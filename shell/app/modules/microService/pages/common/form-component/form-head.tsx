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
import { Button } from 'nusi';
import classnames from 'classnames';

// export interface IGroupHead {
//   mode?: string
//   title?: string
//   size?: string
//   onClick: React.MouseEventHandler<HTMLButtonElement>
//   btnText?: string
//   formProps?: any
//   components: any
// }

export default ({ mode, title, size, btnText, onClick, formProps, components }: any) => {
  const hasBtn = mode !== 'detail' && !!btnText;
  const smallSize = hasBtn || size === 'small';

  let formItemEle = null;
  if (formProps) {
    const { FormItem } = components;
    formItemEle = <FormItem _config={formProps} />;
  }

  return (
    <div className={classnames('group-head', { 'bottom-border': !smallSize })}>
      {title && (
        <h3 className={classnames('group-head-h3', { 'sub-title': smallSize })}>{title}</h3>
      )}
      {formItemEle}
      {hasBtn && (
        <Button onClick={onClick}>{btnText}</Button>
      )}
    </div>
  );
};
