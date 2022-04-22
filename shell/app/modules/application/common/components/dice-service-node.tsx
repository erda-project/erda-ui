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
import PropertyView from './property-view';
import i18n from 'i18n';
import { map } from 'lodash';
import { Form, Input, Button, FormInstance, Radio } from 'antd';
import ObjectInput from './object-input-group';
import ListInput from './list-input-group';
import ResourceField from './resource-field';
import DeploymentsField from './deployments-field';
import { EditJob } from './dice-job-node';
import HealthCheckField from './health-check-field';
import PortsField from './port-field';
import { resourcesValidator, portsValidator } from '../dice-yml-editor-validator';

import './dice-service-node.scss';

const { Item } = Form;

interface AddNodeProps extends IEditProps {
  nodeType: string;
}

export const AddDiceYmlNode = (props: AddNodeProps) => {
  const { nodeType, onSubmit: propsOnSubmit, ...rest } = props;
  const [type, setType] = React.useState(nodeType === 'none' ? 'service' : nodeType);
  const onSubmit = (_data: Obj, _json: Obj) => {
    propsOnSubmit({ ..._data, nodeType: type }, _json);
  };
  const Comp =
    type === 'service' ? <EditService onSubmit={onSubmit} {...rest} /> : <EditJob onSubmit={onSubmit} {...rest} />;

  return (
    <>
      <div className="mb-3">
        <div className="mb-2 text-black-4">{i18n.t('please select the {name}', { name: i18n.t('Type') })}</div>
        <Radio.Group size="small" value={type} onChange={(e) => setType(e.target.value)}>
          <Radio.Button disabled={nodeType === 'job'} value="service">
            {i18n.t('Service')}
          </Radio.Button>
          <Radio.Button disabled={nodeType === 'service'} value={'job'}>
            {i18n.t('dop:Job')}
          </Radio.Button>
        </Radio.Group>
      </div>
      {Comp}
    </>
  );
};

interface IEditProps {
  service: any;
  editing: boolean;
  jsonContent: any;
  onSubmit: (options: any, json: any) => void;
}

export const EditService = (props: IEditProps) => {
  const formRef = React.useRef<FormInstance>();
  const { service, editing, onSubmit: propsOnSubmit, jsonContent } = props;
  const originName = service?.name;

  const {
    ports = [],
    binds = [],
    // volumes = [],
    hosts = [],
    expose = [],
    envs = {},
    resources = {},
    health_check = {},
    deployments = {
      replicas: 1,
    },
    name,
    cmd,
    image,
  } = service;

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

  const _ports: any[] = [];
  map(ports, (p) => {
    if (typeof p !== 'object') {
      _ports.push({ port: p });
    } else {
      _ports.push(p);
    }
  });

  const portsField = (
    <Item
      name="ports"
      initialValue={_ports}
      rules={[
        {
          validator: portsValidator,
        },
      ]}
    >
      <PortsField disabled={!editing} />
    </Item>
  );

  let exposeField: React.ReactNode | null = (
    <Item
      name="expose"
      initialValue={expose}
      getValueFromEvent={(val: Array<{ value: string }>) => {
        return val?.length ? val.map((v) => v.value) : val;
      }}
    >
      <ListInput
        disabled={!editing}
        type="number"
        label={i18n.t('dop:please enter the exposed port')}
        placeholder={i18n.t('dop:exposed port')}
      />
    </Item>
  );
  if (!editing && (!expose || (expose && !expose.length))) {
    exposeField = null;
  }
  let hostsField: React.ReactNode | null = (
    <Item
      name="hosts"
      initialValue={hosts}
      getValueFromEvent={(val: Array<{ value: string }>) => {
        return val?.length ? val.map((v) => v.value) : val;
      }}
    >
      <ListInput disabled={!editing} label={i18n.t('dop:hosts mapping')} />
    </Item>
  );
  if (!editing && (!hosts || (hosts && !hosts.length))) {
    hostsField = null;
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
  const deploymentsField = (
    <Item label={i18n.t('dop:deployment strategy')} name="deployments" initialValue={deployments}>
      <DeploymentsField disabled={!editing} placeholder={i18n.t('dop:please select a deployment strategy')} />
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
  let cmdField: React.ReactNode | null = (
    <Item label={i18n.t('dop:start command')} name="cmd" initialValue={cmd}>
      <Input disabled={!editing} placeholder={i18n.t('dop:please enter the start command')} />
    </Item>
  );

  if (!editing && !cmd) {
    cmdField = null;
  }
  let bindsField: React.ReactNode | null = (
    <Item
      name="binds"
      initialValue={binds}
      getValueFromEvent={(val: Array<{ value: string }>) => {
        return val?.length ? val.map((v) => v.value) : val;
      }}
    >
      <ListInput
        disabled={!editing}
        required={false}
        label={i18n.t('dop:mounting')}
        placeholder={i18n.t('dop:please enter the mount directory')}
      />
    </Item>
  );
  if (!editing && (!binds || (binds && !binds.length))) {
    bindsField = null;
  }
  let healthCheckField: React.ReactNode | null = (
    <Item label={i18n.t('dop:health check')} name="health_check" initialValue={health_check}>
      <HealthCheckField disabled={!editing} />
    </Item>
  );

  if (!editing && (!health_check || (health_check && !Object.keys(health_check).length))) {
    healthCheckField = null;
  }
  // 未完成功能
  // const volumesField = getFieldDecorator('volumes', {
  //   initialValue: volumes,
  // })(<VolumesField required={false} label="持久化目录" placeholder="请输入文件目录" />);

  let imageField: React.ReactNode | null = (
    <Item label={i18n.t('dop:Image name')} name="image" initialValue={image}>
      <Input disabled={!editing} placeholder={i18n.t('dop:please enter the image name')} />
    </Item>
  );
  if (!editing && !image) {
    imageField = null;
  }

  const onSubmit = () => {
    const form = formRef.current;
    form
      ?.validateFields()
      .then((values: Obj) => {
        const curPorts: string[] = [];
        map(values.ports, (p: any) => {
          if (p.port !== undefined) {
            curPorts.push(p.protocol ? p : p.port); // 如果没有配协议，就只存端口号
          }
        });
        propsOnSubmit(
          {
            ...values,
            ports: curPorts,
            originName,
          },
          jsonContent,
        );
      })
      .catch((e: Obj) => {
        if (e.errorFields) {
          form?.scrollToField(e.errorFields?.[0]?.name);
        }
      });
  };

  return (
    <Form ref={formRef} className="edit-service-container" layout="vertical">
      {nameField}
      {portsField}
      {resourceField}
      {deploymentsField}
      {healthCheckField || editing ? healthCheckField : null}
      {envsField || editing ? envsField : null}
      {exposeField || editing ? exposeField : null}
      {hostsField || editing ? hostsField : null}
      {bindsField || editing ? bindsField : null}
      {cmdField || editing ? cmdField : null}
      {imageField || editing ? imageField : null}
      {editing ? (
        <Button type="primary" ghost onClick={onSubmit}>
          {i18n.t('Save')}
        </Button>
      ) : null}
    </Form>
  );
};

interface ViewProps {
  dataSource: {
    ports: Array<{ protocol: string; port: number }>;
    expose: string[];
    hosts: string[];
    resources: {
      cpu: number;
      mem: number;
      disk: number;
      network: {
        mode: 'overlay' | 'host';
      };
    };
    deployments: {
      mode: 'global' | 'replicated';
      replicas: number;
      labels?: string[];
    };
    envs: object;
  };
}

export const ServiceView = (props: ViewProps) => {
  const { dataSource } = props;
  const { resources, deployments, ports, envs } = dataSource;
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
      <span className="dice-service-detail-column">
        <span>{i18n.t('Number of instances')}：</span>
        <span>{(deployments && deployments.replicas) || '-'}</span>
      </span>
      <span className="dice-service-detail-column">
        <span>{i18n.t('Port')}：</span>
        <span>
          {Array.isArray(ports)
            ? ports.map((p) => (typeof p === 'object' ? `${p.protocol || ''}:${p.port}` : p)).join('/')
            : '-'}
        </span>
      </span>
      {envContent}
    </div>
  );
};
