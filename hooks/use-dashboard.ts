import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

export type DashboardFuel = {
  id: number;
  petrol_per_litre: number;
  diesel_per_litre: number;
  kerosene_per_litre: number;
  source: string;
  location: string;
  created_at: string;
};

export type DashboardForex = {
  id: number;
  usd_kes: number;
  eur_kes: number;
  gbp_kes: number;
  source: string;
  created_at: string;
};

export type DashboardFoodBasket = {
  id: number;
  maize_flour: number;
  wheat_flour: number;
  rice: number;
  sugar: number;
  cooking_oil: number;
  milk: number;
  eggs: number;
  bread: number;
  tomatoes: number;
  onions: number;
  created_at: string;
};

export type DashboardInsight = {
  id: number;
  trigger: string;
  summary: string;
  impact_score: number;
  affected_areas: string[];
  created_at: string;
};

export type DashboardResponse = {
  fuel: DashboardFuel[];
  forex: DashboardForex[];
  food_basket: DashboardFoodBasket[];
  latest_insight: DashboardInsight[];
  updated_at: string;
};

export function useDashboard() {
  return useQuery<DashboardResponse>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get<DashboardResponse>('/dashboard/');
      return data;
    },
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
}
