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

import { goTo, formatTime, fromNow } from 'app/common/utils';
import { FilterGroup, Panel, useUpdate } from 'common';
import i18n from 'i18n';
import { ColumnProps } from 'core/common/interface';
import { Button, Cascader, message, Spin, Table, Tooltip } from 'app/nusi';
import * as React from 'react';
import addonStore from 'common/stores/addon';
import jvmStore, { ProfileStateMap } from '../../stores/jvm';

export default () => {
  const [services, runningList, historyList, historyPaging] = jvmStore.useStore((s) => [
    s.services,
    s.runningList,
    s.historyList,
    s.historyPaging,
  ]);
  const addonDetail = addonStore.useStore((s) => s.addonDetail);
  const insId = addonDetail.realInstanceId;
  const runningTimer = React.useRef(-1);
  const pendingTimer = React.useRef(-1);

  const [{ idList, isPending, isLoadHistory }, updater] = useUpdate({
    idList: [] as string[],
    isPending: false,
    isLoadHistory: false,
  });

  const getRunningList = React.useCallback(() => {
    jvmStore.getProfileList({ insId, state: ProfileStateMap.RUNNING, isHistory: false }).then(() => {
      runningTimer.current = window.setTimeout(() => {
        getRunningList();
      }, 15 * 1000);
    });
  }, [insId]);

  const getHistoryList = React.useCallback(
    (q = {}) => {
      updater.isLoadHistory(true);
      jvmStore
        .getProfileList({
          insId,
          isHistory: true,
          state: [ProfileStateMap.COMPLETED, ProfileStateMap.FAILED, ProfileStateMap.TERMINATING],
          ...q,
        })
        .finally(() => {
          updater.isLoadHistory(false);
        });
    },
    [insId, updater],
  );

  React.useEffect(() => {
    if (addonDetail.realInstanceId) {
      jvmStore.getServiceInsList(addonDetail.realInstanceId);
    }
    getRunningList();
    getHistoryList();

    return () => {
      clearTimeout(runningTimer.current);
      clearTimeout(pendingTimer.current);
    };
  }, [addonDetail, getHistoryList, getRunningList, insId]);

  const onChange = (values: any) => {
    updater.idList(values.ids);
  };

  const rollingState = React.useCallback(
    (s) => {
      jvmStore.getProfileStatus({ insId, profileId: s.id }).then((res) => {
        switch (res.state) {
          case 'pending':
            pendingTimer.current = window.setTimeout(() => {
              rollingState(res);
            }, 5000);
            break;
          // case ProfileStateMap.COMPLETED:
          // case ProfileStateMap.TERMINATING:
          case ProfileStateMap.RUNNING:
            goTo(`./${res.id}`);
            break;
          case ProfileStateMap.FAILED:
            message.error(res.message);
            break;
          default:
            break;
        }
      });
    },
    [insId],
  );

  const startProfile = () => {
    const [applicationId, serviceId, serviceInstanceId] = idList;
    jvmStore
      .startProfile({
        insId,
        applicationId,
        serviceId,
        serviceInstanceId,
      })
      .then((s) => {
        updater.isPending(true);
        rollingState(s);
      });
  };

  const getCols = (isHistory: boolean) => {
    const cols: Array<ColumnProps<JVM.ProfileItem>> = [
      {
        title: i18n.t('addonPlatform:application / service / instance name'),
        dataIndex: 'serviceInstanceName',
        key: 'serviceInstanceName',
        render: (_, record) => `${record.applicationName} / ${record.applicationName} / ${record.serviceInstanceName}`,
      },
      {
        title: i18n.t('addonPlatform:analyze id'),
        dataIndex: 'profiling',
        key: 'profiling',
        render: (v) => <Tooltip title={v}>{v}</Tooltip>,
      },
      {
        title: i18n.t('common:state'),
        dataIndex: ['state', 'state'],
        key: 'state.state',
        width: 140,
        render: (v) => {
          return (
            {
              [ProfileStateMap.PENDING]: i18n.t('addonPlatform:attaching to process'),
              [ProfileStateMap.RUNNING]: i18n.t('addonPlatform:processing'),
              [ProfileStateMap.COMPLETED]: i18n.t('addonPlatform:completed'),
              [ProfileStateMap.FAILED]: i18n.t('addonPlatform:failed'),
              [ProfileStateMap.TERMINATING]: i18n.t('addonPlatform:terminate'),
            }[v] || null
          );
        },
      },
      {
        title: i18n.t('create time'),
        dataIndex: 'createTime',
        key: 'createTime',
        width: 180,
        render: (v) => formatTime(v, 'YYYY-MM-DD HH:mm:ss'),
      },
      isHistory
        ? {
            title: i18n.t('common:end at'),
            dataIndex: 'finishTime',
            key: 'finishTime',
            width: 180,
            render: (v) => formatTime(v, 'YYYY-MM-DD HH:mm:ss'),
          }
        : {
            title: i18n.t('addonPlatform:started at'),
            key: 'startFrom',
            width: 120,
            render: (v) => fromNow(v),
          },
      {
        title: i18n.t('operations'),
        width: 80,
        render: (record: JVM.ProfileItem) => {
          return (
            <div className="table-operations">
              <span className="table-operations-btn" onClick={() => goTo(`./${record.profiling}`)}>
                {i18n.t('common:view')}
              </span>
            </div>
          );
        },
      },
    ];
    return cols;
  };

  return (
    <div className="jvm-profile">
      <Spin spinning={isPending} tip={i18n.t('addonPlatform:attaching to process')}>
        <div className="px20 pt20 pb4 mb20 white-bg border-all">
          <FilterGroup
            list={[
              {
                label: i18n.t('addonPlatform:select instance'),
                name: 'ids',
                type: 'custom',
                placeholder: '选择后进行分析',
                Comp: <Cascader options={services} expandTrigger="hover" style={{ width: 400 }} />,
              },
            ]}
            onChange={onChange}
          >
            <Button type="primary" disabled={!idList.length} onClick={startProfile}>
              {i18n.t('addonPlatform:start analysis')}
            </Button>
          </FilterGroup>
        </div>
      </Spin>
      <Panel title={i18n.t('addonPlatform:analyzing')} className="block">
        <Table
          dataSource={runningList}
          columns={getCols(false)}
          rowKey="profiling"
          pagination={false}
          tableLayout="fixed"
        />
      </Panel>
      <Panel title={i18n.t('addonPlatform:historical analysis')} className="block mt20">
        <Table
          dataSource={historyList}
          columns={getCols(true)}
          rowKey="profiling"
          loading={isLoadHistory}
          pagination={{
            current: historyPaging.pageNo,
            pageSize: historyPaging.pageSize,
            total: historyPaging.total,
            onChange: (no: number) => getHistoryList({ pageNo: no }),
          }}
          tableLayout="fixed"
        />
      </Panel>
    </div>
  );
};
