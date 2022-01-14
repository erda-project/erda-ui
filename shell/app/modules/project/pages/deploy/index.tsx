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

import * as React from 'react';
import { RadioTabs, ErdaIcon, EmptyHolder, Badge } from 'common';
import { ENV_MAP } from 'project/common/config';
import { map, debounce } from 'lodash';
import { Drawer, Button, Input, Timeline, Avatar, Spin } from 'antd';
import { goTo, getAvatarChars, updateSearch } from 'common/utils';
import { useUpdate } from 'common/use-hooks';
import routeInfoStore from 'core/stores/route';
import DiceConfigPage, { useMock } from 'app/config-page';
import { getUrlQuery } from 'config-page/utils';
import { CardItem } from 'app/config-page/components/card/card';
import i18n from 'i18n';
import DeployLog from 'runtime/common/logs/components/deploy-log';
import { useUserMap } from 'core/stores/userMap';
import { useEffectOnce, useUpdateEffect } from 'react-use';
import DeployDetail from './deploy-detail';
import { deployOrderStatusMap } from './config';
import moment from 'moment';
import {
  getDeployOrders,
  getDeployOrderDetail,
  cancelDeploy,
  startDeploy,
  createDeploy,
} from 'project/services/deploy';
import AddDeploy from './add-deploy';

import './index.scss';

interface IState {
  detailDrawerVisible: boolean;
  searchValue: string;
  addDrawerVisible: boolean;
  logData: undefined | { detailLogId: string; applicationId: string };
  logVisible: boolean;
  deployDetail: PROJECT_DEPLOY.DeployDetail | undefined;
  selectedOrder: string;
  selectedRelease: { id: string; releaseId: string } | undefined;
  urlQuery: Obj<{ [key: string]: string }>;
}

const DeployContainer = () => {
  const { env: routeEnv, projectId } = routeInfoStore.useStore((s) => s.params);
  const env = routeEnv?.toUpperCase();

  return (
    <div className="project-deploy flex flex-col h-full pb-2">
      <div className="flex items-center justify-between">
        <RadioTabs
          value={env}
          onChange={(v) => goTo(goTo.pages.projectDeployEnv, { projectId, env: `${v}`?.toLowerCase() })}
          options={map(ENV_MAP, (v, k) => ({ label: v, value: k }))}
        />
      </div>
      <DeployContent key={env} projectId={projectId} env={env} />
    </div>
  );
};

const DeployContent = ({ projectId, env: propsEnv }: { projectId: string; env: string }) => {
  const [query] = routeInfoStore.useStore((s) => [s.query]);
  const [
    {
      detailDrawerVisible,
      addDrawerVisible,
      searchValue,
      logVisible,
      logData,
      deployDetail,
      selectedOrder,
      selectedRelease,
      urlQuery,
    },
    updater,
    update,
  ] = useUpdate<IState>({
    detailDrawerVisible: false,
    addDrawerVisible: false,
    logVisible: false,
    logData: undefined,
    searchValue: '',
    deployDetail: undefined,
    selectedRelease: undefined,
    selectedOrder: '',
    urlQuery: query,
  });
  const env = propsEnv?.toUpperCase();

  const urlQueryChange = (val: Obj) => updater.urlQuery((prev: Obj) => ({ ...prev, ...getUrlQuery(val) }));

  const timer = React.useRef<number>();
  const isAutoLoaing = React.useRef(false);

  React.useEffect(() => {
    updateSearch({ ...urlQuery });
  }, [urlQuery]);

  const [deployOrdersData, loading] = getDeployOrders.useState();
  const deployOrders = React.useMemo(() => deployOrdersData?.list || [], [deployOrdersData]);

  const getDeployOrdersFunc = React.useCallback(
    (_query?: { q: string }) => {
      clearInterval(timer.current);
      getDeployOrders.fetch({
        q: searchValue,
        ..._query,
        pageNo: 1,
        pageSize: 100,
        projectID: projectId,
        workspace: env,
      });
      timer.current = setInterval(() => {
        isAutoLoaing.current = true;
        getDeployOrders
          .fetch({
            q: searchValue,
            ..._query,
            pageNo: 1,
            pageSize: 100,
            projectID: projectId,
            workspace: env,
          })
          .then(() => (isAutoLoaing.current = false));
      }, 1000 * 30);
    },
    [projectId, env, searchValue],
  );

  const debounceChange = React.useRef(debounce(getDeployOrdersFunc, 600));

  useEffectOnce(() => {
    getDeployOrdersFunc();
    return () => {
      clearInterval(timer.current);
    };
  });

  useUpdateEffect(() => {
    debounceChange.current({ q: searchValue });
  }, [searchValue]);

  const getDeployDetailFunc = React.useCallback((deploymentOrderId: string) => {
    getDeployOrderDetail.fetch({ deploymentOrderId }).then((res) => {
      if (res.data) {
        update({
          deployDetail: res.data,
          detailDrawerVisible: true,
        });
      }
    });
  }, []);

  const inParams = {
    projectId,
    // deployId: selectedOrder,
    env,
    ...urlQuery,
  };

  const deployOrderOpMap = React.useMemo(
    () => ({
      start: (deploymentOrderID: string) => (
        <Button
          type="primary"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            startDeploy.fetch({ deploymentOrderID }).then(() => {
              getDeployOrdersFunc();
              deployDetail && getDeployDetailFunc(deployDetail.id);
            });
          }}
        >
          {i18n.t('dop:start deploy')}
        </Button>
      ),
      restart: (deploymentOrderID: string) => (
        <Button
          type="primary"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            startDeploy.fetch({ deploymentOrderID }).then(() => {
              getDeployOrdersFunc();
              deployDetail && getDeployDetailFunc(deployDetail.id);
            });
          }}
        >
          {i18n.t('dop:restart deploy')}
        </Button>
      ),
      cancel: (deploymentOrderID: string) => (
        <Button
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            cancelDeploy.fetch({ deploymentOrderID, force: true }).then(() => {
              getDeployOrdersFunc();
              deployDetail && getDeployDetailFunc(deployDetail.id);
            });
          }}
        >
          {i18n.t('dop:cancel deploy')}
        </Button>
      ),
    }),
    [getDeployOrdersFunc, getDeployDetailFunc, deployDetail],
  );

  const userMap = useUserMap();
  const cards = React.useMemo(() => {
    return deployOrders.map((item) => {
      const curUser = userMap[item.operator];
      const curStatus = deployOrderStatusMap[item.status];
      return {
        id: item.id,
        title: item.name,
        time: item.createdAt,
        titleState: [{ status: curStatus?.status, onlyDot: true }],
        textMeta: [
          {
            mainText: item.applicationStatus,
            subText: i18n.t('application'),
            subTip: i18n.t('dop:deploy succeeded applications count / applications count'),
          },

          { mainText: item.releaseVersion || item.releaseId, subText: i18n.t('Artifact') },
        ],
        icon: (
          <Avatar src={curUser?.avatar} size="small" className="mr-1">
            {curUser?.nick ? getAvatarChars(curUser.nick) : i18n.t('none')}
          </Avatar>
        ),
        buttonOperation: item.type !== 'PIPELINE' ? deployOrderOpMap[curStatus.op]?.(item.id) : undefined,
      };
    });
  }, [userMap, deployOrders, deployOrderOpMap]);

  const curDetailStatus =
    deployDetail?.type !== 'PIPELINE' && deployDetail?.status && deployOrderStatusMap[deployDetail?.status];
  const closeAddDrawer = () => updater.addDrawerVisible(false);
  return (
    <>
      <div className="flex flex-1 mt-2 overflow-hidden">
        <div className="bg-white flex-1 overflow-hidden">
          <DiceConfigPage
            scenarioKey="project-runtime"
            scenarioType="project-runtime"
            // useMock={useMock}
            // forceMock
            inParams={inParams}
            customProps={{
              inputFilter: {
                op: {
                  onFilterChange: urlQueryChange,
                },
              },
              advanceFilter: {
                op: {
                  onFilterChange: urlQueryChange,
                },
              },
              list: {
                op: {
                  clickItem: (op: { serverData?: { logId: string; appId: string } }, extra: { action: string }) => {
                    const { logId, appId } = op.serverData || {};
                    if (extra.action === 'clickTitleState' && logId && appId) {
                      update({
                        logVisible: true,
                        logData: {
                          detailLogId: logId,
                          applicationId: appId,
                        },
                      });
                    }
                  },
                },
              },
              page: {
                props: {
                  className: 'h-full',
                },
              },
            }}
          />
        </div>

        <div className="w-[320px] bg-white ml-4 rounded-sm flex flex-col">
          <div className="px-4 flex justify-between items-center mt-2">
            <span className="text-default-8 font-medium">{i18n.t('dop:deployment records')}</span>
            <Button
              size="small"
              type="primary"
              className="text-white-4 hover:text-white flex items-center"
              onClick={() => updater.addDrawerVisible(true)}
            >
              <span className="text-white">{i18n.t('add')}</span>
            </Button>
          </div>
          <div className="mt-2 px-4">
            <Input
              size="small"
              className="bg-black-06 border-none"
              value={searchValue}
              prefix={<ErdaIcon size="16" fill="default-3" type="search" />}
              onChange={(e) => {
                const { value } = e.target;
                updater.searchValue(value);
              }}
              placeholder={i18n.t('dop:search by person or product information')}
            />
          </div>
          <div className="mt-2 flex-1 h-0">
            <Spin
              spinning={!isAutoLoaing.current && loading}
              wrapperClassName="full-spin-height overflow-hidden project-deploy-orders"
            >
              {cards.length ? (
                <Timeline className="mt-2">
                  {cards.map((card) => {
                    return (
                      <Timeline.Item
                        key={card.id}
                        dot={<div className="ml-0.5 mt-1 bg-default-3 w-[8px] h-[8px] rounded-full" />}
                      >
                        <span className="text-sm text-default-6 mb-1">
                          {moment(card.time).format('YYYY-MM-DD HH:mm:ss')}
                        </span>
                        <CardItem
                          className={`animate-border ${selectedOrder === card.id ? 'bg-default-06' : ''}`}
                          card={card}
                          onClick={() => {
                            getDeployDetailFunc(card.id);
                          }}
                        />
                      </Timeline.Item>
                    );
                  })}
                </Timeline>
              ) : (
                <EmptyHolder relative />
              )}
            </Spin>
          </div>
        </div>
      </div>
      <Drawer
        width={'80%'}
        destroyOnClose
        title={
          <div className="flex-h-center justify-between pr-8">
            <div className="flex-h-center">
              <span>{deployDetail?.name}</span>
              {curDetailStatus ? (
                <Badge className="ml-1" status={curDetailStatus.status} text={curDetailStatus.text} />
              ) : null}
            </div>
            <div>{curDetailStatus?.op && deployOrderOpMap[curDetailStatus.op]?.(deployDetail?.id)}</div>
          </div>
        }
        visible={detailDrawerVisible}
        onClose={() => update({ detailDrawerVisible: false, deployDetail: undefined })}
      >
        <DeployDetail detail={deployDetail} />
      </Drawer>
      <Drawer
        title={i18n.t('dop:create deployment request')}
        width={'80%'}
        destroyOnClose
        visible={addDrawerVisible}
        onClose={closeAddDrawer}
        footer={
          <div className="">
            <Button
              type="primary"
              className="mr-2"
              disabled={!selectedRelease}
              onClick={() => {
                selectedRelease &&
                  createDeploy.fetch({ workspace: env, ...selectedRelease }).then(() => {
                    getDeployOrdersFunc();
                    closeAddDrawer();
                  });
              }}
            >
              {i18n.t('create')}
            </Button>
            <Button onClick={closeAddDrawer}>{i18n.t('cancel')}</Button>
          </div>
        }
      >
        <AddDeploy onSelect={(v: { id: string; releaseId: string }) => updater.selectedRelease(v)} />
      </Drawer>

      <Drawer visible={logVisible} width={'80%'} onClose={() => update({ logVisible: false, logData: undefined })}>
        {logData ? <DeployLog {...logData} /> : null}
      </Drawer>
    </>
  );
};

export default DeployContainer;
