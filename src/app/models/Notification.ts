export interface Notification {
  type: NotificationType;
  message: string;
  date?: string;
}

export enum NotificationType {

  INFO = 'INFO',

  SUCCESS = 'SUCCESS',

  WARNING = 'WARNING',

  ERROR = 'ERROR'
}
