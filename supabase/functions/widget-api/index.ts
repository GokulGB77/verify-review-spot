import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

interface ReviewStats {
  entity_id: string;
  entity_name: string;
  total_reviews: number;
  verified_reviews: number;
  average_rating: number;
  total_stars: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    
    // Expected path: /widget-api/{action}/{entity_id}
    const action = pathParts[pathParts.length - 2];
    const entityId = pathParts[pathParts.length - 1];

    if (!entityId) {
      return new Response(
        JSON.stringify({ error: 'Entity ID is required' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (action === 'stats') {
      const stats = await getEntityStats(supabase, entityId);
      return new Response(
        JSON.stringify(stats), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (action === 'badge') {
      const stats = await getEntityStats(supabase, entityId);
      const style = url.searchParams.get('style') || 'default';
      const color = url.searchParams.get('color') || '007bff';
      const background = url.searchParams.get('background') || 'ffffff';
      
      const svg = generateBadge(stats, style, color, background);
      return new Response(
        svg, 
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=300' // 5 minutes cache
          } 
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use /stats or /badge' }), 
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Widget API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function getEntityStats(supabase: any, entityId: string): Promise<ReviewStats> {
  // Get entity details
  const { data: entity, error: entityError } = await supabase
    .from('entities')
    .select('entity_id, name, average_rating, review_count')
    .eq('entity_id', entityId)
    .eq('status', 'active')
    .single();

  if (entityError || !entity) {
    throw new Error(`Entity not found: ${entityId}`);
  }

  // Get review statistics
  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('rating, is_verified')
    .eq('business_id', entityId);

  if (reviewsError) {
    throw new Error('Failed to fetch reviews');
  }

  const totalReviews = reviews?.length || 0;
  const verifiedReviews = reviews?.filter(r => r.is_verified).length || 0;
  const totalStars = reviews?.reduce((sum, r) => sum + r.rating, 0) || 0;
  const averageRating = totalReviews > 0 ? parseFloat((totalStars / totalReviews).toFixed(1)) : 0;

  return {
    entity_id: entity.entity_id,
    entity_name: entity.name,
    total_reviews: totalReviews,
    verified_reviews: verifiedReviews,
    average_rating: averageRating,
    total_stars: totalStars
  };
}

function generateBadge(stats: ReviewStats, style: string, color: string, background: string): string {
  const { entity_name, total_reviews, average_rating, verified_reviews } = stats;
  
  if (style === 'compact') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40" viewBox="0 0 120 40">
      <rect width="120" height="40" rx="5" fill="#${background}" stroke="#${color}" stroke-width="1"/>
      <text x="10" y="15" font-family="Arial, sans-serif" font-size="10" fill="#${color}" font-weight="bold">
        ${entity_name.length > 12 ? entity_name.substring(0, 12) + '...' : entity_name}
      </text>
      <text x="10" y="28" font-family="Arial, sans-serif" font-size="12" fill="#${color}">
        ⭐ ${average_rating} (${total_reviews})
      </text>
    </svg>`;
  }

  if (style === 'detailed') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80" viewBox="0 0 200 80">
      <rect width="200" height="80" rx="8" fill="#${background}" stroke="#${color}" stroke-width="2"/>
      <text x="15" y="20" font-family="Arial, sans-serif" font-size="14" fill="#${color}" font-weight="bold">
        ${entity_name.length > 20 ? entity_name.substring(0, 20) + '...' : entity_name}
      </text>
      <text x="15" y="40" font-family="Arial, sans-serif" font-size="12" fill="#${color}">
        ⭐ ${average_rating}/5 • ${total_reviews} reviews
      </text>
      <text x="15" y="60" font-family="Arial, sans-serif" font-size="10" fill="#${color}">
        ✓ ${verified_reviews} verified reviews
      </text>
    </svg>`;
  }

  // Default style
  return `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="50" viewBox="0 0 160 50">
    <rect width="160" height="50" rx="6" fill="#${background}" stroke="#${color}" stroke-width="1.5"/>
    <text x="12" y="18" font-family="Arial, sans-serif" font-size="12" fill="#${color}" font-weight="bold">
      ${entity_name.length > 15 ? entity_name.substring(0, 15) + '...' : entity_name}
    </text>
    <text x="12" y="35" font-family="Arial, sans-serif" font-size="11" fill="#${color}">
      ⭐ ${average_rating} • ${total_reviews} reviews
    </text>
  </svg>`;
}