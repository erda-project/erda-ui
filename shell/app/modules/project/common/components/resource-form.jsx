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

import React, { PureComponent } from 'react';
import { RenderForm } from 'common';

export default class ResourceForm extends PureComponent {
  callFormFn = (fn, ...args) => this.form[fn](...args);

  render() {
    const { service, editDisabled, ...rest } = this.props;
    const realPattern = /^(\+?[1-9][0-9]*|[0-9]+\.\d+)$/;

    const { resources = {} } = service;
    const resourceFormList = [
      {
        label: 'CPU',
        name: 'cpu',
        type: 'inputNumber',
        pattern: realPattern,
        initialValue: resources.cpu,
        itemProps: { step: 0.01, min: 0.01 },
        formItemLayout: {
          labelCol: {
            sm: { span: 24 },
            md: { span: 10 },
            lg: { span: 12 },
          },
          wrapperCol: {
            sm: { span: 24 },
            md: { span: 14 }, // 12
            lg: { span: 12 },
          },
        },
      }, {
        label: 'Memory(MB)',
        name: 'mem',
        type: 'inputNumber',
        pattern: realPattern,
        initialValue: resources.mem,
        itemProps: { min: 1 },
        formItemLayout: {
          labelCol: {
            sm: { span: 24 },
            md: { span: 14 },
            lg: { span: 14 },
          },
          wrapperCol: {
            sm: { span: 24 },
            md: { span: 10 },
            lg: { span: 10 },
          },
        },
      }, {
        label: 'Disk(MB)',
        name: 'disk',
        type: 'inputNumber',
        pattern: /^(\+?[0-9]*|[0-9]+\.\d+)$/,
        initialValue: resources.disk,
        itemProps: { min: 0 },
        formItemLayout: {
          labelCol: {
            sm: { span: 24 },
            md: { span: 12 },
            lg: { span: 12 },
          },
          wrapperCol: {
            sm: { span: 24 },
            md: { span: 12 },
            lg: { span: 12 },
          },
        },
      }, {
        label: 'Scale',
        name: 'replicas',
        type: 'inputNumber',
        pattern: /^\d+$/,
        initialValue: service.deployments.replicas,
        itemProps: { min: 0, max: 20 },
        formItemLayout: {
          labelCol: {
            sm: { span: 24 },
            md: { span: 10 },
            lg: { span: 12 },
          },
          wrapperCol: {
            sm: { span: 24 },
            md: { span: 14 },
            lg: { span: 12 },
          },
        },
      },
    ];


    return (
      <RenderForm
        className={`resource-form ${editDisabled ? 'disabled' : ''}`}
        layout="inline"
        list={resourceFormList}
        ref={(ref) => { this.form = ref; }}
        {...rest}
      />
    );
  }
}
