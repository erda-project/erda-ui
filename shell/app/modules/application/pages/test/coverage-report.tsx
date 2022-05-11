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
import { Drawer } from 'antd';
import i18n from 'i18n';
import Echarts from 'charts/components/echarts';
import { coverageReportColor } from 'application/common/config';
import applicationTestStore from 'application/stores/test';

interface IProps {
  visible: boolean;
  id: number;
  onClose: () => void;
}

interface TestDetail {
  id: number;
  coverageReport: Report[];
}

interface Report {
  children: Report[];
  name: string;
  path: string;
  value: number[];
}

const CoverageReport = ({ visible, id, onClose }: IProps) => {
  const testDetail = applicationTestStore.useStore((s) => s.testDetail) as TestDetail;
  const { getTestDetail } = applicationTestStore.effects;
  React.useEffect(() => {
    id && getTestDetail(id);
  }, [id]);

  const options = React.useMemo(
    () =>
      testDetail?.id
        ? {
            series: [
              {
                type: 'treemap',
                breadcrumb: {
                  itemStyle: {
                    color: coverageReportColor.breadcrumbColor,
                  },
                },
                colorMappingBy: 'value',
                data: testDetail.coverageReport,
                leafDepth: 5,
                levels: [
                  {
                    color: coverageReportColor.levelsColor,
                    itemStyle: {
                      borderWidth: 0,
                      gapWidth: 5,
                    },
                  },
                  {
                    color: coverageReportColor.levelsColor,
                    itemStyle: {
                      gapWidth: 1,
                    },
                  },
                  {
                    color: coverageReportColor.levelsColor,
                    itemStyle: {
                      borderColorSaturation: 0.6,
                      gapWidth: 1,
                    },
                  },
                  {
                    color: coverageReportColor.levelsColor,
                    itemStyle: {
                      borderColorSaturation: 0.6,
                      gapWidth: 1,
                    },
                  },
                  {
                    color: coverageReportColor.levelsColor,
                    itemStyle: {
                      borderColorSaturation: 0.6,
                      gapWidth: 1,
                    },
                  },
                ],
                name: i18n.t('dop:Code Coverage Statistics'),
                roam: false,
                visualDimension: 6,
                visualMax: 100,
                visualMin: 0,
                width: '100%',
                tooltip: {
                  show: true,
                  formatter: ({ data }: { data: { path: string; value: number[] } }) => {
                    const { path = '', value = [] } = data || {};

                    return `
                      ${path}
                      <br/>
                      ${i18n.t('dop:Total number of rows')} ${value[0] || 0}
                      <br/>
                      ${i18n.t('dop:Covering the number of rows')} ${value[9] || 0}
                      <br/>
                      ${i18n.t('dop:Line coverage')} ${value[6] || 0}
                      <br/>
                      ${i18n.t('dop:Class coverage')} ${value[8] || 0}
                    `;
                  },
                },
              },
            ],
            tooltip: {
              show: true,
              trigger: 'item',
            },
          }
        : {},
    [testDetail?.id],
  );

  return (
    <Drawer title={i18n.t('dop:Code Coverage Statistics')} visible={visible} onClose={onClose} width="80%">
      <Echarts option={options} />
    </Drawer>
  );
};

export default CoverageReport;
