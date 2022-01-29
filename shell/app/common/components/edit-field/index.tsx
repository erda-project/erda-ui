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

import { DatePicker, Input, Select, Tooltip } from 'antd';
import layoutStore from 'layout/stores/layout';
import classnames from 'classnames';
import { ErdaIcon, MarkdownEditor, MarkdownRender } from 'common';
import { useUpdate } from 'common/use-hooks';
import { getTimeRanges } from 'common/utils';
import { off, on } from 'core/event-hub';
import { isZh } from 'core/i18n';
import i18n from 'i18n';
import { get, isFunction, set } from 'lodash';
import moment from 'moment';
import React from 'react';
import { useMount } from 'react-use';
import './index.scss';

interface IMdProps {
  value?: string;
  originalValue?: string;
  disabled?: boolean;
  hasEdited?: boolean;
  maxHeight: number;
  onChange: (v: string) => void;
  onSave: (v?: string, fieldType?: string) => void;
}
export const EditMd = ({ value, onChange, onSave, disabled, originalValue, maxHeight, ...rest }: IMdProps) => {
  const [{ v, expanded, expandBtnVisible, isEditing }, updater, update] = useUpdate({
    v: value,
    isEditing: false,
    expanded: false,
    expandBtnVisible: false,
  });

  const mdContentRef = React.useRef<HTMLDivElement>(null);
  const [isImagePreviewOpen] = layoutStore.useStore((s) => [s.isImagePreviewOpen]);

  const checkContentHeight = React.useCallback(() => {
    if (value?.length && !isEditing && mdContentRef.current) {
      updater.expandBtnVisible(mdContentRef.current.getBoundingClientRect().height > maxHeight);
    } else {
      updater.expandBtnVisible(false);
    }
  }, [isEditing, maxHeight, updater, value]);

  React.useEffect(() => {
    on('md-img-loaded', checkContentHeight);
    checkContentHeight();
    return () => {
      off('md-img-loaded', checkContentHeight);
    };
  }, [checkContentHeight]);

  React.useEffect(() => {
    updater.v(value);
  }, [updater, value]);

  const operationBtns = !disabled
    ? [
        {
          text: i18n.t('save'),
          type: 'primary' as const,
          onClick: (_v: string) => {
            onSave(_v);
            updater.isEditing(false);
          },
        },
        {
          text: i18n.t('cancel'),
          onClick: () => {
            update({ v: originalValue, isEditing: false });
          },
        },
      ]
    : [];

  return isEditing ? (
    <MarkdownEditor
      {...rest}
      value={v}
      onChange={onChange}
      onBlur={(_v: string) => onSave(_v, 'markdown')}
      defaultMode="md"
      defaultHeight={maxHeight}
      operationBtns={operationBtns}
    />
  ) : (
    // drawer z-index is 1000, tooltip default z-index is 1070. Tooltip is alway insert before drawer
    // so if set two components with same z-index, drawer will override tooltip
    // solution: when open img, set tooltip z-index to 999, otherwise set to 1001
    <Tooltip
      placement="left"
      title={i18n.t('dop:click to edit')}
      zIndex={isImagePreviewOpen ? 999 : 1001}
      arrowPointAtCenter
    >
      <div
        className="relative hover:bg-black-06 cursor-pointer rounded"
        onClick={() => updater.isEditing(true)}
        style={{ maxHeight: expanded ? '' : maxHeight }}
      >
        <div className="overflow-hidden" style={{ maxHeight: 'inherit' }}>
          <div ref={mdContentRef} className="md-content">
            <MarkdownRender noWrapper value={value || i18n.t('no description yet')} />
            <div
              className={`absolute left-0 bottom-0 w-full h-16 bg-gradient-to-t from-white flex justify-center items-center ${
                !expandBtnVisible || expanded ? 'hidden' : ''
              }`}
            />
          </div>
        </div>
        <div
          className={`absolute -bottom-10 z-10 left-0 right-0 mx-auto rounded-full ${
            isZh() ? 'w-28' : 'w-44'
          } px-2 py-1 border text-primary shadow cursor-pointer flex items-center justify-center truncate bg-white ${
            expandBtnVisible ? '' : 'hidden'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            updater.expanded(!expanded);
          }}
        >
          <ErdaIcon type={`${expanded ? 'double-up' : 'double-down'}`} />
          <div className="ml-1">{expanded ? i18n.t('collapse description') : i18n.t('expand description')}</div>
        </div>
      </div>
    </Tooltip>
  );
};

interface IProps {
  name: string;
  label?: string;
  labelStyle?: 'normal' | 'desc';
  type?:
    | 'input'
    | 'textArea'
    | 'select'
    | 'markdown'
    | 'datePicker'
    | 'custom'
    | 'readonly'
    | 'dateReadonly'
    | 'planTime'
    | 'last_readonly';
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
  refMap?: Obj<React.RefObject<unknown>>;
  valueRender?: (value: any) => React.ReactNode;
}

const EditField = React.forwardRef((props: IProps, _compRef) => {
  const {
    name,
    type,
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
    refMap,
  } = props;
  const originalValue = get(data, name);
  const compRef = React.useRef<HTMLElement>(null);

  useMount(() => {
    if (typeof _compRef === 'function') {
      _compRef(compRef.current);
    } else {
      _compRef && (_compRef.current = compRef.current);
    }
  });

  const [state, updater] = useUpdate({
    editValue: undefined as unknown as string,
  });
  const { editValue } = state;

  React.useEffect(() => {
    updater.editValue(originalValue);
  }, [originalValue, updater]);

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
  };

  const onBlur = () => {
    if (onChangeCb) {
      if ((type && ['input', 'textArea'].includes(type)) || !type) {
        const currentRef = typeof compRef === 'function' ? refMap?.[name] : compRef?.current;
        data[name] !== currentRef?.state.value && onChangeCb(set({}, name, currentRef?.state.value));
      }
    }
  };

  switch (type) {
    case 'select': {
      const { options, ...rest } = itemProps;
      Comp = (
        <Select
          ref={compRef}
          showArrow={false}
          allowClear
          className="w-full"
          value={editValue}
          onChange={onSelectChange}
          onBlur={() => onBlur()}
          placeholder={placeHolder || (label && `${i18n.t('dop:please set ')}${label}`)}
          disabled={disabled}
          {...rest}
        >
          {isFunction(options) ? options() : options}
        </Select>
      );
      break;
    }
    // 需要增加保存、取消按钮，暂时关闭
    // case 'textArea':
    //   Comp = <Input.TextArea ref={compRef} defaultValue={editValue} onBlur={() => onBlur()} {...itemProps} disabled={disabled} onChange={onInputChange} />;
    //   break;
    case 'markdown': {
      // 创建时不需要提交、取消按钮
      const maxMarkdownHeight = (document.documentElement.clientHeight - 86) * 0.7;
      Comp = !itemProps.isEditMode ? (
        <MarkdownEditor
          {...itemProps}
          defaultHeight={400}
          value={editValue}
          onChange={(v) => onChangeCb?.({ [name]: v })}
        />
      ) : (
        <EditMd
          {...itemProps}
          maxHeight={maxMarkdownHeight}
          defaultHeight={400}
          value={editValue}
          onChange={updater.editValue}
          onSave={(v, fieldType) => onChangeCb?.({ [name]: v }, fieldType)}
          originalValue={originalValue}
          disabled={disabled}
        />
      );
      break;
    }
    case 'datePicker':
      Comp = (
        <DatePicker
          className="w-full"
          allowClear={false}
          value={editValue ? moment(editValue) : undefined}
          onChange={(m: moment.Moment) =>
            onSelectChange(m ? (itemProps?.endDay ? m.endOf('day') : m.startOf('day')) : undefined)
          }
          format="YYYY-MM-DD"
          onBlur={() => onBlur()}
          showTime={false}
          disabled={disabled}
          ranges={getTimeRanges()}
          {...itemProps}
        />
      );
      break;
    case 'custom': {
      // onChange用于改变内部状态，确保组件不重渲染，避免输入框重渲染后光标位置重置。onSave用于保存，比如在onBlur时才保存
      Comp = getComp({
        onChange: updater.editValue,
        onSave: onSelectChange,
        value: editValue,
        disabled,
        originalValue,
      });
      break;
    }
    case 'readonly':
      Comp = <div className="nowrap">{valueRender ? valueRender(editValue) : editValue}</div>;
      break;
    case 'dateReadonly':
      Comp = <div className="prewrap cursor-pointer pl-3">{moment(editValue).format('YYYY-MM-DD')}</div>;
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
          allowClear={false}
        />
      );
      break;
  }

  return (
    <div className={`common-edit-field ${className}`}>
      {label && (
        <div
          data-required={showRequiredMark ? '* ' : ''}
          className={classnames(
            labelStyle === 'desc' ? 'text-sub' : 'text-normal',
            'mb-1',
            showRequiredMark ? 'before:required' : '',
          )}
          style={{ paddingLeft: '10px' }}
        >
          {label}
        </div>
      )}
      <div>
        {Comp}
        {suffix}
      </div>
    </div>
  );
});

export default EditField;
