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

import { map, get } from 'lodash';
import * as React from 'react';
import { Row, Col } from 'app/nusi';
import moment from 'moment';
import i18n from 'i18n';
import { Alarm } from '@icon-park/react';

const scriptDetail = ({ data }: {data: object}) => {
  const errorDetail = get(data, 'list') || [];
  if (!errorDetail) {
    return (
      <div className="no-data-list">
        <div className="no-data-content"><Alarm size="16px" />{i18n.t('microService:no data')}</div>
      </div>
    );
  }

  return (
    <div>
      {
        map(errorDetail, (value, index) => {
          return (
            <div className="error-detail chart-container" key={index}>
              {/* eslint-disable-next-line react/jsx-no-target-blank */}
              <div className="title">{i18n.t('microService:access path')}<a href={`http://${value.host}${value.url}`} target="_blank" rel="noopener noreferrer">{`${value.host}${value.url}`}</a></div>
              <Row gutter={36}>
                <Col span={8}><span className="title-secondly">{i18n.t('microService:time of occurrence')}</span>{moment(value.time).format('YYYY-MM-DD HH:mm:ss')}</Col>
                <Col span={10}><span className="title-secondly">{i18n.t('microService:equipment type')}</span>{value.device}</Col>
                <Col span={6}><span className="title-secondly">{i18n.t('microService:operating system')}</span>{value.os}</Col>
              </Row>
              <Row gutter={36}>
                <Col span={8}><span className="title-secondly">{i18n.t('microService:browser')}</span>{value.browser}</Col>
                <Col span={8}><span className="title-secondly">{i18n.t('version')}</span>{value.browser_version}</Col>
              </Row>
              <Row gutter={36}>
                <Col>
                  <div className="title">{i18n.t('microService:error message')}</div>
                  {value.error}
                  <div><span className="title-secondly">{i18n.t('microService:source of error')}</span>{value.source}</div>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col>
                  <div className="title">{i18n.t('microService:stack information')}</div>
                  {value.stack_trace ? <pre>{value.stack_trace}</pre> : i18n.t('empty') }
                </Col>
              </Row>
            </div>
          );
        })
      }
    </div>
  );
};

export default scriptDetail;
