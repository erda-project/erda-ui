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

import { each, includes, flattenDeep, map } from 'lodash';
import * as React from 'react';
import moment from 'moment';
import { Modal, Table, Spin, Tooltip } from 'app/nusi';
import TraceDetailFilter from './trace-detail-filter';
import './trace-detail.scss';

interface ISpanDetailProps {
  [pro: string]: any;
  spanDetail?: any;
  viewSpanDetail?: (args?: any) => any;
}
const SpanDetail = (props: ISpanDetailProps) => {
  let uid = 1;
  const { spanDetail, viewSpanDetail } = props;
  const { spanName, durationStr, serviceName, annotations, binaryAnnotations } = spanDetail.span;
  const columns1 = [
    {
      title: 'Date Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render(timestamp: number) {
        return moment(timestamp / 1000).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    {
      title: 'Relative Time',
      dataIndex: 'relativeTime',
      key: 'relativeTime',
    },
    {
      title: 'Annotation',
      dataIndex: 'value',
      key: 'value',
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
    },
  ];
  const columns2 = [
    {
      title: 'Key',
      dataIndex: 'key',
      key: 'key',
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
    },
  ];
  return (
    <Modal
      visible={spanDetail.visible}
      onCancel={() => viewSpanDetail && viewSpanDetail({ span: spanDetail, visible: false })}
      className="span-detail-modal"
      width={920}
      title={[
        spanName && spanName.length > 95 ? (
          <Tooltip key="spanName" title={spanName} overlayClassName="full-span-name">
            <h3 className="title">{spanName}</h3>
          </Tooltip>
        ) : (
          <h3 key="spanName">{spanName}</h3>
        ),
        <h4 key="aka" className="sub-title">
          AKA: {serviceName} {durationStr}
        </h4>,
      ]}
      footer=""
    >
      <Table
        className="no-operation"
        rowKey={() => {
          uid += 1;
          return `${uid}`;
        }}
        columns={columns1}
        dataSource={annotations}
        pagination={false}
      />
      <Table
        className="no-operation second-table"
        rowKey="key"
        columns={columns2}
        dataSource={binaryAnnotations}
        pagination={false}
      />
    </Modal>
  );
};

interface IProps {
  [pro: string]: any;
  trace: any;
  isFetching: boolean;
}
interface IState {
  traceTree: any[];
}

class TraceDetail extends React.Component<IProps, IState> {
  state = {
    traceTree: [],
  };

  findChildren = (_ispanId: any, children: any, spans: any) => {
    const tree: any[] = [];
    this.findChildren.bind(this);
    each(spans, (i) => {
      if (includes(children, i.spanId)) {
        tree.push(i.spanId);
        if (i.children) {
          tree.push(this.findChildren(i.spanId, i.children, spans));
        }
      }
    });
    return tree;
  };

  expandSpan = ({ spanId, children, isExpand }: any) => {
    const {
      trace: { spans: oriSpans },
    } = this.props;
    const { traceTree } = this.state;
    const spans = traceTree.length ? traceTree : oriSpans;

    const spanArray = flattenDeep(this.findChildren(spanId, children, spans));
    const rootId = spans[0].spanId;
    const converted = map(spans, (i) => {
      const t = i;
      if (i.spanId === spanId) {
        t.isExpand = !isExpand;
      }
      if (includes(spanArray, i.spanId) && i.spanId !== rootId) {
        t.isShow = !isExpand;
        t.isExpand = !isExpand;
      }
      t.state = 'tre';
      return t;
    });
    this.setState({
      traceTree: converted,
    });
  };

  render() {
    const { isFetching, trace } = this.props;
    return (
      <div className="trace-detail-container">
        <TraceDetailFilter {...this.props} expandSpan={this.expandSpan} />
        <div className="trace-items-cont">
          <div id="timeLabel" className="span">
            <div className="handle">Services</div>
            <div className="duration-container">
              {map(trace.timeMarkers, (i) => {
                return (
                  <div key={i.time} className={`time-marker time-marker-${i.index}`}>
                    {i.time}
                  </div>
                );
              })}
            </div>
          </div>
          <Spin spinning={isFetching}>
            {map(this.state.traceTree.length ? this.state.traceTree : trace.spans, (span) => {
              const {
                spanId,
                depthClass,
                parentId,
                spanName,
                serviceNames,
                duration,
                durationStr,
                children,
                errorType,
                binaryAnnotations,
                annotations,
                depth,
                isExpand,
                isShow,
              } = span;
              return (
                <div
                  key={`span${spanId}`}
                  id={spanId}
                  className={`span service-span depth-${depthClass} ${isShow ? '' : 'hidden'}`}
                  data-keys="id,spanName,serviceNames,serviceName,durationStr,duration"
                  data-id={spanId}
                  data-parent-id={parentId}
                  data-span-name={spanName}
                  data-service-name={span.serviceName}
                  data-service-names={serviceNames}
                  data-duration-str={durationStr}
                  data-duration={duration}
                  data-children={children}
                  data-error-type={errorType}
                >
                  <div className="handle" onClick={() => this.expandSpan({ spanId, children, isExpand })}>
                    <div className="service-name" style={{ marginLeft: `${depth}px` }}>
                      {children ? <span className="expander">{isExpand ? '-' : '+'}</span> : ''}
                      <Tooltip title={span.serviceName}>
                        <span className="service-name-text">{span.serviceName}</span>
                      </Tooltip>
                    </div>
                  </div>

                  <div
                    className="duration-container"
                    onClick={() => this.props.viewSpanDetail({ span, visible: true })}
                  >
                    {map(trace.timeMarkers, (i, index) => {
                      return (
                        <div key={index} className={`time-marker time-marker-${index}`}>
                          .
                        </div>
                      );
                    })}
                    <div className="duration" style={{ left: `${span.left}%`, width: `${span.width}%` }}>
                      {map(annotations, (annotation, index) => {
                        const { isCore, left, value, endpoint, timestamp, relativeTime, serviceName } = annotation;
                        return (
                          <div
                            key={`annotation${index}`}
                            className={`annotation${isCore ? 'core' : ''}`}
                            style={{ left: `${left}%` }}
                            title={value}
                            data-keys="endpoint,value,timestamp,relativeTime,serviceName"
                            data-endpoint={endpoint}
                            data-value={value}
                            data-timestamp={timestamp}
                            data-relative-time={relativeTime}
                            data-service-name={serviceName}
                          />
                        );
                      })}
                    </div>
                    <Tooltip title={spanName} overlayClassName="span-tooltip" arrowPointAtCenter>
                      <span className="span-name" style={{ left: `${span.left}%`, width: `${100 - span.left}%` }}>
                        {durationStr} : {spanName}
                      </span>
                    </Tooltip>
                  </div>
                  {map(binaryAnnotations, (binaryAnnotation) => {
                    const { key, value, annotationType } = binaryAnnotation;
                    return (
                      <div
                        key={`binaryAnnotation${key}`}
                        className="binary-annotation"
                        data-keys="key,value,type"
                        data-key={key}
                        data-value={value}
                        data-type={annotationType}
                      />
                    );
                  })}
                </div>
              );
            })}
          </Spin>
        </div>
        <SpanDetail {...this.props} />
      </div>
    );
  }
}

export default TraceDetail;
