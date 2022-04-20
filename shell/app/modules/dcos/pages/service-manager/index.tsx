// Copyright (c) 2021 Terminus, Inc.
//
// This program is free software: you can use, redistribute, and/or modify
// it under the terms of the GNU Affero General Public License, version 3
// or later ("AGPL"), as published by the Free Software Foundation.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

import React from 'react';
import i18n from 'i18n';
import { Breadcrumb, Spin, Select, Input } from 'antd';
import { map, isEmpty } from 'lodash';
import { JsonChecker, IF, Holder, ErdaIcon } from 'common';
import { useUpdate } from 'common/use-hooks';
import PureServiceList from './service-list';
import AssociatedAddons from '../associated-addon';
import './index.scss';
import dcosServiceStore from 'dcos/stores/services';
import clusterStore from 'cmp/stores/cluster';
import { useLoading } from 'core/stores/loading';
import { useEffectOnce, useUpdateEffect, useDebounce } from 'react-use';

const { Option } = Select;

const ENV_MAP = {
  dev: { enName: 'DEV', cnName: i18n.t('cmp:development environment') },
  test: { enName: 'TEST', cnName: i18n.t('test environment') },
  staging: { enName: 'STAGING', cnName: i18n.t('staging environment') },
  prod: { enName: 'PROD', cnName: i18n.t('cmp:production environment') },
};

interface IState {
  path: DCOS_SERVICES.path[];
  cluster: string;
  environment: string;
  ip: undefined | string;
  serviceList: Array<{ id: string; name: string }>;
  containerList: DCOS_SERVICES.Service[];
}
let reqSt: NodeJS.Timeout;

const ServiceManager = () => {
  const [propsContainerList, propsServiceList, runtimeJson, runtimeStatus, serviceReqStatus, metrics] =
    dcosServiceStore.useStore((s) => [
      s.containerList,
      s.serviceList,
      s.runtimeJson,
      s.runtimeStatus,
      s.serviceReqStatus,
      s.metrics,
    ]);
  const list = clusterStore.useStore((s) => s.list);
  const { getClusterList } = clusterStore.effects;
  const { getContainerList, getServiceList, getRuntimeJson, getRuntimeStatus } = dcosServiceStore.effects;
  const { clearRuntimeJson, clearRuntimeStatus } = dcosServiceStore.reducers;
  const [isFetchingClusters] = useLoading(clusterStore, ['getClusterList']);
  const [isFetchingServices, isFetchingContainers] = useLoading(dcosServiceStore, [
    'getServiceList',
    'getContainerList',
  ]);

  const [{ path, cluster, environment, ip, serviceList, containerList }, updater, update] = useUpdate<IState>({
    path: [{ q: '', name: '' }],
    cluster: '',
    environment: 'dev',
    ip: undefined,
    serviceList: [],
    containerList: [],
  });

  React.useEffect(() => {
    update({
      serviceList: propsServiceList,
      containerList: propsContainerList,
    });
  }, [update, propsContainerList, propsServiceList]);

  useEffectOnce(() => {
    getClusterList().then((_list: ORG_CLUSTER.ICluster[]) => {
      !isEmpty(_list) &&
        update({
          cluster: list[0].name,
          path: [{ q: list[0].name, name: list[0].name }],
        });
    });
    return () => {
      clearInterval(reqSt);
    };
  });

  const fetchServiceList = React.useCallback(
    (q: { paths: DCOS_SERVICES.path[]; environment: string; ip?: string }) => {
      const depth = q.paths.length;
      if (depth < 5) {
        getServiceList(q);
      }
    },
    [getServiceList],
  );

  useDebounce(
    () => {
      fetchServiceList({ paths: path, environment, ip });
    },
    300,
    [ip, path, environment],
  );

  useUpdateEffect(() => {
    clearInterval(reqSt);
    if (['runtime', 'service'].includes(curLevel() as string)) {
      reqRuntimeStatus();
      reqSt = setInterval(() => reqRuntimeStatus(), 5000);
    }
  }, [serviceList]);

  useUpdateEffect(() => {
    combineStatuToService(runtimeStatus);
  }, [runtimeStatus]);

  useUpdateEffect(() => {
    const { cpu, mem } = metrics;
    cpu?.loading === false && mem?.loading === false && combineMetricsToList(formatMetricsToObj(metrics)); // 两部分数据都返回后才开始combine数据
  }, [metrics]);

  useUpdateEffect(() => {
    if (!serviceReqStatus) {
      clearInterval(reqSt);
    }
  }, [serviceReqStatus]);

  const formatMetricsToObj = (_metrics: {
    cpu: { data: Array<{ tag: string; data: number }> };
    mem: { data: Array<{ tag: string; data: number }> };
  }) => {
    const metricsObj = {};
    const { cpu, mem } = _metrics;
    (cpu.data || []).forEach((cItem) => {
      cItem.tag && (metricsObj[cItem.tag] = { cpuUsagePercent: cItem.data / 100 || 0, diskUsage: 0 });
    });
    (mem.data || []).forEach((mItem) => {
      if (mItem.tag) {
        !metricsObj[mItem.tag] && (metricsObj[mItem.tag] = {});
        metricsObj[mItem.tag].memUsage = mItem.data || 0;
      }
    });
    return metricsObj;
  };

  const combineMetricsToList = (metricsObj: Obj) => {
    let newContainerList = [...containerList];
    let newServiceList = [...serviceList];
    if (curLevel('container')) {
      // 当前层级在container上，
      newContainerList = newContainerList.map((item) => {
        let _metrics = null;
        try {
          _metrics = metricsObj[item.containerId] || null;
        } catch (e) {
          _metrics = null;
        }
        return { ...item, metrics: _metrics };
      });
      updater.containerList(newContainerList);
    } else {
      const combineKye = curLevel('service') ? 'name' : 'id';
      newServiceList = newServiceList.map((item) => {
        let _metrics = null;
        try {
          _metrics = metricsObj[item[combineKye]] || null;
        } catch (e) {
          _metrics = null;
        }
        return { ...item, metrics: _metrics };
      });
      updater.serviceList(newServiceList);
    }
  };

  const onJsonShow = (_visible: boolean) => {
    const runtimeId = getLevel('runtime').id;
    _visible && runtimeJson === null && runtimeId !== 'unknown' && getRuntimeJson({ runtimeId });
  };

  const combineStatuToService = (_runtimeStatus: Obj) => {
    let newServiceList = [...serviceList];
    if (curLevel('runtime')) {
      // runtime的status在runtimeStatus中runtimeId为key对象中
      newServiceList = newServiceList.map((item) => {
        let status = '';
        try {
          status = runtimeStatus[item.id].status || '';
        } catch (e) {
          status = '';
        }
        return { ...item, status };
      });
    } else if (curLevel('service')) {
      // service的status在runtimeStatus对应runtimeId为key的对象中的more字段中
      const runtimeId = getLevel('runtime').id;
      newServiceList = newServiceList.map((item) => {
        let status = '';
        try {
          status = runtimeStatus[runtimeId].more[item.name] || '';
        } catch (e) {
          status = '';
        }
        return { ...item, status };
      });
    }
    updater.serviceList(newServiceList);
  };

  const into = (p: { q: string; name: string }) => {
    if (curLevel('runtime')) clearRuntimeJson();
    const newPath = path.concat(p);
    update({
      path: newPath,
    });
    const depth = newPath.length;
    if (depth >= 5) {
      getContainerList(newPath);
    }
  };

  const backTo = (depth: number) => {
    if (curLevel('runtime')) clearRuntimeJson();
    update({
      path: path.slice(0, depth + 1),
    });
  };

  const curLevel = (lev = '') => {
    const levArr = ['project', 'application', 'runtime', 'service', 'container'];
    const curLev = levArr[path.length - 1];
    return lev ? lev === curLev : curLev;
  };

  const getLevel = (lev = '') => {
    const levs = {
      project: path[1] ? { id: path[1].q, name: path[1].name } : null,
      application: path[2] ? { id: path[2].q, name: path[2].name } : null,
      runtime: path[3] ? { id: path[3].q, name: path[3].name } : null,
      service: path[4] ? { id: path[4].q, name: path[4].name } : null,
    };
    return levs[lev] || null;
  };

  const handleEnvChange = (_environment: string) => {
    update({ environment: _environment });
  };

  const handleClusterChange = (_cluster: string) => {
    update({
      cluster: _cluster,
      path: [{ q: _cluster, name: cluster }],
    });
  };

  const reqRuntimeStatus = () => {
    let runtimeIds = '';
    if (curLevel('runtime')) {
      // runtime,批量查询runtime的状态
      runtimeIds = map(serviceList, 'id').join(',');
    } else if (curLevel('service')) {
      // service,查询单个runtime状态
      runtimeIds = getLevel('runtime').id;
    }
    if (runtimeIds && runtimeIds !== 'unknown') {
      getRuntimeStatus({ runtimeIds });
    } else {
      clearInterval(reqSt);
    }
  };
  const jsonString = runtimeJson === null ? '' : JSON.stringify(runtimeJson, null, 2);

  const slot = (
    <IF check={path.length === 1}>
      <div className="filter-group mb-4 ml-3-group">
        <Select
          value={cluster}
          className="w-[150px] bg-black-06 rounded"
          bordered={false}
          onChange={handleClusterChange}
        >
          {map(list, (v) => (
            <Option key={v.name} value={v.name}>
              {v.displayName || v.name}
            </Option>
          ))}
        </Select>
        <Input
          allowClear
          value={ip}
          className="w-[150px] bg-black-06 rounded"
          placeholder={i18n.t('cmp:Search by IP')}
          onChange={(e) => update({ ip: e.target.value })}
        />
        <Select
          value={environment}
          className="w-[150px] bg-black-06 rounded"
          bordered={false}
          onChange={handleEnvChange}
        >
          {map(ENV_MAP, (v, k) => (
            <Option key={k} value={k}>
              {v.cnName}
            </Option>
          ))}
        </Select>
      </div>
    </IF>
  );

  return (
    <Spin spinning={isFetchingClusters}>
      <Holder when={isEmpty(list)}>
        <Breadcrumb
          separator={<ErdaIcon className="text-xs align-middle" type="right" size="14px" />}
          className="path-breadcrumb"
        >
          {path.map((p, i) => {
            const isLast = i === path.length - 1;
            return (
              <Breadcrumb.Item
                key={i}
                className={isLast ? '' : 'hover-active'}
                onClick={() => {
                  if (!isLast) backTo(i);
                }}
              >
                {p.name}
              </Breadcrumb.Item>
            );
          })}
        </Breadcrumb>
        <div className="to-json">
          {path.length === 4 ? (
            <JsonChecker
              buttonText={i18n.t('runtime configs')}
              jsonString={jsonString}
              onToggle={onJsonShow}
              modalConfigs={{ title: i18n.t('runtime configs') }}
            />
          ) : null}
        </div>
      </Holder>
      <Spin spinning={isFetchingServices || isFetchingContainers}>
        <PureServiceList
          into={into}
          slot={slot}
          depth={path.length}
          serviceList={serviceList}
          onReload={
            path.length < 5 ? () => fetchServiceList({ paths: path, environment, ip }) : () => getContainerList(path)
          }
          containerList={containerList}
          haveMetrics={false}
          extraQuery={{ filter_cluster_name: cluster }}
        />
        {path.length === 2 ? (
          <AssociatedAddons projectId={path[1].q} environment={ENV_MAP[environment].enName} />
        ) : null}
      </Spin>
    </Spin>
  );
};

export default ServiceManager;
