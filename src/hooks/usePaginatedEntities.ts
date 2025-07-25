import { useState, useEffect, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type Entity = Tables<'entities'>;

const ITEMS_PER_PAGE = 18;

export const usePaginatedEntities = () => {
  return useInfiniteQuery({
    queryKey: ['entities-paginated'],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error, count } = await supabase
        .from('entities')
        .select('*', { count: 'exact' })
        .eq('status', 'active')
        .order('name', { ascending: true })
        .range(from, to);
      
      if (error) throw error;
      
      return {
        data: data as Entity[],
        nextPage: data.length === ITEMS_PER_PAGE ? pageParam + 1 : undefined,
        totalCount: count || 0,
        hasMore: data.length === ITEMS_PER_PAGE
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });
};

export const useInfiniteScroll = (
  hasNextPage: boolean,
  isFetchingNextPage: boolean,
  fetchNextPage: () => void
) => {
  const [isNearBottom, setIsNearBottom] = useState(false);

  const handleScroll = useCallback(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Trigger when user is 200px from bottom
    const nearBottom = scrollTop + windowHeight >= documentHeight - 200;
    setIsNearBottom(nearBottom);
    
    if (nearBottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return { isNearBottom };
};