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
import { ErdaAlert, MembersTable } from 'common';
import i18n from 'i18n';
import { pick } from 'lodash';
import { goTo } from 'common/utils';
import { MemberScope } from 'app/common/stores/member-scope';
import projectStore from 'project/stores/project';
import { mspRoleMap } from 'user/stores/_perm-msp';
import { replaceWithLink } from 'app/common/utils';

const SettingsMember = () => {
  const info = projectStore.useStore((s) => s.info);

  const roleFilter = React.useCallback(
    (data) => {
      if (info.type === 'MSP') {
        return pick(data, Object.keys(mspRoleMap));
      } else {
        return data;
      }
    },
    [info.type],
  );

  return (
    <div>
      <ErdaAlert
        showOnceKey="project-member"
        message={
          <>
            {replaceWithLink(
              `${i18n.t('Edit members and set member roles. See Role Permission Description for details.')}[${i18n.t(
                'role permissions description',
              )}]`,
              goTo.resolve.perm({ scope: 'app' }),
            )}
          </>
        }
      />

      <MembersTable
        scopeKey={MemberScope.PROJECT}
        overwriteAuth={{ add: true, edit: true, delete: true }}
        roleFilter={roleFilter}
      />
    </div>
  );
};

export default SettingsMember;
