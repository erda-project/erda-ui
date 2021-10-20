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
import DiceConfigPage from 'app/config-page';
import projectStore from 'project/stores/project';
import { Input, Form } from 'core/nusi';
import ExportPdf from 'project/pages/plan-detail/report/export-pdf';
import { Upload as IconUpload } from '@icon-park/react';
import Markdown from 'common/utils/marked';
import { Title } from 'common';
import { useMount } from 'react-use';
import i18n from 'i18n';

export default ({ downloadId, projectId, onFinish }: { downloadId: string; projectId: string; onFinish: Function }) => {
  const { getTestReportDetail } = projectStore.effects;
  const exportRef = React.useRef();
  const [data, setData] = React.useState<PROJECT.ITestReportBody | null>(null);
  useMount(() => {
    getTestReportDetail({ reportId: downloadId, projectId }).then((res) => {
      setData(res);
    });
  });

  const onPreviewMount = () => {
    exportRef.current?.click();
  };

  return (
    <div>
      {data ? (
        <div>
          <div className="top-button-group hidden">
            <ExportPdf onFinish={onFinish} domId="test-report-page" tip={data?.name}>
              {({ exportPdf }) => (
                <span className="text-sm cursor-pointer text-primary" ref={exportRef} onClick={() => exportPdf()}>
                  <IconUpload />
                  {i18n.t('project:export report')}
                </span>
              )}
            </ExportPdf>
          </div>
          <div id="test-report-page">
            <Preview onMount={onPreviewMount} data={data} />
          </div>
        </div>
      ) : null}
    </div>
  );
};

const Preview = (props: { data: PROJECT.ITestReportBody; onMount: Function }) => {
  const { data, onMount } = props;
  useMount(() => {
    onMount();
  });

  return (
    <>
      <div className="bg-white rounded p-2">
        <Form className="w-3/5" layout="vertical">
          <Form.Item label={i18n.t('org:report name')}>
            <Input bordered={false} value={data.name} readOnly />
          </Form.Item>
          <Form.Item label={i18n.t('project:test summary')}>
            <div
              className="border-all rounded p-2 md-content"
              dangerouslySetInnerHTML={{ __html: Markdown(data.summary) }}
            />
          </Form.Item>
        </Form>
      </div>
      <Title title={i18n.t('project:test statistics')} />
      <DiceConfigPage
        scenarioType={'test-dashboard'}
        scenarioKey={'test-dashboard'}
        forbiddenRequest
        fullHeight={false}
        debugConfig={data.reportData?.['test-dashboard']}
      />
      <Title title={i18n.t('project:test statistics')} />
      <DiceConfigPage
        scenarioType={'issue-dashboard'}
        scenarioKey={'issue-dashboard'}
        fullHeight={false}
        forbiddenRequest
        debugConfig={data.reportData?.['issue-dashboard']}
      />
    </>
  );
};
