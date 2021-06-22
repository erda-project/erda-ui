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
import i18n from 'i18n';
import { Button, Form as NForm } from 'app/nusi';
import { getLabel, noop } from 'app/configForm/nusi-form/form-items/common';

const FormItem = NForm.Item;

export default ({ loading }: any) =>
  React.memo(({ fieldConfig }: any) => {
    const { visible, valid, componentProps, required, wrapperProps, label, labelTip } = fieldConfig;
    return (
      <FormItem
        colon
        label={getLabel(label, labelTip)}
        className={visible ? '' : 'hidden'}
        validateStatus={valid[0]}
        help={valid[1]}
        required={required}
        {...wrapperProps}
      >
        <Button loading={loading} type="primary" ghost onClick={() => (componentProps.onChange || noop)()}>
          {i18n.t('analyze')}
        </Button>
      </FormItem>
    );
  });
