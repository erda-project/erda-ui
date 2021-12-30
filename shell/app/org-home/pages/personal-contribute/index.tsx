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
import { useMount } from 'react-use';
import { Echarts } from 'charts';
import { map } from 'lodash';
import { ErdaIcon } from 'common';
import orgStore from 'app/org-home/stores/org';
import { getPersonalContribute } from '../../services/personal-home';
import { colorToRgb } from 'app/common/utils';
import i18n from 'i18n';
import { newColorMap } from 'charts/theme';

const { themeColor } = ErdaIcon;

const infoList = [
  {
    icon: 'xietong',
    desc: i18n.t('dop:collaboration items created/updated'),
    key: 'events',
    color: 'blue-deep',
  },
  {
    icon: 'zidonghuaceshi',
    desc: i18n.t('dop:created/updated automated test cases'),
    key: 'cases',
    color: 'green-deep',
  },
  {
    icon: 'daimatijiao',
    desc: i18n.t('dop:number of code submissions'),
    key: 'commits',
    color: 'purple-deep',
  },
];

const PersonalContribute = ({ currentUser }: { currentUser: ILoginUser }) => {
  const orgId = orgStore.getState((s) => s.currentOrg.id);

  useMount(() => {
    getPersonalContribute.fetch({ orgId, userId: currentUser.id });
  });

  const contributes = getPersonalContribute.useData();

  const getChartOption = () => {
    const option = {
      radar: {
        indicator: map(contributes?.indicators.title, (item, i) => ({
          name: item,
          max: contributes?.indicators.max[i],
        })),
        shape: 'circle',
        splitArea: { show: false },
        nameGap: 4,
        splitNumber: 3,
      },
      series: [
        {
          type: 'radar',
          data: map(
            map(contributes?.indicators.data, ({ data }) => ({ value: data })),
            (item, i) => ({
              ...item,
              areaStyle: { color: i === 1 ? newColorMap.primary5 : themeColor['default-3'] },
            }),
          ),
          lineStyle: { opacity: 0 },
        },
      ],
    };
    return option;
  };

  return (
    <div className="bg-white shadow-card pb-4 w-60">
      <div className="flex justify-between items-center h-12 px-4">
        <div className="text-normal">{i18n.t('dop:personal contribution')}</div>
      </div>
      <div className="flex justify-center">
        <Echarts style={{ maxHeight: '200px', width: '210px' }} option={getChartOption()} />
      </div>
      <div className="px-4">
        <div className="mb-2">{i18n.t('dop:current month')}</div>
        <div className="space-y-2">
          {map(infoList, ({ color, icon, key, desc }) => {
            return (
              <div
                key={key}
                className="w-52 px-4 py-3 relative"
                style={{ backgroundColor: colorToRgb(themeColor[color], 0.04) }}
              >
                <div
                  className="absolute top-0 right-0 bg-icon-wrapper flex justify-center items-center"
                  style={{ color: colorToRgb(themeColor[color], 0.1) }}
                >
                  <ErdaIcon size={44} type={icon} />
                </div>
                <div className="flex items-center leading-6">
                  <ErdaIcon type={icon} size="16" fill={color} />
                  <div className="ml-1">{contributes?.data[key] ?? 0}</div>
                </div>
                <div className="leading-6 text-xs text-sub pl-5">{desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PersonalContribute;
