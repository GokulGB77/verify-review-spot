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

    const { entityName = 'Miles Education' } = await req.json().catch(() => ({
      entityName: 'Miles Education',
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

    // Delete only reviews created by our seeder (tagged as DUMMY)
    const { data: deleted, error: deleteError } = await supabaseClient
      .from('reviews')
      .delete()
      .eq('business_id', businessId)
      .eq('custom_verification_tag', 'DUMMY')
      .select('id');

    if (deleteError) throw deleteError;

    return new Response(
      JSON.stringify({ message: `Deleted ${deleted?.length ?? 0} dummy reviews for ${entityName}`, deletedCount: deleted?.length ?? 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const message = (error as any)?.message ?? 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
