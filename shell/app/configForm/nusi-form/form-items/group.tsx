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
import { Icon as CustomIcon } from 'common';
import classnames from 'classnames';
import './group.scss';

const FormGroupComp = (p: any) => {
  const { fieldConfig, children } = p || {};
  const { key, componentProps } = fieldConfig || {};
  const {
    title,
    showDivider,
    indentation,
    expandable = false,
    defaultExpand = false,
    direction = 'column',
  } = componentProps || {};
  const [expandStatus, setExpandStatus] = React.useState(defaultExpand);
  const curShowDivider = expandable || showDivider;

  const cls = classnames({
    'border-bottom': curShowDivider,
    pointer: expandable,
    'hover-active-bg': expandable,
  });

  const onClick = () => {
    if (expandable) {
      setExpandStatus(!expandStatus);
    }
  };

  return (
    <div className={`dice-form-group my12 ${expandable && !expandStatus ? 'hide-children' : ''}`}>
      <div className={`dice-form-group-title fz14 bold py4 px2 flex-box ${cls}`} onClick={onClick}>
        <span>{title || key}</span>
        {expandable ? <CustomIcon type="chevron-down" className="expand-icon" /> : null}
      </div>
      <div
        className={`dice-form-group-children ${indentation ? 'pl16' : ''} ${
          direction === 'row' ? 'dice-form-group-children-row' : ''
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export const FormGroup = () => React.memo((p: any) => <FormGroupComp {...p} />);

export const config = {
  name: 'formGroup',
  Component: FormGroup, // ???React?????????props????????????value???onChange
};

export const formConfig = {
  formGroup: {
    name: '?????????',
    value: 'formGroup',
    fieldConfig: {
      componentProps: {
        key: 'componentProps',
        name: '????????????',
        fields: [
          {
            label: '?????????key',
            key: 'key',
            type: 'input',
            component: 'input',
            labelTip: '????????????',
            disabled: true,
          },
          {
            label: '?????????',
            key: 'componentProps.title',
            type: 'input',
            component: 'input',
            componentProps: {
              placeholder: '??????????????????',
            },
          },
          {
            label: '?????????????????????',
            key: 'componentProps.showDivider',
            type: 'switch',
            component: 'switch',
          },
          {
            label: '?????????????????????',
            key: 'componentProps.indentation',
            type: 'switch',
            component: 'switch',
          },
          {
            label: '???????????????',
            key: 'componentProps.expandable',
            type: 'switch',
            component: 'switch',
            defaultValue: false,
          },
          {
            label: '????????????',
            key: 'componentProps.defaultExpand',
            type: 'switch',
            component: 'switch',
            defaultValue: false,
          },
        ],
      },
    },
  },
};
