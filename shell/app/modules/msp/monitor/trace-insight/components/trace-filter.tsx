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
import { Form, Input, Select, DatePicker, Dropdown, Menu, Checkbox } from 'antd';
import { isEqual, pickBy } from 'lodash';
import { useUpdate } from 'common/use-hooks';
import Duration from './duration';
import { produce } from 'immer';
import { DownOne as IconDownOne, Plus as IconPlus, Search as IconSearch } from '@icon-park/react/lib/map';
import i18n from 'i18n';

export interface IField {
  key: string;
  label: string;
  type: keyof typeof CompMap;
  fixed: boolean;
  customProps?: Obj;
}

interface IProps<T> {
  initialValues?: Obj;
  list: IField[];

  onChange?(data: T): void;
}

interface IState {
  fields: IField[];
  showFilterKeys: string[];
}

const CompMap = {
  input: Input,
  select: Select,
  dataPicker: DatePicker,
  rangePicker: DatePicker.RangePicker,
  duration: Duration,
};

const filterEmptyValue = (data: Obj) => {
  return pickBy(data, (value) => {
    return value !== undefined && value !== null && value !== '';
  });
};

const TraceFilter = <T extends {}>({ list, initialValues, onChange }: IProps<T>) => {
  const [{ fields, showFilterKeys }, updater, update] = useUpdate<IState>({
    fields: [],
    showFilterKeys: [],
  });
  const flag = React.useRef(false);
  const hasDynamicField = !!list.find((t) => !t.fixed);
  React.useEffect(() => {
    updater.fields(list.filter((t) => t.fixed));
  }, [list]);
  React.useEffect(() => {
    if (Object.keys(initialValues ?? {}).length && !flag.current) {
      form.setFieldsValue(initialValues);
      flag.current = true;
    }
  }, [initialValues]);

  const handleChangeFiled = (selectKeys: string[]) => {
    const prev = form.getFieldsValue();
    const newList = produce<IField[]>(list, (draft) => {
      const fixedList = draft.filter((t) => t.fixed);
      const dynamicList = draft.filter((t) => !t.fixed && selectKeys.includes(t.key));
      return [...fixedList, ...dynamicList];
    });
    update({
      fields: newList,
      showFilterKeys: selectKeys,
    });
    const newValue = {};
    newList.forEach((item) => {
      newValue[item.key] = prev[item.key];
    });
    if (!isEqual(filterEmptyValue(prev), filterEmptyValue(newValue))) {
      onChange?.(newValue);
    }
  };

  const handleClearSelected = () => {
    handleChangeFiled([]);
  };

  const handleChange = (_, allValues: T) => {
    onChange?.(allValues);
  };

  const [form] = Form.useForm();
  return (
    <Form className="flex flex-wrap" form={form} onValuesChange={handleChange} layout="horizontal" preserve={false}>
      {fields.map(({ customProps = {}, type, label, key }) => {
        const Comp = CompMap[type];
        return (
          <Form.Item key={key} className="px-3" label={label} name={key}>
            <Comp {...customProps} />
          </Form.Item>
        );
      })}
      {hasDynamicField ? (
        <Form.Item className="px-3">
          <Dropdown
            trigger={['click']}
            overlay={
              <Menu className="min-w-20">
                <Menu.Item>
                  <Input
                    autoFocus
                    size="small"
                    prefix={<IconSearch size="16" />}
                    onClick={(e) => e.stopPropagation()}
                    placeholder={i18n.t('common:Filter conditions')}
                  />
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item>
                  <div className="flex justify-between">
                    <span>
                      {i18n.t('common:selected')} {showFilterKeys.length}
                      {i18n.t('common:items')}
                    </span>
                    <span className="fake-link" onClick={handleClearSelected}>
                      {i18n.t('common:clear selected')}
                    </span>
                  </div>
                </Menu.Item>
                <Menu.Divider />
                <Checkbox.Group onChange={handleChangeFiled} value={showFilterKeys}>
                  {list
                    .filter((t) => !t.fixed)
                    .map((t) => {
                      return (
                        <Menu.Item key={t.key} className="px-3">
                          <div className="py-1.5">
                            <Checkbox value={t.key}>{t.label}</Checkbox>
                          </div>
                        </Menu.Item>
                      );
                    })}
                </Checkbox.Group>
              </Menu>
            }
          >
            <span className="cursor-pointer">
              <IconPlus fill="rgba(0, 0, 0, 0.8)" className="mr-0.5 mb-1 color-text" />
              <span>{i18n.t('filter')}</span>
              <IconDownOne className="hover ml-1 mb-0.5" size="12" theme="filled" fill="#bbb" />
            </span>
          </Dropdown>
        </Form.Item>
      ) : null}
    </Form>
  );
};

export default TraceFilter;
