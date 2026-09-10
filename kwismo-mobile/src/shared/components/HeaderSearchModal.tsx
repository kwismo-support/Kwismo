import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../ui/Icon';
import { useAppTheme } from '../hooks/useAppTheme';
import { colors, fonts } from '../../styles/tokens';
import { scaleFont } from '../lib/responsive';

interface HeaderSearchModalProps {
  visible: boolean;
  onClose: () => void;
}

interface SearchItem {
  id: string;
  category: 'feature' | 'sim' | 'contact';
  title: string;
  subtitle: string;
  icon: string;
  route: string;
}

export const HeaderSearchModal: React.FC<HeaderSearchModalProps> = ({
  visible,
  onClose,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark, colors: themeColors } = useAppTheme();
  const [query, setQuery] = useState('');

  // Sample searchable index covering Kwismo app features, SIMs, contacts
  const searchIndex: SearchItem[] = useMemo(
    () => [
      {
        id: 'f-1',
        category: 'feature',
        title: 'Transfert de crédit / argent',
        subtitle: 'Protéger et effectuer un transfert par USSD',
        icon: 'solar:card-send-bold',
        route: '/(app)/transfer',
      },
      {
        id: 'f-2',
        category: 'feature',
        title: 'Signaler un numéro frauduleux',
        subtitle: 'Déclarer un numéro suspect ou d’usurpation',
        icon: 'solar:danger-triangle-bold',
        route: '/(app)/report',
      },
      {
        id: 'f-3',
        category: 'feature',
        title: 'Alerter sur WhatsApp',
        subtitle: 'Activer et diffuser les alertes WhatsApp',
        icon: 'solar:chat-round-dots-bold',
        route: '/(app)/alert-whatsapp',
      },
      {
        id: 'f-4',
        category: 'feature',
        title: 'Carnet de contacts',
        subtitle: 'Vérifier la réputation de vos contacts',
        icon: 'solar:users-group-two-rounded-bold',
        route: '/(app)/contacts',
      },
      {
        id: 'f-5',
        category: 'feature',
        title: 'Gestion des numéros SIM',
        subtitle: 'Ajouter ou sécuriser vos puces SIM',
        icon: 'solar:sim-cards-bold',
        route: '/(app)/management',
      },
      {
        id: 'f-6',
        category: 'feature',
        title: 'Authentification 2FA & PIN',
        subtitle: 'Configurer Face ID, empreinte et code PIN',
        icon: 'solar:shield-keyhole-bold',
        route: '/(app)/two-factor',
      },
      {
        id: 's-1',
        category: 'sim',
        title: '+237 6 98 44 43 88 (Orange)',
        subtitle: 'SIM Vérifiée • Statut Normal',
        icon: 'solar:phone-bold',
        route: '/(app)/management',
      },
      {
        id: 's-2',
        category: 'sim',
        title: '+237 6 77 12 34 56 (MTN)',
        subtitle: 'SIM En attente de validation',
        icon: 'solar:phone-bold',
        route: '/(app)/management',
      },
    ],
    []
  );

  const filteredResults = useMemo(() => {
    if (!query.trim()) return searchIndex.slice(0, 5);
    const q = query.toLowerCase().trim();
    return searchIndex.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q)
    );
  }, [query, searchIndex]);

  const handleSelectItem = (route: string) => {
    onClose();
    setQuery('');
    router.push(route as any);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[
            styles.searchContainer,
            {
              paddingTop: Math.max(insets.top + 8, 16),
            },
          ]}
        >
          {/* BARRE DE RECHERCHE ANIMÉE EN HAUT DU HEADER */}
          <View style={styles.searchBarRow}>
            <View style={styles.inputWrapper}>
              <Icon
                name="solar:magnifer-linear"
                size={20}
                color={colors.green}
                style={{ marginLeft: 14, marginRight: 10 }}
              />
              <TextInput
                autoFocus
                value={query}
                onChangeText={setQuery}
                placeholder={t('common.searchPlaceholder', 'Rechercher une fonction, un numéro...')}
                placeholderTextColor="#94A3B8"
                style={styles.searchInput}
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')} style={{ padding: 8 }}>
                  <Icon name="solar:close-circle-bold" size={18} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>{t('common.cancel', 'Annuler')}</Text>
            </TouchableOpacity>
          </View>

          {/* ESPACE BLANC (CONTAINER DE RÉSULTATS) JUSTE EN BAS DE LA BARRE */}
          <View style={styles.resultsWhiteContainer}>
            <View style={styles.resultsHeaderRow}>
              <Text style={styles.resultsSectionTitle}>
                {query.trim()
                  ? `${t('common.searchResults', 'Résultats')} (${filteredResults.length})`
                  : t('common.quickSuggestions', 'Suggestions rapides')}
              </Text>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 360 }}
            >
              {filteredResults.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                  <Icon name="solar:magnifer-bug-linear" size={36} color="#CBD5E1" />
                  <Text style={styles.emptyStateText}>
                    {t('common.noResultsFound', 'Aucun résultat trouvé pour cette recherche')}
                  </Text>
                </View>
              ) : (
                filteredResults.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.7}
                    onPress={() => handleSelectItem(item.route)}
                    style={[
                      styles.resultItemRow,
                      index < filteredResults.length - 1 && styles.itemBorderBottom,
                    ]}
                  >
                    <View style={styles.iconCircle}>
                      <Icon name={item.icon} size={20} color={colors.green} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.itemTitleText}>{item.title}</Text>
                      <Text style={styles.itemSubtitleText}>{item.subtitle}</Text>
                    </View>
                    <Icon name="solar:alt-arrow-right-linear" size={16} color="#94A3B8" />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: scaleFont(14),
    fontFamily: fonts.medium,
    color: '#0F172A',
  },
  cancelButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  cancelButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: scaleFont(14),
    color: colors.white,
  },
  /* ESPACE BLANC - CONTAINER POPUP POUR RÉSULTATS DE RECHERCHE */
  resultsWhiteContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  resultsHeaderRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 6,
  },
  resultsSectionTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(12),
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  resultItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  itemBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(43, 182, 115, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitleText: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(14),
    color: '#0F172A',
    fontWeight: '700',
  },
  itemSubtitleText: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(12),
    color: '#64748B',
    marginTop: 2,
  },
  emptyStateContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontFamily: fonts.medium,
    fontSize: scaleFont(13),
    color: '#94A3B8',
    marginTop: 8,
    textAlign: 'center',
  },
});
