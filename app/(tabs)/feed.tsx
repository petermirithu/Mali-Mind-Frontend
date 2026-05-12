import React, { useState, useRef, useCallback } from 'react';
import {
  ActivityIndicator,
  Animated,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@gluestack-ui/themed';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg: '#0D1117',
  surface: '#121821',
  card: '#1A2332',
  cardBorder: '#243044',
  green: '#0B8F4D',
  greenDim: 'rgba(11,143,77,0.12)',
  greenBorder: 'rgba(11,143,77,0.30)',
  text: '#FFFFFF',
  textSub: '#8A9BB5',
  textDim: '#4A5A72',
  danger: '#F05B5B',
  dangerDim: 'rgba(240,91,91,0.10)',
  gold: '#F5B301',
  goldDim: 'rgba(245,179,1,0.10)',
  blue: '#3B82F6',
  blueDim: 'rgba(59,130,246,0.10)',
};

// ─── Category config ──────────────────────────────────────────────────────────
type Category = 'All' | 'Fuel' | 'Forex' | 'Food' | 'Tax' | 'CBK' | 'Inflation';

const CATEGORY_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
  Fuel:      { color: '#F05B5B', bg: 'rgba(240,91,91,0.12)',   icon: '⛽' },
  Forex:     { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)',  icon: '💱' },
  Food:      { color: '#F5B301', bg: 'rgba(245,179,1,0.12)',   icon: '🛒' },
  Tax:       { color: '#A78BFA', bg: 'rgba(167,139,250,0.12)', icon: '📋' },
  CBK:       { color: '#0B8F4D', bg: 'rgba(11,143,77,0.12)',   icon: '🏦' },
  Inflation: { color: '#FB923C', bg: 'rgba(251,146,60,0.12)',  icon: '📈' },
};

const FILTERS: Category[] = ['All', 'Fuel', 'Forex', 'Food', 'Tax', 'CBK', 'Inflation'];

// ─── Feed data ────────────────────────────────────────────────────────────────
type FeedItem = {
  id: string;
  category: Exclude<Category, 'All'>;
  tag: string;
  title: string;
  what: string;
  why: string;
  impact: string;
  time: string;
  severity: 'high' | 'medium' | 'low';
  change?: string;
  changePositive?: boolean;
};

const FEED_ITEMS: FeedItem[] = [
  {
    id: '1',
    category: 'Fuel',
    tag: 'Price Update',
    title: 'Petrol holds at KES 197.60/litre in Nairobi',
    what: 'EPRA confirmed petrol prices remain at KES 197.60 per litre for May 2026, unchanged from April.',
    why: 'Global crude oil prices stabilised near $82/barrel. The KES/USD rate held at 129, limiting further import cost pressure.',
    impact: 'Transport costs stay elevated. Matatu fares unlikely to drop. Businesses dependent on delivery fleets continue to feel the squeeze.',
    time: '2h ago',
    severity: 'high',
    change: '+3.6%',
    changePositive: false,
  },
  {
    id: '2',
    category: 'CBK',
    tag: 'Policy Decision',
    title: 'CBK holds base rate at 13% for second consecutive month',
    what: 'The Central Bank of Kenya Monetary Policy Committee held the benchmark lending rate at 13.00%, pausing its tightening cycle.',
    why: 'Inflation eased slightly to 5.2% in April, giving the MPC room to pause without triggering currency pressure.',
    impact: 'Loan repayments stay expensive. Mobile loan interest rates remain high. Businesses face continued tight credit conditions into Q2.',
    time: '5h ago',
    severity: 'medium',
    change: '13.0%',
    changePositive: true,
  },
  {
    id: '3',
    category: 'Forex',
    tag: 'Currency Move',
    title: 'USD/KES climbs to 129.45 amid dollar strength',
    what: 'The Kenyan shilling weakened to 129.45 against the US dollar, its lowest point in six weeks.',
    why: 'Strong US jobs data pushed the dollar higher globally. Kenya\'s import demand for fuel and capital goods added pressure on the shilling.',
    impact: 'Imported goods cost more — fuel, electronics, medicine. Expect price increases at supermarkets within 2–3 weeks as importers pass costs forward.',
    time: '7h ago',
    severity: 'high',
    change: '+1.2%',
    changePositive: false,
  },
  {
    id: '4',
    category: 'Food',
    tag: 'Basket Price',
    title: 'Maize flour at KES 86/kg — millers warn of further rise',
    what: 'Maize flour (1kg pack) is retailing at KES 86 at major supermarkets. Millers say input costs are rising and prices could hit KES 95 by June.',
    why: 'Poor short rains in Rift Valley reduced local maize output. Import duties on maize remain, limiting relief from cheaper regional supplies.',
    impact: 'Households spending more on ugali — the core staple. A family of 5 using 4kg/week now spends KES 344/week on maize flour alone, up from KES 280 in Jan.',
    time: '12h ago',
    severity: 'high',
    change: '+8.9%',
    changePositive: false,
  },
  {
    id: '5',
    category: 'Tax',
    tag: 'Regulation',
    title: 'KRA extends deadline for VAT filing to June 20',
    what: 'Kenya Revenue Authority extended the VAT return filing deadline from June 10 to June 20, 2026 following system downtime.',
    why: 'The iTax portal experienced intermittent outages over three days, preventing businesses from submitting returns on time.',
    impact: 'SMEs and freelancers get a 10-day reprieve. No penalties will be applied for late filings submitted before the new deadline.',
    time: '1d ago',
    severity: 'low',
    change: '+10 days',
    changePositive: true,
  },
  {
    id: '6',
    category: 'Inflation',
    tag: 'CPI Data',
    title: 'Kenya CPI inflation eases to 5.2% in April 2026',
    what: 'The Kenya National Bureau of Statistics reported April CPI inflation at 5.2%, down from 5.6% in March.',
    why: 'Lower energy prices in March carried through. Food inflation remains elevated but the rate of increase slowed month-on-month.',
    impact: 'Some relief for households but prices are still rising — just more slowly. The purchasing power of KES 1,000 fell by KES 52 compared to last year.',
    time: '1d ago',
    severity: 'medium',
    change: '-0.4%',
    changePositive: true,
  },
  {
    id: '7',
    category: 'Fuel',
    tag: 'Diesel',
    title: 'Diesel dips to KES 196.63 — a small relief for hauliers',
    what: 'Diesel dropped marginally to KES 196.63/litre, down from KES 198.40 last month per the latest EPRA review.',
    why: 'Global diesel crack spreads narrowed following reduced industrial demand from China. The KES held steady against the USD.',
    impact: 'Freight and logistics firms benefit most. Consumer goods transport costs may ease slightly — watch for small price drops at wholesale markets within 2 weeks.',
    time: '2d ago',
    severity: 'low',
    change: '-0.9%',
    changePositive: true,
  },
  {
    id: '8',
    category: 'CBK',
    tag: 'Forex Reserve',
    title: 'Kenya\'s forex reserves rise to $8.3bn — 4.4 months of import cover',
    what: 'CBK reported usable foreign exchange reserves increased to $8.3 billion, providing 4.4 months of import cover.',
    why: 'Strong diaspora remittances ($412m in March) and tourism receipts boosted reserves. An IMF tranche of $190m also arrived.',
    impact: 'Stable import cover reduces risk of a shilling crisis. Businesses can plan imports with more confidence. Reduces pressure on fuel and food import costs.',
    time: '3d ago',
    severity: 'medium',
    change: '+$0.3bn',
    changePositive: true,
  },
];

// ─── AI explanation via Claude API ───────────────────────────────────────────
async function fetchAiMeaning(item: FeedItem): Promise<string> {
  const prompt = `You are Mali, MaliMind's AI economic assistant for Kenya. In exactly 2 sentences, explain what "${item.title}" means for an everyday Kenyan household. Be specific: use KES amounts, mention Nairobi if relevant, and give one practical action the reader can take. Do not use bullet points.`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) throw new Error('API error');
  const data = await res.json();
  return data?.content?.find((b: any) => b.type === 'text')?.text?.trim() ?? '';
}

// ─── Severity dot ─────────────────────────────────────────────────────────────
function SeverityDot({ level }: { level: FeedItem['severity'] }) {
  const color = level === 'high' ? C.danger : level === 'medium' ? C.gold : C.green;
  return <View style={[sd.dot, { backgroundColor: color }]} />;
}
const sd = StyleSheet.create({ dot: { width: 7, height: 7, borderRadius: 3.5 } });

// ─── Feed card ────────────────────────────────────────────────────────────────
function FeedCard({ item }: { item: FeedItem }) {
  const [expanded, setExpanded] = useState(false);
  const [aiText, setAiText] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const cfg = CATEGORY_CONFIG[item.category];

  const handleExpand = useCallback(async () => {
    setExpanded((e) => !e);
    if (!expanded && !aiText) {
      setAiLoading(true);
      try {
        const text = await fetchAiMeaning(item);
        setAiText(text);
      } catch {
        setAiText('Mali couldn\'t generate an explanation right now. Check your connection.');
      } finally {
        setAiLoading(false);
      }
    }
  }, [expanded, aiText, item]);

  return (
    <View style={fc.card}>
      {/* Top row: category chip + time + severity */}
      <View style={fc.topRow}>
        <View style={[fc.catChip, { backgroundColor: cfg.bg }]}>
          <Text style={fc.catIcon}>{cfg.icon}</Text>
          <Text style={[fc.catLabel, { color: cfg.color }]}>{item.category}</Text>
        </View>
        <View style={fc.topRight}>
          <SeverityDot level={item.severity} />
          <Text style={fc.time}>{item.time}</Text>
        </View>
      </View>

      {/* Tag + change badge */}
      <View style={fc.tagRow}>
        <Text style={fc.tag}>{item.tag}</Text>
        {item.change && (
          <View style={[fc.changeBadge, { backgroundColor: item.changePositive ? C.greenDim : C.dangerDim }]}>
            <Text style={[fc.changeText, { color: item.changePositive ? C.green : C.danger }]}>
              {item.change}
            </Text>
          </View>
        )}
      </View>

      {/* Title */}
      <Text style={fc.title}>{item.title}</Text>

      {/* Collapsed preview */}
      {!expanded && (
        <Text style={fc.preview} numberOfLines={2}>{item.what}</Text>
      )}

      {/* Expanded detail */}
      {expanded && (
        <View style={fc.expandedBody}>
          <View style={fc.section}>
            <Text style={fc.sectionLabel}>WHAT HAPPENED</Text>
            <Text style={fc.sectionText}>{item.what}</Text>
          </View>
          <View style={fc.divider} />
          <View style={fc.section}>
            <Text style={fc.sectionLabel}>WHY IT HAPPENED</Text>
            <Text style={fc.sectionText}>{item.why}</Text>
          </View>
          <View style={fc.divider} />
          <View style={fc.section}>
            <Text style={fc.sectionLabel}>WHAT IT MEANS FOR YOU</Text>
            <Text style={fc.sectionText}>{item.impact}</Text>
          </View>

          {/* AI Mali explanation */}
          <View style={fc.maliBox}>
            <View style={fc.maliHeader}>
              <View style={fc.maliIconWrap}>
                <Text style={fc.maliIcon}>✦</Text>
              </View>
              <Text style={fc.maliTitle}>Mali's Take</Text>
              {aiLoading && <ActivityIndicator size="small" color={C.green} style={{ marginLeft: 8 }} />}
            </View>
            {aiLoading ? (
              <Text style={fc.maliLoading}>Generating insight…</Text>
            ) : aiText ? (
              <Text style={fc.maliText}>{aiText}</Text>
            ) : null}
          </View>
        </View>
      )}

      {/* Expand / collapse button */}
      <TouchableOpacity style={fc.expandBtn} onPress={handleExpand} activeOpacity={0.7}>
        <Text style={fc.expandBtnText}>{expanded ? 'Show less ↑' : 'Full breakdown + Mali insight →'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const fc = StyleSheet.create({
  card: {
    backgroundColor: C.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 5,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  catIcon: { fontSize: 12 },
  catLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  time: { fontSize: 11, color: C.textDim },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tag: {
    fontSize: 10,
    fontWeight: '700',
    color: C.textDim,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  changeBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  changeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
    lineHeight: 23,
    marginBottom: 10,
  },
  preview: {
    fontSize: 13,
    color: C.textSub,
    lineHeight: 20,
    marginBottom: 12,
  },
  expandedBody: {
    marginBottom: 12,
  },
  section: {
    paddingVertical: 12,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: C.textDim,
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  sectionText: {
    fontSize: 13,
    color: C.textSub,
    lineHeight: 21,
  },
  divider: {
    height: 1,
    backgroundColor: C.cardBorder,
  },
  maliBox: {
    marginTop: 14,
    backgroundColor: C.greenDim,
    borderWidth: 1,
    borderColor: C.greenBorder,
    borderRadius: 14,
    padding: 14,
  },
  maliHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  maliIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(11,143,77,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  maliIcon: { fontSize: 10, color: C.green },
  maliTitle: { fontSize: 12, fontWeight: '700', color: C.green, letterSpacing: 0.3 },
  maliLoading: { fontSize: 13, color: C.textDim, fontStyle: 'italic' },
  maliText: { fontSize: 13, color: C.textSub, lineHeight: 21 },
  expandBtn: {
    paddingTop: 4,
  },
  expandBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.green,
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function FeedScreen() {
  const [activeFilter, setActiveFilter] = useState<Category>('All');
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const filtered = activeFilter === 'All'
    ? FEED_ITEMS
    : FEED_ITEMS.filter((i) => i.category === activeFilter);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setRefreshKey((k) => k + 1);
    }, 1200);
  }, []);

  const now = new Date().toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <SafeAreaView style={sc.screen} edges={['top']}>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <View style={sc.header}>
        <View>
          <Text style={sc.headerTitle}>Market Feed</Text>
          <Text style={sc.headerDate}>{now}</Text>
        </View>
        <View style={sc.livePill}>
          <View style={sc.liveDot} />
          <Text style={sc.liveText}>Live</Text>
        </View>
      </View>

      {/* ── Filter chips ─────────────────────────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={sc.filterScroll}
        contentContainerStyle={sc.filterContent}
      >
        {FILTERS.map((f) => {
          const active = f === activeFilter;
          const cfg = f !== 'All' ? CATEGORY_CONFIG[f] : null;
          return (
            <TouchableOpacity
              key={f}
              style={[
                sc.filterChip,
                active && { backgroundColor: cfg?.bg ?? C.greenDim, borderColor: cfg?.color ?? C.green },
              ]}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.75}
            >
              {cfg && <Text style={sc.filterIcon}>{cfg.icon}</Text>}
              <Text style={[sc.filterText, active && { color: cfg?.color ?? C.green, fontWeight: '700' }]}>
                {f}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Feed list ────────────────────────────────────────────────────────── */}
      <ScrollView
        style={sc.scroll}
        contentContainerStyle={sc.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.green}
            colors={[C.green]}
          />
        }
      >
        {/* Summary bar */}
        <View style={sc.summaryBar}>
          <Text style={sc.summaryText}>
            {filtered.length} update{filtered.length !== 1 ? 's' : ''} today
          </Text>
          <View style={sc.summaryRight}>
            {[
              { label: 'High', color: C.danger, count: filtered.filter((i) => i.severity === 'high').length },
              { label: 'Med', color: C.gold, count: filtered.filter((i) => i.severity === 'medium').length },
            ]
              .filter((s) => s.count > 0)
              .map((s) => (
                <View key={s.label} style={sc.severityBadge}>
                  <View style={[sc.severityDot, { backgroundColor: s.color }]} />
                  <Text style={sc.severityLabel}>{s.count} {s.label}</Text>
                </View>
              ))}
          </View>
        </View>

        {filtered.map((item) => (
          <FeedCard key={`${item.id}-${refreshKey}`} item={item} />
        ))}

        <Text style={sc.footer}>Pull to refresh · Powered by MaliMind</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Screen styles ────────────────────────────────────────────────────────────
const sc = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -0.4,
  },
  headerDate: {
    fontSize: 12,
    color: C.textDim,
    marginTop: 3,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: C.green,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.green,
  },

  // Filter row
  filterScroll: {
    flexGrow: 0,
    marginBottom: 4,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filterIcon: { fontSize: 12 },
  filterText: {
    fontSize: 13,
    color: C.textSub,
    fontWeight: '500',
  },

  // Feed
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 48,
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingVertical: 4,
  },
  summaryText: {
    fontSize: 12,
    color: C.textDim,
    fontWeight: '500',
  },
  summaryRight: {
    flexDirection: 'row',
    gap: 12,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  severityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  severityLabel: {
    fontSize: 11,
    color: C.textDim,
  },

  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: C.textDim,
    marginTop: 8,
    marginBottom: 16,
  },
});