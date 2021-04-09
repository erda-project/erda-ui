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

import './index.scss';

import React from 'react';
import classNames from 'classnames';
import { remove } from 'lodash';

const panelStack: any = [];

interface IProps {
  lightboxIsOpen: boolean,
  noPadding: boolean,
  className: string,
  visible: boolean,
  currentIssueTypeKey?: any,
  onCancel?(val: boolean): void,
}

export default class SidePanel extends React.Component<IProps> {
  componentDidMount() {
    this.escHandler = (e: KeyboardEvent) => {
      if (e.keyCode === 27 && this.props.lightboxIsOpen === false) {
        this.props.onCancel(false);
      }
    };
    document.body.addEventListener('keydown', this.escHandler);
  }

  componentWillUnmount() {
    remove(panelStack, o => o === this);
    document.body.removeEventListener('keydown', this.escHandler);
  }

  render() {
    const { className, visible, children, noPadding } = this.props;
    const classes = classNames(
      'side-panel',
      className,
      { visible, 'no-padding': noPadding },
    );

    return (
      <div className={classes} id="side-panel">
        {children}
      </div>
    );
  }
}
