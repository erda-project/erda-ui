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
import routeInfoStore from 'core/stores/route';
import { Form, Input, Button } from 'antd';
import DiceConfigPage from 'config-page';
import { useUpdate } from 'app/common/use-hooks';
import i18n from 'i18n';
import { goTo } from 'common/utils';
import { MarkdownEditor, Title } from 'common';
import { saveTestReport } from 'project/services/project';

interface IState {
  testDashboard: Obj | null;
  issueDashboard: Obj | null;
}

export default () => {
  const [{ projectId }] = routeInfoStore.useStore((s) => [s.params, s.query]);
  const [form] = Form.useForm();
  const saving = saveTestReport.useLoading();
  const [{ testDashboard, issueDashboard }, updater] = useUpdate<IState>({
    testDashboard: null,
    issueDashboard: null,
  });

  const onClick = () => {
    form.validateFields().then((res) => {
      saveTestReport
        .fetch({
          projectId,
          ...res,
          reportData: {
            'issue-dashboard': issueDashboard,
            'test-dashboard': testDashboard,
          },
        })
        .then(() => {
          goTo('../');
        });
    });
  };
  const inParams = { projectId };

  return (
    <div>
      <div className="top-button-group">
        <Button type="primary" onClick={onClick} loading={saving}>
          {i18n.t('project:create test report')}
        </Button>
      </div>
      <div className="bg-white rounded p-2">
        <Form className="w-3/5" layout="vertical" form={form}>
          <Form.Item label={i18n.t('org:report name')} name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label={i18n.t('project:test summary')} name="summary">
            <MarkdownEditor />
          </Form.Item>
        </Form>
      </div>
      <Title title={i18n.t('project:test statistics')} />
      <DiceConfigPage
        scenarioType={'test-dashboard'}
        scenarioKey={'test-dashboard'}
        fullHeight={false}
        updateConfig={(v) => {
          updater.testDashboard(v);
        }}
        debugConfig={testDashboard}
        inParams={inParams}
      />

      <Title title={i18n.t('project:test statistics')} />
      <DiceConfigPage
        scenarioType={'issue-dashboard'}
        scenarioKey={'issue-dashboard'}
        inParams={inParams}
        fullHeight={false}
        debugConfig={issueDashboard}
        updateConfig={(v) => {
          updater.issueDashboard(v);
        }}
      />
    </div>
  );
};
