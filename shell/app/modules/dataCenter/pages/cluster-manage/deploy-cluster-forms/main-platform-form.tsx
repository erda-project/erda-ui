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
import { IFormProps, regRulesMap, FormUnitContainer } from '../form-utils';
import { RenderPureForm, ReadonlyForm } from 'common';
import i18n from 'i18n';

// SaaS话集群主平台配置
export const MainPlatformForm = ({ form, isReadonly, data, curRef }: IFormProps) => {
  const formPrefix = 'config.mainPlatform';
  const fieldsList = [
    {
      label: i18n.t('dcos:pan domain name'),
      name: `${formPrefix}.wildcardDomain`,
      rules: [{ ...regRulesMap.wildcardDomain }],
    },
    {
      label: i18n.t('dcos:lb access agreement'),
      name: `${formPrefix}.scheme`,
      type: 'radioGroup',
      initialValue: 'http',
      options: ['http', 'https'].map((v) => ({ value: v, name: v })),
      itemProps: {
        onChange: (e: any) => {
          const port = e.target.value === 'http' ? 80 : 443;
          form.setFieldsValue({ 'config.mainPlatform.port': port });
        },
      },
    },
    {
      label: i18n.t('dcos:lb access port'),
      name: `${formPrefix}.port`,
      rules: [{ ...regRulesMap.port }],
      initialValue: 80,
    },
  ];
  return (
    <FormUnitContainer title={i18n.t('dcos:saas-based cluster master platform configuration')} curRef={curRef}>
      {isReadonly ? (
        <ReadonlyForm fieldsList={fieldsList} data={data} />
      ) : (
        <RenderPureForm list={fieldsList} form={form} layout="vertical" className="deploy-form-render" />
      )}
    </FormUnitContainer>
  );
};
