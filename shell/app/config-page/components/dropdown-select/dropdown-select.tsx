import React from 'react';
import { Icon as CustomIcon } from 'common';
import { Tooltip, Dropdown, Menu } from 'nusi';
import { map } from 'lodash';
import i18n from 'i18n';
import './dropdown-select.scss';

const DropdownSelector = (props: CP_DROPDOWN_SELECT.Props) => {
  const { props: configProps } = props;
  const { disabled, disabledTip, operations, prefixIcon, value, execOperation } = configProps;
  const ValueRender = (
    <div className='v-align hover-active dropdown-field-selector' onClick={(e: any) => e.stopPropagation()}>
      <div className='v-align'>
        {prefixIcon ? <CustomIcon type={prefixIcon} /> : null}
        {value || <span className='color-text-desc'>{i18n.t('unset')}</span>}
      </div>
      <CustomIcon type='di' className='arrow-icon' />
    </div>
  );


  const onClick = (e: any) => {
    e.domEvent.stopPropagation();
    execOperation(operations[e.key]);
  };
  const menu = (
    <Menu onClick={onClick}>
      {map(operations, (op) => (
        <Menu.Item disabled={op.disabled} key={op.key}>
          <Tooltip title={op.disabledTip}>
            <div className='v-align'>
              {op.prefixIcon ? <CustomIcon type={op.prefixIcon} /> : null}
              {op.text}
            </div>
          </Tooltip>
        </Menu.Item>
      ))}
    </Menu>
  );
  return (
    <Dropdown overlay={menu} trigger={['click']}>
      {ValueRender}
    </Dropdown>
  );
};

export default DropdownSelector;