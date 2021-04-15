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
import { Spin } from 'app/nusi';
import { goTo } from 'common/utils';

export const dealPath = (params) => {
  const { projectId, app, runtime, service } = params;
  const path = [];
  if (projectId) {
    path.push({ q: projectId });
  }
  if (app) {
    const [id, name] = app.split('@');
    path.push({ q: id, name });
  }
  if (runtime) {
    const [id, name] = runtime.split('@');
    path.push({ q: id, name });
  }
  if (service) {
    const [, name] = service.split('@');
    path.push({ q: name });
  }
  return path;
};

const pathWrapper = (Comp, dealPathFn) => {
  class PathWrapper extends React.PureComponent {
    constructor(props) {
      super();
      this.dealPath = dealPathFn || dealPath;
      this.state = {
        path: this.dealPath(props.params),
      };
    }

    componentDidMount() {
      this.getList();
    }

    UNSAFE_componentWillReceiveProps({ params, changeFlag }) {
      if (params !== this.props.params || changeFlag !== this.props.changeFlag) {
        this.setState({
          path: this.dealPath(params),
        }, () => {
          this.getList();
        });
      }
    }

    getList = () => this.props.getList(this.state.path);

    into = ({ q, name }) => {
      return goTo(`./${q}@${encodeURIComponent(name)}`);
    };

    render() {
      const { isFetching } = this.props;
      const { path } = this.state;
      return (
        <Spin spinning={isFetching}>
          <Comp {...this.props} into={this.into} depth={path.length} />
        </Spin>
      );
    }
  }

  return PathWrapper;
};

export default pathWrapper;
