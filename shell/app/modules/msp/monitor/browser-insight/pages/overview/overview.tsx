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
import { TimeSelectWithStore } from 'msp/components/time-select';
import DiceConfigPage from 'app/config-page';
import monitorCommonStore from 'common/stores/monitorCommon';
import routeInfoStore from 'core/stores/route';
import { functionalColor } from 'common/constants';

const topNConfig = [
  {
    key: 'maxReqDomainTop5',
    color: functionalColor.actions,
    icon: 'gaofangwenliangyemian',
  },
  {
    key: 'maxReqPageTop5',
    color: functionalColor.success,
    icon: 'gaofangwenliangyemian',
  },
  {
    key: 'slowReqPageTop5',
    color: functionalColor.warning,
    icon: 'manxiangyingyemian',
  },
  {
    key: 'slowReqRegionTop5',
    color: functionalColor.error,
    icon: 'manxiangyingdiqu',
  },
];
const indicators = [
  'apdex',
  'apiSuccessRate',
  'avgPageLoadDuration',
  'jsErrorCount',
  'pv',
  'uv',
  'resourceLoadErrorCount',
];

const Overview = () => {
  const range = monitorCommonStore.useStore((s) => s.globalTimeSelectSpan.range);
  const tenantId = routeInfoStore.useStore((s) => s.params.terminusKey);
  return (
    <div>
      <div className="flex justify-end mb-2">
        <TimeSelectWithStore />
      </div>
      {tenantId ? (
        <DiceConfigPage
          scenarioKey="browser-overview"
          scenarioType="browser-overview"
          inParams={{ tenantId, startTime: range.startTimeMs, endTime: range.endTimeMs, _: range.triggerTime }}
          forceUpdateKey={['inParams']}
          customProps={{
            ...['cards', 'topNs', 'charts'].reduce((previousValue, currentValue) => {
              return {
                ...previousValue,
                [`${currentValue}Wrapper`]: {
                  props: {
                    className: 'p-0',
                  },
                },
                [`${currentValue}Title`]: {
                  props: {
                    level: 1,
                    noMarginBottom: true,
                    className: 'h-12 bg-lotion px-4 mb-2',
                  },
                },
              };
            }, {}),
            topNs: {
              props: {
                gutter: 8,
                span: [6, 6, 6, 6],
                wrapperClassName: '-mt-1 px-4 pb-3',
              },
            },
            cards: {
              props: {
                colFlex: 'auto',
                gutter: 0,
                wrapperClassName: 'p-4',
              },
            },
            charts: {
              props: {
                gutter: 8,
                span: [12, 12, 12, 12],
                wrapperClassName: 'px-4 pb-2',
                className: 'mb-2 overflow-visible',
              },
            },
            ...topNConfig.reduce((prev, next) => {
              return {
                ...prev,
                [`topN@${next.key}`]: {
                  props: {
                    theme: [
                      {
                        titleIcon: next.icon,
                        color: next.color,
                      },
                    ],
                  },
                },
              };
            }, {}),
            ...indicators.reduce(
              (previousValue, currentValue) => ({
                ...previousValue,
                [`kvCard@${currentValue}`]: {
                  props: {
                    gutter: 0,
                  },
                },
              }),
              {},
            ),
          }}
        />
      ) : null}
    </div>
  );
};

export default Overview;
