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

import React from 'react';
import { ClusterTerminal } from 'cmp/common/cluster-terminal';
import { Button, Drawer, DatePicker, InputNumber } from 'core/nusi';
import { getOrgFromPath, setApiWithOrg } from 'common/utils';
import moment, { Moment } from 'moment';
import { Terminal as IconTerminal } from '@icon-park/react';
import { FormModal } from 'common';
import { FormInstance } from 'core/common/interface';
import i18n from 'i18n';
import './cluster-terminal.scss';

interface IClusterTerminalProps {
  clusterName: string;
}

const replaceProtocol = (value: string) => value.replace('http', 'ws');

export const K8sClusterTerminalButton = ({ clusterName }: IClusterTerminalProps) => {
  const [visible, setVisible] = React.useState(false);

  const params = {
    url: `${replaceProtocol(window.location.protocol)}//${
      window.location.host
    }/api/${getOrgFromPath()}/websocket/k8s/clusters/${clusterName}/kubectl-shell`,
    subProtocol: 'channel',
  };

  return (
    <>
      <Drawer
        visible={visible}
        destroyOnClose
        onClose={() => setVisible(false)}
        title={`${i18n.t('cmp:cluster {name} console', { name: clusterName })}`}
        width={'80%'}
      >
        <div className="k8s-cluster-terminal-container">
          <ClusterTerminal params={params} />
        </div>
      </Drawer>
      <Button type="primary" onClick={() => setVisible(true)}>
        <IconTerminal theme="outline" strokeLinejoin="miter" strokeLinecap="butt" />
        {i18n.t('cmp:kubectl command')}
      </Button>
    </>
  );
};

interface IPodTerminalProps {
  clusterName: string;
  namespace: string;
  podName: string;
  containerName: string;

  visible: boolean;
  onClose: () => void;
}

export const K8sPodTerminalConsole = (props: IPodTerminalProps) => {
  const { clusterName, namespace, podName, containerName, visible, onClose } = props;
  const params = {
    url: `${replaceProtocol(window.location.protocol)}//${
      window.location.host
    }/api/${getOrgFromPath()}/websocket/k8s/clusters/${clusterName}/api/v1/namespaces/${namespace}/pods/${podName}/exec?container=${containerName}&stdout=1&stdin=1&stderr=1&tty=1&command=%2Fbin%2Fsh&command=-c&command=TERM%3Dxterm-256color%3B%20export%20TERM%3B%20%5B%20-x%20%2Fbin%2Fbash%20%5D%20%26%26%20(%5B%20-x%20%2Fusr%2Fbin%2Fscript%20%5D%20%26%26%20%2Fusr%2Fbin%2Fscript%20-q%20-c%20%22%2Fbin%2Fbash%22%20%2Fdev%2Fnull%20%7C%7C%20exec%20%2Fbin%2Fbash)%20%7C%7C%20exec%20%2Fbin%2Fsh`,
    subProtocol: 'channel',
  };

  return (
    <Drawer visible={visible} destroyOnClose onClose={onClose} title={`Pod ${i18n.t('console')}`} width={'80%'}>
      <div className="k8s-cluster-terminal-container">
        <ClusterTerminal params={params} />
      </div>
    </Drawer>
  );
};

export const K8sPodTerminalLog = (props: Merge<IPodTerminalProps, { containerId?: string }>) => {
  const { clusterName, namespace, containerId, podName, containerName, visible, onClose } = props;

  const [downloadVis, setDownloadVis] = React.useState(false);

  const params = {
    url: `${replaceProtocol(window.location.protocol)}//${
      window.location.host
    }/api/${getOrgFromPath()}/websocket/k8s/clusters/${clusterName}/api/v1/namespaces/${namespace}/pods/${podName}/log?previous=false&follow=true&timestamps=true&pretty=true&container=${containerName}&sinceSeconds=1800`,
    subProtocol: 'binary',
  };

  const disabledStartDate = (startValue: Moment | undefined) => {
    if (!startValue) return false;
    return startValue > moment();
  };

  const fieldsList = [
    {
      label: i18n.t('cmp:log type'),
      name: 'type',
      type: 'radioGroup',
      initialValue: 'stdout',
      options: [
        {
          value: 'stdout',
          name: i18n.t('standard'),
        },
        {
          value: 'stderr',
          name: i18n.t('error'),
        },
      ],
    },
    {
      name: 'start',
      label: i18n.t('common:start at'),
      getComp: ({ form }: { form: FormInstance }) => (
        <DatePicker
          className="w-full"
          disabledDate={disabledStartDate}
          showTime
          showToday={false}
          format="YYYY-MM-DD HH:mm:ss"
          placeholder={i18n.t('common:select log start time')}
          onOk={(value: Moment) => {
            form.setFieldsValue({ startTime: value });
          }}
        />
      ),
    },
    {
      name: 'duration',
      label: i18n.t('common:duration(minutes)'),
      initialValue: 60,
      getComp: ({ form }: { form: FormInstance }) => (
        <InputNumber
          min={1}
          className="w-full"
          onChange={(duration) => {
            form.setFieldsValue({ endTime: duration });
          }}
          placeholder={i18n.t('please enter {name}', { name: i18n.t('common:duration(minutes)') })}
        />
      ),
    },
  ];

  const handleDownload = (formData: { start: Moment; duration: number; type: string }) => {
    const { type, start, duration } = formData;
    const now = moment().valueOf();
    let end = start.valueOf() + duration * 60 * 1000;
    end = Math.min(end, now) * 1000000;
    const _start = start.valueOf() * 1000000; // ns
    const logFile = `/api/orgCenter/logs/actions/download?clusterName=${clusterName}&end=${end}&id=${containerId}&source=container&start=${_start}&stream=${type}`;
    window.open(setApiWithOrg(logFile));
    setDownloadVis(false);
  };

  return (
    <>
      <Drawer visible={visible} destroyOnClose onClose={onClose} title={`${i18n.t('log')}`} width={'80%'}>
        <div className="k8s-cluster-terminal-container">
          <ClusterTerminal
            params={params}
            extraOptions={[
              <Button key="download" onClick={() => setDownloadVis(true)} type="ghost">
                {i18n.t('download')}
              </Button>,
            ]}
          />
        </div>
      </Drawer>
      <FormModal
        title={i18n.t('common:log download')}
        visible={downloadVis}
        fieldsList={fieldsList}
        onOk={handleDownload}
        onCancel={() => setDownloadVis(false)}
        modalProps={{ destroyOnClose: true }}
      />
    </>
  );
};
