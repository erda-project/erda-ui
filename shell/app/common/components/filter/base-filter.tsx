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
import { Input } from 'antd';
import { Icon as CustomIcon } from 'common';
import FormBuilder from '../form-builder';
import { FormInstance, IFieldType } from 'core/common/interface';
import { throttle } from 'lodash';

export interface IFilterProps {
  className?: string;
  config: FilterItemConfig[];
  onSubmit?: (value: Object) => void;
  onReset?: (value: Object) => void;
  onFieldChange?: Function;
  actions?: React.ReactNode[] | null;
  style?: React.CSSProperties;
}

export interface FilterItemConfig extends IFieldType {
  format?: (props: React.ComponentProps<any>, value: { [name: string]: any }) => { [name: string]: any };
  name: string;
}

const { Fields } = FormBuilder;

const searchInput = (props) => {
  return <Input prefix={<CustomIcon type="search" />} {...props} />;
};

const Filter = React.forwardRef(
  (
    { config, onSubmit, onFieldChange, className }: IFilterProps,
    ref: React.Ref<{ form: FormInstance; search: () => void }>,
  ) => {
    const formRef = React.useRef<FormInstance>({} as FormInstance);

    React.useImperativeHandle(ref, () => ({
      form: formRef.current,
      search,
    }));

    const search = React.useCallback(() => {
      const { validateFields, scrollToField } = formRef.current;

      validateFields()
        .then((values: { [name: string]: any }) => {
          const formattedValue: { [name: string]: any } = {};
          config.forEach(({ name, format, customProps }) => {
            const curValue = values[name];
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
        .catch(({ errorFields }: { errorFields: Array<{ name: string[]; errors: string[] }> }) => {
          scrollToField(errorFields[0].name);
        });
    }, [onSubmit, config]);

    const handleValueChange = throttle(
      (_changedValue: { [name: string]: any }, allValues: { [name: string]: any }) => {
        const formattedValue: { [name: string]: any } = {};
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

    const itemFromConfig = (itemConfig: IFieldType) => {
      const { required = false, type } = itemConfig;
      return {
        ...itemConfig,
        type: type === Input ? searchInput : type,
        required,
        onFieldChange,
        onFieldEnter: search,
      };
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

export default Filter;
