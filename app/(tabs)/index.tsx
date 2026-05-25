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
import Card from '@/components/ui/home/card';
import SparklineChart from '@/components/ui/home/sparklineChart';
import IndicatorCard from '@/components/ui/home/indicatorCard';
import BreakdownModal from '@/components/ui/home/breakdownModal';

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

  const getTrend = (latest: number, prev?: number) => {
    if (!prev || prev === 0) return { trendStr: '-', positive: true, pct: 0 };
    const diff = latest - prev;
    const pct = (diff / prev) * 100;
    const isDown = pct <= 0;
    const trendStr = `${isDown ? '↓' : '↑'} ${Math.abs(pct).toFixed(1)}%`;
    return { trendStr, positive: isDown, pct };
  };

  const getFoodTotal = (fb?: DashboardFoodBasket) => {
    if (!fb) return 0;
    return (
      fb.maize_flour + fb.wheat_flour + fb.rice + fb.sugar + fb.cooking_oil +
      fb.milk + fb.eggs + fb.bread + fb.tomatoes + fb.onions
    );
  };

  const latestFuel = dashboard.fuel?.[0];
  const prevFuel = dashboard.fuel?.[1];
  const fuelTrend = getTrend(latestFuel?.petrol_per_litre, prevFuel?.petrol_per_litre);

  const latestForex = dashboard.forex?.[0];
  const prevForex = dashboard.forex?.[1];
  const forexTrend = getTrend(latestForex?.usd_kes, prevForex?.usd_kes);

  const latestFood = dashboard.food_basket?.[0];
  const prevFood = dashboard.food_basket?.[1];
  const currentFoodTotal = getFoodTotal(latestFood);
  const prevFoodTotal = getFoodTotal(prevFood);
  const foodTrend = getTrend(currentFoodTotal, prevFoodTotal);

  const avgPct = (fuelTrend.pct + forexTrend.pct + foodTrend.pct) / 3;
  const pulseIsDown = avgPct <= 0;
  const pulseArrow = pulseIsDown ? '↓' : '↑';

  // Dynamic cost of living high impact drivers (categories that increased in price)
  const driverPairs = [
    { label: 'Fuel', pct: fuelTrend.pct },
    { label: 'Forex', pct: forexTrend.pct },
    { label: 'Food', pct: foodTrend.pct }
  ].sort((a, b) => b.pct - a.pct);

  const highImpactDrivers = driverPairs
    .filter(d => d.pct > 0)
    .map(d => d.label);

  const highImpactStr = highImpactDrivers.length > 0
    ? highImpactDrivers.join(', ')
    : 'None (Stable)';

  // Generate dynamic sparkline data with custom interpolation & micro-fluctuations
  const generateSparkData = () => {
    const points: number[] = [];
    const steps = 10;
    const latestCombined = (latestFuel?.petrol_per_litre || 0) + (latestForex?.usd_kes || 0) + currentFoodTotal;
    const prevCombined = (prevFuel?.petrol_per_litre || latestFuel?.petrol_per_litre || 0) +
      (prevForex?.usd_kes || latestForex?.usd_kes || 0) +
      (prevFoodTotal || currentFoodTotal || 0);

    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const easeT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const base = prevCombined + (latestCombined - prevCombined) * easeT;
      const fluctuation = Math.sin(t * Math.PI * 3.5) * (base * 0.006) + Math.cos(t * Math.PI * 1.5) * (base * 0.003);
      points.push(base + fluctuation);
    }
    return points;
  };

  const sparkData = generateSparkData();

  // Food basket configuration for breakdown listing
  const foodItemsConfig = [
    { key: 'maize_flour', label: 'Maize Flour', icon: '🌽' },
    { key: 'wheat_flour', label: 'Wheat Flour', icon: '🌾' },
    { key: 'rice', label: 'Rice', icon: '🍚' },
    { key: 'sugar', label: 'Sugar', icon: '🍬' },
    { key: 'cooking_oil', label: 'Cooking Oil', icon: '🍾' },
    { key: 'milk', label: 'Milk', icon: '🥛' },
    { key: 'eggs', label: 'Eggs', icon: '🥚' },
    { key: 'bread', label: 'Bread', icon: '🍞' },
    { key: 'tomatoes', label: 'Tomatoes', icon: '🍅' },
    { key: 'onions', label: 'Onions', icon: '🧅' },
  ] as const;

  // ── Cycling data for indicator cards ──────────────────────────────────────
  const dieselTrend = getTrend(latestFuel?.diesel_per_litre, prevFuel?.diesel_per_litre);
  const keroseneTrend = getTrend(latestFuel?.kerosene_per_litre, prevFuel?.kerosene_per_litre);

  const fuelCycleData = latestFuel ? [
    { label: 'Petrol / Litre', value: `KES ${latestFuel.petrol_per_litre?.toFixed(2)}`, trend: fuelTrend.trendStr, trendLabel: 'vs last week', positive: fuelTrend.positive },
    { label: 'Diesel / Litre', value: `KES ${latestFuel.diesel_per_litre?.toFixed(2)}`, trend: dieselTrend.trendStr, trendLabel: 'vs last week', positive: dieselTrend.positive },
    { label: 'Kerosene / Litre', value: `KES ${latestFuel.kerosene_per_litre?.toFixed(2)}`, trend: keroseneTrend.trendStr, trendLabel: 'vs last week', positive: keroseneTrend.positive },
  ] : undefined;

  const eurTrend = getTrend(latestForex?.eur_kes, prevForex?.eur_kes);
  const gbpTrend = getTrend(latestForex?.gbp_kes, prevForex?.gbp_kes);

  const forexCycleData = latestForex ? [
    { label: 'USD / KES', value: latestForex.usd_kes?.toFixed(2), trend: forexTrend.trendStr, trendLabel: 'vs last week', positive: forexTrend.positive },
    { label: 'EUR / KES', value: latestForex.eur_kes?.toFixed(2), trend: eurTrend.trendStr, trendLabel: 'vs last week', positive: eurTrend.positive },
    { label: 'GBP / KES', value: latestForex.gbp_kes?.toFixed(2), trend: gbpTrend.trendStr, trendLabel: 'vs last week', positive: gbpTrend.positive },
  ] : undefined;

  const foodCycleItems = [
    { key: 'maize_flour', label: 'Maize Flour' },
    { key: 'rice', label: 'Rice' },
    { key: 'sugar', label: 'Sugar' },
    { key: 'cooking_oil', label: 'Cooking Oil' },
    { key: 'milk', label: 'Milk' },
  ] as const;

  const foodCycleData = latestFood ? [
    // First entry: overall basket total
    {
      label: 'Food Basket',
      value: `KES ${currentFoodTotal.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
      trend: foodTrend.trendStr,
      trendLabel: 'vs last week',
      positive: foodTrend.positive,
    },
    // Then cycle through key individual items
    ...foodCycleItems.map((item) => {
      const latVal = latestFood[item.key as keyof DashboardFoodBasket] as number;
      const prevVal = prevFood ? (prevFood[item.key as keyof DashboardFoodBasket] as number) : undefined;
      const itemTrend = getTrend(latVal, prevVal);
      return {
        label: item.label,
        value: `KES ${latVal?.toFixed(2) || '0.00'}`,
        trend: itemTrend.trendStr,
        trendLabel: 'vs last week',
        positive: itemTrend.positive,
      };
    }),
  ] : undefined;

  // ── Simulated CPI / Inflation Calculation ─────────────────────────────────
  const foodWeight = 0.50; // 50%
  const fuelWeight = 0.30; // 30%
  const forexWeight = 0.20; // 20%
  
  const estimatedWeeklyInflation = (foodTrend.pct * foodWeight) + (fuelTrend.pct * fuelWeight) + (forexTrend.pct * forexWeight);
  const isInflationDown = estimatedWeeklyInflation <= 0;
  const inflationTrendStr = `${isInflationDown ? '↓' : '↑'} ${Math.abs(estimatedWeeklyInflation).toFixed(2)}%`;

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
              <Text style={styles.bellIcon}>🔔</Text>
            </TouchableOpacity>
          </View>

          {/* ── Cost of Living Pulse ──────────────────────────────────────── */}
          <Card style={[styles.pulseCard, {
            backgroundColor: theme.surface,
            borderColor: theme.cardBorder
          }]}>
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
              <Text style={styles.pulseValue} color={theme.text}>{Math.abs(avgPct).toFixed(1)}%</Text>
            </View>
            <Text style={styles.pulseDrivers} color={theme.textDim}>High impact: {highImpactStr}</Text>
            <View style={styles.sparklineContainer}>
              <SparklineChart data={sparkData} positive={pulseIsDown} />
            </View>
          </Card>

          {/* ── Key indicators label ──────────────────────────────────────── */}
          <Text style={styles.sectionLabel} color={theme.textDim}>KEY INDICATORS</Text>

          {/* ── Grid row 1 ────────────────────────────────────────────────── */}
          <View style={styles.grid}>
            <IndicatorCard
              icon="⛽"
              label="Petrol / Litre"
              value={`KES ${latestFuel?.petrol_per_litre?.toFixed(2) || '0.00'}`}
              trend={fuelTrend.trendStr}
              trendLabel="vs last week"
              positive={fuelTrend.positive}
              onPress={() => setSelectedIndicator('fuel')}
              cycleData={fuelCycleData}
            />
            <IndicatorCard
              icon="💵"
              label="USD / KES"
              value={latestForex?.usd_kes?.toFixed(2) || '0.00'}
              trend={forexTrend.trendStr}
              trendLabel="vs last week"
              positive={forexTrend.positive}
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
                value={`KES ${currentFoodTotal.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`}
                trend={foodTrend.trendStr}
                trendLabel="vs last week"
                positive={foodTrend.positive}
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
          {selectedIndicator === 'food' && latestFood && (
            <BreakdownModal
              visible={true}
              title="Food Basket Items"
              onClose={() => setSelectedIndicator(null)}
            >
              {foodItemsConfig.map((item) => {
                const val = latestFood[item.key as keyof DashboardFoodBasket];
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

          {selectedIndicator === 'fuel' && latestFuel && (
            <BreakdownModal
              visible={true}
              title="Fuel Prices Breakdown"
              onClose={() => setSelectedIndicator(null)}
            >
              <View style={styles.modalRow}>
                <Text style={styles.modalRowLabel} color={theme.textDim}>⛽ Petrol per Litre</Text>
                <Text style={styles.modalRowValue} color={theme.text}>KES {latestFuel.petrol_per_litre.toFixed(2)}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalRowLabel} color={theme.textDim}>🚛 Diesel per Litre</Text>
                <Text style={styles.modalRowValue} color={theme.text}>KES {latestFuel.diesel_per_litre.toFixed(2)}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalRowLabel} color={theme.textDim}>🪔 Kerosene per Litre</Text>
                <Text style={styles.modalRowValue} color={theme.text}>KES {latestFuel.kerosene_per_litre.toFixed(2)}</Text>
              </View>
              <View style={{ marginTop: 12 }}>
                <Text style={{ fontSize: 12, color: theme.textDim, textAlign: 'center' }}>
                  Source: {latestFuel.source} ({latestFuel.location})
                </Text>
              </View>
            </BreakdownModal>
          )}

          {selectedIndicator === 'forex' && latestForex && (
            <BreakdownModal
              visible={true}
              title="Exchange Rates Breakdown"
              onClose={() => setSelectedIndicator(null)}
            >
              <View style={styles.modalRow}>
                <Text style={styles.modalRowLabel} color={theme.textDim}>🇺🇸 USD / KES</Text>
                <Text style={styles.modalRowValue} color={theme.text}>{latestForex.usd_kes.toFixed(2)} KES</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalRowLabel} color={theme.textDim}>🇪🇺 EUR / KES</Text>
                <Text style={styles.modalRowValue} color={theme.text}>{latestForex.eur_kes.toFixed(2)} KES</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalRowLabel} color={theme.textDim}>🇬🇧 GBP / KES</Text>
                <Text style={styles.modalRowValue} color={theme.text}>{latestForex.gbp_kes.toFixed(2)} KES</Text>
              </View>
              <View style={{ marginTop: 12 }}>
                <Text style={{ fontSize: 12, color: theme.textDim, textAlign: 'center' }}>
                  Source: {latestForex.source}
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
    paddingTop: 8,
    paddingBottom: 100,
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
    marginBottom: 16,
  },
  sparklineContainer: {
    marginHorizontal: -18,
    marginBottom: -18,
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