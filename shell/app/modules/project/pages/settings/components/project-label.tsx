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

import { FormModal, Icon as CustomIcon } from 'common';
import { useUpdate } from 'common/use-hooks';
import i18n from 'app/i18n';
import { FormInstance } from 'core/common/interface';
import { Modal } from 'antd';
import projectLabel from 'project/stores/label';
import React from 'react';
import { useEffectOnce } from 'react-use';
import './project-label.scss';
import { Close as IconClose, Plus as IconPlus } from '@icon-park/react';

const colors = ['red', 'orange', 'blue', 'green', 'purple', 'gray'];

export default () => {
  const list = projectLabel.useStore((s) => s.list);
  const { getLabels, createLabel, updateLabel, deleteLabel } = projectLabel.effects;
  const { clearList } = projectLabel.reducers;

  const [state, updater] = useUpdate({
    activeLabel: null,
    modalVisible: false,
    activeColor: colors[0],
  });

  useEffectOnce(() => {
    getLabels({ type: 'issue' });
    return clearList;
  });

  const onClickLabel = (label: LABEL.Item) => {
    updater.activeLabel(label);
    updater.activeColor(label.color);
    updater.modalVisible(true);
  };

  const onCancel = () => {
    updater.modalVisible(false);
    updater.activeLabel(null);
    updater.activeColor(colors[0]);
  };

  const onOk = (data: any) => {
    const then = () => {
      getLabels({ type: 'issue' });
      onCancel();
    };
    if (data.id) {
      updateLabel(data).then(then);
    } else {
      createLabel(data).then(then);
    }
  };

  const handleDelete = (label: LABEL.Item) => {
    Modal.confirm({
      title: i18n.t('dop:issues associated label will be deleted, confirm to delete?'),
      onOk: () => {
        deleteLabel(label.id);
      },
    });
  };

  const fieldsList = [
    {
      name: 'id',
      itemProps: {
        type: 'hidden',
      },
    },
    {
      name: 'type',
      initialValue: 'issue',
      itemProps: {
        type: 'hidden',
      },
    },
    {
      label: i18n.t('dop:label name'),
      name: 'name',
      rules: [
        {
          validator: (_, value: string, callback: any) => {
            return value && value.trim().length > 0 ? callback() : callback(i18n.t('common:can not be all spaces'));
          },
        },
      ],
      itemProps: {
        placeholder: i18n.t('dop:within {num} characters', { num: 50 }),
        maxLength: 50,
      },
    },
    {
      label: i18n.t('dop:label color'),
      name: 'color',
      type: 'custom',
      initialValue: colors[0],
      getComp: ({ form }: { form: FormInstance }) => {
        return (
          <div className="color-list">
            {colors.map((c) => (
              <span
                key={c}
                className={`color-option bg-${c} ${state.activeColor === c ? 'active' : ''}`}
                onClick={() => {
                  updater.activeColor(c);
                  form.setFieldsValue({ color: c });
                }}
              >
                <CustomIcon type="duigou" />
              </span>
            ))}
          </div>
        );
      },
      rules: [{ required: true, message: i18n.t('dop:please select color') }],
    },
  ];

  return (
    <div className="project-label-list">
      <div>
        <span className="label-item create" onClick={() => updater.modalVisible(true)}>
          <IconPlus size="14px" />
          {i18n.t('dop:add label')}
        </span>
        {list.map((label) => (
          <span
            className={`label-item text-${label.color} bg-${label.color} bg-opacity-10`}
            key={label.id}
            onClick={() => onClickLabel(label)}
          >
            {label.name}
            <IconClose
              className="ml-1"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(label);
              }}
            />
          </span>
        ))}
      </div>
      <FormModal
        name={i18n.t('label')}
        visible={state.modalVisible}
        fieldsList={fieldsList}
        formData={state.activeLabel}
        onOk={onOk}
        onCancel={onCancel}
      />
    </div>
  );
};
