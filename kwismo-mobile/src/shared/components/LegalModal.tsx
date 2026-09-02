import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../ui/Icon';
import { useAppTheme } from '../hooks/useAppTheme';
import { colors, fonts } from '../../styles/tokens';
import { scaleFont } from '../lib/responsive';

interface LegalModalProps {
  visible: boolean;
  title: string;
  content?: string;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  visible,
  title,
  content,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const { colors: themeColors } = useAppTheme();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor: themeColors.background,
            paddingTop: insets.top,
          },
        ]}
      >
        {/* En-tête avec titre et bouton de fermeture à l'extrême haut droit */}
        <View
          style={[
            styles.header,
            {
              borderBottomColor: themeColors.inputBorder,
              backgroundColor: themeColors.cardBg,
            },
          ]}
        >
          <Text
            style={[styles.headerTitle, { color: themeColors.textPrimary }]}
            numberOfLines={1}
          >
            {title}
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Icon
              name="solar:close-circle-bold"
              size={26}
              color={themeColors.inputPlaceholder}
            />
          </TouchableOpacity>
        </View>

        {/* Zone de contenu prête à accueillir le texte */}
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 32 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {content ? (
            <Text style={[styles.contentText, { color: themeColors.textPrimary }]}>
              {content}
            </Text>
          ) : (
            <View style={styles.placeholderContainer}>
              <Text
                style={[
                  styles.placeholderText,
                  { color: themeColors.textSecondary },
                ]}
              >
                {title}
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default LegalModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(18),
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 20,
  },
  contentText: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(14),
    lineHeight: 22,
  },
  placeholderContainer: {
    paddingVertical: 20,
  },
  placeholderText: {
    fontFamily: fonts.medium,
    fontSize: scaleFont(14),
    lineHeight: 22,
  },
});
