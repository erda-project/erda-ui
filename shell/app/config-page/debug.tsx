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
import DiceConfigPage from 'app/config-page';
import { ErrorBoundary, FileEditor, Icon as CustomIcon } from 'common';
import { Button, message, Popover } from 'app/nusi';
import './debug.scss';
import moment from 'moment';


export default () => {
  const pageRef = React.useRef(null);
  const [text, setText] = React.useState(defaultJson);
  const [config, setConfig] = React.useState(defaultData);
  const [logs, setLogs] = React.useState([] as any);

  const updateMock = () => {
    try {
      const obj = (new Function(`return ${text}`))();
      setConfig(obj);
    } catch (error) {
      message.error('内容有错误');
    }
  };

  const onExecOp = ({ cId, op, reload, updateInfo }: any) => {
    setLogs((prev) => prev.concat({ time: moment().format('HH:mm:ss'), type: '操作', cId, opKey: op.text || op.key, command: JSON.stringify(op.command), reload, data: JSON.stringify(updateInfo, null, 2) }));
  };

  return (
    <div className="debug-page full-height flex-box">
      <div className="left full-height">
        <FileEditor
          autoHeight
          fileExtension="json"
          value={text}
          onChange={setText}
        />
        <Button type="primary" className="update-button" onClick={() => updateMock()}>更新</Button>
        <Button type="primary" className="request-button" onClick={() => pageRef.current.reload(config)}>请求</Button>
      </div>
      <div className="right full-height">
        <ErrorBoundary>
          <DiceConfigPage
            ref={pageRef}
            showLoading
            scenarioType={config?.scenario?.scenarioType}
            scenarioKey={config?.scenario?.scenarioKey}
            inParams={config?.inParams}
            debugConfig={config}
            onExecOp={onExecOp}
            updateConfig={(v) => { setConfig(v); setText(JSON.stringify(v, null, 2)); }}
          />
        </ErrorBoundary>
        <div className="log-panel">
          <h3>操作日志<span className="ml8 fake-link" onClick={() => setLogs([])}>清空</span></h3>
          {logs.map((log, i) => {
            return (
              <div key={i} className="log-item">
                <span>{log.time} {log.reload && <CustomIcon type="refresh" />} {log.type} {log.cId}: {log.opKey}
                  {log.command && <pre className="mb0">{log.command}</pre>}
                </span>
                {log.data && (
                  <Popover
                    placement="top"
                    content={
                      <div className="code-block auto-overflow" style={{ height: '600px', maxWidth: '600px' }}>
                        <pre className="prewrap">{log.data}</pre>
                      </div>
                    }
                  >
                    <span className="fake-link">
                      查看数据
                    </span>
                  </Popover>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};


const defaultData = {
  scenario: {
    scenarioKey: 'issue-manage',
    scenarioType: 'issue-manage',
  },
  inParams: {
    fixedIssueType: 'ALL',
    issueFilter__urlQuery: 'eyJzdGF0ZUJlbG9uZ3MiOlsiT1BFTiIsIldPUktJTkciLCJXT05URklYIiwiUkVPUEVOIiwiUkVTT0xWRUQiXX0=',
    issueTable__urlQuery: 'eyJwYWdlTm8iOjF9',
    issueViewGroup__urlQuery: 'eyJ2YWx1ZSI6InRhYmxlIiwiY2hpbGRyZW5WYWx1ZSI6eyJrYW5iYW4iOiJkZWFkbGluZSJ9fQ==',
    projectId: '70',
  },
};
const defaultJson = JSON.stringify(defaultData, null, 2);
