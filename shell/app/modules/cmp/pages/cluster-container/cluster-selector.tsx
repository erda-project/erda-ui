import * as React from 'react';
import clusterStore from 'cmp/stores/cluster';
import { Select } from 'antd';
import { goTo } from 'common/utils';
import layoutStore from 'layout/stores/layout';
import { getCmpMenu } from 'app/menus/cmp';
import { TYPE_K8S_AND_EDAS, EMPTY_CLUSTER, replaceContainerCluster } from 'cmp/pages/cluster-manage/config';
import routeInfoStore from 'core/stores/route';

const ClusterSelector = () => {
  const { clusterName } = routeInfoStore.useStore((s) => s.params);
  const [list, chosenCluster] = clusterStore.useStore((s) => [s.list, s.chosenCluster]);
  const { setChosenCluster } = clusterStore.reducers;

  React.useEffect(() => {
    if (!chosenCluster && clusterName !== chosenCluster) {
      setChosenCluster(list?.[0]?.name);
    }
  }, [chosenCluster, list, setChosenCluster, clusterName]);

  React.useEffect(() => {
    layoutStore.reducers.setSubSiderInfoMap({
      key: 'cmp',
      menu: getCmpMenu(chosenCluster),
    });
  }, [chosenCluster]);

  const useList = list?.filter((item: ORG_CLUSTER.ICluster) => TYPE_K8S_AND_EDAS.includes(item.type));

  return (
    <div className="flex items-center">
      <span className="flex items-center font-bold text-lg">容器资源</span>
      <span className="bg-dark-2 mx-5" style={{ width: 1, height: 12 }} />
      <Select
        bordered={false}
        dropdownMatchSelectWidth={false}
        className={'hover:bg-hover-gray-bg rounded'}
        getPopupContainer={() => document.body}
        value={chosenCluster === EMPTY_CLUSTER ? undefined : chosenCluster}
        placeholder={'选择集群'}
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
