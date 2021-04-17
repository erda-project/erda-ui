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
import { Button } from 'app/nusi';
import { createTerm, destroyTerm } from 'common/utils/xterm';
import './terminal.scss';
import i18n from 'i18n';

interface IProps {
  params: object;
}

interface IState {
  max: boolean;
}
export class Terminal extends React.Component<IProps, IState> {
  terminal: HTMLDivElement | null;

  term: any;

  state = {
    max: false,
  };

  componentDidMount() {
    const { params } = this.props;
    this.term = createTerm(this.terminal, params);
    // wait for term init finished
    setTimeout(() => {
      this.term.fit();
    }, 0);
  }

  componentDidUpdate(prevProps: IProps, prevState: IState) {
    if (prevState.max !== this.state.max) {
      this.term.fit();
    }
  }

  componentWillUnmount() {
    destroyTerm(this.term);
  }

  changeSize = () => {
    this.setState({
      max: !this.state.max,
    });
  };

  render() {
    const { max } = this.state;
    return (
      <div ref={(term) => { this.terminal = term; }} className={`terminal-container${max ? ' show-max' : ''}`}>
        <div className="terminal-control btn-line-rtl">
          <Button className="resize-button" onClick={this.changeSize} type="ghost">{max ? i18n.t('default:exit full screen') : i18n.t('default:full screen')}</Button>
        </div>
      </div>
    );
  }
}
