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

import * as React from 'react';
import DiceConfigPage from 'config-page/index';
import orgStore from 'app/org-home/stores/org.tsx';
import './personal-home.scss';
import i18n from 'i18n';

const PersonalHome = () => {
  const curOrgName = orgStore.useStore((s) => s.currentOrg.name);
  const inParams = { orgName: curOrgName || '-' };

  React.useEffect(() => {
    document.title = `${i18n.t('Personal dashboard')} · Erda`;

    return () => {
      document.title = ' · Erda';
    };
  }, []);

  return (
    <div className="home-page">
      <div className="home-page-sidebar">
        <DiceConfigPage
          scenarioType="home-page-sidebar"
          scenarioKey="home-page-sidebar"
          key={curOrgName}
          inParams={inParams}
        />
      </div>
      <div className="home-page-content full-width">
        <DiceConfigPage
          scenarioType="home-page-content"
          scenarioKey="home-page-content"
          key={curOrgName}
          inParams={inParams}
        />
      </div>
    </div>
  );
};

export default PersonalHome;
