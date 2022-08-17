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
import { Tooltip, Popover, Tabs, Modal } from 'antd';
import { Icon as CustomIcon, IF, Table, Badge } from 'common';
import { useUpdate } from 'common/use-hooks';
import HealthPoint from 'project/common/components/health-point';
import { map, isEmpty } from 'lodash';
import classNames from 'classnames';
import { statusMap } from 'project/common/components/health-point';
import { SlidePanel, IWithTabs } from 'runtime/common/components/slide-panel-tabs';
import ProjectUnitDetail from 'monitor-common/components/resource-usage/resource-usage-charts';
import ContainerLog from 'runtime/common/logs/containers/container-log';
import Terminal from 'dcos/common/containers/terminal';
import i18n from 'i18n';
import { firstCharToUpper, notify, updateSearch } from 'common/utils';
import DomainModal from './domain-modal';
import ServiceDropdown from './service-dropdown';
import routeInfoStore from 'core/stores/route';
import './service-card.scss';
import { useMount, useUpdateEffect } from 'react-use';
import moment from 'moment';
import runtimeStore from 'runtime/stores/runtime';
import { WithAuth, usePerm } from 'user/common';
import runtimeServiceStore from 'runtime/stores/service';
import runtimeDomainStore from 'runtime/stores/domain';
import ElasticScaling from './elastic-scaling';
import { getRuntimeServicePods, getRuntimeService } from 'runtime/services/runtime';
import { insertWhen } from 'common/utils';

const { TabPane } = Tabs;

const FORBIDDEN_STATUS_LIST = ['WAITING', 'DEPLOYING', 'CANCELING'];

const titleMap = {
  monitor: i18n.t('Container Monitoring'),
  log: i18n.t('runtime:Container log'),
  terminal: i18n.t('Console'),
  record: i18n.t('runtime:History'),
};

interface IProps {
  name: string;
  params: Obj;
  runtimeDetail: typeof runtimeStore.stateType.runtimeDetail;
  service: RUNTIME_SERVICE.Detail;
  isEndpoint?: boolean;
  runtimeType?: string;
}

const ServiceCard = (props: IProps) => {
  const {
    runtimeDetail,
    name,
    params: { appId, runtimeId },
    service,
    isEndpoint = false,
    runtimeType = 'service',
  } = props;

  const domainMap = runtimeDomainStore.useStore((s) => s.domainMap);

  const [{ title, visible, withTabs, content, slideVisible, domainModalVisible, elasticScalingVisible }, updater] =
    useUpdate({
      title: '',
      visible: false,
      slideVisible: false,
      withTabs: {},
      content: null,
      domainModalVisible: false,
      elasticScalingVisible: false,
    });

  const { serviceName, jumpFrom } = routeInfoStore.useStore((s) => s.query);

  const [runingFetched, setRunningFetched] = React.useState({ loading: false, fetched: false });
  const [stopedFetched, setStopedFetched] = React.useState({ loading: false, fetched: false });

  const [stopedData, setStopedData] = React.useState<RUNTIME.ServicePod[]>([]);
  const [_runningData, setRunningData] = React.useState<RUNTIME.ServicePod[]>([]);

  const runningData = React.useMemo(
    () => map(_runningData || [], (item) => ({ isRunning: true, ...item })),
    [_runningData],
  );

  useUpdateEffect(() => {
    if (visible) {
      !runingFetched.fetched && fetchRunningData();
      !stopedFetched.fetched && fetchStopData();
    }
  }, [visible]);

  const fetchRunningData = React.useCallback(() => {
    setRunningFetched((prev) => ({ ...prev, loading: true }));
    return getRuntimeServicePods({ runtimeID: runtimeId, serviceName: name }).then((res) => {
      setRunningFetched({ fetched: true, loading: false });
      setRunningData(res?.data || []);
      return res?.data || [];
    });
  }, [runtimeId, name]);

  const fetchStopData = React.useCallback(() => {
    setStopedFetched((prev) => ({ ...prev, loading: true }));
    getRuntimeService({ runtimeID: runtimeId, serviceName: name, status: 'stopped' }).then((res) => {
      setStopedData(res?.data || []);
      setStopedFetched({ fetched: true, loading: false });
    });
  }, [runtimeId, name]);

  const openSlidePanel = (type: string, record?: RUNTIME.ServicePod) => {
    updater.title(titleMap[type]);
    if (isEmpty(runningData)) {
      fetchRunningData().then((res) => {
        renderSlidePanel(type, res || [], record);
      });
    } else {
      renderSlidePanel(type, runningData || [], record);
    }
  };

  const renderSlidePanel = (type: string, insList: RUNTIME.ServicePod[], record?: RUNTIME.ServicePod) => {
    let instanceList: RUNTIME.ServicePod[] = [];
    let defaultKey = '';

    const getTabKey = (ins: any) => {
      let tagId = '';
      const { uid: id, containerId: _containerId } = ins;
      const containerId = ins.podContainers?.[0]?.containerId || _containerId;
      if (containerId) {
        tagId = containerId.slice(0, 6);
      } else if (id) {
        // 兼容id有时候为containerId(k8s集群)
        tagId = id.includes('.') ? id.split('.')[1].slice(0, 6) : id.slice(0, 6);
      }
      return {
        tab: `${name} . ${tagId}`,
        key: id || containerId,
      };
    };

    const getDefaultKey = (ins: RUNTIME.ServicePod) => {
      const { uid, containerId: _containerId } = ins;
      const containerId = ins.podContainers?.[0]?.containerId || _containerId;
      let key: any = uid || containerId;
      type === 'monitor' && (key = containerId || uid);
      return key;
    };

    const convertIns = (ins: RUNTIME.ServicePod) => {
      if (ins.podContainers) {
        const { podContainers, k8sNamespace, podNamespace, status, phase, ..._rest } = ins;
        const podItem = podContainers?.[0] || {};
        return {
          status: phase || status,
          podNamespace: k8sNamespace || podNamespace,
          ..._rest,
          ...podItem,
          podUid: _rest.uid,
        };
      }
      return ins;
    };
    // 没有 record，操作入口为 serviceCard 下拉，默认定位到运行中的第一个实例
    if (!record) {
      const firstIns = insList.length ? insList[0] : null;
      instanceList = insList;
      if (firstIns) {
        defaultKey = getDefaultKey(firstIns);
      }
    } else {
      // 有 record，操作入口为 instanceTable 或实例错误信息
      const { isRunning } = record;
      if (isRunning) {
        instanceList = insList;
      } else {
        instanceList = [record];
      }
      defaultKey = getDefaultKey(record);
    }

    switch (type) {
      // 优先取 containerId 查询，若无则用 id(instanceId) 查询
      case 'monitor': {
        const contents = map(instanceList, (ins) => {
          const { uid: id, containerId: _containerId } = ins;
          const containerId = ins.podContainers?.[0]?.containerId || _containerId;

          return {
            Comp: ProjectUnitDetail,
            props: {
              instance: convertIns(ins),
              api: '/api/runtime/metrics',
              extraQuery: { filter_runtime_id: runtimeId, filter_application_id: appId },
            },
            ...getTabKey(ins),
            key: containerId || id,
          };
        });
        updater.withTabs({ defaultActiveKey: defaultKey, contents });
        break;
      }
      // id 和 containerId 中任意一个
      case 'log': {
        const contents = map(instanceList, (ins) => {
          const { isRunning } = ins;
          return {
            Comp: ContainerLog,
            props: {
              instance: convertIns(ins),
              isStopped: !isRunning,
              extraQuery: { applicationId: appId },
              fetchApi: '/api/runtime/logs',
            },
            ...getTabKey(ins),
          };
        });
        updater.withTabs({ defaultActiveKey: defaultKey, contents });
        break;
      }
      case 'terminal': {
        const { clusterName } = runtimeDetail;
        const contents = map(instanceList, (ins) => {
          const { uid: id, containerId: _containerId, host } = ins;
          const containerId = ins.podContainers?.[0]?.containerId || _containerId;
          return {
            Comp: Terminal,
            props: {
              instanceTerminal: true,
              instance: convertIns(ins),
              clusterName,
              host,
              containerId: containerId || id,
            },
            ...getTabKey(ins),
          };
        });
        updater.withTabs({ defaultActiveKey: defaultKey, contents });
        break;
      }
      default:
        break;
    }
    updater.slideVisible(true);
  };

  const togglePanel = () => {
    updater.visible(!visible);
  };

  useMount(() => {
    if (serviceName === name) {
      jumpFrom === 'ipPage' && togglePanel();
      jumpFrom === 'domainPage' && updater.domainModalVisible(true);
    }
  });

  const updateServicesConfig = (data: RUNTIME_SERVICE.PreOverlay) => {
    runtimeServiceStore.updateServicesConfig(data).then(() => {
      runtimeStore.getRuntimeDetail({ runtimeId, forceUpdate: true });
    });
  };

  const {
    resources,
    status,
    deployments: { replicas },
    errors,
  } = service as RUNTIME_SERVICE.Detail;

  const { cpu, mem } = resources;
  const expose = map(domainMap[name], 'domain').filter((domain) => !!domain);
  const isServiceType = runtimeType !== 'job';
  const resourceInfo = (
    <span className="resources nowrap">{`${
      isServiceType ? `${i18n.t('instance')} ${replicas} /` : ''
    } CPU ${cpu} / ${i18n.t('memory')} ${mem}MB`}</span>
  );

  const serviceClass = classNames({
    'service-card-wrapper': true,
    block: visible,
  });

  const getOperation = () => {
    const commonOps = (
      <div className="common-ops">
        <span>
          <ServiceDropdown
            openSlidePanel={openSlidePanel}
            openDomainModalVisible={() => updater.domainModalVisible(true)}
            service={service}
            isEndpoint={isEndpoint}
            updateServicesConfig={updateServicesConfig}
            name={name}
            deployStatus={runtimeDetail.deployStatus}
            onElasticScaling={() => {
              updater.elasticScalingVisible(true);
            }}
          />
          <DomainModal
            visible={domainModalVisible}
            onCancel={() => {
              updater.domainModalVisible(false);
              updateSearch({ serviceName: undefined, jumpFrom: undefined });
            }}
            serviceName={name}
          />
          <ElasticScaling
            visible={elasticScalingVisible}
            onClose={() => {
              updater.elasticScalingVisible(false);
              runtimeStore.getRuntimeDetail({ runtimeId, forceUpdate: true });
            }}
            serviceName={name}
          />
        </span>
      </div>
    );

    if (!isEndpoint) return commonOps;

    const hasCustomDomain = expose && expose.length > 0;
    const isOpsForbidden = FORBIDDEN_STATUS_LIST.includes(runtimeDetail.deployStatus);

    let links =
      expose && expose[0] ? (
        <a className="mr-3" href={`//${expose[0]}`} target="_blank" rel="noopener noreferrer">
          {i18n.t('runtime:Access Domain')}
        </a>
      ) : (
        <span
          className="domain-links hover-active"
          onClick={(e) => {
            e.stopPropagation();
            if (isOpsForbidden) {
              notify('warning', i18n.t('runtime:deploying, please operate later'));
            } else if (runtimeDetail.deployStatus !== 'OK' && isEmpty(domainMap)) {
              notify('warning', i18n.t('runtime:please operate after successful deployment'));
            } else {
              updater.domainModalVisible(true);
            }
          }}
        >
          {i18n.t('runtime:set domain')}
        </span>
      );

    if (expose && expose.length > 1) {
      const linkContent = (
        <ul className="popover-links">
          {map(expose, (link) => (
            <li key={link}>
              <a href={`//${link}`} target="_blank" rel="noopener noreferrer">
                {link}
              </a>
            </li>
          ))}
        </ul>
      );
      links = (
        <Popover title={i18n.t('runtime:available domain')} content={linkContent}>
          <span className="domain-links hover-active">{i18n.t('runtime:Access Domain')}</span>
        </Popover>
      );
    }
    return (
      <div className="endpoint-ops">
        {hasCustomDomain ? null : (
          <>
            <CustomIcon className="warning-info" type="tishi" />
            <span className="warning-info mr-3">{i18n.t('runtime:domain not set')}</span>
          </>
        )}
        {links}
        {commonOps}
      </div>
    );
  };

  let errorMsg: React.ReactNode = '';
  if (errors && errors[0] && status !== 'Healthy') {
    const { ctx, msg } = errors[0];
    const { instanceId } = ctx;
    const wrapTooltip = (children: any, text: string) => {
      return <Tooltip title={text}>{children}</Tooltip>;
    };
    const msgContent = `${msg}，${i18n.t('runtime:please view container log')}`;
    errorMsg = (
      <span
        className="log-link"
        onClick={(e) => {
          e.stopPropagation();
          openSlidePanel('log', { id: instanceId });
        }}
      >
        {msgContent}
      </span>
    );
    if (msg.length > 30) {
      errorMsg = wrapTooltip(errorMsg, msgContent);
    }
  }

  const permMap = usePerm((s) => s.app);
  const consoleAuth = (permMap.runtime[`${runtimeDetail.extra.workspace.toLowerCase()}Console`] || {}).pass;

  const handleKill = (record: RUNTIME.ServicePod) => {
    const infoContent = (
      <div className="">
        <div>{`${i18n.t('cmp:Pod instance')}: ${record.podName}`}</div>
      </div>
    );

    const onOk = () =>
      runtimeServiceStore
        .killServicePod({
          runtimeID: +runtimeId,
          podName: record.podName,
        })
        .then(() => {
          fetchRunningData();
          fetchStopData();
        });

    Modal.confirm({
      title: i18n.t('runtime:confirm to delete the Pod'),
      content: infoContent,
      width: 500,
      onOk,
    });
  };

  return (
    <React.Fragment>
      <div className={`${serviceClass} mb-5`}>
        <div className="service-card" onClick={() => togglePanel()}>
          <div className="service-card-icon-wrapper">
            <CustomIcon type={isEndpoint ? 'mysql1' : 'wfw1'} color />
          </div>
          <div className="service-card-info">
            <div className="info-msg">
              <IF check={status !== 'Healthy'}>
                <HealthPoint type="service" status={status} />
              </IF>
              <span className="name text-base">{name}</span>
              {resourceInfo}
              {runtimeDetail.services[name].hpaEnabled === 'Y' && (
                <span className="mr-4">{i18n.s('Elastic scaling policy is enabled', 'dop')}</span>
              )}
            </div>
            <div className="error-msg text-xs nowrap">{errorMsg}</div>
          </div>
          {isServiceType && (
            <div className="service-card-operation" onClick={(e) => e.stopPropagation()}>
              {getOperation()}
            </div>
          )}
        </div>
        <div className={`inner-content ${visible ? '' : 'hidden'}`}>
          <Tabs defaultActiveKey="service-details">
            <TabPane tab={`${i18n.t('Running')} (${runningData?.length || 0})`} key="running">
              <RunningPods
                data={runningData || []}
                consoleAuth={consoleAuth}
                key={name}
                kill={handleKill}
                isServiceType={isServiceType}
                openSlidePanel={openSlidePanel}
                onReload={fetchRunningData}
              />
            </TabPane>
            <TabPane tab={`${i18n.t('Stopped')} (${stopedData?.length || 0})`} key="stop">
              <StopedPods
                data={stopedData || []}
                loading={stopedFetched.loading}
                onReload={fetchStopData}
                key={name}
                isServiceType={isServiceType}
                openSlidePanel={openSlidePanel}
              />
              <div />
            </TabPane>
          </Tabs>
        </div>
      </div>
      <SlidePanel
        title={title}
        content={content}
        withTabs={withTabs as IWithTabs}
        visible={slideVisible}
        closeSlidePanel={() => updater.slideVisible(false)}
      />
    </React.Fragment>
  );
};

const RunningPods = ({
  data,
  consoleAuth,
  isServiceType,
  openSlidePanel,
  onReload,
  kill,
}: {
  data: RUNTIME.ServicePod[];
  consoleAuth: boolean;
  onReload: () => void;
  isServiceType: boolean;
  openSlidePanel: (type: string, record?: RUNTIME.ServicePod) => void;
  kill: (record: RUNTIME.ServicePod) => void;
}) => {
  const actions = {
    width: 100,
    render: (record: RUNTIME.ServicePod) => {
      const _containerId = record.podContainers?.[0]?.containerId;
      return [
        ...insertWhen(!!_containerId, [
          {
            title: (
              <WithAuth pass={consoleAuth}>
                <span>{i18n.t('Console')}</span>
              </WithAuth>
            ),
            onClick: () => {
              openSlidePanel('terminal', { ...record });
            },
          },
          ...insertWhen(isServiceType, [
            {
              title: i18n.t('Container Monitoring'),
              onClick: () => openSlidePanel('monitor', { ...record }),
            },
          ]),
          {
            title: firstCharToUpper(i18n.t('log')),
            onClick: () => openSlidePanel('log', { ...record }),
          },
        ]),
        {
          title: firstCharToUpper(i18n.t('stop')),
          onClick: () => {
            kill(record);
          },
        },
      ];
    },
  };
  const columns = [
    {
      dataIndex: 'podName',
      title: firstCharToUpper(i18n.t('instance name')),
      width: 180,
    },
    {
      dataIndex: 'ipAddress',
      title: firstCharToUpper(i18n.s('instance IP', 'runtime')),
    },
    {
      dataIndex: 'phase',
      title: i18n.t('Status'),
      render: (text: string) => {
        const phaseMap = {
          Creating: { status: 'processing', name: i18n.s('creating', 'dop') },
          Healthy: { status: 'success', name: i18n.t('healthy') },
          Unhealthy: { status: 'error', name: i18n.t('unhealthy') },
          default: { status: 'default', name: text },
        };
        const curPhase = phaseMap[text] || phaseMap.default;
        return <Badge text={curPhase.name} status={curPhase.status} showDot={false} />;
      },
    },
    {
      dataIndex: 'host',
      title: i18n.t('runtime:Host IP'),
    },
    {
      dataIndex: 'message',
      title: i18n.t('runtime:Message'),
    },
    {
      dataIndex: 'restartCount',
      title: i18n.t('cmp:Number of restarts'),
    },
    {
      dataIndex: 'k8sNamespace',
      title: i18n.t('cmp:Namespace'),
      hidden: true,
    },
    {
      dataIndex: 'startedAt',
      title: i18n.t('Creation time'),
      render: (text: string) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];

  return (
    <Table
      rowKey={(record, i) => {
        const { uid: id, containerId: _containerId } = record;
        const containerId = record.podContainers?.[0]?.containerId || _containerId;
        return `${i}${id}-${containerId}`;
      }}
      actions={actions}
      columns={columns}
      scroll={{ x: 1000 }}
      dataSource={data}
      onReload={onReload}
    />
  );
};

const insStatusMap = statusMap.task;
const StopedPods = ({
  data,
  loading,
  onReload,
  isServiceType,
  openSlidePanel,
}: {
  data: RUNTIME.ServicePod[];
  loading: boolean;
  onReload: () => void;
  isServiceType: boolean;
  openSlidePanel: (type: string, record?: RUNTIME.ServicePod) => void;
}) => {
  const columns = [
    {
      title: i18n.t('runtime:Instance IP'),
      dataIndex: 'ipAddress',
      width: 120,
    },
    {
      title: i18n.t('runtime:Host address'),
      width: 120,
      dataIndex: 'host',
    },
    {
      title: i18n.t('Status'),
      dataIndex: 'status',
      className: 'th-status',
      render: (text: string, record: RUNTIME.ServicePod) => {
        const { message } = record;
        return (
          <span className="nowrap">
            {insStatusMap[text].text}
            {message ? <Tooltip title={message}> ({message})</Tooltip> : null}
          </span>
        );
      },
    },
    {
      title: i18n.t('Creation time'),
      width: 176,
      dataIndex: 'startedAt',
      className: 'th-time nowrap',
      render: (text: string) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: i18n.t('Operations'),
      dataIndex: 'Operations',
      render: (_, record: RUNTIME.ServicePod) => {
        return (
          <div className="service-ops table-operations">
            <IF check={isServiceType}>
              <span className="table-operations-btn" onClick={() => openSlidePanel('monitor', { ...record })}>
                {i18n.t('Container Monitoring')}
              </span>
            </IF>
            <span className="table-operations-btn" onClick={() => openSlidePanel('log', { ...record })}>
              {firstCharToUpper(i18n.t('log'))}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      onReload={onReload}
      dataSource={data || []}
      rowKey={(record, i) => {
        const { uid: id, containerId: _containerId } = record;
        const containerId = record.podContainers?.[0]?.containerId || _containerId;
        return `${i}${id}-${containerId}`;
      }}
      loading={loading}
    />
  );
};

export default ServiceCard;
