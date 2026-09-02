import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../src/shared/ui/Icon';
import { TabBar } from '../../src/shared/components/TabBar';
import { Input } from '../../src/shared/ui/Input';
import { Button } from '../../src/shared/ui/Button';
import { toast } from '../../src/shared/store/toastStore';
import { useAppTheme } from '../../src/shared/hooks/useAppTheme';
import { colors, fonts } from '../../src/styles/tokens';
import { scaleFont } from '../../src/shared/lib/responsive';

export default function TransferScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark, colors: themeColors } = useAppTheme();

  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [operator, setOperator] = useState<'orange' | 'mtn'>('orange');
  const [phoneError, setPhoneError] = useState('');
  const [amountError, setAmountError] = useState('');

  const handleTransfer = async () => {
    let valid = true;
    setPhoneError('');
    setAmountError('');

    if (!phone.trim()) {
      setPhoneError(t('validation.required'));
      valid = false;
    }
    if (!amount.trim()) {
      setAmountError(t('validation.required'));
      valid = false;
    }

    if (!valid) return false;

    toast.success(t('toasts.transferInitiated'));
    return true;
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.headerCard, { paddingTop: Math.max(insets.top + 10, 20) }]}>
          <Text style={styles.headerTitle}>{t('common.transfer')}</Text>
          <Text style={styles.headerSubtitle}>{t('common.moneyTransfer')}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.operatorRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setOperator('orange')}
              style={[
                styles.operatorCard,
                { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder },
                operator === 'orange' && { borderColor: '#FF7900', borderWidth: 2 },
              ]}
            >
              <Text style={[styles.operatorText, { color: '#FF7900' }]}>Orange Money</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setOperator('mtn')}
              style={[
                styles.operatorCard,
                { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder },
                operator === 'mtn' && { borderColor: '#FFCC00', borderWidth: 2 },
              ]}
            >
              <Text style={[styles.operatorText, { color: isDark ? '#FACC15' : '#D97706' }]}>
                MTN MoMo
              </Text>
            </TouchableOpacity>
          </View>

          <Input
            placeholder={t('common.phonePlaceholder')}
            value={phone}
            onChangeText={(val) => {
              setPhone(val);
              if (phoneError) setPhoneError('');
            }}
            error={phoneError}
            keyboardType="phone-pad"
            leftIcon={<Icon name="solar:phone-linear" color={themeColors.inputPlaceholder} size={20} />}
          />

          <Input
            placeholder={t('common.amountFCFA')}
            value={amount}
            onChangeText={(val) => {
              setAmount(val);
              if (amountError) setAmountError('');
            }}
            error={amountError}
            keyboardType="numeric"
            leftIcon={<Icon name="solar:dollar-linear" color={themeColors.inputPlaceholder} size={20} />}
            containerStyle={{ marginBottom: 24 }}
          />

          <View style={[styles.securityNotice, { backgroundColor: isDark ? '#1E293B' : '#E6F7F0' }]}>
            <Icon name="solar:shield-warning-bold" color={colors.green} size={20} style={{ marginRight: 10 }} />
            <Text style={[styles.securityText, { color: themeColors.textPrimary }]}>
              {t('common.transferSecurityNotice')}
            </Text>
          </View>

          <Button
            title={t('common.startTransfer')}
            onPress={handleTransfer}
            variant="primary"
            size="md"
            leftIcon={<Icon name="solar:card-transfer-linear" color={colors.white} size={20} />}
          />
        </View>
      </ScrollView>

      <TabBar activeTab="transfer" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    backgroundColor: colors.green,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontFamily: fonts.h6,
    fontSize: scaleFont(22),
    fontWeight: '700',
    color: colors.white,
  },
  headerSubtitle: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(13),
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  operatorRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  operatorCard: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  operatorText: {
    fontFamily: fonts.bold,
    fontSize: scaleFont(14),
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 24,
  },
  securityText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: scaleFont(12),
    lineHeight: 18,
  },
});

