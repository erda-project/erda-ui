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
import { Col, Row, Tooltip } from 'antd';
import Ellipsis from 'common/components/ellipsis';
import ErdaIcon from 'common/components/erda-icon';
import './index.scss';

const IndicatorCard: React.FC<CP_KV.Props> = (props) => {
  const { props: configProps, data } = props;
  const { gutter = 8, span } = configProps || {};
  const itemSpan = span ?? new Array(data.list.length).fill(Math.ceil(24 / data.list.length));
  return (
    <Row className={`${configProps.wrapperClass ?? ''} ${configProps.mode ?? 'light'} cp-kv w-full`} gutter={gutter}>
      {data.list.map((item, index) => {
        return (
          <Col key={item.key} span={itemSpan[index]}>
            <div className="items p-3">
              <div className="text-center">
                <span className="text-xl items-value">{item.value}</span>
                {item.subKey ? <span className="text-xs	items-unit ml-0.5">{item.subKey}</span> : null}
              </div>
              <div className="flex justify-center items-center items-title">
                <Ellipsis className="text-xs text-center" title={item.key} />
                {item.tip ? (
                  <Tooltip title={item.tip}>
                    <ErdaIcon type="help" color="currentColor" className="ml-0.5 cursor-pointer" />
                  </Tooltip>
                ) : null}
              </div>
            </div>
          </Col>
        );
      })}
    </Row>
  );
};

export default IndicatorCard;
