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

import springBg from 'app/images/land-spring.jpg';
import orgStore from 'app/org-home/stores/org';
import { ErdaIcon } from 'common';
import i18n from 'i18n';
import React from 'react';
import './index.scss';

const LandPage = () => {
  const orgs = orgStore.useStore((s) => s.orgs);
  const [activeOrg, setActiveOrg] = React.useState<any>(null);
  const [showOptions, setShowOptions] = React.useState(false);
  const [filterKey, setFilterKey] = React.useState('');

  const filteredList = orgs.filter((org) => org.displayName?.toLowerCase().includes(filterKey.toLowerCase()));

  return (
    <div className="land-page flex items-center justify-center h-full">
      <div className="absolute left-20 top-5">
        <ErdaIcon className="text-white" size={60} type="erda" />
      </div>
      <img className="bg-image" src={springBg} alt="background-image" />
      <div className="content text-white z-10">
        <div className="title">
          <div>{i18n.t('layout:Global optimization')}</div>
          <div>{i18n.t('layout:Help enterprises to create an agile R & D organization')}</div>
        </div>
        <div className="mt-8 org-select-text">{i18n.t('layout:Choose your organization space')}</div>
        <div
          className={`mt-4 rounded-sm h-16 py-5 text-default cursor-pointer flex items-center justify-between org-select ${
            showOptions ? 'showOptions' : ''
          } ${filterKey ? 'searching' : ''}`}
        >
          <input
            className="input"
            type="text"
            value={activeOrg?.displayName || filterKey}
            onChange={(e) => setFilterKey(e.target.value)}
            onFocus={() => setShowOptions(true)}
            onBlur={() => setShowOptions(false)}
          />
          <div className="tip text-default-6">{i18n.t('layout:Organizational space')}</div>
          <ErdaIcon className="icon mr-6" size={20} type="caret-down" />
          <div className="options">
            {filteredList.length ? (
              filteredList.map((org) => {
                return (
                  <a key={org.id} href={`/${org.name}`}>
                    <div
                      className={`option flex items-center px-2 h-[76px] cursor-pointer hover:bg-default-04 ${
                        org.id === activeOrg?.id ? 'active' : ''
                      }`}
                      onMouseEnter={() => setActiveOrg(org)}
                      onMouseLeave={() => setActiveOrg(null)}
                    >
                      {org.logo ? (
                        <img className="w-10 h-10 rounded-sm" src={org.logo} alt={`${org.name} logo`} />
                      ) : (
                        <ErdaIcon type="zuzhi-40k0k60g" size={40} />
                      )}
                      <div className="ml-2">
                        <div className="org-name">{org.displayName}</div>
                        <div className="org-sub-name text-xs text-desc">{org.desc}</div>
                      </div>
                    </div>
                  </a>
                );
              })
            ) : (
              <div className="h-full flex-all-center">
                <ErdaIcon type="zuzhi-40k0k60g" size={64} />
                <div>
                  <div className="org-name">
                    {filterKey ? i18n.t('No matching organization') : i18n.t("Haven't join any org")}
                  </div>
                  <div className="org-sub-name text-xs text-desc">
                    {filterKey
                      ? i18n.t('Search results are empty')
                      : i18n.t('Contact your organization administrator to invite you to join')}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandPage;
