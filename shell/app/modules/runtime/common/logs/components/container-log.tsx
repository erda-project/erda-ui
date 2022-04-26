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
import { SimpleLog, ErdaIcon } from 'common';
import { LogRoller, IProps as LogProps } from 'common/components/log-roller';
import { regLog } from 'common/components/pure-log-roller/log-util';
import { transformLog } from 'common/utils';
import i18n from 'i18n';
import { useUpdate } from 'common/use-hooks';

import { useUpdateEffect } from 'react-use';
import commonStore from 'common/stores/common';
import LogFilter from 'runtime/common/logs/components/log-filter';

import './container-log.scss';

const defaultLogName = 'stdout';

const parseLinkInContent = (content: string, pushSlideComp?: (q: string) => void) => {
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
  (pushSlideComp?: (_id: string) => void, onTimeClick?: (q: Obj) => void) =>
  ({ log }: { log: { content: string; pattern: string } }) => {
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
      reContent = transformLog(reContent as string);
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

const SecondLevelLogDrawer = ({
  onClose,
  visible,
  query,
  logKey,
  style,
  extraButton,
}: {
  onClose: () => void;
  visible: boolean;
  query: Obj;
  logKey: string;
  style: Obj;
  extraButton?: React.ReactNode;
}) => {
  return (
    <Drawer title={i18n.t('runtime:Container log')} visible={visible} destroyOnClose width="80%" onClose={onClose}>
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

interface Props {
  instance: RUNTIME_SERVICE.Instance;
  clearLog: (id: string) => void;
  extraQuery: Obj;
  pushSlideComp: (d: Obj) => void;
  popSlideComp: () => void;
  style: Obj;
  isStopped: boolean;
  sourceType?: string;
  fetchApi?: string;
  backupApi?: string;
  hasLogs?: boolean;
}

interface IState {
  logNameMap: Obj<string>;
  query: undefined | Obj;
  visible: boolean;
  start: undefined | string;
}

const RuntimeContainerLog = (props: Props) => {
  const {
    instance,
    clearLog,
    extraQuery,
    pushSlideComp: propsPushSlideComp,
    popSlideComp,
    style,
    isStopped,
    sourceType,
    fetchApi,
    backupApi,
    hasLogs,
  } = props;
  const [{ logNameMap, query, visible, start }, updater, update] = useUpdate<IState>({
    logNameMap: { [instance.id || '']: instance.logLevel || defaultLogName },
    query: undefined,
    visible: false,
    start: undefined,
  });

  const [logFallback] = commonStore.useStore((s) => [s.logFallback]);

  const toggleLogName = (_id: string) => {
    update({
      logNameMap: { ...logNameMap, [_id]: logNameMap[_id] === 'stderr' ? 'stdout' : 'stderr' },
    });
    clearLog(getLogId());
  };

  const pushSlideComp = (requestId: string) => {
    const p = { requestId, applicationId: get(extraQuery, 'applicationId') };
    propsPushSlideComp({
      getComp: () => <SimpleLog {...p} />,
      getTitle: () => (
        <span>
          <ErdaIcon type="left-one" className="hover-active align-middle" size="16" onClick={() => popSlideComp()} />
          &nbsp;
          {i18n.t('runtime:monitor log')}
        </span>
      ),
    });
  };

  const getLogId = () => {
    const { id, containerId } = instance;
    const reId = id || containerId;
    const logName = logNameMap[reId] || defaultLogName;
    return `${logName}-${reId}`;
  };

  const handleChange = (q: Obj) => {
    clearLog(getLogId());
    update({
      query: q,
    });
  };

  const handleTimeClick = (q: Obj) => {
    update({
      visible: true,
      start: q.timestamp,
    });
  };

  const handleClose = () => {
    updater.visible(false);
  };

  const { id, containerId, updatedAt } = instance;

  let end;
  const reId = id || containerId;
  const source = sourceType || 'container';
  if (isStopped) {
    updatedAt && (end = new Date(updatedAt).getTime() * 1000000);
  }

  const logName = logNameMap[reId] || defaultLogName;
  const extraButton = logFallback ? null : (
    <>
      <Switch
        checkedChildren={i18n.t('Error')}
        unCheckedChildren={i18n.t('Standard')}
        checked={logName === 'stderr'}
        onChange={() => toggleLogName(reId)}
      />
      <LogFilter onChange={handleChange} />
    </>
  );
  const baseQuery = { id: reId, source, stream: logName, end, fetchApi, backupApi, ...extraQuery };
  const logRoller = (
    <>
      <WrappedLogRoller
        query={{ ...baseQuery }}
        filter={query}
        logKey={`${logName}-${reId}`}
        pause={false}
        style={style}
        isStopped={isStopped}
        instance={instance}
        extraButton={extraButton}
        CustomLogItem={getLogItem(pushSlideComp, handleTimeClick)}
        key={`${logName}-${reId}-${JSON.stringify(query)}`}
        hasLogs={hasLogs}
      />
      <SecondLevelLogDrawer
        onClose={handleClose}
        visible={visible}
        query={{ ...baseQuery, start }}
        logKey={`secondLevel-${logName}-${reId}`}
        style={style}
      />
    </>
  );
  return logRoller;
};

const WrappedLogRoller = (props: Merge<LogProps, { isStopped: boolean; instance: Obj }>) => {
  const { isStopped, instance, ...propsRest } = props;
  const [logsMap, logFallback] = commonStore.useStore((s) => [s.logsMap, s.logFallback]);
  const { fetchLog } = commonStore.effects;
  const { clearLog } = commonStore.reducers;
  const { content, fetchPeriod, ...rest } = logsMap[props.logKey] || {};
  const [query, setQuery] = React.useState<Obj<string | number | boolean>>(props.query || {});

  useUpdateEffect(() => {
    if (logFallback) {
      const { podName, podNamespace, containerName, containerId, clusterName } = instance;
      setQuery((prev) => ({
        ...prev,
        fetchApi: '/api/runtime/realtime/logs',
        live: true,
        podName,
        podNamespace,
        containerName,
        clusterName,
        containerId,
      }));
    }
  }, [logFallback]);

  const reFetchLog = (q: Obj) => {
    // only container running log can use fallback api
    const res = fetchLog(q, { isRunsContainerLog: !isStopped && props?.query?.source === 'container' });
    return res;
  };
  return (
    <LogRoller
      {...propsRest}
      {...rest}
      disableDownload={logFallback}
      query={query}
      content={content || []}
      fetchPeriod={fetchPeriod || 3000}
      fetchLog={reFetchLog}
      clearLog={clearLog}
    />
  );
};

export default RuntimeContainerLog;
