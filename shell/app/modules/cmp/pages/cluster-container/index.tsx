import * as React from 'react';
import routeInfoStore from 'core/stores/route';
import { EmptyHolder } from 'common';
import { EMPTY_CLUSTER } from 'cmp/pages/cluster-manage/config';

export const ClusterContainer = ({ children }: { children: React.ReactNode }) => {
  const { clusterName } = routeInfoStore.useStore((s) => s.params);
  if (EMPTY_CLUSTER === clusterName) {
    return <EmptyHolder tip="当前无可用集群" />;
  }
  return <div key={clusterName}>{children}</div>;
};
