
import type React from 'react';

export interface Tool {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  actionText: string;
  comingSoon?: boolean;
}
