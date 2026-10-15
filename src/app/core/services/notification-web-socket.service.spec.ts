import { notificationTopics } from './notification-web-socket.service';

describe('notificationTopics', () => {
  it('includes each role once for a multi-role user', () => {
    expect(notificationTopics(1, ['ADMIN', 'FLEET_MANAGER', 'ADMIN'])).toEqual([
      '/topic/notification/1/ADMIN',
      '/topic/notification/1/FLEET_MANAGER',
    ]);
  });

  it('does not subscribe to an undefined or empty role', () => {
    expect(notificationTopics(1, ['', 'ADMIN'])).toEqual(['/topic/notification/1/ADMIN']);
  });
});
