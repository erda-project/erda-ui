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
import { useClickAway } from 'react-use';
import { erdaEnv } from 'common/constants';
import UserMenu from 'layout/pages/page-container/components/navigation/user-menu';
import './index.scss';

const LandPage = () => {
  const orgs = orgStore.useStore((s) => s.orgs);
  const [activeOrg, setActiveOrg] = React.useState<any>(null);
  const [showOptions, setShowOptions] = React.useState(false);
  const [filterKey, setFilterKey] = React.useState('');

  const ref = React.useRef(null);
  useClickAway(ref, () => {
    setShowOptions(false);
  });

  const filteredList = orgs.filter((org) => org.displayName?.toLowerCase().includes(filterKey.toLowerCase()));

  return (
    <div className="land-page flex items-center justify-center h-full">
      <div className="absolute flex items-center justify-between left-20 right-20 top-5 z-10">
        <ErdaIcon className="text-white" size={60} type="erda" />
        <UserMenu placement="bottomRight" size={36} align={{ offset: [0, -6] }} className="no-arrow" />
      </div>
      <img className="bg-image" src={springBg} alt="background-image" />
      <div className="content text-white z-10">
        <div className="title">
          <div>{i18n.t('layout:Optimize global performance')}</div>
          <div>{i18n.t('layout:to assist you building agile R&D organizations')}</div>
        </div>
        <div className="mt-8 org-select-text">{i18n.t('layout:Choose your organization space')}</div>
        <div
          ref={ref}
          className={`mt-4 rounded-sm h-16 py-5 text-default cursor-pointer flex items-center justify-between org-select ${
            showOptions ? 'showOptions' : ''
          } ${filterKey ? 'searching' : ''}`}
        >
          <input
            className="input"
            type="text"
            value={activeOrg?.displayName || filterKey}
            onChange={(e) => !activeOrg && setFilterKey(e.target.value)}
            onClick={(e) => setShowOptions(true)}
          />
          <div className="tip text-default-6">{i18n.t('layout:Organizational space')}</div>
          <ErdaIcon className="icon mr-6" size={20} type="caret-down" />
          <div className="options">
            {filteredList.length ? (
              filteredList.map((org) => {
                return (
                  <a
                    key={org.id}
                    href={`/${org.name}`}
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
                    <div className="ml-2 flex-1 truncate">
                      <div className="org-name truncate">{org.displayName}</div>
                      <div className="org-sub-name text-xs text-desc truncate">{org.desc}</div>
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
        {erdaEnv.ENABLE_APPLY_ORG && (
          <a
            className="inline-block mt-6 px-3 leading-8 text-white bg-white-2 rounded-sm cursor-pointer hover:bg-white-4"
            href="https://www.erda.cloud/contact"
            target="_blank"
            rel="noreferrer"
          >
            {i18n.t('layout:Apply for new organization')}
          </a>
        )}
      </div>
    </div>
  );
};

export default LandPage;
