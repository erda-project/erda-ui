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
import { Alert, Menu, Button, Tooltip, Drawer } from 'antd';
import { SimpleLog, ErdaIcon, DropdownSelect } from 'common';
import { LogRoller, IProps as LogProps } from 'common/components/log-roller';
import { regLog } from 'common/components/pure-log-roller/log-util';
import { transformLog } from 'common/utils';
import i18n from 'i18n';
import { useUpdate } from 'common/use-hooks';
import commonStore from 'common/stores/common';
import LogFilter from 'runtime/common/logs/components/log-filter';
import { uuid } from 'common/utils';
import './container-log.scss';

const defaultLogName = 'all';

const parseLinkInContent = (content: string, pushSlideComp?: (q: string) => void) => {
  if (regLog.LOGSTART.test(content)) {
    const [parrent, time, level, params, thread] = regLog.LOGSTART.exec(content);

    const [serviceName, requestId, ...rest] = (params || '').split(',');
    if (!requestId) return `[${serviceName}] - [${thread}] ${content.split(parrent).join('')}`;
    const logInfo = content.split(parrent);
    return (
      <React.Fragment>
        {'['}
        <a onClick={() => pushSlideComp && pushSlideComp(requestId)}>
          <Tooltip title={rest.length ? `[trace_id: ${requestId}, span_id: ${rest}]` : `[${requestId}]`}>
            {serviceName}
          </Tooltip>
        </a>
        {`] - [${thread}] ${logInfo[1]}`}
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
  logUid: string;
}

const logTypes = [
  { key: 'all', name: i18n.t('common:All') },
  { key: 'stdout', name: i18n.t('Standard') },
  { key: 'stderr', name: i18n.t('Error') },
];

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
  const [{ logNameMap, query, visible, start, logUid }, updater, update] = useUpdate<IState>({
    logNameMap: { [instance.id || '']: instance.logLevel || defaultLogName },
    query: undefined,
    visible: false,
    start: undefined,
    logUid: uuid(),
  });

  const changeLogName = (_id: string, val: string) => {
    update({
      logNameMap: { ...logNameMap, [_id]: val },
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
    return `${logName}-${reId}-${logUid}`;
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
  const logKey = getLogId();
  const extraButton = (
    <>
      <DropdownSelect
        overlay={
          <Menu
            className="bg-log-bg"
            onClick={(e) => {
              changeLogName(reId, e.key);
            }}
          >
            {logTypes.map((item) => {
              const active = logName === item.key;
              return (
                <Menu.Item
                  key={item.key}
                  className={`w-[85px] hover:bg-light-pop-bg hover:text-white ${
                    active ? 'text-white' : 'text-white-6'
                  }`}
                >
                  <span className="flex-h-center justify-between">
                    {item.name}
                    {active ? <ErdaIcon type="check" /> : null}
                  </span>
                </Menu.Item>
              );
            })}
          </Menu>
        }
      >
        <Button className="px-4 inline-flex items-center justify-between">
          <span>{logTypes.find((item) => item.key === logName)?.name || logName}</span>
          <ErdaIcon type="caret-down" />
        </Button>
      </DropdownSelect>
      <LogFilter onChange={handleChange} />
    </>
  );
  const baseQuery = { id: reId, source, stream: logName, end, fetchApi, backupApi, ...extraQuery };
  const logRoller = (
    <>
      <WrappedLogRoller
        query={{ ...baseQuery }}
        isStopped={isStopped}
        filter={query}
        logKey={logKey}
        pause={false}
        style={style}
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
        logKey={`secondLevel-${getLogId()}`}
        style={style}
      />
    </>
  );
  return logRoller;
};

const WrappedLogRoller = (props: Merge<LogProps, { instance: Obj; isStopped: boolean }>) => {
  const { instance, isStopped, ...propsRest } = props;
  const [logsMap, logFallbackMap] = commonStore.useStore((s) => [s.logsMap, s.logFallbackMap]);
  const { fetchLog } = commonStore.effects;
  const { clearLog } = commonStore.reducers;
  const { content, fetchPeriod, ...rest } = logsMap[props.logKey] || {};
  const [isFirstQuery, setIsFirstQuery] = React.useState(true);

  const reFetchLog = (q: Obj) => {
    const res = fetchLog(q).then((r) => {
      setIsFirstQuery(false);
      return r;
    });
    return res;
  };
  const logFallback = logFallbackMap[props.logKey];

  return (
    <>
      {logFallback ? (
        <Alert
          type="info"
          message={
            <div className="overflow-auto whitespace-nowrap">
              {i18n.t(
                'dop:The current log has entered degraded mode (only all types will enter the degraded mode), log loading may be slow, please be patient',
              )}
            </div>
          }
          className="mb-2 bg-blue-1 border-blue"
        />
      ) : null}
      <LogRoller
        {...propsRest}
        {...rest}
        downloadFallback={logFallback}
        query={{
          isFirstQuery,
          live: !isStopped,
          ...instance,
          ...props?.query,
          stream: props?.query?.stream === 'all' ? '' : props?.query?.stream,
        }}
        content={content || []}
        style={logFallback ? { top: 50, height: 'calc(100% - 50px)' } : {}}
        fetchPeriod={fetchPeriod || 3000}
        fetchLog={reFetchLog}
        clearLog={clearLog}
      />
    </>
  );
};

export default RuntimeContainerLog;
