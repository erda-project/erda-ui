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
import { first, last } from 'lodash';
import { LogRoller as PureLogRoller } from '../components/log/log-roller';
import { DownloadLogModal } from '../components/log/download-log-modal';
import commonStore from '../stores/common';


const getCurTimeNs = () => new Date().getTime() * 1000000;

interface IProps {
  logKey: string;
  content: Array<{ timestamp: DOMHighResTimeStamp }>;
  style?: object;
  pause?: boolean;
  hasLogs?: boolean;
  fetchPeriod?: number;
  query?: {
    [prop: string]: string | number;
  };
  fetchLog: (query: object) => Promise<any>;
  clearLog: (logKey?: string) => void;
}

interface IState {
  backwardLoading: boolean;
  rolling: boolean;
  downloadLogModalVisible: boolean;
}

enum Direction {
  forward = 'forward',
  backward = 'backward',
}
interface IRequery {
  start?: DOMHighResTimeStamp;
  end?: DOMHighResTimeStamp;
  count?: number;
}
export class LogRoller extends React.Component<IProps, IState> {
  private logRoller: PureLogRoller | null;

  private rollingTimeout: number | undefined;

  constructor(props: IProps) {
    super(props);
    this.state = {
      backwardLoading: false,
      rolling: true,
      downloadLogModalVisible: false,
    };
  }

  componentDidMount() {
    const { fetchLog, fetchPeriod } = this.props;
    fetchLog(this.getQuery(Direction.backward)).then(() => {
      if (this.logRoller) {
        this.scrollToBottom();
        this.rollingTimeout = setTimeout(() => this.fetchLog(Direction.forward), fetchPeriod);
      }
    });
  }

  getSnapshotBeforeUpdate(prevProps: any) {
    if (prevProps.pause !== this.props.pause) {
      return this.props.pause;
    }
    return null;
  }

  componentDidUpdate(_prevProps: any, _prevState: any, snapshot: any) {
    if (snapshot !== null) {
      this[this.props.pause ? 'cancelRolling' : 'startRolling']();
    }
  }

  componentWillUnmount() {
    const { logKey } = this.props;
    this.props.clearLog(logKey);
    this.cancelRolling();
  }

  fetchLog = (direction: Direction) => {
    const { fetchLog, fetchPeriod, query = {} } = this.props;
    if (Direction.forward === direction) { // 下翻
      // 传入query.end，不往下继续查询(结束的container log)
      if (query.end) return this.cancelRolling();
      fetchLog(this.getQuery(direction)).then(() => {
        if (this.logRoller) {
          this.scrollToBottom();
          if (this.rollingTimeout !== undefined) {
            this.rollingTimeout = setTimeout(() => this.fetchLog(Direction.forward), fetchPeriod);
          }
        }
      });
    } else if (Direction.backward === direction) { // 上翻
      if (this.state.backwardLoading) return;
      this.setState({ backwardLoading: true });
      const beforeHeight = this.logRoller && this.logRoller.preElm.scrollHeight; // 请求前的scrollheight
      fetchLog(this.getQuery(direction)).then(() => {
        if (this.logRoller) {
          this.setState({ backwardLoading: false });
          this.scrollToTop(this.logRoller.preElm.scrollHeight - beforeHeight);
        }
      });
    }
  };

  toggleDownloadModal = () => {
    this.setState({ downloadLogModalVisible: !this.state.downloadLogModalVisible });
  };

  getQuery = (direction: string) => {
    const { query = {}, content, logKey } = this.props;
    const { size = 200, requestId, end, ...rest } = query;

    if (requestId) {
      return { requestId }; // 查询requestId 则忽略其他查询条件
    }
    const reQuery: IRequery = {};
    if (Direction.forward === direction) {
      const lastItem = last(content);
      reQuery.start = lastItem ? lastItem.timestamp : 0;
      reQuery.end = getCurTimeNs();
      reQuery.count = Number(size);
    } else if (Direction.backward === direction) {
      reQuery.start = 0;
      const firstItem = first(content);
      reQuery.end = firstItem ? firstItem.timestamp : (Number(end) || getCurTimeNs());
      reQuery.count = -1 * Number(size);
    }
    return { ...reQuery, ...rest, logKey };
  };

  scrollTo = (to: number) => {
    if (this.logRoller && this.logRoller.preElm) {
      this.logRoller.preElm.scrollTop = to;
    }
  };

  scrollToTop = (top = 0) => this.scrollTo(top);

  scrollToBottom = () => this.scrollTo(999999999); // safari下设置过大的数值无效，所以给一个理论上足够大的值

  forwardLog = () => {
    this.fetchLog(Direction.forward);
  };

  backwardLog = () => {
    this.fetchLog(Direction.backward);
  };

  startRolling = () => {
    this.scrollToBottom();
    this.setState({ rolling: true });
    this.rollingTimeout = -1;
    this.forwardLog();
  };

  cancelRolling = () => {
    this.setState({ rolling: false });
    if (this.rollingTimeout) {
      clearTimeout(this.rollingTimeout);
      this.rollingTimeout = undefined;
    }
  };

  goToTop = () => {
    this.scrollToTop();
    this.cancelRolling();
    this.backwardLog();
  };

  render() {
    const {
      content,
      query,
      style = {},
      hasLogs = true,
      ...otherProps
    } = this.props;
    const { rolling, backwardLoading, downloadLogModalVisible } = this.state;
    const lastItem = last(content);

    return (
      <div className="log-viewer" style={style}>
        <PureLogRoller
          ref={(ref) => { this.logRoller = ref; }}
          content={content}
          onStartRolling={this.startRolling}
          onCancelRolling={this.cancelRolling}
          onGoToTop={this.goToTop}
          onGoToBottom={this.scrollToBottom}
          rolling={rolling}
          backwardLoading={backwardLoading}
          onShowDownloadModal={this.toggleDownloadModal}
          hasLogs={hasLogs && !!lastItem}
          {...otherProps}
        />
        <DownloadLogModal
          visible={downloadLogModalVisible}
          start={lastItem ? lastItem.timestamp : 0}
          query={query}
          onCancel={this.toggleDownloadModal}
        />
      </div>);
  }
}

export default (props: { logKey: string; [k: string]: any }) => {
  const logsMap = commonStore.useStore((s) => s.logsMap);
  const { fetchLog } = commonStore.effects;
  const { clearLog } = commonStore.reducers;
  const { content, fetchPeriod, ...rest } = logsMap[props.logKey] || {};
  return (
    <LogRoller
      {...props}
      {...rest}
      content={content || []}
      fetchPeriod={fetchPeriod || 3000}
      fetchLog={fetchLog}
      clearLog={clearLog}
    />
  );
};
