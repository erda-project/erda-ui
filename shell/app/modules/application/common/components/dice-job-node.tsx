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
import { Form, Input, Button, FormInstance, Tooltip } from 'antd';
import ResourceField from './resource-field';
import { resourcesValidator } from '../dice-yml-editor-validator';
import ObjectInput from './object-input-group';
import PropertyView from './property-view';
import i18n from 'i18n';

import './dice-job-node.scss';

const { Item } = Form;

interface ViewProps {
  dataSource: {
    data: {
      cmd: string;
      resources: {
        cpu: number;
        mem: number;
      };
      envs: Obj;
    };
  };
}

export const JobView = (props: ViewProps) => {
  const { dataSource } = props;
  const { resources, cmd, envs = {} } = dataSource?.data || {};
  const envKeys = Object.keys(envs || {});
  const envContent = envKeys.length ? (
    <span className="envs-column w-full">
      {i18n.t('dop:Environment Variable')}: <PropertyView dataSource={envs} />
    </span>
  ) : null;
  return (
    <div>
      <span className="dice-service-detail-column">
        <span>CPU：</span>
        <span>{(resources && resources.cpu) || '-'}</span>
      </span>
      <span className="dice-service-detail-column">
        <span>{i18n.t('memory')}：</span>
        <span>{(resources && resources.mem) || '-'}</span>
      </span>
      <Tooltip title={cmd}>
        <div className="bg-default-04 rounded px-1 py-0.5 text-black-6 truncate mb-2">
          <span>{'Cmd'}：</span>
          <span>{cmd || '-'}</span>
        </div>
      </Tooltip>
      {envContent}
    </div>
  );
};

interface EditProps {
  job: Obj;
  editing: boolean;
  jsonContent: Obj;
  onSubmit: (options: Obj, json: Obj) => void;
}
export const EditJob = (props: EditProps) => {
  const formRef = React.useRef<FormInstance>();
  const { job, editing, onSubmit: propsOnSubmit, jsonContent } = props;
  const originName = job?.name;

  const { resources = {}, name, cmd, envs = {} } = job?.data || {};

  const nameField = (
    <Item
      label={i18n.t('Service name')}
      name="name"
      initialValue={name}
      rules={[
        {
          required: true,
          message: i18n.t('dop:please enter the service name'),
        },
      ]}
    >
      <Input disabled={!editing} placeholder={i18n.t('dop:please enter the service name')} />
    </Item>
  );

  let envsField: React.ReactNode | null = (
    <Item
      name="envs"
      initialValue={envs}
      rules={[
        {
          required: true,
          message: i18n.t('dop:please enter an environment variable'),
        },
      ]}
    >
      <ObjectInput
        disabled={!editing}
        label={i18n.t('dop:Environment Variable')}
        errorMessage={i18n.t('dop:environment variables cannot be empty')}
      />
    </Item>
  );

  if (!editing && (!envs || (envs && !Object.keys(envs).length))) {
    envsField = null;
  }

  const resourceField = (
    <Item
      label={i18n.t('dop:resources')}
      name="resources"
      initialValue={resources}
      rules={[
        {
          required: true,
          message: i18n.t('dop:please select a resource'),
        },
        {
          validator: resourcesValidator,
        },
      ]}
    >
      <ResourceField disabled={!editing} placeholder={i18n.t('dop:please select a resource')} />
    </Item>
  );

  const cmdField = (
    <Item label={i18n.t('dop:start command')} name="cmd" initialValue={cmd}>
      <Input disabled={!editing} placeholder={i18n.t('dop:please enter the start command')} />
    </Item>
  );

  const onSubmit = () => {
    const form = formRef.current;
    form?.validateFields().then((values: Obj) => {
      propsOnSubmit(
        {
          ...values,
          originName,
        },
        jsonContent,
      );
    });
    // .catch((e: Obj) => {
    //   if (e.errorFields) {
    //     form?.scrollToField(e.errorFields?.[0]?.name);
    //   }
    // });
  };

  return (
    <Form ref={formRef} className="edit-job-container" layout="vertical">
      {nameField}
      {resourceField}
      {envsField || editing ? envsField : null}
      {cmdField || editing ? cmdField : null}
      {editing ? (
        <Button type="primary" ghost onClick={onSubmit}>
          {i18n.t('Save')}
        </Button>
      ) : null}
    </Form>
  );
};
