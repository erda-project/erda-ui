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
import { TimeSelectWithStore } from 'msp/components/time-select';
import DiceConfigPage from 'app/config-page';
import monitorCommon from 'common/stores/monitorCommon';
import { useMock } from 'msp/alarm-manage/overview/data.mock';

const indicators = ['apdex', 'apiSuccessRate', 'avgPageLoadDuration', 'jsErrorCount', 'alertEvent', 'uv'];
const Overview = () => {
  const range = monitorCommon.useStore((s) => s.globalTimeSelectSpan.range);
  return (
    <div>
      <div className="top-button-group z-10">
        <TimeSelectWithStore placement="bottomRight" />
      </div>
      <DiceConfigPage
        scenarioKey=""
        scenarioType=""
        inParams={{
          startTime: range.startTimeMs,
          endTime: range.endTimeMs,
          _: range.triggerTime,
        }}
        forceUpdateKey={['inParams']}
        forceMock
        useMock={useMock}
        customProps={{
          ...indicators.reduce(
            (previousValue, currentValue) => ({
              ...previousValue,
              [`kvCard@${currentValue}`]: {
                props: {
                  gutter: 0,
                  className: 'h-24 py-6',
                },
              },
            }),
            {},
          ),
          cards: {
            props: {
              gutter: 0,
            },
          },
          comp: {
            props: {
              showDefaultBgColor: false,
              className: 'bg-white',
            },
          },
          alarmEvent: {
            props: {
              showDefaultBgColor: false,
              className: 'bg-white',
            },
          },
          alertNotice: {
            props: {
              showDefaultBgColor: false,
              className: 'bg-white',
            },
          },
          alarmDurationAnalysis: {
            props: {
              showDefaultBgColor: false,
              className: 'bg-white',
            },
          },
          compContainer: {
            props: {
              leftProportion: 3,
              rightProportion: 7,
            },
          },
        }}
      />
    </div>
  );
};

export default Overview;
