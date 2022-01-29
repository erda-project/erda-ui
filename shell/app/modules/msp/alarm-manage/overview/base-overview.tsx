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
import monitorCommon from 'common/stores/monitorCommon';
import { TimeSelectWithStore } from 'msp/components/time-select';
import DiceConfigPage from 'config-page';
import { useMock } from 'msp/alarm-manage/overview/data.mock';

const indicators = [
  'alertTriggerCount',
  'alertRecoverCount',
  'alertReduceCount',
  'alertSilenceCount',
  'notifySuccessCount',
  'notifyFailCount',
];

interface IProps {
  scope: 'micro_service' | 'org';
  scopeId: string | number;
}

const BaseOverview: React.FC<IProps> = ({ scope, scopeId }) => {
  const range = monitorCommon.useStore((s) => s.globalTimeSelectSpan.range);
  return (
    <div>
      <div className="top-button-group z-10">
        <TimeSelectWithStore placement="bottomRight" />
      </div>
      <DiceConfigPage
        scenarioKey="msp-alert-overview"
        scenarioType="msp-alert-overview"
        inParams={{
          scope,
          scopeId,
          startTime: range.startTimeMs,
          endTime: range.endTimeMs,
          _: range.triggerTime,
        }}
        wrapperClassName="overflow"
        forceUpdateKey={['inParams']}
        // forceMock
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
          compositeHeader: {
            props: {
              showDefaultBgColor: false,
              className: 'bg-white',
            },
          },
          alertDurationAnalysis: {
            props: {
              showDefaultBgColor: false,
              className: 'bg-white',
            },
          },
          alertEventCharts: {
            props: {
              showDefaultBgColor: false,
              className: 'bg-white',
            },
          },
          alertNotifyCharts: {
            props: {
              showDefaultBgColor: false,
              className: 'bg-white',
            },
          },
          headerContainer: {
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

export default BaseOverview;
