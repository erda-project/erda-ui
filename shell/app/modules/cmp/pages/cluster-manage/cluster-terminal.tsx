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
import React from 'react';
import { Terminal } from 'common';
import { getClusterDetail } from 'cmp/services/cluster';
import { getOrgFromPath } from 'common/utils';
import i18n from 'i18n';

interface IProps {
  clusterName: string;
}

const K8sClusterTerminal = (props: IProps) => {
  const { clusterName } = props;

  const replaceProtocol = (value: string) => value.replace('http', 'ws');
  const ob = {
    namespace: 'default',
    name: 'test-7c8c8745d4-56vt4',
    clusterName: 'terminus-dev',
  };
  const _params = {
    url: `wss://${window.location.host}/api/${getOrgFromPath()}/websocket/k8s/clusters/${ob.clusterName}/kubectl-shell`,
    // url: `${replaceProtocol(window.location.protocol)}//${
    //   window.location.host
    // }/api/${getOrgFromPath()}/websocket/k8s/clusters/${ob.clusterName}/api/v1/namespaces/${ob.namespace}/pods/${ob.name}/exec?container=${encodeURIComponent('container-0')}&stdout=1&stdin=1&stderr=1&tty=1&command=${encodeURIComponent('/bin/bash')}
    // `,
    // initData,
  };

  const wss = new WebSocket(_params.url);
  wss.onopen = function (evt) {
    console.log('Connection open ...', evt);
    wss.send('Hello WebSockets!');
  };

  wss.onmessage = function (evt) {
    console.log('Received Message: ' + evt);
    // wss.close();
  };

  wss.onclose = function (evt) {
    console.log('Connection closed.', evt);
  };

  wss.onerror = function (evt) {
    console.log('Connection closed.', evt);
  };

  return (
    <div className="">
      {12}
      {/* <Terminal params={_params} /> */}
    </div>
  );
};

export default K8sClusterTerminal;

// wss://local.dice.dev.terminus.io:3000/api/erda/websocket/k8s/clusters/terminus-dev/api/v1/namespaces/default/pods/test-7c8c8745d4-56vt4#containers/exec?container=container-0&stdout=1&stdin=1&stderr=1&tty=1&command=%2Fbin%2Fbash\n
