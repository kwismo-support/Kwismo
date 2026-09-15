import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';
import { HeaderBar } from '@/shared/components/HeaderBar';
import { Skeleton, SkeletonCircle, SkeletonLoader } from '@/shared/ui/Skeleton';
import { colors } from '@/styles/tokens';

const CONTACTS_DATA = [
  { id: '1', name: 'Alain Dupont', phone: '+237 6 98 44 43 88', status: 'Protégé', trusted: true },
  { id: '2', name: 'Carine Mbida', phone: '+237 6 77 12 34 56', status: 'Protégé', trusted: true },
  { id: '3', name: 'Boris Talla', phone: '+237 6 55 98 76 54', status: 'Non vérifié', trusted: false },
  { id: '4', name: 'Diane Ewane', phone: '+237 6 99 23 45 67', status: 'Protégé', trusted: true },
  { id: '5', name: 'Eric Kamga', phone: '+237 6 70 88 99 00', status: 'Protégé', trusted: true },
];

export default function ContactsScreen() {
  const { t } = useTranslation();
  const [search] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const filteredContacts = CONTACTS_DATA.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <View className="flex-1 bg-white dark:bg-brand-darkBg">
      <StatusBar style="light" />

      <HeaderBar title={t('common.contacts', 'Répertoire de contacts')} showBack={true} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pt-4">
          <SkeletonLoader
            loading={loading}
            fallback={
              <>
                {Array.from({ length: 4 }).map((_, idx) => (
                  <View
                    key={`skel-contact-${idx}`}
                    className="flex-row items-center p-3.5 rounded-xl mb-2.5 bg-white dark:bg-[#162035] border border-slate-200 dark:border-slate-700/60"
                  >
                    <SkeletonCircle size={44} style={{ marginRight: 12 }} />
                    <View style={{ flex: 1, gap: 6 }}>
                      <Skeleton width="50%" height={16} borderRadius={4} />
                      <Skeleton width="40%" height={12} borderRadius={4} />
                    </View>
                    <Skeleton width={70} height={24} borderRadius={12} />
                  </View>
                ))}
              </>
            }
          >
            {filteredContacts.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                className="flex-row items-center p-3.5 rounded-xl mb-2.5 bg-white dark:bg-[#162035] border border-slate-200 dark:border-slate-700/60 shadow-sm"
              >
                <View className="w-11 h-11 rounded-full bg-blue-500 justify-center items-center mr-3">
                  <Text className="font-bold text-lg text-white">{item.name[0]}</Text>
                </View>

                <View className="flex-1">
                  <Text className="font-bold text-base text-slate-900 dark:text-white">
                    {item.name}
                  </Text>
                  <View className="flex-row items-center mt-0.5">
                    <Icon name="solar:phone-linear" color="#94A3B8" size={12} style={{ marginRight: 4 }} />
                    <Text className="text-2xs text-slate-500 dark:text-slate-400">
                      {item.phone}
                    </Text>
                  </View>
                </View>

                {item.trusted && (
                  <View className="flex-row items-center bg-emerald-50 dark:bg-emerald-950/50 px-2 py-1 rounded-md mr-2">
                    <Icon name="solar:shield-check-bold" color={colors.green} size={14} style={{ marginRight: 4 }} />
                    <Text className="font-medium text-2xs text-brand-green">{item.status}</Text>
                  </View>
                )}

                <Icon name="solar:alt-arrow-right-linear" color="#94A3B8" size={18} />
              </TouchableOpacity>
            ))}
          </SkeletonLoader>
        </View>
      </ScrollView>
    </View>
  );
}


