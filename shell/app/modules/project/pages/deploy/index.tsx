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
import { Drawer, Button, Input, Timeline, Spin, message } from 'antd';
import { goTo } from 'common/utils';
import { useUpdate } from 'common/use-hooks';
import routeInfoStore from 'core/stores/route';
import DiceConfigPage, { useMock } from 'app/config-page';
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
  getProjectRuntimeCount,
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
  selectedRelease: { id: string; releaseId: string; name: string; hasFail: boolean; type?: string } | undefined;
  modes: string[];
}

const DeployContainer = () => {
  const { workspace: routeEnv, projectId, appId } = routeInfoStore.useStore((s) => s.params);
  const env = routeEnv?.toUpperCase();
  const [runtimeCount, setRuntimeCount] = React.useState({
    DEV: 0,
    PROD: 0,
    STAGING: 0,
    TEST: 0,
  });

  const isAppDeploy = !!appId;

  React.useEffect(() => {
    getProjectRuntimeCount.fetch({ projectId, appId }).then((res) => {
      res?.data && setRuntimeCount(res.data);
    });
  }, [projectId, appId]);

  const options = map(ENV_MAP, (v, k) => ({ label: `${v}(${runtimeCount[k] || 0})`, value: k }));

  return (
    <div className="project-deploy flex flex-col h-full pb-2">
      <div className="flex items-center justify-between">
        <RadioTabs
          key={env}
          value={env}
          onChange={(v) =>
            isAppDeploy
              ? goTo(goTo.pages.appDeployEnv, { projectId, workspace: `${v}`?.toLowerCase(), appId })
              : goTo(goTo.pages.projectDeployEnv, { projectId, workspace: `${v}`?.toLowerCase() })
          }
          options={options}
        />
      </div>
      <DeployContent
        key={env}
        appId={appId}
        isAppDeploy={isAppDeploy}
        projectId={projectId}
        env={env}
        onCountChange={(count: number) => setRuntimeCount((prev) => ({ ...prev, [env]: count }))}
      />
    </div>
  );
};

const DeployContent = ({
  projectId,
  appId,
  env: propsEnv,
  onCountChange,
  isAppDeploy,
}: {
  projectId: string;
  appId: string;
  env: string;
  isAppDeploy: boolean;
  onCountChange: (count: number) => void;
}) => {
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
      modes,
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
    modes: [],
    selectedOrder: '',
  });
  const env = propsEnv?.toUpperCase();

  const timer = React.useRef<number>();
  const isAutoLoaing = React.useRef(false);
  const reloadRef = React.useRef<{ reload: () => void }>();

  const [deployOrdersData, loading] = getDeployOrders.useState();
  const deployOrders = React.useMemo(() => deployOrdersData?.list || [], [deployOrdersData]);

  const reloadRuntime = () => {
    if (reloadRef.current && reloadRef.current.reload) {
      reloadRef.current.reload();
    }
  };

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
          .then(() => {
            isAutoLoaing.current = false;
          });
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

  const getDeployDetailFunc = React.useCallback(
    (deploymentOrderId: string) => {
      getDeployOrderDetail.fetch({ deploymentOrderId }).then((res) => {
        if (res.data) {
          update({
            deployDetail: res.data,
            detailDrawerVisible: true,
          });
        }
      });
    },
    [update],
  );

  const inParams = {
    projectId,
    appId,
    // deployId: selectedOrder,
    env,
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
              reloadRuntime();
              getDeployOrdersFunc();
              deployDetail && getDeployDetailFunc(deployDetail.id);
            });
          }}
        >
          {i18n.t('dop:Start Deployment')}
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
      const typeStatusMap = {
        project: { status: 'processing', text: i18n.t('project'), showDot: false },
        application: { status: 'success', text: i18n.t('application'), showDot: false },
      };
      return {
        id: item.id,
        title: item.name,
        time: item.createdAt,
        operator: curUser?.nick || curUser?.name || item.operator,
        titleState: [{ status: curStatus?.status, onlyDot: true }, typeStatusMap[item.releaseInfo?.type]],
        textMeta: [
          {
            mainText: item.applicationStatus,
            subText: i18n.t('application'),
            subTip: i18n.t('dop:deploy succeeded applications count / applications count'),
          },

          { mainText: item.releaseInfo?.version || item.releaseInfo?.id, subText: i18n.t('Artifacts') },
        ],
        icon: (
          <ErdaIcon type="id" size="20" disableCurrent />
          // <Avatar src={curUser?.avatar} size="small" className="mr-1">
          //   {curUser?.nick ? getAvatarChars(curUser.nick) : i18n.t('None')}
          // </Avatar>
        ),
        buttonOperation: item.type !== 'PIPELINE' ? deployOrderOpMap[curStatus.op]?.(item.id) : undefined,
      };
    });
  }, [userMap, deployOrders, deployOrderOpMap]);

  const curDetailStatus =
    deployDetail?.type !== 'PIPELINE' && deployDetail?.status && deployOrderStatusMap[deployDetail?.status];
  const closeAddDrawer = () => {
    update({
      addDrawerVisible: false,
      selectedRelease: undefined,
      modes: [],
    });
  };
  const scenarioKey = isAppDeploy ? 'app-runtime' : 'project-runtime';
  return (
    <>
      <div className="flex flex-1 mt-2 overflow-hidden">
        <div className="bg-white flex-1 overflow-hidden">
          <DiceConfigPage
            scenarioKey={scenarioKey}
            scenarioType={scenarioKey}
            // useMock={useMock}
            // forceMock
            ref={reloadRef}
            inParams={inParams}
            customProps={{
              list: {
                props: isAppDeploy
                  ? {}
                  : {
                      whiteHead: true,
                      whiteFooter: true,
                    },
                op: {
                  onStateChange: (data: { total: number }) => {
                    onCountChange(data?.total);
                  },
                  clickItem: (op: { serverData?: { logId: string; appId: string } }, extra: { action: string }) => {
                    const { logId, appId: _appId } = op.serverData || {};
                    if (extra.action === 'clickTitleState' && logId && _appId) {
                      update({
                        logVisible: true,
                        logData: {
                          detailLogId: logId,
                          applicationId: _appId,
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
        {isAppDeploy ? null : (
          <div className="bg-white flex">
            <div className="w-[320px] bg-default-02 rounded-sm flex flex-col">
              <div className="px-4 flex justify-between items-center mt-2">
                <span className="text-default-8 font-medium">{i18n.t('dop:Deployment records')}</span>
                <Button
                  size="small"
                  className="text-default-4 hover:text-default-8 flex items-center"
                  onClick={() => updater.addDrawerVisible(true)}
                >
                  <ErdaIcon type="plus" />
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
                  placeholder={i18n.t('dop:search by ID, person or product information')}
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
                        const { operator, ...cardRest } = card;
                        return (
                          <Timeline.Item
                            key={card.id}
                            dot={<div className="ml-0.5 mt-1 bg-default-3 w-[8px] h-[8px] rounded-full" />}
                          >
                            <div className="text-sm text-default-6 mb-1">
                              <span className="mr-2">{operator}</span>
                              <span>{moment(card.time).format('YYYY-MM-DD HH:mm:ss')}</span>
                            </div>
                            <CardItem
                              className={'bg-white'}
                              card={cardRest}
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
        )}
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
        title={
          <div className="flex-h-center">
            <span className="mr-2">{i18n.t('dop:Create deployment')}</span>
            {selectedRelease ? (
              <>
                <ErdaIcon size={20} type="id" disableCurrent className="mr-1" />
                <span>{selectedRelease.name}</span>
              </>
            ) : null}
          </div>
        }
        width={'80%'}
        destroyOnClose
        visible={addDrawerVisible}
        onClose={closeAddDrawer}
        footer={
          <div className="">
            <Button
              type="primary"
              className="mr-2"
              disabled={!selectedRelease || selectedRelease.hasFail}
              onClick={() => {
                if (selectedRelease?.type === 'PROJECT_RELEASE' && !modes.length) {
                  message.error(i18n.t('please choose {name}', { name: i18n.t('mode') }));
                  return;
                }

                selectedRelease &&
                  createDeploy
                    .fetch({ workspace: env, id: selectedRelease.id, releaseId: selectedRelease.releaseId, modes })
                    .then(() => {
                      getDeployOrdersFunc();
                      closeAddDrawer();
                    });
              }}
            >
              {i18n.t('create')}
            </Button>
            <Button onClick={closeAddDrawer}>{i18n.t('Cancel')}</Button>
          </div>
        }
      >
        <AddDeploy
          id={selectedRelease?.id}
          onSelect={(v: { id: string; releaseId: string; name: string; hasFail: boolean; type?: string }) =>
            updater.selectedRelease(v)
          }
          onModesSelect={(v: string[]) => {
            updater.modes(v);
          }}
        />
      </Drawer>

      <Drawer visible={logVisible} width={'80%'} onClose={() => update({ logVisible: false, logData: undefined })}>
        {logData ? <DeployLog {...logData} /> : null}
      </Drawer>
    </>
  );
};

export default DeployContainer;
