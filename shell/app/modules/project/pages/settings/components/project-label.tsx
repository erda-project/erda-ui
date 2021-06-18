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

import { FormModal, Icon as CustomIcon, useUpdate } from 'app/common';
import i18n from 'app/i18n';
import { WrappedFormUtils } from 'core/common/interface';
import { Modal } from 'app/nusi';
import projectLabel from 'project/stores/label';
import * as React from 'react';
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
  });

  useEffectOnce(() => {
    getLabels({ type: 'issue' });
    return clearList;
  });

  const onClickLabel = (label: LABEL.Item) => {
    updater.activeLabel(label);
    updater.modalVisible(true);
  };

  const onCancel = () => {
    updater.modalVisible(false);
    updater.activeLabel(null);
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
      title: i18n.t('project:issues associated label will be deleted, confirm to delete?'),
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
      label: i18n.t('project:label name'),
      name: 'name',
      rules: [
        {
          validator: (_, value: string, callback: any) => {
            return value && value.trim().length > 0 ? callback() : callback(i18n.t('common:can not be all spaces'));
          },
        },
      ],
      itemProps: {
        placeholder: i18n.t('project:within {num} characters', { num: 50 }),
        maxLength: 50,
      },
    },
    {
      label: i18n.t('project:label color'),
      name: 'color',
      type: 'custom',
      initialValue: colors[0],
      getComp: ({ form }: { form: WrappedFormUtils }) => {
        const v = form.getFieldValue('color') || colors[0];
        return (
          <div className="color-list colorful-bg">
            {colors.map((c) => (
              <span
                key={c}
                className={`color-option ${c} ${v === c ? 'active' : ''}`}
                onClick={() => form.setFieldsValue({ color: c })}
              >
                <CustomIcon type="duigou" />
              </span>
            ))}
          </div>
        );
      },
      rules: [{ required: true, message: i18n.t('project:please select color') }],
    },
  ];

  return (
    <div className="project-label-list">
      <div className="colorful-light-bg">
        <span className="label-item create" onClick={() => updater.modalVisible(true)}>
          <IconPlus size="14px" />
          {i18n.t('project:add label')}
        </span>
        {list.map((label) => (
          <span className={`label-item ${label.color}`} key={label.id} onClick={() => onClickLabel(label)}>
            {label.name}
            <IconClose
              className="ml4"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(label);
              }}
            />
          </span>
        ))}
      </div>
      <FormModal
        name={i18n.t('project:label')}
        visible={state.modalVisible}
        fieldsList={fieldsList}
        formData={state.activeLabel}
        onOk={onOk}
        onCancel={onCancel}
      />
    </div>
  );
};
