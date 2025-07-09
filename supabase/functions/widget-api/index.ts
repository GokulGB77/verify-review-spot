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

    if (action === 'reviews') {
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50); // Max 50 per page
      const sort = url.searchParams.get('sort') || 'recent';
      const verified = url.searchParams.get('verified') || 'all';
      const minRating = url.searchParams.get('min_rating');
      
      const reviews = await getEntityReviews(supabase, entityId, { page, limit, sort, verified, minRating });
      return new Response(
        JSON.stringify(reviews), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (action === 'ratings-breakdown') {
      const breakdown = await getRatingsBreakdown(supabase, entityId);
      return new Response(
        JSON.stringify(breakdown), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use /stats, /badge, /reviews, or /ratings-breakdown' }),
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

async function getEntityReviews(supabase: any, entityId: string, options: {
  page: number;
  limit: number;
  sort: string;
  verified: string;
  minRating?: string;
}) {
  const { page, limit, sort, verified, minRating } = options;
  const offset = (page - 1) * limit;

  // Verify entity exists
  const { data: entity, error: entityError } = await supabase
    .from('entities')
    .select('entity_id, name')
    .eq('entity_id', entityId)
    .eq('status', 'active')
    .single();

  if (entityError || !entity) {
    throw new Error(`Entity not found: ${entityId}`);
  }

  // Build query
  let query = supabase
    .from('reviews')
    .select(`
      id,
      rating,
      content,
      created_at,
      is_verified,
      is_proof_submitted,
      custom_verification_tag,
      upvotes,
      downvotes,
      business_response,
      business_response_date
    `)
    .eq('business_id', entityId);

  // Apply filters
  if (verified === 'true') {
    query = query.eq('is_verified', true);
  } else if (verified === 'false') {
    query = query.eq('is_verified', false);
  }

  if (minRating) {
    const rating = parseInt(minRating);
    if (!isNaN(rating) && rating >= 1 && rating <= 5) {
      query = query.gte('rating', rating);
    }
  }

  // Apply sorting
  if (sort === 'top') {
    query = query.order('rating', { ascending: false });
  } else if (sort === 'verified') {
    query = query.order('is_verified', { ascending: false });
  } else { // default: recent
    query = query.order('created_at', { ascending: false });
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data: reviews, error: reviewsError } = await query;

  if (reviewsError) {
    throw new Error('Failed to fetch reviews');
  }

  // Get total count for pagination
  let countQuery = supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', entityId);

  if (verified === 'true') {
    countQuery = countQuery.eq('is_verified', true);
  } else if (verified === 'false') {
    countQuery = countQuery.eq('is_verified', false);
  }

  if (minRating) {
    const rating = parseInt(minRating);
    if (!isNaN(rating) && rating >= 1 && rating <= 5) {
      countQuery = countQuery.gte('rating', rating);
    }
  }

  const { count, error: countError } = await countQuery;

  if (countError) {
    throw new Error('Failed to count reviews');
  }

  const totalReviews = count || 0;
  const totalPages = Math.ceil(totalReviews / limit);

  return {
    entity_id: entityId,
    entity_name: entity.name,
    reviews: reviews || [],
    pagination: {
      current_page: page,
      total_pages: totalPages,
      total_reviews: totalReviews,
      per_page: limit,
      has_next: page < totalPages,
      has_prev: page > 1
    },
    filters: {
      sort,
      verified,
      min_rating: minRating
    }
  };
}

async function getRatingsBreakdown(supabase: any, entityId: string) {
  // Verify entity exists
  const { data: entity, error: entityError } = await supabase
    .from('entities')
    .select('entity_id, name')
    .eq('entity_id', entityId)
    .eq('status', 'active')
    .single();

  if (entityError || !entity) {
    throw new Error(`Entity not found: ${entityId}`);
  }

  // Get all reviews for the entity
  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('rating, is_verified')
    .eq('business_id', entityId);

  if (reviewsError) {
    throw new Error('Failed to fetch reviews');
  }

  // Count ratings by star
  const ratingCounts = {
    '5_star': 0,
    '4_star': 0,
    '3_star': 0,
    '2_star': 0,
    '1_star': 0
  };

  // Count verified vs unverified
  let verifiedCount = 0;
  let unverifiedCount = 0;

  reviews?.forEach(review => {
    // Count by star rating
    ratingCounts[`${review.rating}_star`]++;
    
    // Count verified status
    if (review.is_verified) {
      verifiedCount++;
    } else {
      unverifiedCount++;
    }
  });

  return {
    ...ratingCounts,
    verified_reviews: verifiedCount,
    unverified_reviews: unverifiedCount
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