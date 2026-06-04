export type NotificationSeverity = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'CRITICAL';

export type NotificationStatus = 'UNREAD' | 'READ' | 'ARCHIVED';

export interface Notification {
  id: number;
  title: string;
  message: string;
  severity: NotificationSeverity;
  status: NotificationStatus;
  createdAt: string;
}
