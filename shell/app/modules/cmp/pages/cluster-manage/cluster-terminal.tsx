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
    // url: `wss://${window.location.host}/api/erda/v1/namespaces/addon-nacos--r823ba8ce60a94db68dab45557547ada9/pods/nacos-0/exec?container=nacos&stdout=1&stdin=1&stderr=1&tty=1&command=%2Fbin%2Fsh&command=-c&command=TERM%3Dxterm-256color%3B%20export%20TERM%3B%20%5B%20-x%20%2Fbin%2Fbash%20%5D%20%26%26%20(%5B%20-x%20%2Fusr%2Fbin%2Fscript%20%5D%20%26%26%20%2Fusr%2Fbin%2Fscript%20-q%20-c%20%22%2Fbin%2Fbash%22%20%2Fdev%2Fnull%20%7C%7C%20exec%20%2Fbin%2Fbash)%20%7C%7C%20exec%20%2Fbin%2Fsh`,
    // url: `wss://${window.location.host}/api/terminus/websocket/032/wcwitmd2/websocket`,
    url: `wss://${window.location.host}/api/erda/websocket/k8s/clusters/terminus-dev/api/v1/namespaces/project-387-dev/pods/cluster-agent-3feb156fc4-bf99775bc-2tpkp/exec?container=cluster-agent&stdout=1&stdin=1&stderr=1&tty=1&command=%2Fbin%2Fsh&command=-c&command=TERM%3Dxterm-256color%3B%20export%20TERM%3B%20%5B%20-x%20%2Fbin%2Fbash%20%5D%20%26%26%20(%5B%20-x%20%2Fusr%2Fbin%2Fscript%20%5D%20%26%26%20%2Fusr%2Fbin%2Fscript%20-q%20-c%20%22%2Fbin%2Fbash%22%20%2Fdev%2Fnull%20%7C%7C%20exec%20%2Fbin%2Fbash)%20%7C%7C%20exec%20%2Fbin%2Fsh`,
    // url: `${replaceProtocol(window.location.protocol)}//${
    //   window.location.host
    // }/api/${getOrgFromPath()}/websocket/k8s/clusters/${ob.clusterName}/api/v1/namespaces/${ob.namespace}/pods/${ob.name}/exec?container=${encodeURIComponent('container-0')}&stdout=1&stdin=1&stderr=1&tty=1&command=${encodeURIComponent('/bin/bash')}
    // `,
    // initData,
  };

  React.useEffect(() => {
    const wss = new WebSocket(_params.url);
    wss.onopen = function (evt) {
      console.log('Connection open ...', evt);
      // wss.send('Hello WebSockets!');
    };

    wss.onmessage = function (evt) {
      console.log('Received Message: ' + evt);
      // wss.close();
    };

    wss.onclose = function (evt) {
      console.log('Connection closed.', evt);
    };

    wss.onerror = function (evt, ee) {
      console.log('Connection error.', evt, ee);
    };
  }, []);

  return (
    <div className="">
      {12}
      {/* <Terminal params={_params} /> */}
    </div>
  );
};

export default K8sClusterTerminal;

// wss://local.dice.dev.terminus.io:3000/api/erda/websocket/k8s/clusters/terminus-dev/api/v1/namespaces/default/pods/test-7c8c8745d4-56vt4#containers/exec?container=container-0&stdout=1&stdin=1&stderr=1&tty=1&command=%2Fbin%2Fbash\n
