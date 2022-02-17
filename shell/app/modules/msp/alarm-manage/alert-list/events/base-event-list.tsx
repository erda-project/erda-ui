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

interface IProps {
  scope: 'micro_service' | 'org';
  scopeId: string;
  clickRow?: (data: { id: string }) => void;
}

const BaseEventList: React.FC<IProps> = ({ scopeId, scope, clickRow }) => {
  return (
    <DiceConfigPage
      scenarioKey="msp-alert-event-list"
      scenarioType="msp-alert-event-list"
      inParams={{
        scopeId,
        scope,
      }}
      customProps={{
        table: {
          op: {
            clickRow,
          },
        },
      }}
    />
  );
};

export default BaseEventList;
