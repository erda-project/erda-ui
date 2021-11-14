import * as React from 'react';
import clusterStore from 'cmp/stores/cluster';
import { Select } from 'antd';
import { goTo } from 'common/utils';
import { TYPE_K8S_AND_EDAS, EMPTY_CLUSTER, replaceContainerCluster } from 'cmp/pages/cluster-manage/config';
import i18n from 'i18n';

const ClusterSelector = () => {
  const [list, chosenCluster] = clusterStore.useStore((s) => [s.list, s.chosenCluster]);
  const { setChosenCluster } = clusterStore.reducers;

  const useList = list?.filter((item: ORG_CLUSTER.ICluster) => TYPE_K8S_AND_EDAS.includes(item.type));

  return (
    <div className="flex items-center">
      <span className="flex items-center font-bold text-lg">{i18n.t('container resource')}</span>
      <span className="bg-dark-2 mx-5" style={{ width: 1, height: 12 }} />
      <Select
        bordered={false}
        dropdownMatchSelectWidth={false}
        className={'hover:bg-hover-gray-bg rounded'}
        getPopupContainer={() => document.body}
        value={chosenCluster === EMPTY_CLUSTER ? undefined : chosenCluster}
        placeholder={i18n.t('choose cluster')}
        onChange={(v) => {
          setChosenCluster(v);
          goTo(replaceContainerCluster(v));
        }}
      >
        {useList?.map((item: ORG_CLUSTER.ICluster) => (
          <Select.Option key={item.id} value={item.name}>
            {item.displayName || item.name}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};

export default ClusterSelector;
