/* eslint-disable no-param-reassign */
import React from 'react';
import {
  createSchemaField,
  Field as ReactField,
  observer,
  useField,
  useFieldSchema,
  RecursionField,
  FormProvider,
  connect,
  mapProps,
  Schema,
  FormConsumer,
} from '@formily/react';
import {
  createForm,
  Form as FormType,
  onFieldValueChange,
  onFormValuesChange,
  onFormInitialValuesChange,
  onFormMount,
  onFieldReact,
  FormPathPattern,
  Field,
  isField,
  FieldDataSource,
  registerValidateRules,
  ArrayField as ArrayFieldType,
  isArrayField,
  isObjectField,
} from '@formily/core';
import { action } from '@formily/reactive';
import {
  Form,
  FormItem,
  FormLayout,
  IFormLayoutProps,
  FormGrid,
  IFormGridProps,
  IFormStep,
  FormStep,
} from '@formily/antd';
import { createFields, createStepField, createTabsField, transformConfigRecursively } from './utils';
import type { CT, Field as XField } from './interface';
import classnames from 'classnames';
import { usePrefixCls } from '../_util/hooks';
import SelectTable from './select-table';
import ArrayTabs from './array-tabs';

// type IsUnion<T, U extends T = T> = (T extends any ? (U extends T ? false : true) : never) extends false ? false : true;

// type OnlyOneElementObj<T extends any = {}> = IsUnion<keyof T> extends false ? T : never;

export interface FormProps<T extends Obj = any> {
  fieldsConfig: XField[];
  form?: FormType<T>;
  layoutConfig?: IFormLayoutProps;
  gridConfig?: IFormGridProps;
  style?: React.CSSProperties;
  className?: string;
}

export const defaultLayoutConfig = {
  layout: 'vertical',
};

const ErdaForm = <T extends Obj>({ fieldsConfig, form, layoutConfig, style, gridConfig, className }: FormProps<T>) => {
  const componentMap = React.useRef(new Map<CT, string>());

  const [prefixCls] = usePrefixCls('form');

  const properties = React.useMemo(
    () => transformConfigRecursively(fieldsConfig, componentMap.current),
    [fieldsConfig],
  );

  const schemaConfig = {
    type: 'object',
    properties: {
      layout: {
        type: 'void',
        'x-component': 'FormLayout',
        'x-component-props': { ...defaultLayoutConfig, ...layoutConfig },
        properties: {
          grid: {
            type: 'void',
            'x-component': 'FormGrid',
            'x-component-props': {
              maxColumns: 1,
              ...gridConfig,
            },
            properties,
          },
        },
      },
    },
  };

  const components = Array.from(componentMap.current.entries()).reduce<Obj<CT>>(
    (main, [key, value]) => ({ ...main, [value]: key }),
    {},
  );

  const SchemaField = createSchemaField({
    components: { ...components, FormItem, FormLayout, FormGrid },
  });

  return (
    <FormProvider form={form!}>
      <Form style={style} className={classnames(`${prefixCls}`, className)} form={form!}>
        <SchemaField schema={schemaConfig} />
      </Form>
    </FormProvider>
  );
};

const takeAsyncDataSource = <T extends FieldDataSource>(
  pattern: FormPathPattern,
  service: (field: Field) => Promise<T>,
  dataSourceAttrName?: string,
) => {
  onFieldReact(pattern, (field) => {
    if (isField(field)) {
      field.loading = true;
      service(field).then(
        action.bound!((data: FieldDataSource) => {
          if (dataSourceAttrName) {
            field.componentProps[dataSourceAttrName] = data;
          }
          field.dataSource = data;
          field.componentProps._datasource = data;
          field.loading = false;
        }),
      );
    }
  });
};

export default ErdaForm;
ErdaForm.createForm = createForm;
ErdaForm.FormProvider = FormProvider;
ErdaForm.FormConsumer = FormConsumer;
ErdaForm.connect = connect;
ErdaForm.mapProps = mapProps;
ErdaForm.createFields = createFields;
ErdaForm.onFieldValueChange = onFieldValueChange;
ErdaForm.onFormValuesChange = onFormValuesChange;
ErdaForm.onFormInitialValuesChange = onFormInitialValuesChange;
ErdaForm.onFormMount = onFormMount;
ErdaForm.takeAsyncDataSource = takeAsyncDataSource;
ErdaForm.registerValidateRules = registerValidateRules;
ErdaForm.observer = observer;
ErdaForm.Field = ReactField;
ErdaForm.useField = useField;
ErdaForm.useFieldSchema = useFieldSchema;
ErdaForm.RecursionField = RecursionField;
ErdaForm.SelectTable = SelectTable;
ErdaForm.createTabsField = createTabsField;
ErdaForm.isField = isField;
ErdaForm.isArrayField = isArrayField;
ErdaForm.isObjectField = isObjectField;
ErdaForm.ArrayTabs = ArrayTabs;
ErdaForm.createStepField = createStepField;
ErdaForm.createFormStep = FormStep.createFormStep;

export type {
  FormType,
  Field,
  IFormLayoutProps,
  ArrayFieldType,
  IFormGridProps,
  FormLayout,
  FormGrid,
  IFormStep,
  Schema,
};
