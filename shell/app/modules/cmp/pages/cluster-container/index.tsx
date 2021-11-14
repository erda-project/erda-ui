import * as React from 'react';
import routeInfoStore from 'core/stores/route';
import { EmptyHolder } from 'common';
import { EMPTY_CLUSTER } from 'cmp/pages/cluster-manage/config';
import i18n from 'i18n';

export const ClusterContainer = ({ children }: { children: React.ReactNode }) => {
  const { clusterName } = routeInfoStore.useStore((s) => s.params);
  if (EMPTY_CLUSTER === clusterName) {
    return <EmptyHolder tip={i18n.t('cmp:no cluster available')} />;
  }
  return <div key={clusterName}>{children}</div>;
};
