import React from 'react';
import BaseNotificationDetail from 'msp/alarm-manage/alert-list/notification/base-notification-detail';
import orgStore from 'app/org-home/stores/org';

const Notification = () => {
  const orgId = orgStore.useStore((s) => s.currentOrg.id);
  return <BaseNotificationDetail scopeId={`${orgId}`} scope="org" />;
};

export default Notification;
