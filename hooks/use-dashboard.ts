import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

// ── Shared trend type ─────────────────────────────────────────────────────────
export type Trend = {
  trend_str: string;
  direction: 'up' | 'down' | 'stable';
  percent: number;
};

// ── Fuel ───────────────────────────────────────────────────────────────────────
export type DashboardFuel = {
  petrol_per_litre: number;
  petrol_trend: Trend;
  diesel_per_litre: number;
  diesel_trend: Trend;
  kerosene_per_litre: number;
  kerosene_trend: Trend;
  source: string;
  location: string;
  created_at: string;
};

// ── Forex ──────────────────────────────────────────────────────────────────────
export type DashboardForex = {
  usd_kes: number;
  usd_kes_trend: Trend;
  eur_kes: number;
  eur_kes_trend: Trend;
  gbp_kes: number;
  gbp_kes_trend: Trend;
  source: string;
  created_at: string;
};

// ── Food Basket ────────────────────────────────────────────────────────────────
export type DashboardFoodBasket = {
  maize_flour: number;
  maize_flour_trend: Trend;
  wheat_flour: number;
  wheat_flour_trend: Trend;
  rice: number;
  rice_trend: Trend;
  sugar: number;
  sugar_trend: Trend;
  cooking_oil: number;
  cooking_oil_trend: Trend;
  milk: number;
  milk_trend: Trend;
  eggs: number;
  eggs_trend: Trend;
  bread: number;
  bread_trend: Trend;
  tomatoes: number;
  tomatoes_trend: Trend;
  onions: number;
  onions_trend: Trend;
  created_at: string;
};

// ── AI Insight ─────────────────────────────────────────────────────────────────
export type DashboardInsight = {
  id: number;
  trigger: string;
  summary: string;
  impact_score: number;
  affected_areas: string[];
  created_at: string;
};

// ── High Impact Driver ─────────────────────────────────────────────────────────
export type HighImpactDriver = {
  category: string;
  item: string;
  pct_change: number;
  direction: 'up' | 'down' | 'stable';
};

// ── Weekly Chart Point ─────────────────────────────────────────────────────────
export type WeeklyChartPoint = {
  week_start: string;
  avg_pct: number;
};

// ── Overall Metrics ────────────────────────────────────────────────────────────
export type OverallMetrics = {
  fuel_avg_pct: number;
  forex_avg_pct: number;
  food_avg_pct: number;
  overall_avg_pct: number;
  overall_trend: Trend;
  high_impact_drivers: HighImpactDriver[];
  weekly_chart_data: WeeklyChartPoint[];
};

// ── Full Response ──────────────────────────────────────────────────────────────
export type DashboardResponse = {
  fuel: DashboardFuel;
  forex: DashboardForex;
  food_basket: DashboardFoodBasket;
  latest_insight: DashboardInsight[];
  overall_metrics: OverallMetrics;
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
