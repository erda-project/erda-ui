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
import { KeyValueEditor } from 'common';
import i18n from 'i18n';
import { Modal, Row, Col, Form, Input } from 'app/nusi';
import { WrappedFormUtils } from 'core/common/interface';
import middlewareDashboardStore from 'dataCenter/stores/middleware-dashboard';
import './modal.scss';

type IObj = { [k: string]: any };

interface IProps {
  form: WrappedFormUtils;
  formData: Merge<MIDDLEWARE_DASHBOARD.IMiddleBase, { name: string }>;
  dataSource?: IObj
  visible: boolean;
  onCancel(): void;
  afterSubmit?(): void;
}

const { Item: FormItem } = Form;

const UpgradeModal = ({ formData, visible, form, onCancel, afterSubmit, dataSource }: IProps) => {
  const [data, setData] = React.useState({});
  const editor = React.useRef(null as any);
  React.useEffect(() => {
    if (visible) {
      if (!dataSource) {
        middlewareDashboardStore.effects.getConfig(formData).then(res => {
          setData(res.config || {});
        });
      } else {
        setData(dataSource as IObj);
      }
    }
    return () => {
      setData({});
    };
  }, [visible, dataSource, formData]);
  const handleOk = () => {
    form.validateFields((err) => {
      if (err) {
        return;
      }
      const config = editor.current.getEditData();
      const payload = {
        ...formData,
        config,
      };
      middlewareDashboardStore.effects.submitConfig(payload).then(() => {
        onCancel();
        afterSubmit && afterSubmit();
      });
    });
  };
  return (
    <Modal
      width={960}
      visible={visible}
      title={i18n.t('default:configure upgrade')}
      destroyOnClose
      className="middleware-op-modal"
      onOk={handleOk}
      onCancel={onCancel}
    >
      <Row gutter={[80, 0]}>
        <Col span={12}>
          <FormItem
            label={i18n.t('default:name')}
            required
          >
            {
              form.getFieldDecorator('name', {
                initialValue: formData.name,
              })(
                <Input disabled />
              )
            }
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <KeyValueEditor
            dataSource={data}
            form={form}
            ref={editor}
            maxLength={2018}
          />
        </Col>
      </Row>
    </Modal>
  );
};

export default Form.create()(UpgradeModal) as any as (p: Omit<IProps, 'form'>) => JSX.Element;
