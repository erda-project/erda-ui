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
import FormBuilder from '../form-builder';
import { FormInstance } from '../../interface';
import { throttle } from 'lodash';

export interface IFilterProps {
  className?: string;
  config: FilterItemConfig[];
  onSubmit?: (value: Object) => void;
  onReset?: (value: Object) => void;
  onFieldChange?: Function;
  onRef?: any;
  actions?: React.ReactNode[] | null;
  style?: React.CSSProperties;
}

export interface FilterItemConfig {
  required?: boolean;
  validator?: any[];
  type: React.ComponentType<any>;
  collapseRender?: (props: any, value: any) => string | string[];
  format?: (props: any, value: any) => any;
  customProps?: Object;
  label?: string;
  name: string;
  keepInitialValue?: boolean;
  [prop: string]: any;
}

const { Fields } = FormBuilder;

export const Filter = React.forwardRef(
  (
    { config, onSubmit, onFieldChange, className }: IFilterProps,
    ref: React.Ref<{ form: FormInstance; search: () => void }>,
  ) => {
    const formRef = React.useRef<FormInstance>({} as FormInstance);

    React.useImperativeHandle(ref, () => ({
      form: formRef.current,
      search,
    }));

    // 搜索
    const search = React.useCallback(() => {
      const { validateFields, scrollToField } = formRef.current;

      validateFields()
        .then((values: any) => {
          const formattedValue: any = {};
          config.forEach(({ name, format, customProps }) => {
            const curValue = values?.[name];
            if (format && curValue) {
              formattedValue[name] = format(customProps, curValue);
            } else {
              formattedValue[name] = curValue;
            }
          });
          if (onSubmit) {
            onSubmit(formattedValue);
          }
        })
        .catch(({ errorFields }: { errorFields: Array<{ name: any[]; errors: any[] }> }) => {
          scrollToField(errorFields[0].name);
        });
    }, [onSubmit, config]);

    const handleValueChange = throttle(
      (_changedValue: any, allValues: any) => {
        const formattedValue: any = {};
        config.forEach(({ name, format, customProps }) => {
          const curValue = allValues?.[name];
          if (format && curValue) {
            formattedValue[name] = format(customProps, curValue);
          } else {
            formattedValue[name] = curValue;
          }
        });
        onSubmit?.(formattedValue);
      },
      500,
      { leading: false },
    );

    const itemFromConfig = (itemConfig: FilterItemConfig) => {
      const { required = false } = itemConfig;
      return { ...itemConfig, required, onFieldChange, onFieldEnter: search };
    };

    return (
      <div className="erda-filter">
        <FormBuilder
          ref={formRef}
          className={className}
          onSubmit={search}
          onValuesChange={handleValueChange}
          size="small"
          layout="horizontal"
          isMultiColumn
        >
          <Fields fields={config.map(itemFromConfig)} />
        </FormBuilder>
      </div>
    );
  },
);
