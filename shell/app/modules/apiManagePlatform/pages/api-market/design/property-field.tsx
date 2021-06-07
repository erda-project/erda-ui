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
import { Checkbox, Radio, Tooltip, Input, Select, InputNumber } from 'app/nusi';
import i18n from 'i18n';
import { useUpdate, FileEditor, Icon as CustomIcon } from 'common';
import { map, isEmpty } from 'lodash';
import { CustomLabel } from 'dcos/common/custom-label';

import { regRules } from 'common/utils';
import {
  BASE_DATA_TYPE, NUMBER_TYPE_MAP, REQUIRED_OPTIONS, API_PROPERTY_REQUIRED, API_MEDIA,
  RADIO_OPTIONS, DATATYPE_EXAMPLE_MAP, API_FORM_KEY,
  INPUT_MAX_LENGTH, TEXTAREA_MAX_LENGTH, DEFAULT_NUMBER_PROPS, API_MEDIA_TYPE, DEFAULT_LENGTH_PROPS } from 'app/modules/apiManagePlatform/configs.ts';

const { Option } = Select;
const numberTypeOptions = map(NUMBER_TYPE_MAP, (item) => (
  <Option key={item} value={item}>{item.slice(0, 1).toUpperCase() + item.slice(1)}</Option>));

export const RadioGroup = React.forwardRef((radioProps: {
  options: Array<{name: string; value: string}>;
  value: string;
  disabled?: boolean;
  onChange: (e: any) => void;
}) => {
  const { options, onChange, value, disabled } = radioProps;

  return (
    <Radio.Group buttonStyle="solid" size="small" value={value} onChange={onChange} disabled={disabled}>
      { options.map(({ value: v, name }) => <Radio.Button key={v} value={v}>{name}</Radio.Button>) }
    </Radio.Group>
  );
});

const DetailBtn = (detailBtnProps: {
  visible: boolean;
  onChange: (v: boolean) => void;
}) => {
  const { visible, onChange } = detailBtnProps;
  return (
    <Tooltip title={i18n.t('detail')}>
      <CustomIcon
        type={visible ? 'chevron-up' : 'chevron-down'}
        className="pointer mt8"
        style={{ width: 'auto' }}
        onClick={() => {
          onChange(!visible);
        }}
      />
    </Tooltip>
  );
};

// 枚举值
export const EnumRef = React.forwardRef((enumProps: {
  value: string[];
  dataType: BASE_DATA_TYPE;
  hideCheckBox?: boolean;
  disabled?: boolean;
  onChange: (v?: string[] | null) => void;
}) => {
  const [{
    enumVisible,
  }, updater] = useUpdate({
    enumVisible: false,
  });

  const { onChange, disabled = false, dataType, ...restProps } = enumProps;

  React.useEffect(() => {
    if (enumProps?.value && enumProps?.value.length) {
      updater.enumVisible(true);
    }
  }, [enumProps, updater]);

  const onCheckHandle = React.useCallback((e) => {
    const checkState = e.target.checked;
    updater.enumVisible(checkState);
    if (!checkState) {
      onChange(null);
    }
  }, [onChange, updater]);

  const onChangeHandle = (values: any[]) => {
    const enumValues = !isEmpty(values) ? map(values, (item) => {
      return dataType === BASE_DATA_TYPE.number ? (Number(item) || 0) : item;
    }) : undefined;
    onChange(enumValues);
  };

  const isEnumExist = React.useMemo(() => (enumProps?.value && enumProps?.value?.length), [enumProps]);
  const showAddBtn = React.useMemo(() => (enumVisible || isEnumExist), [enumVisible, isEnumExist]);

  return (
    <div className="flex-box flex-start">
      {
        disabled
          ? (
            <div>
              <span className="mr8">{i18n.t('project:enumerated value')}: </span>
              {isEnumExist && map(enumProps?.value, (item) => <span className="tag-default">{item}</span>)}
            </div>
          )
          :
          (
            <>
              {
                !restProps?.hideCheckBox && (
                <Checkbox disabled={disabled} checked={enumVisible} onChange={onCheckHandle} >{i18n.t('project:enumerated value')} </Checkbox>
                )
              }
              {showAddBtn && (
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  <CustomLabel
                    value={enumProps?.value || []}
                    onChange={onChangeHandle}
                    labelName={i18n.t('project:add enum value')}
                  />
                </div>
              )}
            </>
          )
      }
    </div>
  );
});

// object类型的example展示
export const ApiFileEditor = React.forwardRef((fileEditorProps: {value: any}) => {
  const { value } = fileEditorProps;
  const _value = value ? JSON.stringify(value, null, 2) : JSON.stringify({}, null, 2);
  return <FileEditor {...fileEditorProps} fileExtension="json" value={_value} />;
});

/** ------boolean 的配置项-------------------------------*/
// boolean 默认值
export const booleanDefaultValueField = {
  type: RadioGroup,
  label: i18n.t('default value'),
  name: 'default',
  colSpan: 6,
  required: false,
  customProps: {
    options: RADIO_OPTIONS,
  },
};

// boolean 示例
export const booleanExampleField = {
  type: RadioGroup,
  label: i18n.t('project:example'),
  name: 'example',
  colSpan: 6,
  required: false,
  initialValue: true,
  customProps: {
    options: RADIO_OPTIONS,
  },
};

/** ------string 的配置项-------------------------------*/
// string 规则
export const stringPatternField = {
  type: Input,
  label: i18n.t('project:validation rules'),
  name: 'pattern',
  required: false,
  colSpan: 8,
  customProps: {
    maxLength: INPUT_MAX_LENGTH,
  },
};

// string 最小长度
export const stringMinLengthField = (dataTempStorage: Obj) => {
  return {
    type: InputNumber,
    label: i18n.t('project:minimum length'),
    name: 'minLength',
    colSpan: 8,
    required: false,
    customProps: {
      className: 'full-width',
      precision: 0,
      ...DEFAULT_LENGTH_PROPS,
    },
    validator: [
      {
        validator: (_rule: any, value: number, callback: (msg?: string) => void) => {
          const maxLength = dataTempStorage?.maxLength;
          if (maxLength === undefined || maxLength >= value) {
            callback();
          } else {
            callback(i18n.t('project:the minimum value must be less than or equal to the maximum value'));
          }
        },
      },
    ],
  };
};
// string 最大长度
export const stringMaxLengthField = (dataTempStorage: Obj) => {
  return {
    type: InputNumber,
    label: i18n.t('project:the maximum length'),
    name: 'maxLength',
    colSpan: 8,
    required: false,
    customProps: {
      className: 'full-width',
      precision: 0,
      ...DEFAULT_LENGTH_PROPS,
    },
    validator: [
      {
        validator: (_rule: any, value: number, callback: (msg?: string) => void) => {
          const minLength = dataTempStorage?.minLength;
          if (minLength === undefined || minLength <= value) {
            callback();
          } else {
            callback(i18n.t('project:the maximum value must be greater than or equal to the minimum value'));
          }
        },
      },
    ],
  };
};

// string 默认值
export const stringDefaultValueField = {
  type: Input,
  label: i18n.t('default value'),
  name: 'default',
  required: false,
  colSpan: 24,
  customProps: {
    maxLength: INPUT_MAX_LENGTH,
    className: 'full-width',
  },
};

// string 示例
export const stringExampleField = {
  type: Input,
  label: i18n.t('project:example'),
  name: 'example',
  colSpan: 24,
  required: false,
  initialValue: DATATYPE_EXAMPLE_MAP.string,
  customProps: {
    maxLength: TEXTAREA_MAX_LENGTH,
    className: 'full-width',
  },
};


/** ------number 的配置项-------------------------------*/
// number 数值类型
export const numberFormatField = {
  type: Select,
  label: i18n.t('project:numeric type'),
  name: 'format',
  required: false,
  colSpan: 8,
  customProps: {
    options: numberTypeOptions,
  },
};

// number 最小值
export const numberMinimumField = (dataTempStorage: Obj) => {
  return {
    type: InputNumber,
    label: i18n.t('microService:minimum'),
    name: 'minimum',
    colSpan: 8,
    required: false,
    customProps: {
      className: 'full-width',
      ...DEFAULT_NUMBER_PROPS,
    },
    validator: [
      {
        validator: (_rule: any, value: number, callback: (msg?: string) => void) => {
          const maximum = dataTempStorage?.maximum;
          if (maximum === undefined || maximum >= value) {
            callback();
          } else {
            callback(i18n.t('project:the minimum value must be less than or equal to the maximum value'));
          }
        },
      },
    ],
  };
};

// number 最大值
export const numberMaximumField = (dataTempStorage: Obj) => {
  return {
    type: InputNumber,
    label: i18n.t('microService:maximum value'),
    name: 'maximum',
    colSpan: 8,
    required: false,
    customProps: {
      className: 'full-width',
      ...DEFAULT_NUMBER_PROPS,
    },
    validator: [
      {
        validator: (_rule: any, value: number, callback: (msg?: string) => void) => {
          const minimum = dataTempStorage?.minimum;
          if (minimum === undefined || minimum <= value) {
            callback();
          } else {
            callback(i18n.t('project:the maximum value must be greater than or equal to the minimum value'));
          }
        },
      },
    ],
  };
};

// number 默认值
export const numberDefaultValueField = {
  type: InputNumber,
  label: i18n.t('default value'),
  name: 'default',
  required: false,
  colSpan: 24,
  customProps: { className: 'full-width', ...DEFAULT_NUMBER_PROPS },
};

// number 默认值
export const numberExampleField = {
  type: InputNumber,
  label: i18n.t('project:example'),
  name: 'example',
  colSpan: 24,
  required: false,
  initialValue: DATATYPE_EXAMPLE_MAP.number,
  customProps: { className: 'full-width', ...DEFAULT_NUMBER_PROPS },
};

/** ------object 的配置项-------------------------------*/
// object example 配置项
export const objectExampleField = {
  type: ApiFileEditor,
  label: i18n.t('project:example'),
  name: 'example',
  colSpan: 24,
  required: false,
  customProps: {
    className: 'full-width',
    fileExtension: 'json',
    readOnly: true,
  },
};

// description field
export const descriptionField = {
  type: Input.TextArea,
  label: i18n.t('application:description'),
  name: 'description',
  colSpan: 24,
  required: false,
  customProps: { rows: 2, maxLength: TEXTAREA_MAX_LENGTH },
};

// 枚举值的配置
export const enumField = (curPropertyType: string) => {
  return {
    type: EnumRef,
    label: '',
    name: 'enum',
    colSpan: 24,
    required: false,
    customProps: {
      dataType: curPropertyType,
    },
  };
};

// media type field
export const mediaTypeField = {
  type: Select,
  label: 'Media Type',
  name: API_MEDIA,
  colSpan: 12,
  initialValue: 'application/json',
  customProps: {
    options: map(API_MEDIA_TYPE, (t) => <Option key={t} value={t}>{t}</Option>),
  },
};

export const propertyTypeSelectorField = {
  type: Select,
  label: i18n.t('type'),
  name: 'type',
  colSpan: 12,
  initialValue: 'object',
};

export const detailBtnField = {
  type: DetailBtn,
  label: <span style={{ opacity: 0 }}>s</span>,
  name: 'operation',
  colSpan: 1.5,
  initialValue: 'false',
  required: false,
};


export const getPropertyDetailFields = (props: {
  type: BASE_DATA_TYPE;
  curPropertyType: BASE_DATA_TYPE|string;
  formData: Obj;
}): any[] => {
  const { type, curPropertyType, formData } = props;
  if (type === BASE_DATA_TYPE.string || formData?.type === BASE_DATA_TYPE.string) {
    return [
      { ...enumField(curPropertyType) },
      stringPatternField,
      { ...stringMinLengthField(formData) },
      { ...stringMaxLengthField(formData) },
      stringDefaultValueField,
      stringExampleField,
    ];
  } else if (type === BASE_DATA_TYPE.number || formData?.type === BASE_DATA_TYPE.number) {
    return [
      { ...enumField(curPropertyType) },
      numberFormatField,
      { ...numberMinimumField(formData) },
      { ...numberMaximumField(formData) },
      numberDefaultValueField,
      numberExampleField,
    ];
  } else if (type === BASE_DATA_TYPE.boolean) {
    return [booleanDefaultValueField, booleanExampleField];
  } else {
    return [];
  }
};


type IFormType = 'Response' | 'Query' | 'Parameters' | 'DataType' | 'Body' | 'Array';
export const getPropertyFormSelector = (props: {
  formType: IFormType;
  dataTypeOptions: any[];
  propertyNameMap: Obj;
  AllDataTypes: string[];
  detailVisible: boolean;
}) => {
  const { formType, dataTypeOptions, propertyNameMap, AllDataTypes, detailVisible } = props;
  if (formType === 'Response' || formType === 'Body') {
    return [
      mediaTypeField,
      {
        ...propertyTypeSelectorField,
        customProps: {
          options: dataTypeOptions,
          showSearch: true,
        },
      },
    ];
  } else if (formType === 'Query') {
    return [
      {
        type: Input,
        label: i18n.t('backup:parameter name'),
        name: API_FORM_KEY,
        colSpan: 10,
        customProps: {
          maxLength: INPUT_MAX_LENGTH,
        },
        validator: [
          {
            validator: (_rule: any, value: string, callback: (msg?: string) => void) => {
              const { pattern, message } = regRules.specialLetter;
              if (propertyNameMap.includes(value)) {
                callback(i18n.t('project:the parameter names cannot be the same'));
              } else if (pattern.test(value)) {
                callback(message);
              } else {
                callback();
              }
            },
          },
        ],
      },
      {
        type: RadioGroup,
        label: i18n.t('is required'),
        name: API_PROPERTY_REQUIRED,
        colSpan: 2.5,
        initialValue: true,
        customProps: {
          options: REQUIRED_OPTIONS,
        },
      },
      {
        ...propertyTypeSelectorField,
        colSpan: 10,
        initialValue: 'string',
        customProps: {
          options: dataTypeOptions,
          showSearch: true,
        },
      },
      {
        ...detailBtnField,
        customProps: {
          visible: detailVisible,
        },
      },
    ];
  } else if (formType === 'DataType') {
    return [
      {
        type: Input,
        label: i18n.t('backup:parameter name'),
        name: API_FORM_KEY,
        colSpan: 12,
        customProps: {
          maxLength: INPUT_MAX_LENGTH,
        },
        validator: [
          {
            validator: (_rule: any, value: string, callback: (msg?: string) => void) => {
              const { pattern, message } = regRules.specialLetter;
              if (AllDataTypes.includes(value)) {
                callback(i18n.t('exist the same {key}', { key: i18n.t('name') }));
              } else if (pattern.test(value)) {
                callback(message);
              } else if (value.toLocaleLowerCase() in BASE_DATA_TYPE) {
                callback(i18n.t('project:rule of api datatype'));
              } else {
                callback();
              }
            },
          },
        ],
      },
      {
        ...propertyTypeSelectorField,
        initialValue: 'string',
        customProps: {
          options: dataTypeOptions,
          showSearch: true,
        },
      },
    ];
  } else if (formType === 'Array') {
    return [
      {
        ...propertyTypeSelectorField,
        initialValue: 'string',
        colSpan: 24,
        customProps: {
          options: dataTypeOptions,
          showSearch: true,
        },
      },
    ];
  } else {
    return {};
  }
};
