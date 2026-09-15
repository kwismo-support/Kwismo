import React from 'react';
import { HeaderBar } from '@/shared/components/HeaderBar';

export const AppHeader: React.FC<{ title: string; showBack?: boolean }> = ({ title, showBack }) => {
  return <HeaderBar title={title} showBack={showBack} />;
};

