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

import { Input, Collapse } from 'nusi';
import { Icon as CustomIcon, EmptyListHolder } from 'common';
import classnames from 'classnames';
import React, { PureComponent } from 'react';
import './action-select.scss';
import { isEqual, groupBy, map, get } from 'lodash';
import i18n from 'i18n';

interface IProps {
  value?: any;
  label: string;
  disabled?: boolean;
  placeholder: string;
  actions: IStageAction[];
  onChange: (params: any) => void;
}

const { Panel } = Collapse;

interface IAddOnProps {
  className?: string | null;
  addon: IStageAction;
  editing?: boolean;
  onClick?: (addon: IStageAction) => void;
}

const AddOn = ({ addon, className, onClick, editing }: IAddOnProps) => {
  const { desc, name, logoUrl, displayName } = addon;

  return (
    <div
      onClick={() => (editing && onClick) && onClick(addon)}
      className={classnames('dice-yml-actions', className)}
    >
      {
        logoUrl ? (
          <img alt='logo' src={logoUrl} className='actions-icon' />
        ) : (
          <CustomIcon type='wfw' color className='actions-icon' />
        )
      }
      <span className="actions-info">
        <div className="actions-info-name">{displayName || name}</div>
        <div className="actions-info-description">{desc || '-'}</div>
      </span>
      <div className="actions-border-bottom" />
    </div>
  );
};

export default class extends PureComponent<IProps, any> {
  public state = {
    actions: [],
    // 源数组， 搜索走这个数组
    originActions: [],
    isFocus: true,
    isSelected: true,
    searchValue: undefined,
    selectedItem: {} as any,
  };

  static getDerivedStateFromProps(nextProps: Readonly<IProps>, prevState: any): any {
    if (!isEqual(nextProps.value, prevState.value) || !isEqual(nextProps.actions, prevState.originActions)) {
      const selectedItem = nextProps.actions.find((i: any) => i.name === nextProps.value);
      const isSelected = selectedItem !== null;
      return {
        ...prevState,
        selectedItem,
        isSelected,
        isFocus: isSelected,
        originActions: nextProps.actions,
        actions: selectedItem ? prevState.actions : nextProps.actions,
        value: nextProps.value,
        searchValue: selectedItem ? prevState.searchValue : null,
      };
    }

    return prevState;
  }

  public render() {
    const { label, disabled, placeholder } = this.props;
    const { selectedItem, searchValue } = this.state;

    let content = (
      <React.Fragment>
        <Input
          disabled={disabled}
          autoFocus
          onFocus={this.onFocus}
          onClick={this.openSelect}
          onChange={this.searchInputChange}
          value={searchValue}
          className="actions-input"
          placeholder={placeholder || `${i18n.t('application:please choose')} Add-on`}
        />
        {this.renderSelectContent()}
      </React.Fragment>
    );

    if (selectedItem) {
      content = (
        <React.Fragment>
          <AddOn
            addon={selectedItem}
          />
        </React.Fragment>
      );
    }

    return (
      <div className="new-yml-editor-actions-select">
        <div className="actions-select-label">
          <span className="actions-select-label-required">*</span>
          {label}:
          {(selectedItem && !disabled) ? <a onClick={this.clear} className="reselect">{i18n.t('application:reselect')}</a> : null}
        </div>
        {content}
      </div>
    );
  }

  private openSelect = () => {
    this.setState({
      isSelected: !this.state.isSelected,
    });
  };

  private onFocus = (e: any) => {
    e.stopPropagation();
    this.setState({
      isFocus: true,
    });
  };

  private renderSelectContent = () => {
    const { disabled } = this.props;
    const { actions, isFocus, isSelected, selectedItem } = this.state;
    if (!isFocus && !isSelected) {
      return null;
    }

    if (actions.length === 0) {
      return (
        <div tabIndex={1} className="new-yml-editor-actions-list">
          <EmptyListHolder />
        </div>
      );
    }
    const actionsGroup = groupBy(actions, 'group');
    const addonsContent = (
      <Collapse className='new-yml-editor-collapse' defaultActiveKey={get(Object.keys(actionsGroup), 0)}>
        {
          map(actionsGroup, (actionArr, groupKey) => {
            const header = get(actionArr, '[0].groupDisplayName') || get(actionArr, '[0].group') || groupKey;
            return (
              <Panel header={header} key={groupKey}>
                {map(actionArr, (addon: IStageAction) => {
                  let activeClass = null;
                  // @ts-ignore
                  if (selectedItem && selectedItem.name === addon.name) {
                    activeClass = 'actions-selected';
                  }
                  return (
                    <AddOn
                      editing={!disabled}
                      className={activeClass}
                      addon={addon}
                      key={addon.name}
                      onClick={this.selectedAddonAction}
                    />
                  );
                })}
              </Panel>
            );
          })
        }
      </Collapse>
    );
    return (
      <div
        tabIndex={1}
        className="new-yml-editor-actions-list"
      >
        {addonsContent}
      </div>
    );
  };

  private selectedAddonAction = (addon: IStageAction) => {
    const { onChange } = this.props;

    if (onChange) {
      onChange(addon.name);
    }
  };

  private searchInputChange = (e: any) => {
    const { originActions } = this.state;
    this.setState({
      searchValue: e.target.value,
      actions: originActions
        .filter((item: IStageAction) => e.target.value === '' ||
          item.name.toLowerCase().includes(e.target.value)),
    });
  };

  private clear = () => {
    const { onChange } = this.props;

    if (onChange) {
      onChange(null);
    }
  };
}
