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
import BaseEventDetail from 'msp/alarm-manage/alert-list/events/base-event-detail';
import orgStore from 'app/org-home/stores/org';

const EventDetail = () => {
  const orgId = orgStore.useStore((s) => s.currentOrg.id);
  return <BaseEventDetail scope="org" scopeId={`${orgId}`} />;
};

export default EventDetail;
