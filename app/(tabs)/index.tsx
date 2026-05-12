import React, { useRef, useEffect } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@gluestack-ui/themed';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

import { useDashboard, type DashboardResponse } from '@/hooks/use-dashboard';
import { useTheme } from '@/contexts/theme-context';
import { IconSymbol } from '@/components/ui/icon-symbol';

// ─── Fallback data ────────────────────────────────────────────────────────────
const fallbackDashboard: DashboardResponse = {
  fuel: {
    id: 9,
    petrol_per_litre: 188.4,
    diesel_per_litre: 196.63,
    kerosene_per_litre: 152.78,
    source: 'EPRA_TICKER',
    location: 'Nairobi',
    created_at: '2026-04-27T15:32:21.172094Z',
  },
  forex: {
    id: 3,
    usd_kes: 129.45,
    eur_kes: 151.57,
    gbp_kes: 175.07,
    source: 'open_exchange_rates',
    created_at: '2026-04-27T15:35:30.171441Z',
  },
  food_basket: [
    { id: 38, name: 'wheat flour', price_kes: 90.0, unit: '1kg', retailer: 'Quickmart', source: '', created_at: '' },
    { id: 39, name: 'rice', price_kes: 155.0, unit: '1kg', retailer: 'Quickmart', source: '', created_at: '' },
    { id: 40, name: 'sugar', price_kes: 155.0, unit: '1kg', retailer: 'Quickmart', source: '', created_at: '' },
    { id: 41, name: 'cooking oil', price_kes: 311.0, unit: '1L', retailer: 'Quickmart', source: '', created_at: '' },
    { id: 37, name: 'maize flour', price_kes: 86.0, unit: '1kg', retailer: 'Quickmart', source: '', created_at: '' },
  ],
  latest_insight: {
    id: 6,
    trigger: 'food_update',
    summary:
      'Fuel prices rose this week, pushing up transport costs and expected food prices in major towns. Households should budget for higher expenses in the coming days.',
    impact_score: -0.6,
    affected_areas: ['food'],
    created_at: '2026-04-28T17:36:16.671217Z',
  },
  updated_at: '2026-04-30T13:21:43.039188',
};

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg: '#0D1117',
  surface: '#121821',
  card: '#1A2332',
  cardBorder: '#243044',
  green: '#0B8F4D',
  greenDim: 'rgba(11,143,77,0.15)',
  greenGlow: 'rgba(11,143,77,0.35)',
  text: '#FFFFFF',
  textSub: '#8A9BB5',
  textDim: '#4A5A72',
  danger: '#F05B5B',
  dangerDim: 'rgba(240,91,91,0.12)',
  gold: '#F5B301',
};

// ─── Sparkline chart ──────────────────────────────────────────────────────────
const SPARK_DATA = [62, 58, 65, 60, 70, 66, 74, 69, 78, 73, 82, 79, 88, 84, 92];

function SparklineChart() {
  const W = Dimensions.get('window').width - 80; // card padding
  const H = 72;
  const pad = 4;

  const min = Math.min(...SPARK_DATA);
  const max = Math.max(...SPARK_DATA);
  const range = max - min || 1;
  const stepX = (W - pad * 2) / (SPARK_DATA.length - 1);

  const points = SPARK_DATA.map((v, i) => ({
    x: pad + i * stepX,
    y: H - pad - ((v - min) / range) * (H - pad * 2),
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  const areaPath =
    linePath +
    ` L ${points[points.length - 1].x.toFixed(1)} ${H} L ${points[0].x.toFixed(1)} ${H} Z`;

  return (
    <Svg width={W} height={H}>
      <Defs>
        <LinearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={C.green} stopOpacity="0.35" />
          <Stop offset="1" stopColor={C.green} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Path d={areaPath} fill="url(#spark)" />
      <Path d={linePath} stroke={C.green} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Cards ────────────────────────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function IndicatorCard({
  icon,
  label,
  value,
  trend,
  trendLabel,
  positive = false,
}: {
  icon: string;
  label: string;
  value: string;
  trend: string;
  trendLabel: string;
  positive?: boolean;
}) {
  return (
    <Card style={styles.indicatorCard}>
      <View style={styles.indicatorHeader}>
        <Text style={styles.indicatorIcon}>{icon}</Text>
        <Text style={styles.indicatorLabel}>{label}</Text>
      </View>
      <Text style={styles.indicatorValue}>{value}</Text>
      <View style={[styles.trendPill, { backgroundColor: positive ? C.greenDim : C.dangerDim }]}>
        <Text style={[styles.trendText, { color: positive ? C.green : C.danger }]}>
          {trend} {trendLabel}
        </Text>
      </View>
    </Card>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { data, isLoading } = useDashboard();
  const dashboard = data ?? fallbackDashboard;
  const foodTotal = dashboard.food_basket
    .slice(0, 4)
    .reduce((s, i) => s + i.price_kes, 0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }),
    ]).start();
  }, []);

  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* ── Header ───────────────────────────────────────────────────── */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Hello, Alex 👋</Text>
              <Text style={styles.date}>{today}</Text>
            </View>
            <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7}>
              <Text style={styles.bellIcon}>🔔</Text>
            </TouchableOpacity>
          </View>

          {/* ── Cost of Living Pulse ──────────────────────────────────────── */}
          <Card style={styles.pulseCard}>
            <View style={styles.pulseTopRow}>
              <View>
                <Text style={styles.pulseHeading}>COST OF LIVING PULSE</Text>
                <Text style={styles.pulseSubheading}>Overall change this week</Text>
              </View>
            </View>
            <View style={styles.pulseMidRow}>
              <Text style={styles.pulseArrow}>↑</Text>
              <Text style={styles.pulseValue}>2.3%</Text>
            </View>
            <Text style={styles.pulseDrivers}>High impact: Fuel, Food, Transport</Text>
            <View style={styles.sparklineContainer}>
              <SparklineChart />
            </View>
          </Card>

          {/* ── Key indicators label ──────────────────────────────────────── */}
          <Text style={styles.sectionLabel}>KEY INDICATORS</Text>

          {/* ── Grid row 1 ────────────────────────────────────────────────── */}
          <View style={styles.grid}>
            <IndicatorCard
              icon="⛽"
              label="Fuel Prices"
              value={`KES ${dashboard.fuel.petrol_per_litre.toFixed(2)}`}
              trend="↑ 3.6%"
              trendLabel="vs last week"
            />
            <IndicatorCard
              icon="💵"
              label="USD / KES"
              value={dashboard.forex.usd_kes.toFixed(2)}
              trend="↑ 1.2%"
              trendLabel="vs last week"
            />
          </View>

          {/* ── Grid row 2 ────────────────────────────────────────────────── */}
          <View style={styles.grid}>
            <IndicatorCard
              icon="🛒"
              label="Food Basket"
              value={`KES ${foodTotal.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`}
              trend="↑ 2.7%"
              trendLabel="vs last week"
            />
            <IndicatorCard
              icon="📈"
              label="Inflation (CPI)"
              value="5.2%"
              trend="↑ 0.4%"
              trendLabel="vs last month"
            />
          </View>

          {/* ── AI Insight ────────────────────────────────────────────────── */}
          <Card style={styles.insightCard}>
            <View style={styles.insightTopRow}>
              <View style={styles.insightTitleRow}>
                <View style={styles.insightDot} />
                <Text style={styles.insightLabel}>✦ AI INSIGHT</Text>
              </View>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.insightClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.insightText}>
              {isLoading ? 'Loading latest insight…' : dashboard.latest_insight.summary}
            </Text>
            <TouchableOpacity style={styles.insightReadMore} activeOpacity={0.7}>
              <Text style={styles.insightReadMoreText}>Read more →</Text>
            </TouchableOpacity>
          </Card>

          {/* ── Pagination dots ───────────────────────────────────────────── */}
          <View style={styles.dots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>

        </Animated.View>
      </ScrollView>

      {/* ── Bottom Tab Bar ────────────────────────────────────────────────── */}
      {/* <View style={styles.tabBar}>
        {[
          { icon: '⊞', label: 'Home', active: true },
          { icon: '⚡', label: 'Impact', active: false },
          { icon: '✦', label: 'Ask Mali', active: false },
          { icon: '📰', label: 'Feed', active: false },
          { icon: '👤', label: 'Profile', active: false },
        ].map((tab) => (
          <TouchableOpacity key={tab.label} style={styles.tabItem} activeOpacity={0.7}>
            <Text style={[styles.tabIcon, tab.active && styles.tabIconActive]}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, tab.active && styles.tabLabelActive]}>{tab.label}</Text>
            {tab.active && <View style={styles.tabActiveBar} />}
          </TouchableOpacity>
        ))}
      </View> */}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
  },
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
    color: C.text,
    letterSpacing: 0.2,
  },
  date: {
    fontSize: 13,
    color: C.textSub,
    marginTop: 3,
  },
  bellBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: {
    fontSize: 18,
  },

  // Card base
  card: {
    backgroundColor: C.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 6,
  },

  // Pulse card
  pulseCard: {
    backgroundColor: C.surface,
    borderColor: C.cardBorder,
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
    color: C.textSub,
    letterSpacing: 1.2,
  },
  pulseSubheading: {
    fontSize: 12,
    color: C.textDim,
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
    color: C.green,
    lineHeight: 46,
  },
  pulseValue: {
    fontSize: 42,
    fontWeight: '800',
    color: C.text,
    lineHeight: 48,
    letterSpacing: -1,
  },
  pulseDrivers: {
    fontSize: 12,
    color: C.textSub,
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
    color: C.textSub,
    letterSpacing: 1.2,
    marginBottom: 12,
  },

  // Indicator grid
  grid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 0,
  },
  indicatorCard: {
    flex: 1,
    marginBottom: 12,
    padding: 14,
  },
  indicatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  indicatorIcon: {
    fontSize: 14,
  },
  indicatorLabel: {
    fontSize: 12,
    color: C.textSub,
    fontWeight: '500',
  },
  indicatorValue: {
    fontSize: 22,
    fontWeight: '700',
    color: C.text,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  trendPill: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '600',
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
    backgroundColor: C.green,
  },
  insightLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.green,
    letterSpacing: 1.1,
  },
  insightClose: {
    fontSize: 14,
    color: C.textDim,
  },
  insightText: {
    fontSize: 14,
    color: C.textSub,
    lineHeight: 22,
  },
  insightReadMore: {
    marginTop: 12,
    alignSelf: 'flex-end',
  },
  insightReadMoreText: {
    fontSize: 13,
    color: C.green,
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
    backgroundColor: C.cardBorder,
  },
  dotActive: {
    width: 18,
    backgroundColor: C.green,
    borderRadius: 3,
  }
});