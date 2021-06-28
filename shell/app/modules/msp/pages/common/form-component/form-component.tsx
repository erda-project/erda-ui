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
import { Button, message } from 'app/nusi';
import { isEmpty, isPlainObject } from 'lodash';
import i18n from 'i18n';

export const FormFooter = (props: any) => {
  const { router, onSubmit, onValidate } = props;

  return (
    <div className="form-hoc-fotter">
      <Button size="large" onClick={router.goBack}>
        {i18n.t('msp:cancel')}
      </Button>
      <Button
        size="large"
        className="ml8"
        onClick={(e: any) => {
          e.preventDefault();
          onValidate()
            .then(onSubmit)
            .then((data: any) => {
              const isSuccess = isPlainObject(data) ? !isEmpty(data) : !!data;
              if (isSuccess) {
                const status = i18n.t('msp:operated successfully');
                message.success(status);
                router.goBack();
              }
            });
        }}
      >
        {i18n.t('msp:determine')}
      </Button>
    </div>
  );
};

export const FormList = (props: any): any => {
  const { size, children } = props;

  return Array.from({ length: size }).map((_: any, i: number) => {
    return React.cloneElement(children(i), { key: String(i) });
  });
};

export const TopButton = ({ type = 'primary', text = i18n.t('msp:edit'), onClick, onDelete }: any) => {
  return (
    <div className="top-button-group repo-clone-btn">
      {onDelete && (
        <Button onClick={onDelete} className="mr8">
          {i18n.t('msp:delete')}
        </Button>
      )}
      <Button type={type} onClick={onClick}>
        {text}
      </Button>
    </div>
  );
};
