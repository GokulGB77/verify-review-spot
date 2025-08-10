import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { entityName = 'Miles Education', count = 50 } = await req.json().catch(() => ({
      entityName: 'Miles Education',
      count: 50,
    }));

    // Find the entity by name (case-insensitive)
    const { data: entities, error: entityError } = await supabaseClient
      .from('entities')
      .select('entity_id, name')
      .ilike('name', entityName)
      .limit(1);

    if (entityError) throw entityError;

    if (!entities || entities.length === 0) {
      return new Response(
        JSON.stringify({ error: `Entity not found for name: ${entityName}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    const businessId = entities[0].entity_id;

    // Get a pool of users to attribute reviews to
    const { data: profiles, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id')
      .limit(25);

    if (profileError) throw profileError;

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No users (profiles) found to assign reviews.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const sampleSentences = [
      'Outstanding experience with knowledgeable staff and prompt support.',
      'Good overall. Clear communication and timely responses.',
      'Average service; some areas could be improved but decent value.',
      'Exceeded expectations with great attention to detail.',
      'Professional and courteous team. Would recommend to others.',
      'Support was helpful and resolved my issue quickly.',
      'Quality service and consistent follow-up throughout.',
      'Some delays, but the final outcome was satisfactory.',
      'Impressed by the depth of expertise and resources available.',
      'Friendly and approachable staff made the process easy.',
    ];

    function randomInt(min: number, max: number) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function randomPastDate(daysBack = 90) {
      const now = new Date();
      const past = new Date(now);
      past.setDate(now.getDate() - randomInt(0, daysBack));
      past.setHours(randomInt(0, 23), randomInt(0, 59), randomInt(0, 59), 0);
      return past.toISOString();
    }

    const dummyReviews = Array.from({ length: Number(count) }).map((_, i) => {
      const profile = profiles[i % profiles.length];
      const rating = randomInt(3, 5);
      const base = sampleSentences[i % sampleSentences.length];
      const extra = i % 3 === 0 ? ' Highly recommend!' : i % 3 === 1 ? ' Would enroll again.' : ' Learned a lot.';
      return {
        user_id: profile.id,
        business_id: businessId,
        rating,
        content: `${base} ${extra}`,
        upvotes: randomInt(0, 12),
        downvotes: randomInt(0, 3),
        is_proof_submitted: Math.random() < 0.5,
        created_at: randomPastDate(120),
        updated_at: new Date().toISOString(),
      };
    });

    const { data, error } = await supabaseClient
      .from('reviews')
      .insert(dummyReviews)
      .select('id');

    if (error) throw error;

    return new Response(
      JSON.stringify({ message: `Dummy reviews created for ${entityName}`, insertedCount: data?.length ?? 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const message = error?.message ?? 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
