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
import { Button, Switch } from 'nusi';
import { Copy } from 'common';
import './json-show.scss';

interface IProps {
  data: object | null;
  name?: string;
  onToggle?(b: boolean): void;
}

interface IState {
  showJson: boolean;
}

export class JsonShow extends React.Component<IProps, IState> {
  state = {
    showJson: false,
  };

  private jsonStr: string;


  toggleJson = (visible: boolean) => {
    this.setState({
      showJson: visible,
    }, () => {
      const { onToggle } = this.props;
      if (onToggle) {
        onToggle(this.state.showJson);
      }
    });
  };

  render() {
    const { showJson } = this.state;
    const { data, name } = this.props;
    this.jsonStr = data === null ? '' : JSON.stringify(data, null, 2);
    return (
      <div>
        <span style={{ verticalAlign: 'middle', fontWeight: 'bold' }}>{name || 'JSON'}</span> <Switch checked={showJson} onChange={this.toggleJson} />

        <div className={`json-detail ${showJson ? 'slide-in' : ''}`}>
          <Button className="json-detail-btn for-copy" shape="circle" icon="copy" /><Copy selector=".for-copy" opts={{ text: () => this.jsonStr }} />
          <Button className="json-detail-btn" shape="circle" icon="close-circle-o" onClick={() => this.toggleJson(false)} />
          <pre>{this.jsonStr}</pre>
        </div>
      </div>
    );
  }
}
