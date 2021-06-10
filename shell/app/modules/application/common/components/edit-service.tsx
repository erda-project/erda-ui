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

import { FormComponentProps } from 'core/common/interface';
import React, { PureComponent } from 'react';
import { isEqual, map } from 'lodash';
import { Form, Input, Button } from 'app/nusi';
import ObjectInput from './object-input-group';
import ListInput from './list-input-group';
import ResourceField from './resource-field';
import DeploymentsField from './deployments-field';
import HealthCheckField from './health-check-field';
import PortsField from './port-field';
import { resourcesValidator, portsValidator } from '../dice-yml-editor-validator';
import i18n from 'i18n';
import './edit-service.scss';

const { Item } = Form;
interface IEditServiceProps {
  service: any;
  editing: boolean;
  jsonContent: any;
  onSubmit: (options: any, json: any) => void;
}

interface IFormComponentState {
  service: {
    ports: string[];
    envs: object;
  };
}

class EditService extends PureComponent<IEditServiceProps & FormComponentProps, IFormComponentState> {
  state = {
    service: {},
    originName: null,
  };

  static getDerivedStateFromProps(nextProps: any, prevState: any) {
    if (!isEqual(nextProps.service, prevState.service)) {
      return {
        service: nextProps.service,
        originName: nextProps.service.name,
      };
    }
    return null;
  }

  render() {
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
    } = this.state.service;
    const { form, editing } = this.props;
    const { getFieldDecorator } = form;

    const nameField = getFieldDecorator('name', {
      initialValue: name,
      rules: [
        {
          required: true,
          message: i18n.t('application:please enter the service name'),
        },
      ],
    })(<Input disabled={!editing} placeholder={i18n.t('application:please enter the service name')} />);
    const _ports: any[] = [];
    map(ports, (p) => {
      if (typeof p !== 'object') {
        _ports.push({ port: p });
      } else {
        _ports.push(p);
      }
    });
    const portsField = getFieldDecorator('ports', {
      initialValue: _ports,
      rules: [
        {
          validator: portsValidator,
        },
      ],
    })(<PortsField disabled={!editing} />);

    let exposeField = getFieldDecorator('expose', {
      initialValue: expose,
    })(
      <ListInput
        disabled={!editing}
        type="number"
        label={i18n.t('application:please enter the exposed port')}
        placeholder={i18n.t('application:exposure port')}
      />,
    );
    if (!editing && (!expose || (expose && !expose.length))) {
      exposeField = null;
    }
    let hostsField = getFieldDecorator('hosts', {
      initialValue: hosts,
    })(<ListInput disabled={!editing} label={i18n.t('application:hosts mapping')} />);
    if (!editing && (!hosts || (hosts && !hosts.length))) {
      hostsField = null;
    }
    const resourceField = getFieldDecorator('resources', {
      initialValue: resources,
      rules: [
        {
          required: true,
          message: i18n.t('application:please select a resource'),
        },
        {
          validator: resourcesValidator,
        },
      ],
    })(<ResourceField disabled={!editing} placeholder={i18n.t('application:please select a resource')} />);
    const deploymentsField = getFieldDecorator('deployments', {
      initialValue: deployments,
    })(
      <DeploymentsField disabled={!editing} placeholder={i18n.t('application:please select a deployment strategy')} />,
    );

    let envsField = getFieldDecorator('envs', {
      initialValue: envs,
      rules: [
        {
          required: true,
          message: i18n.t('application:please enter an environment variable'),
        },
      ],
    })(
      <ObjectInput
        disabled={!editing}
        label={i18n.t('application:environment variable')}
        errorMessage={i18n.t('application:environment variables cannot be empty')}
      />,
    );

    if (!editing && (!envs || (envs && !Object.keys(envs).length))) {
      envsField = null;
    }
    let cmdField = getFieldDecorator('cmd', {
      initialValue: cmd,
    })(<Input disabled={!editing} placeholder={i18n.t('application:please enter the start command')} />);

    if (!editing && !cmd) {
      cmdField = null;
    }
    let bindsField = getFieldDecorator('binds', {
      initialValue: binds,
    })(
      <ListInput
        disabled={!editing}
        required={false}
        label={i18n.t('application:mounting')}
        placeholder={i18n.t('application:please enter the mount directory')}
      />,
    );
    if (!editing && (!binds || (binds && !binds.length))) {
      bindsField = null;
    }
    let healthCheckField = getFieldDecorator('health_check', {
      initialValue: health_check || {},
    })(<HealthCheckField disabled={!editing} />);

    if (!editing && (!health_check || (health_check && !Object.keys(health_check).length))) {
      healthCheckField = null;
    }
    // 未完成功能
    // const volumesField = getFieldDecorator('volumes', {
    //   initialValue: volumes,
    // })(<VolumesField required={false} label="持久化目录" placeholder="请输入文件目录" />);

    let imageField = getFieldDecorator('image', {
      initialValue: image,
    })(<Input disabled={!editing} placeholder={i18n.t('application:please enter the image name')} />);
    if (!editing && !image) {
      imageField = null;
    }
    return (
      <Form className="edit-service-container">
        <Item label={i18n.t('application:service name')}>{nameField}</Item>
        <Item>{portsField}</Item>
        <Item label={i18n.t('application:resources')}>{resourceField}</Item>
        <Item label={i18n.t('application:deployment strategy')}>{deploymentsField}</Item>
        {healthCheckField || editing ? (
          <Item label={i18n.t('application:health check')}>{healthCheckField}</Item>
        ) : null}
        {envsField || editing ? <Item>{envsField}</Item> : null}
        {exposeField || editing ? <Item>{exposeField}</Item> : null}
        {hostsField || editing ? <Item>{hostsField}</Item> : null}
        {bindsField || editing ? <Item>{bindsField}</Item> : null}
        {cmdField || editing ? <Item label={i18n.t('application:start command')}>{cmdField}</Item> : null}
        {imageField || editing ? <Item label={i18n.t('application:image name')}>{imageField}</Item> : null}
        {editing ? (
          <Button type="primary" ghost onClick={this.onSubmit}>
            {i18n.t('application:save')}
          </Button>
        ) : null}
      </Form>
    );
  }

  private onSubmit = () => {
    const { originName } = this.state;
    const { form, onSubmit, jsonContent } = this.props;
    form.validateFieldsAndScroll((error: any, values: any) => {
      if (!error) {
        const ports: any[] = [];
        map(values.ports, (p: any) => {
          if (p.port !== undefined) {
            ports.push(p.protocol ? p : p.port); // 如果没有配协议，就只存端口号
          }
        });
        onSubmit(
          {
            ...values,
            ports,
            originName,
          },
          jsonContent,
        );
      }
    });
  };
}

export default Form.create()(EditService);
