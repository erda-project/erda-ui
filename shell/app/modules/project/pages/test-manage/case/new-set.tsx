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
import { Icon, Input, Popover, message, Button } from 'nusi';
import i18n from 'i18n';
import testSetStore from 'project/stores/test-set';

interface IProps {
  afterCreate(data:TEST_SET.TestSet): void
}
const NewSet = ({ afterCreate }: IProps) => {
  const [visible, setVisible] = React.useState(false);
  const [value, setValue] = React.useState('');
  const { createTestSet } = testSetStore.effects;

  const handleHide = () => {
    setVisible(false);
    setValue('');
  };

  const handlePressEntry = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.keyCode === 13) {
      handleSave();
    }
  };

  const handleSave = () => {
    if (value) {
      if (value.includes('/') || value.includes('\\')) {
        message.error(i18n.t('project:name cannot use forward backslash, please re-enter '));
        return;
      }
      createTestSet({ parentID: 0, name: value }).then(afterCreate);
      handleHide();
    } else {
      message.warning(i18n.t('project:name is required'));
    }
  };

  const content = (
    <div className="flex-box">
      <Input
        autoFocus
        placeholder={i18n.t('project:enter test set name')}
        value={value}
        maxLength={50}
        onChange={e => setValue(e.target.value)}
        onKeyUp={handlePressEntry}
      />
      <Icon className="ml12 fz18 color-primary" type="check" onClick={handleSave} />
      <Icon className="ml12 fz18" type="close" onClick={handleHide} />
    </div>
  );

  return (
    <Popover
      key={String(visible)} // 每次重新渲染，让input自动获焦
      visible={visible}
      content={content}
      trigger="click"
      placement="bottomRight"
      align={{ offset: [10, 0] }}
      onVisibleChange={v => (v ? setVisible(v) : handleHide())}
    >
      <Button type="primary">{i18n.t('project:add test set')}</Button>
    </Popover>
  );
};

export default NewSet;
