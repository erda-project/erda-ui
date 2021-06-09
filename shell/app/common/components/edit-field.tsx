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
import { Input, Select, DatePicker } from 'app/nusi';
import moment from 'moment';
import { MarkdownEditor, useUpdate } from 'common';
import { getTimeRanges } from 'common/utils';
import { isFunction, get, set } from 'lodash';
import Markdown from 'common/utils/marked';
import i18n from 'i18n';
import classnames from 'classnames';

import './edit-field.scss';

interface IMdProps {
  value?: string;
  originalValue?: string;
  disabled?: boolean;
  hasEdited?: boolean;
  onChange: (v: string) => void;
  onSave: (v?: string, fieldType?: string) => void;
}
export const EditMd = ({ value, onChange, onSave, disabled, originalValue, hasEdited, ...rest }: IMdProps) => {
  const [v, setV] = React.useState(value);
  const [mdEditing, setMdEditing] = React.useState(false);
  const [showBtn, setShowBtn] = React.useState(false);
  React.useEffect(() => {
    setV(value);
  }, [value]);
  React.useEffect(() => {
    if (hasEdited) {
      setShowBtn(false);
    }
  }, [hasEdited]);
  const btnProps = (showBtn && !disabled)
    ? {
      onSubmit(_v: string) {
        onSave(_v);
        setShowBtn(false);
        setMdEditing(false);
      },
      onCancel() {
        setV(originalValue); // 取消时不应调用保存，加个内部状态来还原数据
        setShowBtn(false);
        setMdEditing(false);
      },
    }
    : {};
  return mdEditing ? (
    <MarkdownEditor
      {...rest}
      value={v}
      defaultMode="md"
      autoFocus
      canView={{ html: false }}
      onChange={onChange}
      onBlur={(_v: string) => onSave(_v, 'markdown')}
      onFocus={() => setShowBtn(true)}
      readOnly={disabled}
      notClearAfterSubmit
      {...btnProps}
    />
  ) : (
    <div className="md-content-preview border-radius pa8" onClick={() => setMdEditing(true)}>
      <div className="md-content" dangerouslySetInnerHTML={{ __html: Markdown(v || '') }} />
    </div>
  );
};

interface IProps {
  name: string;
  label?: string;
  labelStyle?: 'normal' | 'desc';
  type?: 'input' | 'textArea' | 'select' | 'markdown' | 'datePicker' | 'custom' | 'readonly' | 'dateReadonly' | 'planTime' | 'last_readonly';
  onChangeCb?: Function;
  value?: any;
  placeHolder?: string;
  className?: string;
  itemProps?: any;
  data?: any;
  disabled?: boolean;
  getComp?: any;
  suffix?: any;
  showRequiredMark?: boolean;
  valueRender?: (value: any) => React.ReactNode;
}

export const EditField = React.forwardRef((props: IProps, _compRef) => {
  const {
    name,
    type,
    value,
    placeHolder,
    className = '',
    label,
    labelStyle,
    itemProps,
    disabled = false,
    onChangeCb,
    data,
    suffix = null,
    showRequiredMark = false,
    valueRender,
    getComp,
  } = props;
  const originalValue = get(data, name);

  const compRef = _compRef || React.useRef(null as React.RefObject<unknown>);

  const [state, updater] = useUpdate({
    editMode: false,
    editValue: undefined as unknown as string,
  });
  const { editMode, editValue } = state;

  React.useEffect(() => {
    updater.editValue(value || get(data, name));
  }, [value, data, name, updater]);

  let Comp = <div />;

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 如果有，调用原来的onChange
    if (get(itemProps, 'onChange')) {
      itemProps.onChange(e);
    }
    updater.editValue(e.target.value);
  };

  const onSelectChange = (_v: string | moment.Moment | null) => {
    const v = type === 'datePicker' && _v ? (_v as moment.Moment).format() : _v;
    if (onChangeCb) {
      onChangeCb(set({}, name, v));
    }
    updater.editMode(true);
  };

  const onBlur = (v?: string, fieldType?: string) => {
    if (onChangeCb) {
      if ((type && ['input', 'textArea'].includes(type)) || !type) {
        onChangeCb(set({}, name, compRef?.current?.state.value));
      } else if (type === 'markdown') {
        onChangeCb(set({}, name, v), fieldType);
      }
    }
    updater.editMode(true);
  };

  switch (type) {
    case 'select': {
      const { options, ...rest } = itemProps;
      Comp = (
        <Select
          ref={compRef}
          showArrow={false}
          showSearch
          allowClear
          className="full-width"
          value={editValue}
          onChange={onSelectChange}
          onBlur={() => onBlur()}
          placeholder={placeHolder || (label && `${i18n.t('project:please set ')}${label}`)}
          disabled={disabled}
          {...rest}
        >
          {isFunction(options) ? options() : options}
        </Select>);
      break;
    }
    // 需要增加保存、取消按钮，暂时关闭
    // case 'textArea':
    //   Comp = <Input.TextArea ref={compRef} defaultValue={editValue} onBlur={() => onBlur()} {...itemProps} disabled={disabled} onChange={onInputChange} />;
    //   break;
    case 'markdown':
      // 创建时不需要提交、取消按钮
      Comp = !itemProps.isEditMode
        ? (
          <MarkdownEditor
            {...itemProps}
            value={editValue}
            onChange={onBlur}
          />
        )
        : (
          <EditMd
            {...itemProps}
            value={editValue}
            onChange={updater.editValue}
            onSave={onBlur}
            originalValue={originalValue}
            disabled={disabled}
          />
        );
      break;
    case 'datePicker':
      Comp = (
        <DatePicker
          className="full-width"
          allowClear={false}
          value={editValue ? moment(editValue) : undefined}
          onChange={(m: moment.Moment) => onSelectChange(m ? m.startOf('day') : undefined)}
          format="YYYY-MM-DD"
          onBlur={() => onBlur()}
          showTime={false}
          disabled={disabled}
          ranges={getTimeRanges()}
          {...itemProps}
        />);
      break;
    case 'custom': {
      // onChange用于改变内部状态，确保组件不重渲染，避免输入框重渲染后光标位置重置。onSave用于保存，比如在onBlur时才保存
      Comp = getComp({ onChange: updater.editValue, onSave: onSelectChange, value: editValue, disabled, originalValue });
      break;
    }
    case 'readonly':
      Comp = (
        <div className="nowrap pl12">
          {valueRender ? valueRender(editValue) : editValue}
        </div>
      );
      break;
    case 'last_readonly':
      Comp = (
        <div className="nowrap">
          {valueRender ? valueRender(editValue) : editValue}
        </div>
      );
      break;
    case 'dateReadonly':
      Comp = (
        <div className="prewrap pointer pl12">
          {moment(editValue).format('YYYY-MM-DD')}
        </div>
      );
      break;
    default:
      Comp = (
        <Input
          ref={compRef}
          disabled={disabled}
          className={itemProps.className}
          value={editValue}
          onBlur={() => onBlur()}
          {...itemProps}
          onChange={onInputChange}
        />
      );
      break;
  }

  const onClick = () => {
    if (!editMode && ((type && !['dateReadonly', 'readonly'].includes(type)) || !type)) {
      updater.editMode(false);
    }
  };

  return (
    <div className={`common-edit-field ${className}`}>
      {label &&
      <div
        className={classnames(
          labelStyle === 'desc' ? 'color-text-sub' : 'color-text',
          'mb4',
          showRequiredMark ? 'ant-form-item-required' : '',
        )}
        style={{ paddingLeft: '10px' }}
      >
        {label}
      </div>}
      <div onClick={onClick} className={classnames({ 'edit-comp-text': editMode })}>
        {Comp}
        {suffix}
      </div>
    </div>
  );
});
