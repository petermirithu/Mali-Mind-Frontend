import { useMemo, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from '@gluestack-ui/themed';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useImpact, useSaveImpact } from '@/hooks/use-impact';
import { useTheme } from '@/contexts/theme-context';
import HeroChart from '@/components/impact/heroChart';
import ImpactTile from '@/components/impact/impactTile';
import ImpactProfileItem from '@/components/impact/impactProfileItem';
import ImpactBreakdownChart from '@/components/impact/impactBreakDownChart';
import { useSelector } from 'react-redux';

const { width: SW } = Dimensions.get('window');


// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatKES(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatKESDecimal(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function isImpactProfileEmpty(profile: any): boolean {

  // {"commute": 0, "custom_categories": [], "electricity": 0, "food_budget": 0, "income": 0, "rent": 0, "savings": 0, "transport": "N/A", "water": 0}

  if (!profile) return true;

  const numericFields = [
    Number(profile.income ?? 0),
    Number(profile.rent ?? 0),
    Number(profile.food_budget ?? 0),
    Number(profile.savings ?? 0),
    Number(profile.commute ?? 0),
    Number(profile.electricity ?? 0),
    Number(profile.water ?? 0),
  ];

  const allNumericZero = numericFields.every((n) => !Number.isFinite(n) || n <= 0);
  const noTransport = !profile.transport || String(profile.transport).trim().length === 0 || profile.transport == "N/A";

  const customCategories = Array.isArray(profile.custom_categories) ? profile.custom_categories : [];
  const hasAnyCustomWithValue = customCategories.some((cat: any) => {
    const nameOk = String(cat?.custom_item_name ?? '').trim().length > 0;
    const value = Number(cat?.monthly_cost ?? 0);
    return nameOk && Number.isFinite(value) && value > 0;
  });

  return allNumericZero && noTransport && !hasAnyCustomWithValue;
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ImpactScreen() {
  const { theme } = useTheme();
  const screenStyls = useMemo(() => screenStyles(theme), [theme]);
  const modalStyls = useMemo(() => modalStyles(theme), [theme]);

  const { userProfile } = useSelector((state: any) => state.userProfile);

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // ─── Fetch impact data ─────────────────────────────────────────────  
  const { data: impactData, isLoading, isError, refetch } = useImpact(userProfile.id);

  const [formData, setFormData] = useState({
    income: '80000',
    rent: '20000',
    food_budget: '24000',
    savings: '10000',
    transport: 'Matatu',
    commute: '20',
    electricity: '1000',
    water: '500',
  });
  const [isTransportOpen, setIsTransportOpen] = useState(false);
  const transportOptions = ['Matatu', 'Bus', 'Personal Car', 'Bodaboda', 'Walking', 'Uber / Bolt'];

  const [custom_categories, setCustomCategories] = useState<{ label: string, value: string }[]>([]);

  const saveImpact = useSaveImpact();

  // Sync form data when API data loads
  useMemo(() => {
    if (impactData?.user_impact_profile) {
      const profile = impactData.user_impact_profile;
      setFormData({
        income: String(profile.income),
        rent: String(profile.rent),
        food_budget: String(profile.food_budget),
        savings: String(profile.savings),
        transport: profile.transport,
        commute: String(profile.commute),
        electricity: String(profile.electricity),
        water: String(profile.water),
      });
      setCustomCategories(
        profile.custom_categories.map(cat => ({
          label: cat.custom_item_name,
          value: String(cat.monthly_cost),
        }))
      );
    }
  }, [impactData]);

  const handleSave = () => {
    saveImpact.mutate({
      ...formData,
      user_id: userProfile.id,
      custom_categories: custom_categories,
    }, {
      onSuccess: () => {
        setIsEditModalVisible(false);
      }
    });
  };

  const [isProfileExpanded, setIsProfileExpanded] = useState(false);

  // ─── Build profile items from API data ─────────────────────────────
  const profile = impactData?.user_impact_profile;
  const isProfileEmpty = isImpactProfileEmpty(profile);

  const coreProfileItems = profile ? [
    { icon: "💼", label: "Income", value: formatKES(profile.income), valueColor: theme.primary },
    { icon: "🏠", label: "Rent", value: formatKES(profile.rent), valueColor: theme.primary },
    { icon: "🛒", label: "Food Budget", value: formatKES(profile.food_budget), valueColor: theme.primary },
    { icon: "🚌", label: "Transport", value: profile.transport, valueColor: theme.primary },
    { icon: "📍", label: "Daily Commute", value: `${profile.commute} km`, valueColor: theme.primary },
    { icon: "⚡", label: "Electricity", value: formatKES(profile.electricity), valueColor: theme.primary },
    { icon: "💧", label: "Water", value: formatKES(profile.water), valueColor: theme.primary },
  ] : [];

  const additionalProfileItems = profile ? [
    { icon: "💰", label: "Savings", value: formatKES(profile.savings), valueColor: theme.primary },
    ...profile.custom_categories.map(cat => ({
      icon: "📌",
      label: cat.custom_item_name || 'Custom',
      value: formatKES(cat.monthly_cost),
      valueColor: theme.primary,
    }))
  ] : [];

  const allProfileItems = [...coreProfileItems, ...additionalProfileItems];
  const displayItems = isProfileExpanded ? allProfileItems : coreProfileItems;

  // ─── Build impact tiles (pair them in rows of 2) ───────────────────
  const breakdownTiles = useMemo(() => {
    if (!impactData?.impact_breakdown) return [];
    return impactData.impact_breakdown;
  }, [impactData]);

  const tileRows = useMemo(() => {
    const rows: typeof breakdownTiles[] = [];
    for (let i = 0; i < breakdownTiles.length; i += 2) {
      rows.push(breakdownTiles.slice(i, i + 2));
    }
    return rows;
  }, [breakdownTiles]);

  // ─── Hero card values ──────────────────────────────────────────────
  const heroAmount = impactData ? formatKESDecimal(impactData.current_month_spending) : '...';
  const heroChangePct = impactData?.spending_change_pct ?? 0;
  const heroTrend = impactData?.spending_trend ?? 'stable';
  const heroArrow = heroTrend === 'up' ? '↑' : heroTrend === 'down' ? '↓' : '→';
  const heroBadgeColor = heroTrend === 'up' ? theme.dangerDim : heroTrend === 'down' ? theme.primaryDim : theme.warningDim;
  const heroBadgeTextColor = heroTrend === 'up' ? theme.danger : heroTrend === 'down' ? theme.primary : theme.warning;
  const startFillColor = heroTrend === 'up' ? theme.redStartFillColor : theme.greenStartFillColor;
  const endFillColor = heroTrend === 'up' ? theme.redEndFillColor : theme.greenEndFillColor;
  const heroSubText = heroTrend === 'up' ? 'More than last month' : heroTrend === 'down' ? 'Less than last month' : 'Stable this month';
  const totalDeductions = impactData?.total_monthly_deductions ?? 0;
  const moneyLeftThisMonth = impactData?.money_left_this_month ?? 0;
  const savingsUtilizationPct = impactData?.savings_utilization_pct ?? 0;
  const moneyLeftTone = moneyLeftThisMonth < 0 ? theme.danger : theme.primary;

  // ─── Loading / Error states ────────────────────────────────────────
  if (isLoading) {
    return (
      <SafeAreaView style={screenStyls.screen} edges={['top']}>
        <View style={screenStyls.header}>
          <View>
            <Text style={screenStyls.headerTitle}>Your Impact</Text>
            <Text style={screenStyls.headerSub}>See how the economy affects your life</Text>
          </View>
          <TouchableOpacity disabled={true} style={screenStyls.infoBtn} activeOpacity={0.7} onPress={() => refetch()}>
            <MaterialIcons name="refresh" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ color: theme.textDim, marginTop: 12, fontSize: 14 }}>Loading your impact data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !impactData) {
    return (
      <SafeAreaView style={screenStyls.screen} edges={['top']}>
        <View style={screenStyls.header}>
          <View>
            <Text style={screenStyls.headerTitle}>Your Impact</Text>
            <Text style={screenStyls.headerSub}>See how the economy affects your life</Text>
          </View>
          <TouchableOpacity style={screenStyls.infoBtn} activeOpacity={0.7} onPress={() => refetch()}>
            <MaterialIcons name="refresh" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
          <Text style={{ color: theme.text, fontSize: 16, fontWeight: '700', marginBottom: 6, textAlign: 'center' }}>Failed to load impact data</Text>
          <Text style={{ color: theme.textDim, fontSize: 13, textAlign: 'center' }}>Please check your connection and try again.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={screenStyls.screen} edges={['top']}>
      {/* Header */}
      <View style={screenStyls.header}>
        <View>
          <Text style={screenStyls.headerTitle}>Your Impact</Text>
          <Text style={screenStyls.headerSub}>See how the economy affects your life</Text>
        </View>
        <TouchableOpacity style={screenStyls.infoBtn} activeOpacity={0.7} onPress={() => refetch()}>
          <MaterialIcons name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={screenStyls.scroll}
        contentContainerStyle={screenStyls.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isProfileEmpty ? (
          <View style={screenStyls.emptyStateCard}>
            <Text style={screenStyls.emptyStateIcon}>📝</Text>
            <Text style={screenStyls.emptyStateTitle}>Complete Your Impact Profile</Text>
            <Text style={screenStyls.emptyStateBody}>
              Your impact profile is empty. Fill in your income, expenses, and lifestyle details so Mali can personalize and calculate your impact.
            </Text>
            <TouchableOpacity
              style={screenStyls.emptyStateButton}
              activeOpacity={0.85}
              onPress={() => setIsEditModalVisible(true)}
            >
              <Text style={screenStyls.emptyStateButtonText}>Fill Impact Profile</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>



            {/* ── Hero spending card ──────────────────────────────────────────── */}
            <View style={[screenStyls.heroCard, {
              backgroundColor: heroTrend === 'down' ? 'rgba(11, 143, 77, 0.05)' : (heroTrend === 'up' ? 'rgba(235, 87, 87, 0.05)' : 'rgba(245, 166, 35, 0.05)'),
              borderColor: heroTrend === 'down' ? 'rgba(11, 143, 77, 0.3)' : (heroTrend === 'up' ? 'rgba(235, 87, 87, 0.3)' : 'rgba(245, 166, 35, 0.3)'),
              borderWidth: 1.5,
            }]}>
              <HeroChart color={heroBadgeTextColor} currentSpending={impactData.current_month_spending} pastSpending={impactData.past_6_months_spending || []} startFillColor={startFillColor} endFillColor={endFillColor} />
              <View style={screenStyls.heroLeft}>
                <Text style={screenStyls.heroTopLabel}>This month you're spending</Text>
                <Text style={screenStyls.heroAmount}>{heroAmount}</Text>
                <View style={[screenStyls.heroBadge, { backgroundColor: heroBadgeColor }]}>
                  <Text style={[screenStyls.heroBadgeText, { color: heroBadgeTextColor }]}>{heroArrow} {Math.abs(heroChangePct).toFixed(1)}%</Text>
                </View>
                <Text style={screenStyls.heroSub}>{heroSubText}</Text>

                <View style={screenStyls.heroMetaDivider} />

                <View style={screenStyls.heroMetaRow}>
                  <Text style={screenStyls.heroMetaLabel}>Left after deductions</Text>
                  <Text style={[screenStyls.heroMetaValue, { color: moneyLeftTone }]}>
                    {formatKESDecimal(moneyLeftThisMonth)}
                  </Text>
                </View>

                <View style={screenStyls.heroMetaRow}>
                  <Text style={screenStyls.heroMetaLabel}>Savings utilization</Text>
                  <Text style={screenStyls.heroMetaValue}>
                    {savingsUtilizationPct.toFixed(1)}%
                  </Text>
                </View>
              </View>
            </View>

            {/* ── Section 1: Your Profile ─────────────────────────────────────── */}
            <View style={screenStyls.sectionHeader}>
              <Text style={screenStyls.sectionTitle}>Impact Profiles</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(true)}>
                <Text style={screenStyls.editLink}>Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={screenStyls.profileCard}>
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 0,
              }}>
                {displayItems.map((item, index) => (
                  <ImpactProfileItem key={index} {...item} theme={theme} />
                ))}
                {additionalProfileItems.length > 0 && (
                  <ImpactProfileItem
                    icon=""
                    label={isProfileExpanded ? "Show less" : "View all"}
                    value={""}
                    isViewAll
                    onPress={() => setIsProfileExpanded(!isProfileExpanded)}
                    theme={theme}
                  />
                )}
              </View>
            </View>

            {/* ── Section 2: Impact Breakdown ─────────────────────────────────── */}
            <View style={screenStyls.sectionHeader}>
              <Text style={screenStyls.sectionTitle}>Impact Breakdown</Text>
            </View>
            <Text style={screenStyls.sectionDesc}>See where the pressure comes from</Text>

            {tileRows.map((row, rowIndex) => (
              <View key={rowIndex} style={screenStyls.tilesRow}>
                {row.map((item, idx) => (
                  <ImpactTile
                    key={`${rowIndex}-${idx}`}
                    icon={item.icon}
                    label={item.category}
                    amount={formatKES(item.monthly_amount_kes)}
                    pct={`${Math.abs(item.change_pct).toFixed(1)}%`}
                    direction={item.direction}
                    theme={theme}
                  />
                ))}
                {/* Fill empty space if odd number of tiles in last row */}
                {row.length === 1 && <View style={{ flex: 1 }} />}
              </View>
            ))}

            {/* ── Mali Insight ────────────────────────────────────────────────── */}
            <TouchableOpacity style={screenStyls.insightCard} activeOpacity={0.85}>
              <View style={screenStyls.insightIconBox}>
                <Text style={screenStyls.insightRobotIcon}>🤖</Text>
              </View>
              <View style={screenStyls.insightText}>
                <Text style={screenStyls.insightTitle}>Mali Insight</Text>
                <Text style={screenStyls.insightHeadline}>
                  {impactData.ai_insight}
                </Text>
                <Text style={screenStyls.insightBody}>
                  {impactData.ai_insight_detail}
                </Text>
              </View>
            </TouchableOpacity>
                        
            {/* ── Bottom two panels ────────────────────────────────────────────── */}
            <View style={screenStyls.bottomRow}>
              <View style={[screenStyls.bottomCard, screenStyls.expectCard]}>
                <Text style={screenStyls.bottomCardTitle}>What to Expect</Text>
                <Text style={screenStyls.bottomCardDesc}>If current trends continue</Text>

                <View style={screenStyls.expectChart}>
                  <View style={screenStyls.expectChartInner}>
                    <ImpactBreakdownChart
                      breakdownData={impactData.impact_breakdown}
                      width={(SW / 2) - 44}
                      height={100}
                      theme={theme}
                    />
                  </View>
                </View>

                <Text style={screenStyls.expectLabel}>Expected extra cost{'\n'}next month</Text>
                <Text style={screenStyls.expectAmount}>{formatKESDecimal(impactData.expected_extra_cost_kes)}</Text>
                <Text style={screenStyls.expectRange}>
                  Range: <Text style={{ color: theme.danger }}>{formatKESDecimal(impactData.cost_range_min)} – {formatKESDecimal(impactData.cost_range_max)}</Text>
                </Text>
              </View>

              {/* 5. Recommendations */}
              <View style={[screenStyls.bottomCard, screenStyls.recoCard]}>
                <Text style={screenStyls.bottomCardTitle}>Recommendations</Text>
                <Text style={screenStyls.bottomCardDesc}>Smart ways to reduce impact</Text>

                {impactData.recommendations.map((r, i) => (
                  <View key={i} style={screenStyls.recoRow}>
                    <View style={[screenStyls.recoIconBox, { backgroundColor: `${theme.primary}18` }]}>
                      <Text style={screenStyls.recoIcon}>{r.icon}</Text>
                    </View>
                    <Text style={screenStyls.recoText}>{r.text}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={modalStyls.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={modalStyls.modalContent}>
            <View style={modalStyls.modalHeader}>
              <Text style={modalStyls.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={theme.textDim} />
              </TouchableOpacity>
            </View>

            <ScrollView style={modalStyls.modalScroll} contentContainerStyle={modalStyls.modalScrollContent}>
              <Text style={modalStyls.inputLabel}>Income (KES)</Text>
              <TextInput style={modalStyls.input} value={formData.income} onChangeText={(t) => setFormData({ ...formData, income: t })} placeholderTextColor={theme.textDim} keyboardType="numeric" />

              <Text style={modalStyls.inputLabel}>Monthly Rent / Mortgage (KES)</Text>
              <TextInput style={modalStyls.input} value={formData.rent} onChangeText={(t) => setFormData({ ...formData, rent: t })} placeholderTextColor={theme.textDim} keyboardType="numeric" />

              <Text style={modalStyls.inputLabel}>Food & Groceries Budget (KES)</Text>
              <TextInput style={modalStyls.input} value={formData.food_budget} onChangeText={(t) => setFormData({ ...formData, food_budget: t })} placeholderTextColor={theme.textDim} keyboardType="numeric" />

              <Text style={modalStyls.inputLabel}>Transport Mode</Text>
              <TouchableOpacity
                style={modalStyls.input}
                onPress={() => setIsTransportOpen(!isTransportOpen)}
                activeOpacity={0.8}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: formData.transport ? theme.text : theme.textDim, fontSize: 14 }}>
                    {formData.transport || 'Select Transport Mode'}
                  </Text>
                  <MaterialIcons name={isTransportOpen ? "arrow-drop-up" : "arrow-drop-down"} size={24} color={theme.textDim} />
                </View>
              </TouchableOpacity>
              {isTransportOpen && (
                <View style={modalStyls.dropdownMenu}>
                  {transportOptions.map(mode => (
                    <TouchableOpacity
                      key={mode}
                      style={modalStyls.dropdownItem}
                      onPress={() => {
                        setFormData({ ...formData, transport: mode });
                        setIsTransportOpen(false);
                      }}
                    >
                      <Text style={[modalStyls.dropdownItemText, formData.transport === mode && modalStyls.dropdownItemTextSelected]}>{mode}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={modalStyls.inputLabel}>Daily Commute (km)</Text>
              <TextInput style={modalStyls.input} value={formData.commute} onChangeText={(t) => setFormData({ ...formData, commute: t })} placeholderTextColor={theme.textDim} keyboardType="numeric" />

              <Text style={modalStyls.inputLabel}>Electricity (KES)</Text>
              <TextInput style={modalStyls.input} value={formData.electricity} onChangeText={(t) => setFormData({ ...formData, electricity: t })} placeholderTextColor={theme.textDim} keyboardType="numeric" />

              <Text style={modalStyls.inputLabel}>Water (KES)</Text>
              <TextInput style={modalStyls.input} value={formData.water} onChangeText={(t) => setFormData({ ...formData, water: t })} placeholderTextColor={theme.textDim} keyboardType="numeric" />

              <Text style={modalStyls.inputLabel}>Savings & Investments (KES)</Text>
              <TextInput style={modalStyls.input} value={formData.savings} onChangeText={(t) => setFormData({ ...formData, savings: t })} placeholderTextColor={theme.textDim} keyboardType="numeric" />

              <View style={modalStyls.customSectionHeader}>
                <Text style={modalStyls.inputLabel}>Custom Categories</Text>
                <TouchableOpacity onPress={() => setCustomCategories([...custom_categories, { label: '', value: '' }])}>
                  <Text style={modalStyls.addCategoryText}>+ Add</Text>
                </TouchableOpacity>
              </View>

              {custom_categories.map((cat, idx) => (
                <View key={idx} style={modalStyls.customCategoryRow}>
                  <TextInput
                    style={[modalStyls.input, { flex: 1, marginRight: 8, marginBottom: 0 }]}
                    placeholder="Category Name"
                    placeholderTextColor={theme.textDim}
                    value={cat.label}
                    onChangeText={(t) => {
                      const newCats = [...custom_categories];
                      newCats[idx].label = t;
                      setCustomCategories(newCats);
                    }}
                  />
                  <TextInput
                    style={[modalStyls.input, { flex: 1, marginRight: 8, marginBottom: 0 }]}
                    placeholder="Value"
                    placeholderTextColor={theme.textDim}
                    value={cat.value}
                    onChangeText={(t) => {
                      const newCats = [...custom_categories];
                      newCats[idx].value = t;
                      setCustomCategories(newCats);
                    }}
                  />
                  <TouchableOpacity onPress={() => {
                    const newCats = [...custom_categories];
                    newCats.splice(idx, 1);
                    setCustomCategories(newCats);
                  }} style={modalStyls.deleteBtn}>
                    <MaterialIcons name="delete-outline" size={20} color={theme.danger} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <View style={modalStyls.modalFooter}>
              <TouchableOpacity style={modalStyls.saveBtn} onPress={handleSave} disabled={saveImpact.isPending}>
                <Text style={modalStyls.saveBtnText}>{saveImpact.isPending ? 'Saving...' : 'Save Changes'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Screen styles ────────────────────────────────────────────────────────────
const screenStyles = (theme: any) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 24,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.text,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    color: theme.textDim,
    marginTop: 2,
  },
  infoBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: theme.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  infoIcon: {
    fontSize: 15,
    color: theme.textDim,
  },

  // Empty card
  emptyStateCard: {
    backgroundColor: theme.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    paddingHorizontal: 18,
    paddingVertical: 22,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 18,
  },
  emptyStateIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateBody: {
    fontSize: 13,
    lineHeight: 20,
    color: theme.textDim,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyStateButton: {
    backgroundColor: theme.primary,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  // Hero card
  heroCard: {
    backgroundColor: theme.card,
    borderRadius: 20,
    borderWidth: 1,

    padding: 18,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroLeft: {
    flex: 1,
  },
  heroTopLabel: {
    fontSize: 12,
    color: theme.textDim,
    marginBottom: 4,
  },
  heroAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.primary,
    letterSpacing: -1,
    marginBottom: 6,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.dangerDim,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.danger,
  },
  heroSub: {
    fontSize: 12,
    color: theme.textDim,
  },

  heroMetaDivider: {
    height: 1,
    backgroundColor: theme.cardBorder,
    opacity: 0.7,
    marginTop: 10,
    marginBottom: 8,
  },
  heroMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  heroMetaLabel: {
    fontSize: 11,
    color: theme.textDim,
  },
  heroMetaValue: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.text,
  },
  
  // Section headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.text,
    flex: 1,
  },
  sectionDesc: {
    fontSize: 12,
    color: theme.textDim,
    marginBottom: 12,
    marginLeft: 0,
  },
  editLink: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.primary,
  },

  // Profile card
  profileCard: {
    backgroundColor: theme.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    marginBottom: 22,
    overflow: 'hidden',
  },

  // Impact tiles
  tilesRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },

  // Mali Insight
  insightCard: {
    backgroundColor: theme.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 6,
    marginBottom: 18,
  },
  insightIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1A2535',
    borderWidth: 1,
    borderColor: theme.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  insightRobotIcon: {
    fontSize: 24,
  },
  insightText: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.primary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  insightHeadline: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.text,
    lineHeight: 18,
    marginBottom: 4,
  },
  insightBody: {
    fontSize: 12,
    color: theme.textDim,
    lineHeight: 17,
  },
  insightArrow: {
    fontSize: 22,
    color: theme.textDim,
    fontWeight: '300',
  },

  // Bottom row
  bottomRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  bottomCard: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    padding: 14,
  },
  bottomCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 2,
  },
  bottomCardDesc: {
    fontSize: 10,
    color: theme.textDim,
    marginBottom: 10,
  },

  // Expect card
  expectCard: {
    borderColor: 'rgba(232,69,69,0.2)',
  },
  expectChart: {
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  expectChartInner: {
    backgroundColor: 'rgba(232,69,69,0.06)',
    borderRadius: 8,
    padding: 4,
  },
  expectLabel: {
    fontSize: 11,
    color: theme.textDim,
    lineHeight: 16,
    marginBottom: 4,
  },
  expectAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.danger,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  expectRange: {
    fontSize: 10,
    color: theme.textDim,
  },

  // Reco card
  recoCard: {},
  recoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  recoIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  recoIcon: {
    fontSize: 14,
  },
  recoText: {
    flex: 1,
    fontSize: 11,
    color: theme.textDim,
    lineHeight: 16,
  },
  recoViewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  recoViewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.primary,
  },

  // Compare card
  compareCard: {
    backgroundColor: theme.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    padding: 16,
    marginBottom: 8,
  },
  compareHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  compareTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 2,
  },
  compareSub: {
    fontSize: 11,
    color: theme.textDim,
  },
  highImpactBadge: {
    backgroundColor: theme.dangerDim,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(232,69,69,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  highImpactText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.danger,
  },
  barWrapper: {
    marginBottom: 8,
  },
  gradientBar: {
    height: 14,
    borderRadius: 99,
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
  },
  barSegment: {
    height: '100%',
  },
  barIndicator: {
    position: 'absolute',
    right: 8,
    top: -3,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: theme.danger,
    shadowColor: theme.danger,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 6,
  },
  barLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  barLabelTitle: {
    fontSize: 10,
    fontWeight: '700',
  },
  barLabelRange: {
    fontSize: 9,
    color: theme.textDim,
    marginTop: 1,
  }
});

// ─── Modal styles ─────────────────────────────────────────────────────────────
const modalStyles = (theme: any) => StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '85%',
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderColor: theme.cardBorder,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  inputLabel: {
    fontSize: 12,
    color: theme.textDim,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: theme.text,
    fontSize: 14,
    marginBottom: 16,
  },
  customSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  addCategoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.primary,
  },
  customCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.dangerDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: theme.cardBorder,
    backgroundColor: theme.background,
  },
  saveBtn: {
    backgroundColor: theme.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  dropdownMenu: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: 12,
    marginTop: -8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.cardBorder,
  },
  dropdownItemText: {
    color: theme.text,
    fontSize: 14,
  },
  dropdownItemTextSelected: {
    color: theme.primary,
    fontWeight: '700',
  },
});