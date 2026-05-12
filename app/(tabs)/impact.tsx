import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@gluestack-ui/themed';

// ─── Design tokens (matches MaliMind dark palette) ────────────────────────────
const C = {
  bg: '#0D1117',
  surface: '#121821',
  card: '#1A2332',
  cardBorder: '#243044',
  cardBorderGreen: 'rgba(11,143,77,0.3)',
  green: '#0B8F4D',
  greenDim: 'rgba(11,143,77,0.12)',
  greenTrack: 'rgba(11,143,77,0.22)',
  text: '#FFFFFF',
  textSub: '#8A9BB5',
  textDim: '#4A5A72',
  danger: '#F05B5B',
  dangerDim: 'rgba(240,91,91,0.10)',
  gold: '#F5B301',
  goldDim: 'rgba(245,179,1,0.12)',
};

// ─── Real-world impact rates (Kenya-specific) ─────────────────────────────────
// These represent how much of each category is affected by current macro events
const IMPACT_RATES = {
  transport: 0.036,   // +3.6% fuel price increase this week
  food:      0.027,   // +2.7% food basket increase
  rent:      0.008,   // +0.8% (slower moving)
  utilities: 0.045,   // +4.5% electricity tariff increase
};

// ─── Driver explanations shown in the result card ────────────────────────────
const DRIVER_COPY: Record<string, string> = {
  transport: 'Fuel up 3.6% (EPRA, Apr 2026)',
  food:      'Staples basket +2.7% (Quickmart)',
  rent:      'Nairobi rents +0.8% month-on-month',
  utilities: 'Electricity tariff +4.5% (KPLC)',
};

// ─── Slider limits ────────────────────────────────────────────────────────────
const SLIDER_CONFIG = [
  { key: 'transport', label: 'Transport (Monthly)',  min: 0,  max: 20000, step: 500,  default: 5000,  icon: '🚌' },
  { key: 'food',      label: 'Food (Monthly)',       min: 0,  max: 30000, step: 500,  default: 15000, icon: '🛒' },
  { key: 'rent',      label: 'Housing (Rent)',       min: 0,  max: 50000, step: 1000, default: 10000, icon: '🏠' },
  { key: 'utilities', label: 'Utilities & Others',   min: 0,  max: 20000, step: 500,  default: 5000,  icon: '⚡' },
];

function fmt(n: number) {
  return n.toLocaleString('en-KE');
}

// ─── Individual Slider ────────────────────────────────────────────────────────
function BudgetSlider({
  config,
  value,
  onChange,
}: {
  config: (typeof SLIDER_CONFIG)[0];
  value: number;
  onChange: (v: number) => void;
}) {
  const [trackWidth, setTrackWidth] = useState(1);
  const impact = Math.round(value * IMPACT_RATES[config.key as keyof typeof IMPACT_RATES]);
  const pct = ((value - config.min) / (config.max - config.min)) * 100;

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  }, []);

  const handlePress = useCallback(
    (x: number) => {
      const ratio = Math.min(1, Math.max(0, x / trackWidth));
      const raw = config.min + ratio * (config.max - config.min);
      const snapped = Math.round(raw / config.step) * config.step;
      onChange(Math.min(config.max, Math.max(config.min, snapped)));
    },
    [trackWidth, config]
  );

  const thumbLeft = trackWidth > 1
    ? Math.max(0, Math.min(trackWidth - 24, (trackWidth * pct) / 100 - 12))
    : 0;

  return (
    <View style={sl.group}>
      {/* Label row */}
      <View style={sl.topRow}>
        <View style={sl.labelRow}>
          <Text style={sl.icon}>{config.icon}</Text>
          <Text style={sl.label}>{config.label}</Text>
        </View>
        <Text style={sl.amount}>KES {fmt(value)}</Text>
      </View>

      {/* Track */}
      <Pressable
        onLayout={onLayout}
        onPress={(e) => handlePress(e.nativeEvent.locationX)}
        style={sl.trackOuter}
      >
        <View style={sl.trackBg} />
        <View style={[sl.trackFill, { width: `${pct}%` }]} />
        <View style={[sl.thumb, { left: thumbLeft }]} />
      </Pressable>

      {/* Range labels */}
      <View style={sl.rangeRow}>
        <Text style={sl.rangeText}>0</Text>
        <Text style={sl.rangeText}>{fmt(config.max)}</Text>
      </View>

      {/* Impact chip */}
      {impact > 0 && (
        <View style={sl.impactChip}>
          <Text style={sl.impactChipText}>↑ +KES {fmt(impact)}/mo impact</Text>
        </View>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
type Budgets = { transport: number; food: number; rent: number; utilities: number };

export default function ImpactScreen() {
  const [budgets, setBudgets] = useState<Budgets>({
    transport: 5000,
    food:      15000,
    rent:      10000,
    utilities: 5000,
  });

  const set = (key: keyof Budgets) => (v: number) =>
    setBudgets((prev) => ({ ...prev, [key]: v }));

  // Calculate total monthly impact in KES
  const impacts = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(budgets).map(([k, v]) => [
          k,
          Math.round(v * IMPACT_RATES[k as keyof typeof IMPACT_RATES]),
        ])
      ) as Record<keyof Budgets, number>,
    [budgets]
  );

  const totalImpact = useMemo(
    () => Object.values(impacts).reduce((s, v) => s + v, 0),
    [impacts]
  );

  // Top 2 drivers
  const topDrivers = useMemo(
    () =>
      (Object.entries(impacts) as [keyof Budgets, number][])
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .filter(([, v]) => v > 0),
    [impacts]
  );

  const totalSpend = Object.values(budgets).reduce((s, v) => s + v, 0);

  return (
    <SafeAreaView style={sc.screen} edges={['top']}>
      {/* Header */}
      <View style={sc.header}>
        <TouchableOpacity style={sc.backBtn} activeOpacity={0.7}>
          <Text style={sc.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={sc.headerCenter}>
          <Text style={sc.headerTitle}>Your Impact</Text>
          <Text style={sc.headerSub}>Adjust your monthly spending</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={sc.scroll}
        contentContainerStyle={sc.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Context banner ──────────────────────────────────────────────── */}
        <View style={sc.banner}>
          <Text style={sc.bannerIcon}>📊</Text>
          <Text style={sc.bannerText}>
            Based on this week's fuel, food & forex changes — we calculate how your actual spending is affected.
          </Text>
        </View>

        {/* ── Sliders card ─────────────────────────────────────────────────── */}
        <View style={sc.card}>
          <Text style={sc.cardLabel}>MONTHLY BUDGET</Text>
          {SLIDER_CONFIG.map((cfg) => (
            <BudgetSlider
              key={cfg.key}
              config={cfg}
              value={budgets[cfg.key as keyof Budgets]}
              onChange={set(cfg.key as keyof Budgets)}
            />
          ))}
        </View>

        {/* ── Breakdown card ───────────────────────────────────────────────── */}
        <View style={sc.card}>
          <Text style={sc.cardLabel}>IMPACT BREAKDOWN</Text>
          {SLIDER_CONFIG.map((cfg) => {
            const imp = impacts[cfg.key as keyof Budgets];
            const bud = budgets[cfg.key as keyof Budgets];
            const pct = bud > 0 ? ((imp / bud) * 100).toFixed(1) : '0.0';
            return (
              <View key={cfg.key} style={sc.breakdownRow}>
                <View style={sc.breakdownLeft}>
                  <Text style={sc.breakdownIcon}>{cfg.icon}</Text>
                  <View>
                    <Text style={sc.breakdownName}>{cfg.label}</Text>
                    <Text style={sc.breakdownRate}>{DRIVER_COPY[cfg.key]}</Text>
                  </View>
                </View>
                <View style={sc.breakdownRight}>
                  <Text style={sc.breakdownImpact}>+KES {fmt(imp)}</Text>
                  <Text style={sc.breakdownPct}>{pct}%</Text>
                </View>
              </View>
            );
          })}

          {/* Divider + total */}
          <View style={sc.divider} />
          <View style={sc.breakdownRow}>
            <Text style={sc.totalLabel}>Total monthly spend</Text>
            <Text style={sc.totalSpend}>KES {fmt(totalSpend)}</Text>
          </View>
        </View>

        {/* ── Result card ──────────────────────────────────────────────────── */}
        <View style={[sc.card, sc.resultCard]}>
          <View style={sc.resultHeader}>
            <View style={sc.resultDot} />
            <Text style={sc.resultHeading}>Your Estimated Monthly Change</Text>
          </View>

          <View style={sc.resultAmountRow}>
            <Text style={sc.resultArrow}>↑</Text>
            <Text style={sc.resultAmount}>KES {fmt(totalImpact)}</Text>
          </View>
          <Text style={sc.resultSub}>This month vs last month</Text>

          {topDrivers.length > 0 && (
            <View style={sc.driversBox}>
              <Text style={sc.driversTitle}>Main drivers</Text>
              <Text style={sc.driversText}>
                {topDrivers
                  .map(([k]) => {
                    const label = SLIDER_CONFIG.find((c) => c.key === k)?.label ?? k;
                    return `${label} (+KES ${fmt(impacts[k as keyof Budgets])})`;
                  })
                  .join(' and ')}{' '}
                {topDrivers.length === 1 ? 'is' : 'are'} contributing most to your estimated rise in monthly expenses.
              </Text>
            </View>
          )}

          <TouchableOpacity style={sc.cta} activeOpacity={0.8}>
            <Text style={sc.ctaText}>See Recommendations</Text>
          </TouchableOpacity>
        </View>

        {/* ── Tips card ────────────────────────────────────────────────────── */}
        <View style={[sc.card, sc.tipsCard]}>
          <Text style={sc.cardLabel}>SAVINGS TIPS</Text>
          {[
            { icon: '⛽', tip: 'Use Uber Pool or matatu during off-peak to cut transport costs by up to 30%.' },
            { icon: '🛒', tip: 'Buy maize flour and rice in bulk at Quickmart — prices are 12% cheaper per kg.' },
            { icon: '⚡', tip: 'Shift heavy appliances to Economy 7 off-peak hours to reduce your electricity bill.' },
          ].map((t, i) => (
            <View key={i} style={sc.tipRow}>
              <Text style={sc.tipIcon}>{t.icon}</Text>
              <Text style={sc.tipText}>{t.tip}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Slider styles ────────────────────────────────────────────────────────────
const sl = StyleSheet.create({
  group: {
    marginBottom: 24,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  icon: {
    fontSize: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
    color: C.green,
  },
  trackOuter: {
    height: 36,
    justifyContent: 'center',
    position: 'relative',
  },
  trackBg: {
    height: 8,
    borderRadius: 999,
    backgroundColor: C.greenTrack,
  },
  trackFill: {
    position: 'absolute',
    height: 8,
    borderRadius: 999,
    backgroundColor: C.green,
  },
  thumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: C.green,
    shadowColor: C.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
    top: 6,
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  rangeText: {
    fontSize: 10,
    color: C.textDim,
  },
  impactChip: {
    alignSelf: 'flex-start',
    marginTop: 6,
    backgroundColor: C.dangerDim,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  impactChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.danger,
  },
});

// ─── Screen styles ────────────────────────────────────────────────────────────
const sc = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 48,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: C.bg,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 20,
    color: C.text,
    lineHeight: 24,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
  },
  headerSub: {
    fontSize: 12,
    color: C.textSub,
    marginTop: 2,
  },

  // Banner
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: C.greenDim,
    borderWidth: 1,
    borderColor: C.cardBorderGreen,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  bannerIcon: {
    fontSize: 18,
    marginTop: 1,
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    color: C.textSub,
    lineHeight: 20,
  },

  // Card
  card: {
    backgroundColor: C.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 6,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: C.textDim,
    letterSpacing: 1.4,
    marginBottom: 20,
  },

  // Breakdown
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  breakdownIcon: {
    fontSize: 20,
    width: 28,
    textAlign: 'center',
  },
  breakdownName: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text,
  },
  breakdownRate: {
    fontSize: 11,
    color: C.textDim,
    marginTop: 2,
  },
  breakdownRight: {
    alignItems: 'flex-end',
  },
  breakdownImpact: {
    fontSize: 14,
    fontWeight: '700',
    color: C.danger,
  },
  breakdownPct: {
    fontSize: 11,
    color: C.textDim,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: C.cardBorder,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: C.text,
  },
  totalSpend: {
    fontSize: 14,
    fontWeight: '700',
    color: C.textSub,
  },

  // Result card
  resultCard: {
    borderColor: 'rgba(240,91,91,0.25)',
    backgroundColor: 'rgba(240,91,91,0.05)',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  resultDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.green,
  },
  resultHeading: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textSub,
    letterSpacing: 0.2,
  },
  resultAmountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    marginBottom: 4,
  },
  resultArrow: {
    fontSize: 28,
    fontWeight: '800',
    color: C.danger,
    lineHeight: 52,
  },
  resultAmount: {
    fontSize: 48,
    fontWeight: '800',
    color: C.danger,
    letterSpacing: -1.5,
    lineHeight: 56,
  },
  resultSub: {
    fontSize: 13,
    color: C.textSub,
    marginBottom: 18,
  },
  driversBox: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 14,
    marginBottom: 20,
  },
  driversTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textDim,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  driversText: {
    fontSize: 13,
    color: C.textSub,
    lineHeight: 20,
  },
  cta: {
    backgroundColor: C.green,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: C.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },

  // Tips card
  tipsCard: {
    borderColor: C.cardBorder,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  tipIcon: {
    fontSize: 18,
    marginTop: 1,
    width: 24,
    textAlign: 'center',
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: C.textSub,
    lineHeight: 20,
  },
});