import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Text, View } from '@gluestack-ui/themed';
import { FeedItemUi, useFeed } from '@/hooks/use-feed';
import { Spinner } from '@/components/ui/spinner';
import { useTheme } from '@/contexts/theme-context';
import { Fonts } from '@/constants/fonts';
import FeedCard from '@/components/feed/feedCard';
import { showAppToast, useToast } from '@/components/ui/toast';
import { SafeAreaView } from 'react-native-safe-area-context';

type BackendCategory =
  | 'fuel'
  | 'forex'
  | 'food'
  | 'inflation'
  | 'tax'
  | 'cbk'
  | 'banking'
  | 'capital_markets'
  | 'trade_industry'
  | 'real_estate'
  | 'employment'
  | 'smes_business'
  | 'transport'
  | 'utilities';

type CategoryFilter = 'all' | BackendCategory;

type FeedApiItem = {
  id: number;
  title: string;
  category: BackendCategory | string;
  what_happened: string;
  why_it_happened: string;
  what_it_means: string;
  source_url?: string;
  published_at: string;
  created_at: string;
};

const BACKEND_CATEGORIES: BackendCategory[] = [
  'fuel',
  'forex',
  'food',
  'inflation',
  'tax',
  'cbk',
  'banking',
  'capital_markets',
  'trade_industry',
  'real_estate',
  'employment',
  'smes_business',
  'transport',
  'utilities',
];

const FILTERS: CategoryFilter[] = ['all', ...BACKEND_CATEGORIES];

const CATEGORY_CONFIG: Record<string, { icon: string; tone: 'danger' | 'accent' | 'warning' | 'success' }> = {
  fuel: { icon: '⛽', tone: 'danger' },
  forex: { icon: '💱', tone: 'accent' },
  food: { icon: '🛒', tone: 'warning' },
  tax: { icon: '📋', tone: 'accent' },
  cbk: { icon: '🏦', tone: 'success' },
  inflation: { icon: '📈', tone: 'warning' },
  banking: { icon: '🏛️', tone: 'success' },
  capital_markets: { icon: '📊', tone: 'accent' },
  trade_industry: { icon: '🏭', tone: 'warning' },
  real_estate: { icon: '🏘️', tone: 'warning' },
  employment: { icon: '💼', tone: 'success' },
  smes_business: { icon: '🏪', tone: 'success' },
  transport: { icon: '🚚', tone: 'danger' },
  utilities: { icon: '💡', tone: 'accent' },
};

const DEFAULT_CATEGORY_STYLE = { icon: '📰', tone: 'accent' as const };

function toTitleLabel(input: string) {
  return input
    .replace(/_/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function timeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const mins = Math.floor(diffMs / (1000 * 60));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function FeedScreen() {
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('all');
  const { data, isLoading, isError, refetch, isFetching } = useFeed();
  const { theme } = useTheme();
  const toast = useToast();
  const sc = useMemo(() => createScreenStyles(theme), [theme]);
  const hasShownErrorToast = useRef(false);

  const feedItems = useMemo<FeedItemUi[]>(() => {
    const rows = (data as FeedApiItem[] | undefined) ?? [];
    return rows.map((row) => ({
      id: String(row.id),
      category: String(row.category || 'general_finance').toLowerCase(),
      title: row.title,
      what: row.what_happened,
      why: row.why_it_happened,
      impact: row.what_it_means,
      time: timeAgo(row.published_at || row.created_at),
      sourceUrl: row.source_url,
    }));
  }, [data]);

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return feedItems;
    return feedItems.filter((i) => i.category === activeFilter);
  }, [feedItems, activeFilter]);

  const onRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const openSource = useCallback(async (url?: string) => {
    if (!url) return;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      showAppToast(toast, {
        action: 'error',
        title: 'Invalid link',
        description: 'Could not open this source link.',
        nativeIDPrefix: 'feed-link-error',
      });
    }
  }, [toast]);

  useEffect(() => {
    if (isError && !hasShownErrorToast.current) {
      showAppToast(toast, {
        action: 'error',
        title: 'Feed unavailable',
        description: 'Could not load updates right now. Pull to refresh and try again.',
        nativeIDPrefix: 'feed-error',
      });
      hasShownErrorToast.current = true;
    }

    if (!isError) {
      hasShownErrorToast.current = false;
    }
  }, [isError, toast]);

  const now = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <SafeAreaView style={[sc.screen, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={sc.header}>
        <View>
          <Text style={[sc.headerTitle, { color: theme.text }]}>Feed</Text>
          <Text style={[sc.headerDate, { color: theme.textDim }]}>{now}</Text>
        </View>

        <View style={[sc.livePill, { backgroundColor: theme.glassSurface, borderColor: theme.glassBorder }]}>
          <View style={[sc.liveDot, { backgroundColor: theme.success }]} />
          <Text style={[sc.liveText, { color: theme.success }]}>Live</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={sc.filterScroll}
        contentContainerStyle={sc.filterContent}
      >
        {FILTERS.map((f) => {
          const isActive = activeFilter === f;
          const label = f === 'all' ? 'All' : toTitleLabel(f);
          const cfg = CATEGORY_CONFIG[f] ?? DEFAULT_CATEGORY_STYLE;

          return (
            <TouchableOpacity
              key={f}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.8}
              style={[
                sc.filterChip,
                {
                  backgroundColor: isActive ? theme.primaryDim : theme.card,
                  borderColor: isActive ? theme.primary : theme.glassBorder,
                },
              ]}
            >
              <Text style={sc.filterIcon}>{cfg.icon}</Text>
              <Text
                style={[
                  sc.filterText,
                  {
                    color: isActive ? theme.primary : theme.textDim,
                  },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        style={sc.scroll}
        contentContainerStyle={sc.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      >
        <View style={sc.summaryBar}>
          <Text style={[sc.summaryText, { color: theme.textDim }]}>
            {filtered.length} update{filtered.length === 1 ? '' : 's'} in {activeFilter === 'all' ? 'all categories' : toTitleLabel(activeFilter)}
          </Text>
        </View>

        {isLoading ? (
          <View style={sc.stateWrap}>
            <Spinner size="large" color={theme.primary} />
            <Text style={[sc.stateText, { color: theme.textDim }]}>Loading market updates...</Text>
          </View>
        ) : null}

        {isError ? (
          <View style={sc.stateWrap}>
            <Text style={[sc.errorText, { color: theme.danger }]}>
              Could not load updates right now. Pull to refresh and try again.
            </Text>
          </View>
        ) : null}

        {!isLoading && !isError && filtered.length === 0 ? (
          <View style={sc.stateWrap}>
            <Text style={[sc.stateText, { color: theme.textDim }]}>No updates in this category yet.</Text>
          </View>
        ) : null}
        
        {!isLoading && !isError && filtered.map((item) => (
          <FeedCard
            key={item.id}
            item={item}
            cfg={CATEGORY_CONFIG[item.category] ?? DEFAULT_CATEGORY_STYLE}
            toTitleLabel={toTitleLabel}
            onOpenSource={openSource}
          />
        ))}

        {!isLoading && !isError && filtered.length > 0 ? (
          <Text style={[sc.footer, { color: theme.textDim }]}>You are up to date</Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const createScreenStyles = (theme: any) =>
  StyleSheet.create({
    screen: {
      flex: 1,
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
      letterSpacing: -0.35,
      fontFamily: Fonts.sans,
    },
    headerDate: {
      fontSize: 12,
      marginTop: 3,
      fontFamily: Fonts.rounded,
    },
    livePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderWidth: 1,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 7,
    },
    liveDot: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
    },
    liveText: {
      fontSize: 12,
      fontWeight: '700',
      fontFamily: Fonts.rounded,
    },
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
      borderWidth: 1,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    filterIcon: { fontSize: 12 },
    filterText: {
      fontSize: 13,
      fontWeight: '600',
      fontFamily: Fonts.rounded,
    },
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
      fontWeight: '500',
      fontFamily: Fonts.rounded,
    },
    stateWrap: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 24,
    },
    stateText: {
      marginTop: 10,
      fontSize: 13,
      fontFamily: Fonts.rounded,
    },
    errorText: {
      fontSize: 13,
      textAlign: 'center',
      fontFamily: Fonts.rounded,
    },
    footer: {
      textAlign: 'center',
      fontSize: 12,
      marginTop: 8,
      marginBottom: 16,
      fontFamily: Fonts.rounded,
    },
  });