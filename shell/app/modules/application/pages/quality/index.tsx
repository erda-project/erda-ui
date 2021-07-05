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

/*
 * @Author: licao
 * @Date: 2019-03-19 23:12:35
 * @Last Modified by: licao
 * @Last Modified time: 2019-04-18 21:13:31
 */
import React from 'react';
import moment from 'moment';
import { Row, Col, Tabs, Table, Tooltip, Spin } from 'app/nusi';
import { get, isEmpty } from 'lodash';
import { ColumnProps } from 'core/common/interface';
import { Icon as CustomIcon, EmptyHolder, IF, FileEditor, useUpdate } from 'common';
import { goTo } from 'common/utils';
import { useEffectOnce } from 'react-use';
import layoutStore from 'layout/stores/layout';
import i18n from 'i18n';
import codeQualityStore from 'application/stores/quality';
import routeInfoStore from 'core/stores/route';
import { useLoading } from 'core/stores/loading';

import './index.scss';

const { TabPane } = Tabs;
const { ELSE } = IF;

interface ISonarInfo {
  name: string;
  path: string;
  lines: [] | null;
  measures: QA.Measure[];
  language: string;
}

const QUALITY_DATAS = [
  {
    key: 'bugs',
    name: i18n.t('application:code defect'),
    query: 'bug',
    icon: 'bug',
  },
  {
    key: 'vulnerabilities',
    name: i18n.t('application:code vulnerability'),
    query: 'vulnerability',
    icon: 'Vulnerabilities',
  },
  {
    key: 'codeSmells',
    name: i18n.t('application:code smell'),
    query: 'codeSmell',
    icon: 'codesmells',
  },
];

const CodeQuality = () => {
  const [visible, setVisible] = React.useState(false);
  const [curSonarInfo, setCurSonarInfo] = React.useState({ name: '', path: '', language: '', lines: [] });
  // const appDetail = appStore.useStore(s => s.detail);
  const { projectId, appId } = routeInfoStore.useStore((s) => s.params);
  const { getSonarResults, getRepoBlob, getLatestSonarStatistics } = codeQualityStore.effects;
  const { clearSonarResults, clearRepoBlob } = codeQualityStore.reducers;
  const [sonarStatistics, coverage, duplications, blob] = codeQualityStore.useStore((s) => [
    s.sonarStatistics,
    s.coverage,
    s.duplications,
    s.blob,
  ]);
  const [isFetchingSonarStatistics, isFetchingSonarResults, isFetchingRepoBlob] = useLoading(codeQualityStore, [
    'getLatestSonarStatistics',
    'getSonarResults',
    'getRepoBlob',
  ]);
  const [{ headerInfo }, updater] = useUpdate({
    headerInfo: {},
  });
  useEffectOnce(() => {
    getLatestSonarStatistics().then(({ commitId, ...rest }) => {
      if (commitId) {
        getSonarResults({ key: commitId, type: 'coverage' });

        updater.headerInfo({ commitId, ...rest });
      }
    });
    return () => {
      layoutStore.reducers.clearHeaderInfo();
      clearSonarResults();
    };
  });

  const closeDetail = () => {
    setVisible(false);
    clearRepoBlob();
  };

  const handleChangeActiveKey = (activeKey: string) => {
    const { commitId } = sonarStatistics;
    if (coverage.length && duplications.length) return;
    commitId && getSonarResults({ key: commitId, type: activeKey });
  };

  const handleGoToDetail = ({ name, path, lines, language }: ISonarInfo) => {
    setVisible(true);
    setCurSonarInfo({ name, path, lines: lines || [], language });
    getRepoBlob({ path });
  };

  const renderDataPanel = () => {
    return (
      <Row gutter={24}>
        {QUALITY_DATAS.map(({ key, name, icon, query }) => (
          <Col span={24 / QUALITY_DATAS.length} key={key}>
            <div
              className="quality-data flex-box"
              onClick={() => {
                goTo(goTo.pages.qaTicket, {
                  projectId,
                  appId,
                  type: query,
                });
              }}
            >
              <span className="desc flex-box mr16">
                <CustomIcon type={icon} />
                {name}
              </span>
              <div className="data-detail">
                <span className="num">{sonarStatistics[key]}</span>
                <span className={`rate-${get(sonarStatistics, `rating.${key}`, '-').toLowerCase()} rate`}>
                  {get(sonarStatistics, `rating.${key}`, '-')}
                </span>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    );
  };

  const renderSonarResultsTable = (type: string) => {
    const data = { coverage, duplications }[type];
    const SONAR_MAP = {
      coverage: {
        percentCNName: i18n.t('application: coverage'),
        percentName: 'coverage',
        lineCNName: i18n.t('application:number of lines not covered'),
        linesName: 'uncovered_lines',
      },
      duplications: {
        percentCNName: i18n.t('application:repeat rate'),
        percentName: 'duplicated_lines_density',
        lineCNName: i18n.t('application:repeat number of lines'),
        linesName: 'duplicated_lines',
      },
    };

    const columns: Array<ColumnProps<QA.Item>> = [
      {
        title: i18n.t('application:file name'),
        width: 360,
        key: 'name',
        render: ({ name }) => (
          <span className="inline-flex-box">
            <CustomIcon type="page" className="mr8" />
            {name}
          </span>
        ),
      },
      {
        title: i18n.t('application:file path'),
        key: 'path',
        render: ({ path }) => <Tooltip title={path}>{path}</Tooltip>,
      },
      {
        title: SONAR_MAP[type].percentCNName,
        width: 150,
        key: 'percentCNName',
        render: ({ measures }) =>
          `${measures.find((item: QA.Measure) => item.metric === SONAR_MAP[type].percentName)?.value} %`,
      },
      {
        title: SONAR_MAP[type].lineCNName,
        width: 150,
        key: 'lineCNName',
        render: ({ measures }) =>
          `${measures.find((item: QA.Measure) => item.metric === SONAR_MAP[type].linesName)?.value}`,
      },
    ];

    return (
      <Table
        dataSource={data}
        rowKey="path"
        columns={columns}
        pagination={{ pageSize: 20 }}
        loading={isFetchingSonarResults}
        onRow={(record: QA.Item) => {
          return {
            onClick: () => {
              handleGoToDetail(record as unknown as ISonarInfo);
            },
          };
        }}
        scroll={{ x: '100%' }}
      />
    );
  };

  const renderSonarDetail = (type: string) => {
    const ANNOTATIONS_TEXT_MAP = {
      coverage: i18n.t('application:this paragraph is not covered'),
      duplications: i18n.t('application:this paragraph is repeated'),
    };
    const { name, lines: originalLines, language } = curSonarInfo;
    const lines = originalLines.map((line) => parseInt(line, 10)).sort((a, b) => a - b);
    const lineRanges: any[] = [];

    lines.forEach((line, index) => {
      if (line - 1 === lines[index - 1]) {
        lineRanges[lineRanges.length - 1].push(line);
      } else {
        lineRanges.push([line]);
      }
    });

    const annotations = lineRanges.map((lineRange: any) => ({
      row: lineRange[0] - 1,
      column: 4,
      text: ANNOTATIONS_TEXT_MAP[type],
      type: 'warning',
    }));
    const markers = lineRanges.map((lineRange: any) => ({
      startRow: lineRange[0] - 1,
      endRow: lineRange[lineRange.length - 1] - 1,
      startCol: 0,
      className: 'error-marker',
      type: 'text',
    }));

    return (
      <React.Fragment>
        <div className="file-container quality-file">
          <div className="file-header bold flex-box">
            <div className="file-title inline-flex-box">
              <CustomIcon className="hover-active mb4 mr8" type="back" onClick={closeDetail} />
              <span>{name}</span>
            </div>
          </div>
          <div className="file-content">
            <Spin spinning={isFetchingRepoBlob}>
              <IF check={blob.content}>
                <FileEditor
                  name={name}
                  fileExtension={language}
                  value={blob.content}
                  annotations={annotations}
                  markers={markers}
                  options={{
                    readOnly: true,
                  }}
                />
                <ELSE />
                <EmptyHolder relative />
              </IF>
            </Spin>
          </div>
        </div>
      </React.Fragment>
    );
  };

  // 本页只取应用最新一次的 sonar 分析结果（可能没有）
  return (
    <div className="code-quality-content">
      <Spin spinning={isFetchingSonarStatistics}>
        {!isEmpty(headerInfo) && (
          <Row className="quality-info mb20" gutter={24}>
            <Col span={8}>
              <div className="label mb8 ">{i18n.t('application:recent detection time')}</div>
              <span className="value">{moment(headerInfo.time).format('YYYY-MM-DD HH:mm:ss')}</span>
            </Col>
            <Col span={8}>
              <div className="label mb8">{i18n.t('application:detection branch')}</div>
              <span className="value">
                <CustomIcon type="hb" />
                {headerInfo.branch}
              </span>
            </Col>
            <Col span={8}>
              <div className="label mb8">{i18n.t('application:submit')} ID</div>
              <span
                className="value commit-id hover-table-text"
                onClick={() => {
                  goTo(goTo.pages.commit, { commitId: headerInfo.commitId, projectId, appId });
                }}
              >
                <CustomIcon type="commit" />
                <span className="sha-text">{headerInfo.commitId.slice(0, 6)}</span>
              </span>
            </Col>
          </Row>
        )}
        <IF check={!sonarStatistics.commitId}>
          <EmptyHolder relative />
          <ELSE />
          <div className="quality-data-panel mb20">{renderDataPanel()}</div>
          <div className="quality-data-detail">
            <Tabs defaultActiveKey="coverage" onTabClick={closeDetail} onChange={handleChangeActiveKey}>
              <TabPane key="coverage" tab={`${i18n.t('application: coverage')} ${sonarStatistics.coverage}%`}>
                {visible ? renderSonarDetail('coverage') : renderSonarResultsTable('coverage')}
              </TabPane>
              <TabPane key="duplications" tab={`${i18n.t('application:repeat rate')} ${sonarStatistics.duplications}%`}>
                {visible ? renderSonarDetail('duplications') : renderSonarResultsTable('duplications')}
              </TabPane>
            </Tabs>
          </div>
        </IF>
      </Spin>
    </div>
  );
};

export { CodeQuality as CodeQualityWrap };
