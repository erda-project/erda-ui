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

import { isEmpty, get } from 'lodash';
import * as React from 'react';
import { Tooltip, Switch, Icon } from 'nusi';
import { LogRoller, SimpleLog } from 'common';
import { regLog } from 'common/components/log/log-util';
import AnsiUp from 'ansi_up';
import i18n from 'i18n';

import './container-log.scss';

const AU = new AnsiUp();
const defaultLogName = 'stdout';

const parseLinkInContent = (content, pushSlideComp) => {
  if (regLog.LOGSTART.test(content)) {
    const [parrent, time, level, params] = regLog.LOGSTART.exec(content);
    const [serviceName, requestId, ...rest] = (params || '').split(',');
    if (!requestId) return `[${serviceName}] --- ${content.split(parrent).join('')}`;
    const logInfo = content.split(parrent);
    return (
      <React.Fragment>
        {'['}
        <a onClick={() => pushSlideComp(requestId)}>
          <Tooltip title={rest.length ? `[${requestId},${rest}]` : `[${requestId}]`}>
            {serviceName}
          </Tooltip>
        </a>
        {`] ${logInfo[1]}`}
      </React.Fragment>
    );
  } else {
    return content;
  }
};

const getLogItem = pushSlideComp => ({ log }) => {
  const { content } = log;
  let time = '';
  let level = '';
  if (regLog.LOGSTART.test(content)) {
    const [parrent, _time, _level, _params] = regLog.LOGSTART.exec(content);
    time = _time;
    level = _level;
  }

  const reContent = parseLinkInContent(AU.ansi_to_html(content), pushSlideComp);
  return (
    <div className="container-log-item">
      {
        time && <span className="log-item-logtime">{time}</span>
      }
      {level && <span className={`log-item-level ${level.toLowerCase()}`}>{level}</span>}
      <pre className="log-item-content">{reContent}</pre>
    </div>
  );
};

// 容器日志规则：
/** **
 * dcos：必有taskId，containerId可能没有
 * 老edas：必无taskId，必有containerId
 * k8s：taskId,containerId都有
 *
 * 容器日志：先取taksId，若无，则取containerId
 *
 * 此处传入的props.instance 中  id=taskId,containerId=containerId

*/


class RuntimeContainerLog extends React.Component {
  constructor(props) {
    super(props);
    const { instance } = props;
    this.state = {
      logNameMap: { [instance.id]: instance.logLevel || defaultLogName },
    };
  }

  toggleLogName = (id) => {
    const { logNameMap } = this.state;
    this.setState({
      logNameMap: { ...logNameMap, [id]: logNameMap[id] === 'stderr' ? 'stdout' : 'stderr' },
    });
    const { clearLog } = this.props;
    clearLog(this.getLogId());
  };

  pushSlideComp = (requestId) => {
    const { extraQuery } = this.props;
    const p = { requestId, applicationId: get(extraQuery, 'applicationId') };
    this.props.pushSlideComp({
      getComp: () => <SimpleLog {...p} />,
      getTitle: () => (
        <span>
          <Icon className="hover-active" type="caret-left" onClick={() => this.props.popSlideComp()} />&nbsp;
          {i18n.t('runtime:monitor log')}
        </span>
      ),
    });
  };

  getLogId = () => {
    const { instance: { id, containerId } } = this.props;
    const { logNameMap } = this.state;
    const reId = id || containerId;
    const logName = logNameMap[reId] || defaultLogName;
    return `${logName}-${reId}`;
  };

  render() {
    const { style, logsMap, dockerLogMap, instance, params, isStopped, sourceType, extraQuery, fetchApi, hasLogs } = this.props;
    const { activeId, logNameMap } = this.state;

    const { id, containerId, updatedAt } = instance;

    let end;
    const reId = id || containerId;
    const source = sourceType || 'container';
    if (isStopped) {
      updatedAt && (end = new Date(updatedAt).getTime() * 1000000);
    }

    const logName = logNameMap[reId] || defaultLogName;
    const switchLog = <Switch checkedChildren={i18n.t('runtime:error')} unCheckedChildren={i18n.t('runtime:standard')} checked={logName === 'stderr'} onChange={() => this.toggleLogName(reId)} />;
    const logRoller = (
      <LogRoller
        query={{ id: reId, source, stream: logName, end, fetchApi, ...extraQuery }}
        logKey={`${logName}-${reId}`}
        pause={activeId !== `${reId}`}
        style={style}
        extraButton={switchLog}
        CustomLogItem={getLogItem(this.pushSlideComp)}
        key={`${logName}-${reId}`}
        hasLogs={hasLogs}
      />
    );

    return logRoller;
  }
}

export default RuntimeContainerLog;
