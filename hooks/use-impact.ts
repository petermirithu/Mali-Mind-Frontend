import { api } from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

// ─── API Response Types ───────────────────────────────────────────────────────

export type CustomCategory = {
    custom_item_name: string;
    classified_category: string;
    monthly_cost: number;
    affected_by_fuel: boolean;
    affected_by_forex: boolean;
    affected_by_food: boolean;
    estimated_impact_pct: number;
    reasoning: string;
    created_at: string | null;
    updated_at: string | null;
};

export type UserImpactProfile = {
    income: number;
    rent: number;
    food_budget: number;
    transport: string;
    commute: number;
    electricity: number;
    water: number;
    savings: number;
    custom_categories: CustomCategory[];
};

export type ImpactBreakdownItem = {
    category: string;
    icon: string;
    monthly_amount_kes: number;
    change_pct: number;
    direction: "up" | "down" | "stable";
};

export type Recommendation = {
    icon: string;
    text: string;
};

export type PastMonthSpending = {
    month: string;
    total_spending: number;
};

export type ImpactResponse = {
    current_month_spending: number;
    spending_change_pct: number;
    spending_trend: "up" | "down" | "stable";
    total_monthly_deductions: number;
    money_left_this_month: number;
    savings_utilization_pct: number;
    user_impact_profile: UserImpactProfile;
    impact_breakdown: ImpactBreakdownItem[];
    ai_insight: string;
    ai_insight_detail: string;
    expected_extra_cost_kes: number;
    cost_range_min: number;
    cost_range_max: number;
    recommendations: Recommendation[];
    past_6_months_spending: PastMonthSpending[];
    computed_at: string;
};

export type SaveImpactPayload = {
    user_id: number;
    income: string;
    rent: string;
    food_budget: string;
    transport: string;
    commute: string;
    electricity: string;
    water: string;
    savings: string;
    custom_categories: { label: string; value: string }[];
};

export function useImpact(userId: number) {
    return useQuery<ImpactResponse>({
        queryKey: ['impact', userId],
        queryFn: async () => {
            const { data } = await api.get<ImpactResponse>(`/impact/${userId}`);
            return data;
        },
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 2,
    })
}
export function useSaveImpact() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: SaveImpactPayload) => {
            const { data } = await api.post('/impact/profiles', payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['impact'] });
        }
    })
}