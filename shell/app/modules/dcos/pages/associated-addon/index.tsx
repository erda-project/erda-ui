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

import React, { useEffect } from 'react';
import i18n from 'i18n';
import { forEach, filter } from 'lodash';
import { Panel } from 'common';
import { AddonCards } from 'addonPlatform/pages/common/components/addon-cards';
import workBenchStore from 'workBench/stores';


interface IProps {
  projectId: any;
  environment: string;
}

const AssociatedAddons = ({
  projectId,
  environment,
}: IProps) => {
  const projectAddonCategory = workBenchStore.useStore(s => s.projectAddonCategory);
  useEffect(() => {
    workBenchStore.getProjectAddons(projectId);
  }, [projectId]);

  const uselessCategories = [i18n.t('dcos:customize')];
  let associateMicroServices: any[] = [];
  let associatedAddons: any[] = [];
  let associatedAbilities: any[] = [];
  forEach(projectAddonCategory, (v, k) => {
    if (!uselessCategories.includes(k)) {
      forEach(v, (item) => {
        switch (item.platformServiceType) {
          case 0:
            associatedAddons = [...associatedAddons, item];
            break;
          case 1:
            associateMicroServices = [...associateMicroServices, item];
            break;
          case 2:
            associatedAbilities = [...associatedAbilities, item];
            break;
          default:
            break;
        }
      });
    }
  });
  const filterList = (list: any[]) => filter(list, ({ workspace, status }) => (workspace === environment || workspace === 'ALL') && status !== 'ATTACHFAILED');

  return (
    <>
      <Panel title={i18n.t('org:associated plugin')}>
        <AddonCards dataSource={filterList(associatedAddons)} />
      </Panel>
      <Panel title={i18n.t('associated microservice')}>
        <AddonCards dataSource={filterList(associateMicroServices)} />
      </Panel>
      <Panel title={i18n.t('associated ability')}>
        <AddonCards dataSource={filterList(associatedAbilities)} />
      </Panel>
    </>
  );
};

export default AssociatedAddons;
