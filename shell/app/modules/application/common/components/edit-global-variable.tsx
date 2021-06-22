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
import { Form, Button } from 'app/nusi';
import { cloneDeep, forEach, findIndex, uniqueId } from 'lodash';
import VariableInputGroup from './variable-input-group';
import i18n from 'i18n';
import { Plus as IconPlus } from '@icon-park/react';

const { Item } = Form;

interface IEditGlobalVariableProps {
  globalVariable: any;
  editing: boolean;
  onSubmit: (globalVariable: any) => void;
}

const convertGlobalVariableList = (globalVariable: any) => {
  const list: any[] = [];
  forEach(globalVariable, (value: any, key: string) => {
    list.push({
      key,
      value,
    });
  });

  return list;
};

class EditGlobalVariable extends PureComponent<IEditGlobalVariableProps & FormComponentProps, any> {
  state = {
    globalVariableList: [],
  };

  UNSAFE_componentWillMount(): void {
    const list = convertGlobalVariableList(this.props.globalVariable);
    this.setState({
      globalVariableList: list.map((i: any) => ({
        ...i,
        id: uniqueId('var-'),
      })),
    });
  }

  render() {
    const { globalVariableList } = this.state;
    const { form, editing } = this.props;
    const { getFieldDecorator } = form;

    const content = globalVariableList.map((item: any) => {
      const input = getFieldDecorator(item.id, {
        initialValue: item,
        rules: [
          {
            required: true,
            message: i18n.t('application:environment variables cannot be empty'),
          },
        ],
      })(<VariableInputGroup lock={false} disabled={!editing} onDelete={this.deleteVariable} />);
      return (
        <Item className="mr-0" key={item.key}>
          {input}
        </Item>
      );
    });

    return (
      <Form className="global-input-form" layout="inline">
        <div className="global-input-form-title">
          {i18n.t('application:global environment variable')}
          {editing ? <IconPlus className="variable-icon pointer" onClick={this.addNewVariable} /> : null}
        </div>
        {content}
        <div className="mt-3">
          {editing ? (
            <Button type="primary" ghost onClick={this.onSubmit}>
              {i18n.t('application:save')}
            </Button>
          ) : null}
        </div>
      </Form>
    );
  }

  private deleteVariable = (key: string) => {
    const { globalVariableList } = this.state;

    const index = findIndex(globalVariableList, (item: any) => item.key === key);
    globalVariableList.splice(index, 1);

    this.setState({
      globalVariableList: cloneDeep(globalVariableList),
    });
  };

  private onSubmit = () => {
    const { form, onSubmit } = this.props;

    form.validateFieldsAndScroll((err: any, values: any) => {
      if (!err) {
        const object = {};
        forEach(values, (item: any, originKey: string) => {
          if (item.key !== '') {
            object[item.key] = item.value;
          } else {
            form.setFields({
              [originKey]: {
                value: item,
                errors: [new Error(i18n.t('application:environment variables cannot be empty'))],
              },
            });
          }
        });
        onSubmit(object);
      }
    });
  };

  private addNewVariable = () => {
    const { globalVariableList } = this.state;

    globalVariableList.push({
      id: uniqueId('var-'),
      key: 'key',
      value: 'value',
    });
    this.setState({
      globalVariableList: cloneDeep(globalVariableList),
    });
  };
}

export default Form.create()(EditGlobalVariable);
