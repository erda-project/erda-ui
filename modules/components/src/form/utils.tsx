import React from 'react';
import { FormStep, FormTab, IFormGridProps, IFormLayoutProps, IFormStepProps, IFormTabProps } from '@formily/antd';
import { map, reduce, uniqueId } from 'lodash';
import { defaultLayoutConfig } from '.';
import { connect, mapProps } from '@formily/react';
import { CheckType, CT, Field, SchemaField } from './interface';
import { StepProps } from 'antd/lib/steps';
import ErdaIcon from '../icon';
import { usePrefixCls } from '../_util/hooks';

export const createFields: CheckType = (fieldList: any) => fieldList;

export const createTabsField = ({
  tabs,
  customProps,
  name,
}: {
  name: string;
  tabs: Array<{ tab: string; fields: Field[] }>;
  customProps: IFormTabProps;
}): Field => {
  const tabsProperties: Field[] = (tabs ?? []).map((tabItem) => {
    const { tab, fields } = tabItem;
    return {
      type: 'void',
      component: FormTab.TabPane,
      componentName: 'ErdaTabPane',
      name: tab,
      customProps: {
        tab,
      },
      properties: fields,
    };
  }, []);
  const result = {
    type: 'void',
    component: FormTab,
    name,
    customProps: {
      ...customProps,
      formTab: FormTab.createFormTab!(),
    },
    noPropertyLayoutWrapper: true,
    properties: tabsProperties,
  };
  return result;
};

export interface ErdaStepField {
  stepName: string;
  gridConfig?: IFormGridProps;
  layoutConfig?: IFormLayoutProps;
  customProps?: StepProps;
  fields: Field[];
}

const statusRender = {
  process: (index: number, prefixCls: string) => <div className={`${prefixCls} process`}>{index + 1}</div>,
  wait: (index: number, prefixCls: string) => <div className={`${prefixCls} wait`}>{index + 1}</div>,
  finish: (_index: number, prefixCls: string) => (
    <div className={`${prefixCls} finish`}>
      <ErdaIcon type="check" size="16" />
    </div>
  ),
};
const ErdaStepDot = (props: { status: 'wait' | 'process' | 'finish'; index: number }) => {
  const { status, index } = props;
  const [prefixCls] = usePrefixCls('form-step-dot');
  return statusRender[status](index, prefixCls);
};

const customDot = (_: unknown, { status, index }: { status: 'wait' | 'process' | 'finish'; index: number }) => {
  return <ErdaStepDot status={status} index={index} />;
};

export const createStepField = (
  params: ErdaStepField[],
  customProps: IFormStepProps & Required<Pick<IFormStepProps, 'formStep'>> & { name: string },
): Field => {
  const stepProperties = (params ?? []).map(
    ({ stepName, gridConfig, layoutConfig, customProps: _subCustomProps, fields }) => {
      return {
        type: 'void',
        component: FormStep.StepPane,
        componentName: 'ErdaStepPane',
        name: stepName,
        customProps: _subCustomProps,
        gridConfig,
        layoutConfig,
        properties: fields,
      };
    },
  );

  const { name, ...restProps } = customProps;

  const result = {
    type: 'void',
    component: FormStep,
    componentName: 'ErdaFormStep',
    name,
    customProps: { progressDot: customDot, ...restProps },
    properties: stepProperties,
    noPropertyLayoutWrapper: true,
  };
  return result;
};

export const transformConfigRecursively = (fieldsConfig: Field[], componentMap: Map<CT, string>) => {
  const propertiesArray: SchemaField[] = map(fieldsConfig, (item) => {
    const {
      name,
      title,
      label,
      type = 'string',
      customProps,
      wrapperProps,
      defaultValue,
      component,
      required,
      validator,
      items,
      gridConfig,
      layoutConfig,
      display,
      valuePropName,
      noPropertyLayoutWrapper = false,
      componentName: _componentName,
      properties: fieldProperties,
    } = item;

    let componentName = '';
    if (componentMap.has(component)) {
      componentName = componentMap.get(component)!;
    } else {
      componentName = _componentName ?? uniqueId('component-');
      if (valuePropName) {
        componentMap.set(connect(component, mapProps({ value: valuePropName })), componentName);
      } else {
        componentMap.set(component, componentName);
      }
    }

    let _items = {}; // for array fields
    if (items) {
      const _properties = transformConfigRecursively(items, componentMap);
      _items = {
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
                  maxColumns: gridConfig?.minColumns ? gridConfig.minColumns : 1,
                  ...gridConfig,
                },
                properties: _properties,
              },
            },
          },
        },
      };
    }

    let _properties;
    if (fieldProperties) {
      _properties = transformConfigRecursively(fieldProperties, componentMap);
      if (!noPropertyLayoutWrapper) {
        _properties = {
          layout: {
            type: 'void',
            'x-component': 'FormLayout',
            'x-component-props': { ...defaultLayoutConfig, ...layoutConfig },
            properties: {
              grid: {
                type: 'void',
                'x-component': 'FormGrid',
                'x-component-props': {
                  maxColumns: gridConfig?.minColumns ? gridConfig.minColumns : 1,
                  ...gridConfig,
                },
                properties: _properties,
              },
            },
          },
        };
      }
    }

    return {
      name,
      title: title ?? label,
      type,
      required,
      items: _properties ? undefined : _items,
      default: defaultValue,
      'x-validator': validator,
      'x-decorator': _properties ? undefined : 'FormItem',
      'x-component': componentName,
      'x-component-props': customProps,
      'x-display': display,
      'x-decorator-props': _properties ? { ...wrapperProps } : { colon: false, ...wrapperProps },
      properties: _properties,
    };
  });

  const properties = reduce(
    propertiesArray,
    (acc, item) => {
      const { name, ...rest } = item;
      acc[name] = rest;
      return acc;
    },
    {} as Obj<Omit<SchemaField, 'name'>>,
  );
  return properties as Obj<Omit<SchemaField, 'name'>>;
};
