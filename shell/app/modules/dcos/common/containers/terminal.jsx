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

import { isEmpty } from 'lodash';
import * as React from 'react';
import { Terminal, connectCube } from 'common';
import { getOrgFromPath } from 'common/utils';
import i18n from 'i18n';
import './terminal.scss';
import clusterStore from 'dataCenter/stores/cluster';

class ServiceTerminal extends React.Component {
  componentDidMount() {
    const { getClusterDetail, clusterName } = this.props;
    if (clusterName) {
      getClusterDetail({ clusterName });
    }
  }

  render() {
    const { clusterDetail, instanceTerminal = false } = this.props;
    if (isEmpty(clusterDetail)) {
      return (
        <div className="services-terminal">
          <span className="terminal-info">{i18n.t('dcos:getting cluster information')}...</span>
        </div>
      );
    }
    let initData = {};
    if (!instanceTerminal) {
      const { host, user, port } = this.props;
      initData = {
        name: 'ssh',
        args: {
          host,
          port: Number.isNaN(+port) ? 22 : +port,
          user: user || 'root',
        },
      };
    } else {
      const { host: containerHost, containerId } = this.props;
      initData = {
        name: 'docker',
        args: {
          host: containerHost,
          port: 2375,
          container: containerId,
        },
      };
      if (!initData.args.host) {
        return (
          <div className="services-terminal">
            <span className="terminal-info">{i18n.t('dcos:cannot find current container')}</span>
          </div>
        );
      }
      if (!initData.args.container) {
        return (
          <div className="services-terminal">
            <span className="terminal-info">{i18n.t('dcos:cannot find current host')}</span>
          </div>
        );
      }
    }

    const replaceProtocol = (value) => value.replace('http', 'ws');
    const _params = {
      // url: `${replaceProtocol(clusterDetail.urls.colonySoldier)}`,
      url: `${replaceProtocol(window.location.protocol)}//${
        window.location.host
      }/api/${getOrgFromPath()}/terminal?url=${clusterDetail.urls.colonySoldier}`,
      initData,
    };

    return (
      <div className="services-terminal">
        <Terminal params={_params} />
      </div>
    );
  }
}

const mapper = () => {
  const clusterDetail = clusterStore.useStore((s) => s.detail);
  const { getClusterDetail } = clusterStore.effects;
  return {
    clusterDetail,
    getClusterDetail,
  };
};

export default connectCube(ServiceTerminal, mapper);
