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
import i18n from 'i18n';
import { Tag } from 'antd';
import { isEmpty } from 'lodash';
import ErdaIcon from 'common/components/erda-icon';
import routeInfoStore from 'core/stores/route';
import monitorCommonStore from 'common/stores/monitorCommon';
import Ellipsis from 'common/components/ellipsis';
import AnalyzerChart from 'msp/components/analyzer-chart';

interface IProps {
  className: string;
  data: TOPOLOGY.TopoNode['metaData'];
  onCancel?: () => void;
  showRuntime?: boolean;
}

const metric = [
  {
    name: i18n.t('msp:average throughput'),
    key: 'rps',
    util: 'reqs/s',
  },
  {
    name: i18n.t('msp:average response time'),
    key: 'rt',
    unit: 'ms',
  },
  {
    name: i18n.t('msp:error call times'),
    key: 'http_error',
  },
  {
    name: i18n.t('msp:error rate'),
    key: 'error_rate',
    unit: '%',
  },
];

const chartConfig = [
  {
    title: i18n.t('msp:throughput'),
    key: 'rps_chart',
  },
  {
    title: `${i18n.t('msp:average response time')}(ms)`,
    key: 'avg_duration_chart',
  },
  {
    title: i18n.t('msp:error rate'),
    key: 'error_rate_chart',
  },
  {
    title: i18n.t('msp:HTTP status'),
    key: 'http_code_chart',
  },
];

const TopologyDetail: React.FC<IProps> = ({ className, data, onCancel, showRuntime }) => {
  const [range] = monitorCommonStore.useStore((s) => [s.globalTimeSelectSpan.range]);
  const tenantId = routeInfoStore.useStore((s) => s.params.terminusKey);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    setVisible(!isEmpty(data));
  }, [data, range]);

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      setVisible(false);
    }
  };

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const wrapper = Array.from(document.querySelectorAll('.topology-detail'));
      const commonNode = Array.from(document.querySelectorAll('.topology-common-node'));
      const expandHandleNode = Array.from(document.querySelectorAll('.expand-handle'));
      const node = e.target as Node;
      const inner = wrapper.some((wrap) => wrap.contains(node));
      const inNode = commonNode.some((wrap) => wrap.contains(node));
      const inExpandHandle = expandHandleNode.some((wrap) => wrap.contains(node));
      if (!(inner || inNode || inExpandHandle)) {
        handleCancel();
      }
    };
    document.body.addEventListener('click', handleClick);
    return () => {
      document.body.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div className={`topology-detail ${visible ? 'expand' : 'collapse'} ${className}`}>
      <div className="content h-full flex flex-col">
        <div className="flex px-4 justify-between h-12 items-center">
          <div className="flex-1 overflow-ellipsis overflow-hidden whitespace-nowrap text-white pr-4">
            <Ellipsis title={data.name} />
          </div>
          <div onClick={handleCancel} className="text-white-4 cursor-pointer hover:text-white">
            <ErdaIcon type="close" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scroll-bar-dark">
          <div>
            {showRuntime ? (
              <p className="mb-2 px-4">
                <span className="text-white-6 mr-2">Runtime:</span>
                <span className="text-white-9 overflow-ellipsis overflow-hidden whitespace-nowrap">
                  {data.runtimeName}
                </span>
              </p>
            ) : null}
            <p className="mb-2 px-4">
              <span className="text-white-6 mr-2">{i18n.t('type')}:</span>
              <Tag color="#27C99A" className="border-0 bg-green-1">
                {data.typeDisplay}
              </Tag>
            </p>
            <div className="metric-detail flex flex-wrap justify-start pl-3">
              {metric.map((item) => {
                return (
                  <div key={item.key} style={{ width: 140 }} className="m-1 py-3">
                    <p className="text-white text-center leading-8 m-0">
                      <span>{data.metric?.[item.key]}</span>
                      {item.unit ? <span className="text-xs text-white-6 ml-1">{item.unit}</span> : null}
                    </p>
                    <p className="text-white-6 text-center text-xs m-0">{item.name}</p>
                  </div>
                );
              })}
            </div>
          </div>
          {data.serviceId ? (
            <div className="px-4">
              {chartConfig.map((item) => {
                return (
                  <div>
                    <div className="text-white mt-4 mb-2">{item.title}</div>
                    <div style={{ height: '170px' }}>
                      <AnalyzerChart
                        scope="topology"
                        xAxisFormat="HH:mm:ss"
                        style={{ width: '100%', height: '160px', minHeight: 0 }}
                        tenantId={tenantId}
                        view={item.key}
                        serviceId={data.serviceId}
                        grid={{
                          top: '10%',
                          left: '15%',
                          bottom: '30%',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default TopologyDetail;
