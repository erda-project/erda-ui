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

import * as React from 'react';
import { SectionInfoEdit } from 'project/common/components/section-info-edit';
import appStore from 'application/stores/application';
import i18n from 'i18n';
import { regRules } from 'common/utils';

const SonarConfig = () => {
  const appDetail = appStore.useStore((s) => s.detail);
  const { updateAppDetail } = appStore.effects;
  const fieldsList = [
    {
      label: i18n.t('dop:sonar service host'),
      name: 'host',
      rules: [{ ...regRules.http }],
    },
    {
      label: i18n.t('dop:sonar token'),
      name: 'token',
      itemProps: {
        type: 'password',
        maxLength: 100,
      },
    },
    {
      label: i18n.t('dop:sonar project key'),
      name: 'projectKey',
      rules: [
        {
          pattern: /^[a-z0-9]+(-[a-z0-9]+)*$/,
          message: i18n.t('project-app-name-tip'),
        },
      ],
      required: false,
    },
  ];

  const readonlyForm = (
    <div>
      {fieldsList.map((item) => (
        <div key={item.name} className="mb-4">
          <div className="text-black-4 mb-2">{item.label}</div>
          <div className="text-black-8 mb-2">
            {item.name === 'token'
              ? appDetail.sonarConfig?.token
                ? '******'
                : '-'
              : appDetail.sonarConfig?.[item.name] || '-'}
          </div>
        </div>
      ))}
    </div>
  );

  const onUpdate = (v: { host: string; token: string; projectKey: string }) => {
    updateAppDetail({ ...appDetail, sonarConfig: v });
  };

  return (
    <SectionInfoEdit
      hasAuth
      data={{ ...appDetail.sonarConfig }}
      fieldsList={fieldsList}
      updateInfo={onUpdate}
      readonlyForm={readonlyForm}
    />
  );
};

export default SonarConfig;
