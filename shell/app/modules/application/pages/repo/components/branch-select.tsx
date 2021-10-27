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

import { Popover, Input } from 'antd';
import { isEmpty } from 'lodash';
import React from 'react';
import i18n from 'i18n';
import { Check as IconCheck } from '@icon-park/react';

import './branch-select.scss';

const { Search } = Input;

const noop = () => {};
interface IProps {
  className?: string;
  current: string;
  branches: string[];
  tags?: string[];
  containerId?: string;
  commitId?: string | null;
  disabled?: boolean;
  hideTagList?: boolean;
  onChange?: (commitId: string) => void;
}

interface IState {
  filterKey: string;
  visible: boolean;
  inputKey: number;
}
class BranchSelect extends React.PureComponent<IProps, IState> {
  state = {
    filterKey: '',
    visible: false,
    inputKey: 1,
  };

  container: Element | null;

  timer: any;

  componentDidMount() {
    this.container = this.props.containerId ? document.getElementById(this.props.containerId) : document.body;
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  filter = (filterKey: string) => this.setState({ filterKey: filterKey.trim().toLowerCase() });

  show = () => {
    this.setState({
      visible: true,
    });
  };

  hide = () => {
    this.setState((prev) => ({
      visible: false,
      inputKey: prev.inputKey + 1, // keep input always focus when visible
    }));
  };

  handleBlur = () => {
    // 延迟关闭以响应内部的click事件
    this.timer = setTimeout(() => {
      this.hide();
    }, 200);
  };

  render() {
    const {
      branches = [],
      tags = [],
      commitId,
      current,
      hideTagList = false,
      disabled = false,
      children,
      onChange = noop,
      className = '',
    } = this.props;
    const { filterKey, visible, inputKey } = this.state;

    if (isEmpty(branches) && isEmpty(tags)) {
      return null;
    }

    if (disabled) {
      return <button className="repo-branch-select btn nowrap disabled">{children}</button>;
    }

    const branchList = branches.filter((b) => b.includes(filterKey));
    const tagList = tags.filter((t) => t.includes(filterKey));
    const commitList = commitId ? (
      <React.Fragment>
        <div className="title">{i18n.t('dop:commit')}</div>
        <ul>
          <li className="branch-item" onClick={() => onChange(commitId)}>
            {commitId === current ? <IconCheck /> : null}
            <span>{commitId}</span>
          </li>
        </ul>
      </React.Fragment>
    ) : null;

    const content = (
      <React.Fragment>
        <Search
          placeholder={
            hideTagList ? i18n.t('dop:enter branch name to filter') : i18n.t('dop:enter branch or tag name to filter')
          }
          autoFocus
          onBlur={this.handleBlur}
          value={filterKey}
          onChange={(e) => this.filter(e.target.value)}
        />
        <div className="list-wrap">
          {commitList}
          <div className="title">
            {i18n.t('dop:branch')} ({branchList.length})
          </div>
          <ul>
            {branchList.map((branch) => (
              <li className="branch-item" onClick={() => onChange(branch)} key={branch}>
                {branch === current ? <IconCheck /> : null}
                <span>{branch}</span>
              </li>
            ))}
          </ul>
          {hideTagList ? null : (
            <>
              <div className="title">
                {i18n.t('dop:tag')} ({tagList.length})
              </div>
              <ul>
                {tagList.map((tag) => (
                  <li className="branch-item" onClick={() => onChange(tag)} key={tag}>
                    {tag === current ? <IconCheck /> : null} <span>{tag}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </React.Fragment>
    );

    return (
      <Popover
        title={hideTagList ? i18n.t('dop:please choose branch') : i18n.t('dop:please choose branch or tag')}
        key={this.state.inputKey}
        overlayClassName="branch-select-popover"
        trigger="click"
        placement="bottomLeft"
        visible={visible}
        autoAdjustOverflow={false}
        content={content}
        onVisibleChange={() => this.filter('')}
      >
        <button className={`repo-branch-select nowrap ${className}`} onClick={() => this.show()}>
          {children}
        </button>
      </Popover>
    );
  }
}

export default BranchSelect;
