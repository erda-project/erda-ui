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

import { get } from 'lodash';
import React from 'react';
import { Switch, Tooltip, Drawer } from 'antd';
import { LogRoller, SimpleLog, ErdaIcon } from 'common';
import { regLog } from 'common/components/pure-log-roller/log-util';
import { transformLog } from 'common/utils';
import i18n from 'i18n';
import LogFilter from 'runtime/common/logs/components/log-filter';

import './container-log.scss';

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
        <a onClick={() => pushSlideComp && pushSlideComp(requestId)}>
          <Tooltip title={rest.length ? `[${requestId},${rest}]` : `[${requestId}]`}>{serviceName}</Tooltip>
        </a>
        {`] ${logInfo[1]}`}
      </React.Fragment>
    );
  } else {
    return content;
  }
};

const getLogItem =
  (pushSlideComp, onTimeClick) =>
  ({ log }) => {
    const { content, pattern } = log;
    let time = '';
    let level = '';
    if (regLog.LOGSTART.test(content)) {
      const [parrent, _time, _level, _params] = regLog.LOGSTART.exec(content);
      time = _time;
      level = _level;
    }

    let reContent = parseLinkInContent(content, pushSlideComp);
    const isValidElement = React.isValidElement(reContent);
    if (!isValidElement) {
      reContent = transformLog(reContent);
    }
    return (
      <div className="container-log-item">
        {time && (
          <span
            onClick={() => {
              pattern && onTimeClick && onTimeClick(log);
            }}
            className={`log-item-logtime ${onTimeClick && pattern ? 'underline cursor-pointer' : ''}`}
          >
            {time}
          </span>
        )}
        {level && <span className={`log-item-level ${level.toLowerCase()}`}>{level}</span>}
        {isValidElement ? (
          <pre className="log-item-content">{reContent}</pre>
        ) : (
          <pre className="log-item-content" dangerouslySetInnerHTML={{ __html: reContent }} />
        )}
      </div>
    );
  };

const SecondLevelLogDrawer = ({ onClose, visible, query, logKey, style, extraButton }) => {
  return (
    <Drawer title={i18n.t('runtime:container log')} visible={visible} destroyOnClose width="80%" onClose={onClose}>
      <LogRoller
        query={{ ...query, size: 500 }}
        logKey={logKey}
        style={style}
        extraButton={extraButton}
        CustomLogItem={getLogItem()}
        key={logKey}
        searchOnce
        searchContext
      />
    </Drawer>
  );
};

// 容器日志规则：上下文
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
      query: undefined,
      visible: false,
      start: undefined,
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
          <ErdaIcon
            type="left-one"
            className="hover-active align-middle"
            size="16"
            onClick={() => this.props.popSlideComp()}
          />
          &nbsp;
          {i18n.t('runtime:monitor log')}
        </span>
      ),
    });
  };

  getLogId = () => {
    const {
      instance: { id, containerId },
    } = this.props;
    const { logNameMap } = this.state;
    const reId = id || containerId;
    const logName = logNameMap[reId] || defaultLogName;
    return `${logName}-${reId}`;
  };

  handleChange = (data) => {
    const { clearLog } = this.props;
    clearLog(this.getLogId());
    this.setState({
      query: data,
    });
  };

  handleTimeClick = (data) => {
    this.setState({
      visible: true,
      start: data.timestamp,
    });
  };

  handleClose = () => {
    this.setState({
      visible: false,
    });
  };

  render() {
    const { style, logsMap, dockerLogMap, instance, params, isStopped, sourceType, extraQuery, fetchApi, hasLogs } =
      this.props;
    const { activeId, logNameMap, query, visible, start } = this.state;

    const { id, containerId, updatedAt } = instance;

    let end;
    const reId = id || containerId;
    const source = sourceType || 'container';
    if (isStopped) {
      updatedAt && (end = new Date(updatedAt).getTime() * 1000000);
    }

    const logName = logNameMap[reId] || defaultLogName;
    const extraButton = (
      <>
        <Switch
          checkedChildren={i18n.t('Error')}
          unCheckedChildren={i18n.t('Standard')}
          checked={logName === 'stderr'}
          onChange={() => this.toggleLogName(reId)}
        />
        <LogFilter onChange={this.handleChange} />
      </>
    );
    const baseQuery = { id: reId, source, stream: logName, end, fetchApi, ...extraQuery };
    const logRoller = (
      <>
        <LogRoller
          query={{ ...baseQuery }}
          filter={query}
          logKey={`${logName}-${reId}`}
          pause={activeId !== `${reId}`}
          style={style}
          extraButton={extraButton}
          CustomLogItem={getLogItem(this.pushSlideComp, this.handleTimeClick)}
          key={`${logName}-${reId}-${JSON.stringify(query)}`}
          hasLogs={hasLogs}
        />
        <SecondLevelLogDrawer
          onClose={this.handleClose}
          visible={visible}
          query={{ ...baseQuery, start }}
          logKey={`secondLevel-${logName}-${reId}`}
          style={style}
        />
      </>
    );
    return logRoller;
  }
}

export default RuntimeContainerLog;
