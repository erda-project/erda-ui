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
import DiceConfigPage from 'config-page';
import AlarmDetailTitle from '../component/alarm-detail-title';
import { goTo } from 'common/utils';
import mspStore from 'msp/stores/micro-service';
import { TimeSelectWithStore } from 'msp/components/time-select';
import monitorCommon from 'common/stores/monitorCommon';

interface IProps {
  scope: 'micro_service' | 'org';
  scopeId: string;
  id: string;
}

const BaseEventDetail: React.FC<IProps> = ({ scopeId, scope, id }) => {
  const range = monitorCommon.useStore((s) => s.globalTimeSelectSpan.range);
  return (
    <>
      <DiceConfigPage
        scenarioKey="msp-alert-event-detail"
        scenarioType="msp-alert-event-detail"
        inParams={{
          scopeId,
          scope,
          alertEventId: id,
          startTime: range.startTimeMs,
          endTime: range.endTimeMs,
          _: range.triggerTime,
        }}
        customProps={{
          copyButton: {
            props: {
              copyText: window.location.href,
            },
          },
          ...['eventStatus', 'eventOverview'].reduce(
            (previousValue, currentValue) => ({
              ...previousValue,
              [currentValue]: {
                props: {
                  showDefaultBgColor: false,
                  className: 'bg-white',
                },
              },
            }),
            {},
          ),
          eventHistory: {
            props: {
              showDefaultBgColor: false,
              className: 'bg-white',
              childClassName: 'px-0 pb-0',
            },
          },
          monitorData: {
            props: {
              showDefaultBgColor: false,
              className: 'bg-white',
              slot: <TimeSelectWithStore />,
            },
          },
        }}
        operationCallBack={(_, renderConfig) => {
          // @ts-ignore
          mspStore.reducers.updateAlarmTitle(renderConfig?.protocol?.state.pageTitle);
        }}
      />
    </>
  );
};

export const PageTitle = () => {
  return (
    <AlarmDetailTitle
      onClick={() => {
        goTo('..');
      }}
    />
  );
};

export default BaseEventDetail;
