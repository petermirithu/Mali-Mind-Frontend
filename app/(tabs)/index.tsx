import React, { useRef, useEffect, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from '@gluestack-ui/themed';
import { useDashboard, type DashboardFoodBasket } from '@/hooks/use-dashboard';
import { Spinner } from '@/components/ui/spinner';
import { useTheme } from '@/contexts/theme-context';
import Card from '@/components/home/card';
import SparklineChart from '@/components/home/sparklineChart';
import IndicatorCard from '@/components/home/indicatorCard';
import BreakdownModal from '@/components/home/breakdownModal';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { theme } = useTheme();

  const { data: dashboard, isLoading } = useDashboard();
  const [selectedIndicator, setSelectedIndicator] = useState<'food' | 'fuel' | 'forex' | null>(null);
  const [activeInsightIndex, setActiveInsightIndex] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  // Auto-play AI insights carousel
  useEffect(() => {
    if (!dashboard?.latest_insight || dashboard.latest_insight.length <= 1) return;
    const interval = setInterval(() => {
      setActiveInsightIndex((prev) => (prev + 1) % dashboard.latest_insight.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [dashboard?.latest_insight]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }),
    ]).start();
  }, []);

  if (isLoading || !dashboard) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Spinner size={"large"} color={theme.primary} />
          <Text style={{ color: theme.textDim, marginTop: 20 }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Helper: convert backend trend to display props ────────────────────────
  const trendProps = (trend: { trend_str: string; direction: string; percent: number }) => ({
    trendStr: trend.trend_str,
    positive: trend.direction === 'down' || trend.direction === 'stable',
    pct: trend.percent,
  });

  // ── Destructure flat data from backend ────────────────────────────────────
  const { fuel, forex, food_basket: food, overall_metrics: metrics } = dashboard;

  // Food basket total
  const foodTotal =
    food.maize_flour + food.wheat_flour + food.rice + food.sugar + food.cooking_oil +
    food.milk + food.eggs + food.bread + food.tomatoes + food.onions;

  // ── Overall pulse values (from backend) ───────────────────────────────────
  const overallPct = metrics.overall_avg_pct;
  const pulseIsDown = overallPct <= 0;
  const pulseArrow = pulseIsDown ? '↓' : '↑';

  // High impact drivers from backend
  const highImpactUp = metrics.high_impact_drivers
    .filter(d => d.direction === 'up')
    .map(d => d.item.replace('_', ' '));
  const highImpactStr = highImpactUp.length > 0
    ? highImpactUp.slice(0, 3).join(', ')
    : 'None (Stable)';

  // Weekly chart data from backend
  const sparkData = metrics.weekly_chart_data.map(w => w.avg_pct);

  // Food basket configuration for breakdown listing
  const foodItemsConfig = [
    { key: 'maize_flour', trendKey: 'maize_flour_trend', label: 'Maize Flour', icon: '🌽' },
    { key: 'wheat_flour', trendKey: 'wheat_flour_trend', label: 'Wheat Flour', icon: '🌾' },
    { key: 'rice', trendKey: 'rice_trend', label: 'Rice', icon: '🍚' },
    { key: 'sugar', trendKey: 'sugar_trend', label: 'Sugar', icon: '🍬' },
    { key: 'cooking_oil', trendKey: 'cooking_oil_trend', label: 'Cooking Oil', icon: '🍾' },
    { key: 'milk', trendKey: 'milk_trend', label: 'Milk', icon: '🥛' },
    { key: 'eggs', trendKey: 'eggs_trend', label: 'Eggs', icon: '🥚' },
    { key: 'bread', trendKey: 'bread_trend', label: 'Bread', icon: '🍞' },
    { key: 'tomatoes', trendKey: 'tomatoes_trend', label: 'Tomatoes', icon: '🍅' },
    { key: 'onions', trendKey: 'onions_trend', label: 'Onions', icon: '🧅' },
  ] as const;

  // ── Cycling data for indicator cards ──────────────────────────────────────
  const petrolTrend = trendProps(fuel.petrol_trend);
  const dieselTrend = trendProps(fuel.diesel_trend);
  const keroseneTrend = trendProps(fuel.kerosene_trend);

  const fuelCycleData = [
    { label: 'Petrol / Litre', value: `KES ${fuel.petrol_per_litre.toFixed(2)}`, trend: petrolTrend.trendStr, trendLabel: 'vs last week', positive: petrolTrend.positive },
    { label: 'Diesel / Litre', value: `KES ${fuel.diesel_per_litre.toFixed(2)}`, trend: dieselTrend.trendStr, trendLabel: 'vs last week', positive: dieselTrend.positive },
    { label: 'Kerosene / Litre', value: `KES ${fuel.kerosene_per_litre.toFixed(2)}`, trend: keroseneTrend.trendStr, trendLabel: 'vs last week', positive: keroseneTrend.positive },
  ];

  const usdTrend = trendProps(forex.usd_kes_trend);
  const eurTrend = trendProps(forex.eur_kes_trend);
  const gbpTrend = trendProps(forex.gbp_kes_trend);

  const forexCycleData = [
    { label: 'USD / KES', value: forex.usd_kes.toFixed(2), trend: usdTrend.trendStr, trendLabel: 'vs last week', positive: usdTrend.positive },
    { label: 'EUR / KES', value: forex.eur_kes.toFixed(2), trend: eurTrend.trendStr, trendLabel: 'vs last week', positive: eurTrend.positive },
    { label: 'GBP / KES', value: forex.gbp_kes.toFixed(2), trend: gbpTrend.trendStr, trendLabel: 'vs last week', positive: gbpTrend.positive },
  ];

  const foodCycleItems = [
    { key: 'maize_flour', trendKey: 'maize_flour_trend', label: 'Maize Flour' },
    { key: 'rice', trendKey: 'rice_trend', label: 'Rice' },
    { key: 'sugar', trendKey: 'sugar_trend', label: 'Sugar' },
    { key: 'cooking_oil', trendKey: 'cooking_oil_trend', label: 'Cooking Oil' },
    { key: 'milk', trendKey: 'milk_trend', label: 'Milk' },
    { key: 'eggs', trendKey: 'eggs_trend', label: 'Eggs' },
    { key: 'bread', trendKey: 'bread_trend', label: 'Bread' },
    { key: 'tomatoes', trendKey: 'tomatoes_trend', label: 'Tomatoes' },
    { key: 'onions', trendKey: 'onions_trend', label: 'Onions' },
    { key: 'wheat_flour', trendKey: 'wheat_flour_trend', label: 'Wheat Flour' },

  ] as const;

  const foodOverallPct = metrics.food_avg_pct;
  const foodOverallPositive = foodOverallPct <= 0;
  const foodOverallTrendStr = foodOverallPct === 0
    ? '- 0.0%'
    : `${foodOverallPct < 0 ? '↓' : '↑'} ${Math.abs(foodOverallPct).toFixed(1)}%`;

  const foodCycleData = [
    {
      label: 'Food Basket',
      value: `KES ${foodTotal.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
      trend: foodOverallTrendStr,
      trendLabel: 'vs last week',
      positive: foodOverallPositive,
    },
    ...foodCycleItems.map((item) => {
      const val = food[item.key as keyof DashboardFoodBasket] as number;
      const trend = trendProps(food[item.trendKey as keyof DashboardFoodBasket] as any);
      return {
        label: item.label,
        value: `KES ${val?.toFixed(2) || '0.00'}`,
        trend: trend.trendStr,
        trendLabel: 'vs last week',
        positive: trend.positive,
      };
    }),
  ];

  // ── Estimated Inflation (weighted from backend pcts) ──────────────────────
  const estimatedWeeklyInflation = overallPct;
  const isInflationDown = estimatedWeeklyInflation <= 0;
  const inflationTrendStr = estimatedWeeklyInflation === 0
    ? '- 0.0%'
    : `${isInflationDown ? '↓' : '↑'} ${Math.abs(estimatedWeeklyInflation).toFixed(2)}%`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top']}>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.background }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* ── Header ───────────────────────────────────────────────────── */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting} color={theme.text}>Hello, Alex 👋</Text>
              <Text style={styles.date} color={theme.textDim}>{today}</Text>
            </View>
            <TouchableOpacity
              style={[styles.bellBtn, {
                backgroundColor: theme.card,
                borderColor: theme.cardBorder
              }]}
              activeOpacity={0.7}>
              <MaterialIcons name="notifications" size={24} color={theme.textDim} />
            </TouchableOpacity>
          </View>

          {/* ── Cost of Living Pulse ──────────────────────────────────────── */}
          <Card style={[styles.pulseCard, {
            backgroundColor: pulseIsDown ? 'rgba(11, 143, 77, 0.05)' : 'rgba(235, 87, 87, 0.05)',
            borderColor: pulseIsDown ? 'rgba(11, 143, 77, 0.3)' : 'rgba(235, 87, 87, 0.3)',
            borderWidth: 1.5,
            padding: 16,
          }]}>
            <SparklineChart data={sparkData} positive={pulseIsDown} />
            <View>
              <View style={styles.pulseTopRow}>
                <View>
                  <Text style={styles.pulseHeading} color={theme.text}>COST OF LIVING PULSE</Text>
                  <Text style={styles.pulseSubheading} color={theme.textDim}>Overall change this week</Text>
                </View>
              </View>
              <View style={styles.pulseMidRow}>
                <Text style={[styles.pulseArrow, {
                  color: pulseIsDown ? theme.primary : theme.danger
                }]}>{pulseArrow}</Text>
                <Text style={styles.pulseValue} color={theme.text}>{Math.abs(overallPct).toFixed(1)}%</Text>
              </View>
              <Text style={styles.pulseDrivers} color={theme.textDim}>High impact: {highImpactStr}</Text>
            </View>
          </Card>

          {/* ── Key indicators label ──────────────────────────────────────── */}
          <Text style={styles.sectionLabel} color={theme.textDim}>KEY INDICATORS</Text>

          {/* ── Grid row 1 ────────────────────────────────────────────────── */}
          <View style={styles.grid}>
            <IndicatorCard
              icon="⛽"
              label="Petrol / Litre"
              value={`KES ${fuel.petrol_per_litre.toFixed(2)}`}
              trend={petrolTrend.trendStr}
              trendLabel="vs last week"
              positive={petrolTrend.positive}
              onPress={() => setSelectedIndicator('fuel')}
              cycleData={fuelCycleData}
            />
            <IndicatorCard
              icon="💵"
              label="USD / KES"
              value={forex.usd_kes.toFixed(2)}
              trend={usdTrend.trendStr}
              trendLabel="vs last week"
              positive={usdTrend.positive}
              onPress={() => setSelectedIndicator('forex')}
              cycleData={forexCycleData}
            />
          </View>

          {/* ── Grid row 2 ────────────────────────────────────────────────── */}
          <View style={styles.grid}>
            <View style={{ width: 175 }}>
              <IndicatorCard
                icon="🛒"
                label="Food Basket"
                value={`KES ${foodTotal.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`}
                trend={foodOverallTrendStr}
                trendLabel="vs last week"
                positive={foodOverallPositive}
                onPress={() => setSelectedIndicator('food')}
                cycleData={foodCycleData}
              />
            </View>
            <IndicatorCard
              icon="📈"
              label="Est. Inflation"
              value={`${estimatedWeeklyInflation > 0 ? '+' : ''}${estimatedWeeklyInflation.toFixed(2)}%`}
              trend={inflationTrendStr}
              trendLabel="vs last week"
              positive={isInflationDown}
            />
          </View>

          {/* ── AI Insight ────────────────────────────────────────────────── */}
          <Card style={styles.insightCard}>
            <View style={styles.insightTopRow}>
              <View style={styles.insightTitleRow}>
                <View style={styles.insightDot} backgroundColor={theme.primary} />
                <Text style={styles.insightLabel} color={theme.primary}>✦ AI INSIGHT</Text>
              </View>
            </View>
            <Text style={styles.insightText} color={theme.textDim}>
              {dashboard.latest_insight?.[activeInsightIndex]?.summary || 'No insights available.'}
            </Text>
            <TouchableOpacity style={styles.insightReadMore} activeOpacity={0.7}>
              <Text style={styles.insightReadMoreText} color={theme.primary}>Read more →</Text>
            </TouchableOpacity>
          </Card>

          {/* ── Pagination dots ───────────────────────────────────────────── */}
          <View style={styles.dots}>
            {dashboard.latest_insight?.map((_, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setActiveInsightIndex(idx)}
                activeOpacity={0.7}
              >
                <View style={[styles.dot, activeInsightIndex === idx && styles.dotActive]} backgroundColor={theme.primary} />
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Detail Breakdown Modals ────────────────────────────────────── */}
          {selectedIndicator === 'food' && food && (
            <BreakdownModal
              visible={true}
              title="Food Basket Items"
              onClose={() => setSelectedIndicator(null)}
            >
              {foodItemsConfig.map((item) => {
                const val = food[item.key as keyof DashboardFoodBasket];
                return (
                  <View key={item.key} style={styles.modalRow}>
                    <Text style={styles.modalRowLabel} color={theme.textDim}>
                      {item.icon} {item.label}
                    </Text>
                    <Text style={styles.modalRowValue} color={theme.text}>
                      KES {typeof val === 'number' ? val.toFixed(2) : '0.00'}
                    </Text>
                  </View>
                );
              })}
            </BreakdownModal>
          )}

          {selectedIndicator === 'fuel' && fuel && (
            <BreakdownModal
              visible={true}
              title="Fuel Prices Breakdown"
              onClose={() => setSelectedIndicator(null)}
            >
              <View style={styles.modalRow}>
                <Text style={styles.modalRowLabel} color={theme.textDim}>⛽ Petrol per Litre</Text>
                <Text style={styles.modalRowValue} color={theme.text}>KES {fuel.petrol_per_litre.toFixed(2)}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalRowLabel} color={theme.textDim}>🚛 Diesel per Litre</Text>
                <Text style={styles.modalRowValue} color={theme.text}>KES {fuel.diesel_per_litre.toFixed(2)}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalRowLabel} color={theme.textDim}>🪔 Kerosene per Litre</Text>
                <Text style={styles.modalRowValue} color={theme.text}>KES {fuel.kerosene_per_litre.toFixed(2)}</Text>
              </View>
              <View style={{ marginTop: 12 }}>
                <Text style={{ fontSize: 12, color: theme.textDim, textAlign: 'center' }}>
                  Source: {fuel.source} ({fuel.location})
                </Text>
              </View>
            </BreakdownModal>
          )}

          {selectedIndicator === 'forex' && forex && (
            <BreakdownModal
              visible={true}
              title="Exchange Rates Breakdown"
              onClose={() => setSelectedIndicator(null)}
            >
              <View style={styles.modalRow}>
                <Text style={styles.modalRowLabel} color={theme.textDim}>🇺🇸 USD / KES</Text>
                <Text style={styles.modalRowValue} color={theme.text}>{forex.usd_kes.toFixed(2)} KES</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalRowLabel} color={theme.textDim}>🇪🇺 EUR / KES</Text>
                <Text style={styles.modalRowValue} color={theme.text}>{forex.eur_kes.toFixed(2)} KES</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalRowLabel} color={theme.textDim}>🇬🇧 GBP / KES</Text>
                <Text style={styles.modalRowValue} color={theme.text}>{forex.gbp_kes.toFixed(2)} KES</Text>
              </View>
              <View style={{ marginTop: 12 }}>
                <Text style={{ fontSize: 12, color: theme.textDim, textAlign: 'center' }}>
                  Source: {forex.source}
                </Text>
              </View>
            </BreakdownModal>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  date: {
    fontSize: 13,
    marginTop: 3,
  },
  bellBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: {
    fontSize: 18,
  },

  // Pulse card
  pulseCard: {
    marginBottom: 20,
    overflow: 'hidden',
  },
  pulseTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  pulseHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  pulseSubheading: {
    fontSize: 12,
    marginTop: 3,
  },
  pulseMidRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    marginBottom: 4,
  },
  pulseArrow: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 46,
  },
  pulseValue: {
    fontSize: 42,
    fontWeight: '800',
    lineHeight: 48,
    letterSpacing: -1,
  },
  pulseDrivers: {
    fontSize: 12,
    marginBottom: 4,
  },

  // Section label
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 12,
  },

  // Indicator grid
  grid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 0,
  },


  // Insight
  insightCard: {
    borderColor: 'rgba(11,143,77,0.3)',
    backgroundColor: 'rgba(11,143,77,0.06)',
    marginTop: 2,
  },
  insightTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  insightDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  insightLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  insightText: {
    fontSize: 14,
    lineHeight: 22,
  },
  insightReadMore: {
    marginTop: 12,
    alignSelf: 'flex-end',
  },
  insightReadMoreText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Pagination dots
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
    marginBottom: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 18,
    borderRadius: 3,
  },

  // Modal
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(36, 48, 68, 0.4)',
  },
  modalRowLabel: {
    fontSize: 15,
  },
  modalRowValue: {
    fontSize: 15,
    fontWeight: '600',
  }
});