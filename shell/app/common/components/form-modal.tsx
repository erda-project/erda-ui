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

import { isEmpty, pick, isFunction, get, set } from 'lodash';
import i18n from 'i18n';
import React from 'react';
import { Modal, Form, Button, Spin, Alert } from 'app/nusi';
import { RenderPureForm } from 'common';
import { isPromise } from 'common/utils';
import { WrappedFormUtils } from 'core/common/interface';
import { IFormItem } from './render-formItem';
import moment from 'moment';

const noop = () => { };

interface IProps {
  visible: boolean;
  form: WrappedFormUtils;
  formData?: object;
  fieldsList?: IFormItem[] | ((form: WrappedFormUtils, isEdit: boolean) => IFormItem[]);
  title?: string;
  name?: string;
  width?: number | string;
  PureForm?: typeof React.Component | Function;
  formRef?: any;
  formProps?: object;
  loading?: boolean;
  tip?: string;
  okButtonState?: boolean;
  keepValue?: boolean; // 校验不通过时是否保留数据
  modalProps?: {
    [propName: string]: any;
  };
  alertProps?: { [propName: string]: any; };
  customRender?(content: JSX.Element): JSX.Element;
  onOk?(result: object, isAddMode: boolean): PromiseLike<object> | void;
  onCancel?(): void;
  beforeSubmit?(formValues: object, form?: WrappedFormUtils): void;
}

interface IState {
  confirmLoading: boolean;
}
class FormModalComp extends React.Component<IProps, IState> {
  state = {
    confirmLoading: false,
  };

  /** 是否是添加模式 */
  private isAddMode: boolean;

  componentDidUpdate(prevProps : IProps) {
    const { visible, form, formData, fieldsList, formRef } = this.props;
    if ((visible && !prevProps.visible) || formData !== this.props.formData) {
      this.isAddMode = isEmpty(formData);
      if (this.isAddMode) {
        form.resetFields();
      } else {
        setTimeout(() => {
          if (fieldsList) {
            const _list = typeof fieldsList === 'function' ? fieldsList(form, !this.isAddMode) : fieldsList;
            const pureData = {};
            _list.forEach(f => {
              if (f.name && formData) {
                const fieldData = get(formData, f.name);
                if (f.type === 'datePicker' && typeof fieldData === 'string') { // 日期类型 value 不能传 string
                  set(pureData, f.name, moment(fieldData));
                } else {
                  set(pureData, f.name, fieldData);
                }
              }
            });
            form.setFieldsValue(pureData);
          } else {
            // 通过传入的formRef来获取fieldsStore，否则setFieldsValue报错
            form.setFieldsValue(pick(formData, Object.keys(formRef.fieldsStore.fieldsMeta)));
          }
        }, 0);
      }
    }
  }

  submit = (onOk: Function, checkedValues: object, _: any, resolve: Function) => {
    const submitResult = onOk(checkedValues, this.isAddMode);

    if (submitResult && isPromise(submitResult)) {
      this.setState({ confirmLoading: true });
      submitResult.then(() => {
        this.setState({ confirmLoading: false });
        resolve();
      }).catch(() => {
        this.setState({ confirmLoading: false });
      });
    } else {
      resolve();
    }
  };

  handleOk = () => {
    const { form, onOk, beforeSubmit, keepValue = false } = this.props;
    return new Promise((resolve, reject) => {
      form.validateFieldsAndScroll((errors, values) => {
        if (errors) {
          return reject(errors);
        }

        let submitValue = values;
        if (beforeSubmit) {
          submitValue = beforeSubmit(values, form);
          if (isPromise(submitValue)) { // 当需要在提交前做后端检查且不能清除表单域的情况下，可以在beforeSubmit返回promise，通过then结果判定是否真实提交
            return submitValue.then((checkedValues: any) => {
              if (checkedValues === null) {
                return resolve();
              }
              onOk && this.submit(onOk, checkedValues, form, resolve);
            });
          } else if (submitValue === null) {
            return resolve();
          }
        }
        onOk && this.submit(onOk, submitValue, form, resolve);
      });
    }).then(() => !keepValue && form.resetFields());
  };

  handleCancel = () => {
    (this.props.onCancel || noop)();
    // 当点击取消时，modal还未完全关闭时就已经被重置成初始值，加入setTimeout异步重置
    setTimeout(() => {
      this.props.form.resetFields();
    });
  };

  render() {
    const { loading = false, tip, visible, title, okButtonState = false, name = '', width, onOk, onCancel, PureForm = noop, fieldsList, formProps = {}, modalProps = {}, alertProps = {}, ...rest } = this.props;
    const { confirmLoading } = this.state;
    const modalTitle = title || (this.isAddMode ? i18n.t('add {name}', { name }) : i18n.t('edit {name}', { name }));
    if (width) {
      modalProps.width = width;
    } else {
      modalProps.width = 600;
    }
    let content = null;
    if (fieldsList) {
      const _list = typeof fieldsList === 'function' ? fieldsList(rest.form, !this.isAddMode) : fieldsList;
      content = <RenderPureForm layout="vertical" list={_list} {...formProps} {...rest} />;
    } else {
      content = <PureForm mode={this.isAddMode ? 'add' : 'edit'} layout="vertical" {...rest} />;
    }

    return (
      <Modal
        title={modalTitle}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        footer={[
          onCancel
            ? (
              <Button key="back" onClick={this.handleCancel}>
                {i18n.t('cancel')}
              </Button>
            )
            : null,
          onOk
            ? (
              <Button key="submit" type="primary" disabled={okButtonState} loading={confirmLoading} onClick={this.handleOk}>
                {i18n.t('ok')}
              </Button>
            )
            : null,
        ]}
        {...modalProps}
      >
        {!isEmpty(alertProps) && alertProps.message && <Alert message={alertProps.message} {...alertProps} />}
        <Spin spinning={loading} tip={tip}>
          {isFunction(rest.customRender) ? rest.customRender(content) : content}
          {rest.children}
        </Spin>
      </Modal>
    );
  }
}

const PureFormModal = Form.create()(FormModalComp);

/**
 * 表单弹窗组件
  @usage
  ```
    <FormModal
      width='700px'
      name='项目'
      visible={modalVisible}
      onOk={this.createProject} // 不传时不渲染确定按钮
      onCancel={this.toggleModal} // 不传时不渲染取消按钮
      fieldsList={fieldsList} // pass a field list
      PureForm={ProjectForm}  // or a pure form
      modalProps={}
      formProps={}
      beforeSubmit={data => adjustOrCheckData(data)}
    />
  ```
  @description
 * 注意：PureForm必须是 未经 Form.Create()包裹的组件，推荐内部用RenderPureForm组件
 * 如果传了fieldsList数组，则默认使用 RenderPureForm 进行表单渲染，并使用formRef进行初始化设置值
 *
 * 内部组件可从 mode 属性获得当前模式: 'add' | 'edit'
 * 可通过beforeSubmit方法进行提交前的数据调整或检查，若返回null则不会提交
 */
export const FormModal = (props: any) => {
  const formRef = React.useRef(null);
  // 将formRef传递至组件内部，为的是当使用PureForm的时候，可以得到fieldsStore来setFieldsValues，故使用FormModal时，要注意ref得到的和预期的不一样
  return (
    <PureFormModal {...props} ref={formRef} formRef={formRef.current} />
  );
};
