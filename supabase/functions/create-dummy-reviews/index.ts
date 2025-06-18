
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get businesses first
    const { data: businesses, error: businessError } = await supabaseClient
      .from('businesses')
      .select('id')
      .limit(5);

    if (businessError) throw businessError;

    // Get a user to create reviews (using the first available user)
    const { data: profiles, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id')
      .limit(3);

    if (profileError) throw profileError;

    if (!businesses?.length || !profiles?.length) {
      return new Response(
        JSON.stringify({ error: 'No businesses or users found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Create dummy reviews
    const dummyReviews = [
      {
        user_id: profiles[0].id,
        business_id: businesses[0].id,
        rating: 5,
        content: "Excellent service and great experience! The staff was very professional and the quality exceeded my expectations. Would definitely recommend to others.",
        user_badge: "Verified User",
        proof_provided: true,
        upvotes: 12,
        downvotes: 1
      },
      {
        user_id: profiles[1]?.id || profiles[0].id,
        business_id: businesses[0].id,
        rating: 4,
        content: "Good overall experience. The service was prompt and the results were satisfactory. Minor areas for improvement but would use again.",
        user_badge: "Verified Graduate",
        proof_provided: false,
        upvotes: 8,
        downvotes: 0
      },
      {
        user_id: profiles[2]?.id || profiles[0].id,
        business_id: businesses[1]?.id || businesses[0].id,
        rating: 3,
        content: "Average experience. The service was okay but nothing exceptional. Room for improvement in customer service and delivery time.",
        user_badge: "Verified Employee",
        proof_provided: true,
        upvotes: 5,
        downvotes: 3
      },
      {
        user_id: profiles[0].id,
        business_id: businesses[1]?.id || businesses[0].id,
        rating: 5,
        content: "Outstanding quality and exceptional customer service! They went above and beyond to ensure satisfaction. Highly recommend!",
        user_badge: "Verified User",
        proof_provided: true,
        upvotes: 15,
        downvotes: 0,
        business_response: "Thank you so much for your wonderful feedback! We're thrilled that you had such a positive experience with our team.",
        business_response_date: new Date().toISOString()
      }
    ];

    const { data, error } = await supabaseClient
      .from('reviews')
      .insert(dummyReviews)
      .select();

    if (error) throw error;

    return new Response(
      JSON.stringify({ message: 'Dummy reviews created successfully', data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
