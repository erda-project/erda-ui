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
import i18n from 'i18n';
import { DropdownSelectNew } from 'common';
import { goTo } from 'common/utils';
import routeInfoStore from 'core/stores/route';
import orgStore from 'app/org-home/stores/org';
import ImgMap from 'config-page/img-map';

type Size = 'small' | 'middle' | 'big';
interface IProps {
  mode?: 'simple' | 'normal';
  size?: Size;
  optionSize?: Size;
}
const OrgSelector = (props: IProps) => {
  const { mode, size, optionSize } = props;
  // const { getPublicOrgs } = orgStore.effects;
  const orgName = routeInfoStore.useStore((s) => s.params.orgName);
  const orgs = orgStore.useStore((s) => s.orgs);
  // useMount(() => {
  //   getPublicOrgs();
  // });

  // const usedPublicOrg = compact(
  //   publicOrgs.map((o) =>
  //     orgs.find((myOrg) => myOrg.id === o.id)
  //       ? null
  //       : {
  //           key: o.name,
  //           label: o.displayName,
  //           desc: o.name,
  //           imgURL: o.logo || ImgMap.frontImg_default_org_icon,
  //         },
  //   ),
  // );

  const options = [
    {
      label: i18n.t('dop:The organizations I joined'),
      key: 'my',
      children: orgs.map((o) => ({
        key: o.name,
        label: o.displayName,
        desc: o.name,
        imgURL: o.logo || ImgMap.frontImg_default_org_icon,
      })),
    },
  ];

  const changeOrg = (_: string, op: Obj) => {
    goTo(goTo.pages.orgRoot, { orgName: op.desc });
  };

  return (
    <DropdownSelectNew
      title={i18n.t('dop:Switch organization')}
      value={orgName}
      options={options}
      onChange={changeOrg}
      width={400}
      size={size}
      optionSize={optionSize || 'big'}
      mode={mode}
      required
    />
  );
};

export default OrgSelector;
