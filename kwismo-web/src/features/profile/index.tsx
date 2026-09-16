import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/shared/components';
import { FormSkeleton } from '@/shared/ui/skeleton';
import { useProfile } from './hooks/useProfile';
import ProfileForm from './components/ProfileForm';
import PersonalKpisCard from './components/PersonalKpisCard';
import TrustedDevicesList from './components/TrustedDevicesList';

export default function ProfilePage() {
  const { t } = useTranslation(['admin', 'common']);
  const { profile, loading, updating, updateProfile } = useProfile();

  if (loading || !profile) {
    return (
      <div className="p-6 font-body max-w-5xl mx-auto">
        <FormSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 font-body max-w-5xl mx-auto">
      <PageHeader
        title={t('admin:profile.title')}
        subtitle={t('admin:profile.subtitle')}
        showBreadcrumb={true}
      />

      <PersonalKpisCard kpi={profile.kpi} />

      <ProfileForm
        profile={profile}
        isUpdating={updating}
        onUpdate={updateProfile}
      />

      <TrustedDevicesList devices={profile.devices || []} />
    </div>
  );
}
