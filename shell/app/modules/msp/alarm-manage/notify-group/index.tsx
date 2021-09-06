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
import NotifyGroup from 'application/pages/settings/components/app-notify/common-notify-group';
import memberStore from 'common/stores/msp-project-member';
import routeInfoStore from 'core/stores/route';
import './index.scss';

const NotifyGroups = () => {
  const { env, terminusKey, projectId } = routeInfoStore.useStore((s) => s.params);
  return (
    <div className="msp-notify-group">
      <NotifyGroup
        memberStore={memberStore}
        commonPayload={{ scopeType: `msp_${env}`, scopeId: `msp_${terminusKey}`, projectId }}
      />
    </div>
  );
};

export default NotifyGroups;
