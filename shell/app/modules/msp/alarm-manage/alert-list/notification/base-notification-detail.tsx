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

interface IProps {
  scope: 'micro_service' | 'org';
  scopeId: string | number;
  id: number;
}

const BaseNotificationDetail: React.FC<IProps> = ({ scope, scopeId, id }) => {
  return (
    <div>
      <DiceConfigPage
        scenarioKey="msp-notify-detail"
        scenarioType="msp-notify-detail"
        inParams={{
          id,
          scope,
          scopeId,
        }}
        customProps={{
          ...['eventOverview', 'notificationContent'].reduce(
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
        }}
        operationCallBack={(_, renderConfig) => {
          // @ts-ignore
          mspStore.reducers.updateAlarmTitle(renderConfig?.protocol?.state.pageTitle);
        }}
      />
    </div>
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

export default BaseNotificationDetail;
