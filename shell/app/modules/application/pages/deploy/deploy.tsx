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

import { groupBy, map, get, find } from 'lodash';
import React from 'react';
import { Icon as CustomIcon, useUpdate, FormModal, LoadMoreSelector } from 'common';
import { Spin, Tooltip, Alert, Select } from 'app/nusi';
import { EnvCard } from './env-card';
import RuntimeBox from './runtime-box';
import appDeployStore from 'application/stores/deploy';
import GotoCommit from 'application/common/components/goto-commit';
import { useLoading } from 'app/common/stores/loading';
import { useEffectOnce } from 'react-use';
import appStore from 'application/stores/application';
import { getReleaseList } from 'application/services/release';
import routeInfoStore from 'app/common/stores/route';
import { WrappedFormUtils } from 'core/common/interface';
import { usePerm, WithAuth } from 'user/common';
import moment from 'moment';
import classNames from 'classnames';
import orgStore from 'app/org-home/stores/org';
import i18n from 'i18n';

import './deploy.scss';

const { Option } = Select;

const appBlockStatusMap = {
  blocked: i18n.t('default:blocking'),
  unblocking: i18n.t('default:unblocking'),
  unblocked: i18n.t('default:unblocked'),
};


const ENVS_MAP = {
  DEV: i18n.t('dev environment'),
  TEST: i18n.t('test environment'),
  STAGING: i18n.t('staging environment'),
  PROD: i18n.t('prod environment'),
};

interface IProps {
  type: string,
  canCreate: boolean;
  setCurEnv(k: string): void,
}
const NewDeploy = ({ type, setCurEnv, canCreate }: IProps) => {
  const permMap = usePerm(s => s.app.runtime);
  const className = classNames('runtime-box new-deploy center-flex-box', {
    disabled: canCreate,
    'hover-active': !canCreate,
  });
  return (
    <WithAuth pass={permMap[`${type.toLowerCase()}DeployOperation`].pass} >
      <div className={className} onClick={() => setCurEnv(type)}>
        <CustomIcon type='tj1' className='fz24 mb16' />
        <span>{i18n.t('application:Quickly create from artifacts')}</span>
      </div>
    </WithAuth>
  );
};

interface IFormProps {
  curEnv: string,
  isUpdate: boolean,
  curBranch: string,
  setCurEnv(k: string): void,
}

const releaseOptionItem = (release: RELEASE.detail) => {
  if (!release) return;
  const { releaseId, createdAt, labels = {} } = release;
  const displayStr = `${releaseId.slice(0, 6)} (${i18n.t('created at')}: ${moment(createdAt).format('YYYY-MM-DD HH:mm:ss')}; ${i18n.t('application:commit message')}: ${labels.gitCommitMessage})`;
  const tip = (
    <div onClick={(e: any) => e.stopPropagation()}>
      <div className='break-all'>{i18n.t('commit')} ID: <GotoCommit length={6} commitId={labels.gitCommitId} gotoParams={{ jumpOut: true }} /></div>
      <div>{i18n.t('application:commit message')}: {labels.gitCommitMessage}</div>
      <div>{i18n.t('created at')}: {moment(createdAt).format('YYYY-MM-DD HH:mm:ss')}</div>
    </div>
  );
  return (
    <Tooltip title={tip} key={releaseId}>
      <span className='full-width nowrap'>{displayStr}</span>
    </Tooltip>
  );
};

const NewDeployForm = ({ curEnv, isUpdate, setCurEnv, curBranch }: IFormProps) => {
  const branchInfo = appStore.useStore(s => s.branchInfo);
  const { appId } = routeInfoStore.getState(s => s.params);
  const formRef = React.useRef(null as any);
  const branchAuthObj = usePerm(s => s.app.pipeline);
  const initBranch = curBranch || undefined;
  const [{ chosenBranch }, updater] = useUpdate({
    chosenBranch: undefined as undefined | string,
  });
  const [formLoading] = useLoading(appDeployStore, ['addRuntimeByRelease']);
  React.useEffect(() => {
    updater.chosenBranch(initBranch);
    const curForm = formRef && formRef.current;
    if (curForm) {
      setTimeout(() => {
        curForm.props.form.setFieldsValue({ branch: initBranch });
      }, 0);
    }
  }, [initBranch, updater]);

  const fieldList = (form: WrappedFormUtils) => [
    {
      label: i18n.t('application:branch'),
      name: 'branch',
      type: 'select',
      itemProps: {
        disabled: !!initBranch,
        placeholder: i18n.t('please choose {name}', { name: i18n.t('application:branch') }),
        onChange: (v: string) => {
          updater.chosenBranch(v);
          if (form) {
            form.setFieldsValue({ releaseId: undefined });
          }
        },
      },
      options: () => map(branchInfo, item => {
        let tip = '';
        const branchAuth = !item.artifactWorkspace.includes(curEnv);
        if (branchAuth) {
          tip = `${i18n.t('application:this branch can not deploy on {env}', { env: ENVS_MAP[curEnv] })}`;
        }
        if (!tip) {
          const hasAuth = item.isProtect ? branchAuthObj.executeProtected.pass : branchAuthObj.executeNormal.pass;
          !hasAuth && (tip = i18n.t('application:branch is protected, you have no permission yet'));
        }
        return (
          <Option key={item.name} value={item.name} disabled={!!tip}>
            <Tooltip title={tip}>{item.name}</Tooltip>
          </Option>
        );
      }),
    },
    {
      label: i18n.t('releaseId'),
      name: 'releaseId',
      type: 'custom',
      getComp: () => {
        const getData = (_q: Obj = {}) => {
          if (!_q.branchName) return;
          return getReleaseList({ ..._q, applicationId: +appId } as any).then((res: any) => res.data);
        };
        return (
          <LoadMoreSelector
            getData={getData}
            dataFormatter={({ list, total }) => ({
              total,
              list: map(list, item => ({ ...item, label: item.releaseId, value: item.releaseId })),
            })}
            optionRender={releaseOptionItem as any}
            valueItemRender={releaseOptionItem as any}
            extraQuery={{ branchName: chosenBranch }}
            placeholder={i18n.t('application:releaseId-deploy-tip')}
          />
        );
      },
    },
    {
      name: 'workspace',
      initialValue: curEnv,
      itemProps: {
        type: 'hidden',
      },
    },
  ];

  const onOk = (values: any) => {
    const { branch, ...rest } = values;
    appDeployStore.effects.addRuntimeByRelease(rest).finally(() => {
      setCurEnv('');
    });
  };

  return (
    <FormModal
      title={isUpdate ? i18n.t('application:Quickly update from artifacts') : i18n.t('application:Quickly create from artifacts')}
      visible={!!curEnv}
      loading={formLoading}
      wrappedComponentRef={formRef}
      fieldsList={fieldList}
      onOk={onOk}
      onCancel={() => setCurEnv('')}
      modalProps={{
        maskClosable: false,
      }}
    />
  );
};

const Deploy = () => {
  const runtimes = appDeployStore.useStore(s => s.runtimes);
  const currentOrg = orgStore.useStore(s => s.currentOrg);
  const { blockoutConfig } = currentOrg;
  const { blockStatus, unBlockEnd, unBlockStart } = appStore.useStore(s => s.detail);
  const [loading] = useLoading(appDeployStore, ['getRunTimes']);
  const { getRunTimes, redeployRuntime, deleteRuntime } = appDeployStore.effects;
  const { clearDeploy } = appDeployStore.reducers;
  const timer = React.useRef();

  const [{ curEnv, isUpdate, curBranch }, updater, update] = useUpdate({
    curEnv: '',
    isUpdate: false,
    curBranch: '',
  });

  useEffectOnce(() => {
    getRunTimes();
    return () => clearDeploy();
  });

  // 存在删除中的，就10s轮询检查
  React.useEffect(() => {
    const hasDeleting = find(runtimes, item => item.deleteStatus === 'DELETING');
    clearInterval(timer.current);
    if (hasDeleting) {
      timer.current = setInterval(() => {
        getRunTimes();
      }, 1000 * 10) as any;
    }
    return () => {
      clearInterval(timer.current);
    };
  }, [getRunTimes, runtimes]);

  const group = groupBy(runtimes, 'extra.workspace');
  const deployConf = {
    development: {
      type: 'DEV',
      blockNetworkKey: 'blockDev',
      confs: group.DEV || [],
    },
    test: {
      type: 'TEST',
      blockNetworkKey: 'blockTest',
      confs: group.TEST || [],
    },
    staging: {
      type: 'STAGING',
      blockNetworkKey: 'blockStage',
      confs: group.STAGING || [],
    },
    production: {
      type: 'PROD',
      blockNetworkKey: 'blockProd',
      confs: group.PROD || [],
    },
  };
  const handleQuickCreate = (v:string, isBlock: boolean) => {
    if (isBlock) {
      return;
    }
    updater.curEnv(v);
    updater.isUpdate(false);
  };
  const appBlocked = blockStatus !== 'unblocked';
  const message = React.useMemo(() => {
    const status = appBlockStatusMap[blockStatus];
    if (appBlocked) {
      return `[${status}] ${i18n.t('application:cannot deploy tips')}`;
    }
    if (unBlockStart && unBlockEnd) {
      const msg = `${i18n.t('application:unblocking time period')}：${moment(unBlockStart).format('YYYY-MM-DD HH:mm')} ~ ${moment(unBlockEnd).format('YYYY-MM-DD HH:mm')}`;
      return `[${status}] ${msg}`;
    }
    return null;
  }, [blockStatus, appBlocked, unBlockStart, unBlockEnd]);
  return (
    <div className="app-deploy-wrap">
      <Spin spinning={loading}>
        <div className="app-deploy">
          {
            map(deployConf, (item, key) => {
              const envBlocked = get(blockoutConfig, item.blockNetworkKey, false);
              const isBlocked = envBlocked && appBlocked;
              return (
                <div className="app-deploy-stage" key={key}>
                  <EnvCard type={item.type} />
                  {
                    item.confs.map((conf, index) => (
                      <RuntimeBox
                        {...conf}
                        key={String(index)}
                        env={item.type}
                        canDeploy={!isBlocked}
                        onRestart={redeployRuntime}
                        onDelete={deleteRuntime}
                        onUpdate={() => {
                          update({
                            curEnv: item.type,
                            isUpdate: true,
                            curBranch: conf.name,
                          });
                        }}
                      />
                    ))
                  }
                  <NewDeploy canCreate={isBlocked} type={item.type} setCurEnv={(v) => { handleQuickCreate(v, isBlocked); }} />
                  {
                    envBlocked && !!message ? <Alert className='mb16' showIcon type={appBlocked ? 'error' : 'normal'} message={message} /> : null
                  }
                </div>
              );
            })
          }
        </div>
      </Spin>
      <NewDeployForm
        curEnv={curEnv}
        curBranch={curBranch}
        setCurEnv={(v) => {
          update({
            curEnv: v,
            isUpdate: false,
            curBranch: '',
          });
        }}
        isUpdate={isUpdate}
      />
    </div>
  );
};

export const DeployWrap = Deploy;
