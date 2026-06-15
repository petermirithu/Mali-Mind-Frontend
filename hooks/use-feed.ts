import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

export type FeedResponse = {  
    id: number;
    title: string;
    category: string;
    what_happened: string;
    why_it_happened: string;
    what_it_means: string;
    source_url: string;
    published_at: string;
    created_at: string;
};

export type FeedItemUi = {
  id: string;
  category: string;
  title: string;
  what: string;
  why: string;
  impact: string;
  time: string;
  sourceUrl?: string;
};

export function useFeed() {
  return useQuery<FeedResponse[]>({
    queryKey: ['feed'],
    queryFn: async () => {
      const { data } = await api.get<FeedResponse[]>('/feed/');
      return data;
    },
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
}