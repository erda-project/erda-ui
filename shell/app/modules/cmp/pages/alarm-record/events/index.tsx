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
import BaseEventList from 'msp/alarm-manage/alert-list/events/base-event-list';
import orgStore from 'app/org-home/stores/org';
import { goTo } from 'common/utils';

const Events = () => {
  const orgId = orgStore.useStore((s) => s.currentOrg.id);
  return (
    <BaseEventList
      scope="org"
      scopeId={`${orgId}`}
      clickRow={({ id }) => {
        goTo(goTo.pages.orgAlarmEventDetail, {
          eventId: id,
        });
      }}
    />
  );
};

export default Events;
