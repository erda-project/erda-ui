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
import { Popover } from 'antd';
import { LogRoller, Icon as CustomIcon, ErdaIcon } from 'common';
import classnames from 'classnames';
import { map } from 'lodash';
import { stepList } from 'project/common/config';
import ContainerLog from '../containers/container-log';
import MigrationLog from './migration-log';
import i18n from 'i18n';
import runtimeLogStore from 'runtime/stores/log';
import runtimeServiceStore from 'runtime/stores/service';
import commonStore from 'common/stores/common';
import { useMount } from 'react-use';

import './deploy-log.scss';

const linkMark = '##to_link:';

interface IProps {
  detailLogId: string;
  applicationId: number | string;
  query?: Obj;
  hasLogs?: boolean;
}

const DeployLog = ({ detailLogId, query, applicationId, hasLogs }: IProps) => {
  const deploymentStatus = runtimeLogStore.useStore((s) => s.deploymentStatus);
  const { pushSlideComp, popSlideComp } = commonStore.reducers;

  useMount(() => {
    runtimeLogStore.getDeploymentStatus(detailLogId);
  });

  const renderStep = () => {
    // 当前已完成步骤中的最后一个
    const finishedIndex = stepList.findIndex((a) => a.key === deploymentStatus.phase);
    return (
      <div className="step-wrap">
        {stepList.map(({ key, name }, i) => {
          const current = finishedIndex === i;
          const stepClassName = classnames({
            'one-step': true,
            finished: i <= finishedIndex,
          });

          const content = <div className="runtime-deploy-log-error">{deploymentStatus.failCause}</div>;

          return (
            <div key={key} className={stepClassName}>
              <CustomIcon type={current ? 'circle-fill' : 'circle'} />
              {current && deploymentStatus.failCause ? (
                <Popover title={i18n.t('runtime:error details')} content={content} defaultVisible placement="bottom">
                  <span className="step-title">
                    {name}
                    <ErdaIcon type="tishi" color="currentColor" className="align-middle fail-info" />
                  </span>
                </Popover>
              ) : (
                <span className="step-title">{name}</span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const transformContentToLink = (content: string) => {
    if (content.includes(linkMark)) {
      const logInfo = content.split(linkMark);
      const paramsInfo = logInfo[1].split(',');
      const params: Obj = {};
      map(paramsInfo, (item) => {
        const param = item.split(':');
        params[param[0]] = param[1].trim();
      });
      const { containerId, serviceName, runtimeId, migrationId } = params;

      const checkMigrationLog = () => {
        pushSlideComp({
          getComp: () => <MigrationLog migrationId={migrationId} />,
          getTitle: () => (
            <span>
              <ErdaIcon
                type="left-one"
                color="currentColor"
                size="16"
                className="hover-active align-middle"
                onClick={() => popSlideComp()}
              />
              &nbsp;
              {i18n.t('dop:upgrade log')}
            </span>
          ),
        });
      };

      const checkContainerLog = () => {
        runtimeServiceStore.getServiceInstances(serviceName).then((tasks) => {
          const { runs = [], completedRuns = [] } = tasks || {};
          const target = [...runs, ...completedRuns].find((item) => item.id === containerId);
          if (target) {
            pushSlideComp({
              getComp: () => <ContainerLog instance={target} />,
              getTitle: () => (
                <span>
                  <ErdaIcon
                    type="left-one"
                    color="currentColor"
                    size="16"
                    className="hover-active align-middle"
                    onClick={() => popSlideComp()}
                  />
                  &nbsp;
                  {i18n.t('runtime:container log')}
                </span>
              ),
            });
          }
        });
      };

      if (migrationId) {
        return {
          content: logInfo[0],
          suffix: <a onClick={() => checkMigrationLog()}>{i18n.t('dop:view upgrade log')}</a>,
        };
      }

      if (serviceName && containerId && runtimeId) {
        return {
          content: logInfo[0],
          suffix: <a onClick={() => checkContainerLog()}>{i18n.t('runtime:view container log')}</a>,
        };
      }
    }

    return { content };
  };

  return (
    <div className="runtime-log">
      <div className="runtime-deploy-log">
        {renderStep()}
        <LogRoller
          query={{ id: detailLogId, source: 'deploy', applicationId, ...query }}
          logKey={detailLogId}
          transformContent={transformContentToLink}
          hasLogs={hasLogs}
        />
      </div>
    </div>
  );
};

export default DeployLog;
