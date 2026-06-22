import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { updateUserPassword } from '@/authentication/firebase-auth';
import { useTheme } from '@/contexts/theme-context';
import { useSelector } from 'react-redux';
import { useProfile } from '@/hooks/use-profile';
import { Toast, ToastDescription, ToastTitle, useToast } from '@/components/ui/toast';
import { firebaseLogout } from '@/authentication/firebase-auth';
import { setIsAuthenticated, setToken, setUserProfile } from '@/redux/UserProfileSlice';

type ActiveTab = 'account' | 'password';

export default function Profile() {
  const { mode, theme } = useTheme();
  const { userProfile } = useSelector((state: any) => state.userProfile);
  const { updateProfile, changePassword } = useProfile();
  const toast = useToast();
  const router = useRouter();
  const dispatch = useDispatch();

  const fullName = useMemo(() => {
    return userProfile?.fullname || userProfile?.name || 'Mali User';
  }, [userProfile]);

  const email = userProfile?.email || 'No email set';
  const photoUrl = userProfile?.photo_url || '';
  const isGoogleAccount = Boolean(photoUrl);

  const [nameInput, setNameInput] = useState(fullName);

  const [currentPassword, setCurrentPassword] = useState('Lotus@008');
  const [newPassword, setNewPassword] = useState('Lotus@009');
  const [confirmPassword, setConfirmPassword] = useState('Lotus@009');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('account');
  const [tabWidth, setTabWidth] = useState(0);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const hasNameChanged = nameInput.trim() !== fullName.trim();
  const hasPasswordInput = currentPassword.trim().length > 0 || newPassword.trim().length > 0 || confirmPassword.trim().length > 0;

  const indicatorX = useRef(new Animated.Value(0)).current;
  const panelAnim = useRef(new Animated.Value(1)).current;

  const onUpdateProfile = async () => {
    if (!nameInput.trim()) {
      toast.show({
        placement: 'bottom',
        duration: 3200,
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="warning" variant="outline">
            <ToastTitle>Missing details</ToastTitle>
            <ToastDescription numberOfLines={3}>Please provide both full name and email.</ToastDescription>
          </Toast>
        ),
      });
      return;
    }

    try {
      await updateProfile.mutateAsync({
        fullname: nameInput.trim(),
        id: userProfile.id
      });
      toast.show({
        placement: 'bottom',
        duration: 3200,
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="success" variant="outline">
            <ToastTitle>Success</ToastTitle>
            <ToastDescription numberOfLines={3}>Your profile details were updated.</ToastDescription>
          </Toast>
        ),
      });
    } catch (error: any) {
      const rawMessage =
        error?.response?.data?.message ??
        error?.message ??
        'Could not update profile right now.';
      const message = typeof rawMessage === 'string' ? rawMessage : JSON.stringify(rawMessage);

      toast.show({
        placement: 'bottom',
        duration: 4200,
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="error" variant="outline">
            <ToastTitle>Update failed</ToastTitle>
            <ToastDescription numberOfLines={3}>{message}</ToastDescription>
          </Toast>
        ),
      });
    }
  };

  const onChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.show({
        placement: 'bottom',
        duration: 3200,
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="warning" variant="outline">
            <ToastTitle>Missing details</ToastTitle>
            <ToastDescription numberOfLines={3}>Please fill in all password fields.</ToastDescription>
          </Toast>
        ),
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.show({
        placement: 'bottom',
        duration: 3200,
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="warning" variant="outline">
            <ToastTitle>Password mismatch</ToastTitle>
            <ToastDescription numberOfLines={3}>New password and confirmation must match.</ToastDescription>
          </Toast>
        ),
      });
      return;
    }

    setIsChangingPassword(true);
    try {      
      await updateUserPassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
      toast.show({
        placement: 'bottom',
        duration: 3200,
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="success" variant="outline">
            <ToastTitle>Success</ToastTitle>
            <ToastDescription numberOfLines={3}>Your password was changed successfully.</ToastDescription>
          </Toast>
        ),
      });
    } 
    catch (error: any) {
      console.log(error)
      
      const rawMessage =
        error?.response?.data?.message ??
        error?.message ??
        'Could not change password right now.';
      const message = typeof rawMessage === 'string' ? rawMessage : JSON.stringify(rawMessage);
      setIsChangingPassword(false);
      toast.show({
        placement: 'bottom',
        duration: 4200,
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="error" variant="outline">
            <ToastTitle>Change failed</ToastTitle>
            <ToastDescription numberOfLines={3}>{message}</ToastDescription>
          </Toast>
        ),
      });
    }
  };

  const onSignOut = async () => {
    try {
      await firebaseLogout();
      dispatch(setUserProfile(null));
      dispatch(setToken(null));
      dispatch(setIsAuthenticated(false));
      router.replace('/(auth)');
    } catch (error: any) {
      const rawMessage =
        error?.response?.data?.message ??
        error?.message ??
        'Could not sign out right now.';
      const message = typeof rawMessage === 'string' ? rawMessage : JSON.stringify(rawMessage);

      toast.show({
        placement: 'bottom',
        duration: 4200,
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="error" variant="outline">
            <ToastTitle>Sign out failed</ToastTitle>
            <ToastDescription numberOfLines={3}>{message}</ToastDescription>
          </Toast>
        ),
      });
    }
  };

  useEffect(() => {
    if (!tabWidth) return;
    const toValue = activeTab === 'account' ? 0 : tabWidth;
    Animated.spring(indicatorX, {
      toValue,
      tension: 120,
      friction: 16,
      useNativeDriver: true,
    }).start();

    panelAnim.setValue(0.96);
    Animated.timing(panelAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [activeTab, tabWidth, indicatorX, panelAnim]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={styles.heroBackgroundWrap}>
          <View style={[styles.heroOrbLarge, { backgroundColor: theme.primaryDim }]} />
          <View style={[styles.heroOrbSmall, { backgroundColor: theme.accentDim || theme.primaryDim }]} />
        </View>

        <Text style={[styles.pageTitle, { color: theme.text }]}>My Profile</Text>
        <Text style={[styles.subtitle, { color: theme.textDim }]}>A polished space for your identity, security, and preferences.</Text>

        <View style={[styles.heroCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={styles.headerRow}>
            {photoUrl ? (
              <View style={[styles.avatarRing, { borderColor: theme.primary }]}>
                <Image source={{ uri: photoUrl }} style={styles.avatar} />
              </View>
            ) : (
              <View style={[styles.fallbackAvatar, { backgroundColor: theme.primaryDim, borderColor: theme.primary }]}>
                <Text style={styles.fallbackAvatarIcon}>👤</Text>
              </View>
            )}

            <View style={styles.headerMeta}>
              <Text fontWeight="700" style={[styles.cardTitle, { color: theme.text }]}>{fullName}</Text>
              <Text style={[styles.cardText, { color: theme.textDim }]} numberOfLines={1}>{email}</Text>
              <View style={[styles.modeBadge, { backgroundColor: isGoogleAccount ? theme.accentDim || theme.primaryDim : theme.primaryDim }]}>
                <Text style={[styles.modeBadgeText, { color: theme.text }]}>{isGoogleAccount ? 'Google Account' : 'Email Account'}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text fontWeight="700" style={[styles.sectionTitle, { color: theme.text }]}>Theme</Text>
          <Text style={[styles.cardText, { color: theme.textDim, marginBottom: 14 }]}>Theme switch customization is coming soon.</Text>
          <View style={[styles.themeRow, styles.mutedThemeRow, { borderColor: theme.cardBorder, backgroundColor: theme.surface }]}>
            <View>
              <Text style={[styles.themeLabel, { color: theme.text }]}>{mode === 'dark' ? 'Dark Mode' : 'Light Mode'}</Text>
              <Text style={[styles.themeHint, { color: theme.textDim }]}>Coming soon</Text>
            </View>
            <View style={[styles.comingSoonPill, { backgroundColor: theme.primaryDim }]}>
              <Text style={[styles.comingSoonText, { color: theme.text }]}>Soon</Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text fontWeight="700" style={[styles.sectionTitle, { color: theme.text }]}>Settings</Text>

          <View
            style={[styles.tabsWrap, { borderColor: theme.cardBorder, backgroundColor: theme.surface }]}
            onLayout={(event) => {
              const width = event.nativeEvent.layout.width / 2;
              setTabWidth(width);
            }}
          >
            <Animated.View
              pointerEvents="none"
              style={[
                styles.tabIndicator,
                {
                  width: tabWidth || '50%',
                  backgroundColor: theme.primaryDim,
                  transform: [{ translateX: indicatorX }],
                },
              ]}
            />
            <Pressable style={styles.tabButton} onPress={() => setActiveTab('account')}>
              <Text
                style={[
                  styles.tabButtonText,
                  { color: activeTab === 'account' ? theme.text : theme.textDim },
                ]}
              >
                Account Update
              </Text>
            </Pressable>
            <Pressable style={styles.tabButton} onPress={() => setActiveTab('password')}>
              <Text
                style={[
                  styles.tabButtonText,
                  { color: activeTab === 'password' ? theme.text : theme.textDim },
                ]}
              >
                Change Password
              </Text>
            </Pressable>
          </View>

          <Animated.View style={{ opacity: panelAnim, transform: [{ scale: panelAnim }] }}>
            {activeTab === 'account' ? (
              <>
                {isGoogleAccount ? (
                  <View style={[styles.infoPanel, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                    <Text style={styles.infoPanelIcon}>🔒</Text>
                    <Text style={[styles.cardText, { color: theme.textDim, flex: 1 }]}>
                      You are logged in with Google. Profile details are managed by Google and cannot be edited here.
                    </Text>
                  </View>
                ) : (
                  <>
                    <Text style={[styles.inputLabel, { color: theme.textDim }]}>Full Name</Text>
                    <TextInput
                      value={nameInput}
                      onChangeText={setNameInput}
                      style={[styles.input, { color: theme.text, borderColor: theme.cardBorder, backgroundColor: theme.surface }]}
                      placeholder="Enter your full name"
                      placeholderTextColor={theme.textDim}
                    />

                    <Pressable
                      style={[
                        styles.actionButton,
                        {
                          backgroundColor: !hasNameChanged || updateProfile.isPending ? '#6B7280' : theme.primary,
                          opacity: !hasNameChanged || updateProfile.isPending ? 0.85 : 1,
                        },
                      ]}
                      onPress={onUpdateProfile}
                      disabled={!hasNameChanged || updateProfile.isPending}
                    >
                      <Text fontWeight="700" style={styles.toggleText}>
                        {updateProfile.isPending ? 'Updating...' : 'Update Profile'}
                      </Text>
                    </Pressable>
                  </>
                )}
              </>
            ) : (
              <>
                <Text style={[styles.inputLabel, { color: theme.textDim }]}>Current Password</Text>
                <View style={styles.passwordInputWrap}>
                  <TextInput
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry={!showCurrentPassword}
                    style={[
                      styles.input,
                      styles.inputWithIcon,
                      { color: theme.text, borderColor: theme.cardBorder, backgroundColor: theme.surface },
                    ]}
                    placeholder="Enter current password"
                    placeholderTextColor={theme.textDim}
                  />
                  <Pressable
                    style={styles.eyeButton}
                    onPress={() => setShowCurrentPassword((prev) => !prev)}
                    hitSlop={8}
                  >
                    <Text style={[styles.eyeIcon, { color: theme.textDim }]}>{showCurrentPassword ? '🙈' : '👁️'}</Text>
                  </Pressable>
                </View>

                <Text style={[styles.inputLabel, { color: theme.textDim }]}>New Password</Text>
                <View style={styles.passwordInputWrap}>
                  <TextInput
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNewPassword}
                    style={[
                      styles.input,
                      styles.inputWithIcon,
                      { color: theme.text, borderColor: theme.cardBorder, backgroundColor: theme.surface },
                    ]}
                    placeholder="Enter new password"
                    placeholderTextColor={theme.textDim}
                  />
                  <Pressable
                    style={styles.eyeButton}
                    onPress={() => setShowNewPassword((prev) => !prev)}
                    hitSlop={8}
                  >
                    <Text style={[styles.eyeIcon, { color: theme.textDim }]}>{showNewPassword ? '🙈' : '👁️'}</Text>
                  </Pressable>
                </View>

                <Text style={[styles.inputLabel, { color: theme.textDim }]}>Confirm New Password</Text>
                <View style={styles.passwordInputWrap}>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    style={[
                      styles.input,
                      styles.inputWithIcon,
                      { color: theme.text, borderColor: theme.cardBorder, backgroundColor: theme.surface },
                    ]}
                    placeholder="Confirm new password"
                    placeholderTextColor={theme.textDim}
                  />
                  <Pressable
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword((prev) => !prev)}
                    hitSlop={8}
                  >
                    <Text style={[styles.eyeIcon, { color: theme.textDim }]}>{showConfirmPassword ? '🙈' : '👁️'}</Text>
                  </Pressable>
                </View>

                <Pressable
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: !hasPasswordInput || isChangingPassword ? '#6B7280' : theme.primary,
                      opacity: !hasPasswordInput || isChangingPassword ? 0.85 : 1,
                    },
                  ]}
                  onPress={onChangePassword}
                  disabled={!hasPasswordInput || isChangingPassword}
                >
                  <Text fontWeight="700" style={styles.toggleText}>
                    {isChangingPassword ? 'Updating...' : 'Change Password'}
                  </Text>
                </Pressable>

              </>
            )}
          </Animated.View>
        </View>

        <Pressable style={[styles.signOutButton, { borderColor: theme.dangerDim, backgroundColor: theme.dangerDim }]} onPress={onSignOut}>
          <Text fontWeight="700" style={[styles.signOutText, { color: theme.danger }]}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  heroBackgroundWrap: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    height: 220,
  },
  heroOrbLarge: {
    position: 'absolute',
    top: 0,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.45,
  },
  heroOrbSmall: {
    position: 'absolute',
    top: 92,
    left: -26,
    width: 110,
    height: 110,
    borderRadius: 55,
    opacity: 0.35,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  heroCard: {
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerMeta: {
    flex: 1,
  },
  avatarRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  fallbackAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackAvatarIcon: {
    fontSize: 30,
  },
  modeBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 8,
  },
  modeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 20,
  },
  themeRow: {
    borderWidth: 1,
    borderRadius: 16,
    minHeight: 66,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mutedThemeRow: {
    opacity: 0.72,
  },
  themeLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  themeHint: {
    fontSize: 12,
    marginTop: 2,
  },
  comingSoonPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  comingSoonText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  tabsWrap: {
    marginTop: 6,
    marginBottom: 14,
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
    flexDirection: 'row',
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: 12,
    margin: 2,
  },
  tabButton: {
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.15,
  },
  actionButton: {
    borderRadius: 999,
    minHeight: 46,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
    justifyContent: 'center',
  },
  toggleText: {
    color: '#FFF',
    fontSize: 14,
    letterSpacing: 0.2,
  },
  inputLabel: {
    fontSize: 13,
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 14,
    fontSize: 14,
    marginBottom: 8,
  },
  passwordInputWrap: {
    position: 'relative',
  },
  inputWithIcon: {
    paddingRight: 44,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 11,
    height: 26,
    width: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeIcon: {
    fontSize: 16,
  },
  infoPanel: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  infoPanelIcon: {
    fontSize: 16,
    marginTop: 1,
  },
  signOutButton: {
    borderWidth: 1,
    borderRadius: 999,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 12,
  },
  signOutText: {
    fontSize: 15,
    letterSpacing: 0.2,
  },
});