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
import { Select, Alert, Input, Form, Row, Col, Progress } from 'core/nusi';
import i18n from 'i18n';
import { CompactSelect } from 'common';
import { FormInstance } from 'core/common/interface';
import { useUpdate } from 'common/use-hooks';
import clusterStore from 'cmp/stores/cluster';
import projectStore from 'app/modules/project/stores/project';

const { Option } = Select;

interface IProps {
  workSpace: string;
  canEdit?: boolean;
  showTip?: boolean;
  readOnly?: boolean;
  data?: IData;
  form?: FormInstance;
}

export interface IData {
  clusterName: string;
  cpuQuota: string;
  memQuota: string;
}

const ClusterQuota = ({
  workSpace,
  canEdit = true,
  showTip = true,
  readOnly = false,
  data = {} as IData,
  form,
}: IProps) => {
  const clusterList = clusterStore.useStore((s) => s.list);
  const leftResource = projectStore.useStore((s) => s.leftResources) as PROJECT.LeftResources;

  const [{ leftCpu, leftMem, cpuRate, memRate }, updater, update] = useUpdate({
    leftCpu: 0,
    leftMem: 0,
    cpuRate: 100,
    memRate: 100,
  });

  const cluster = form?.getFieldValue?.(['resourceConfig', workSpace, 'clusterName']) || '';

  React.useEffect(() => {
    if (cluster && leftResource && leftResource.ClusterList && leftResource.ClusterList.length !== 0) {
      const quota = leftResource.ClusterList.find(
        (item: PROJECT.ICluster) => item.ClusterName === cluster && item.Workspace === workSpace.toLocaleLowerCase(),
      );

      quota &&
        update({
          leftCpu: quota.CPUAvailable,
          leftMem: quota.MemAvailable,
          cpuRate: quota.CPUQuotaRate,
          memRate: quota.MemQuotaRate,
        });
    }
  }, [cluster, leftResource, workSpace, update]);

  const tip = (
    <div>
      <span className="mr-4">
        {i18n.t('cmp:available resources')}：CPU：{leftCpu} {i18n.t('core')}
      </span>
      <span>
        {i18n.t('memory')}:{leftMem} GB
      </span>
    </div>
  );

  if (readOnly) {
    return (
      <>
        <span className="mr-2 text-black text-opacity-40">{i18n.t('cluster')}:</span>
        {data.clusterName || ''}
        <div className="mr-4 text-black text-opacity-40">
          {i18n.t('CPU allocation')}
          <span className="text-black text-opacity-100 mx-2">{data.cpuQuota || 0}</span>
          {i18n.t('core')}
        </div>
        <div className="mr-4 text-black text-opacity-40">
          {i18n.t('Memory allocation')}
          <span className="text-black text-opacity-100 mx-2">{data.memQuota || 0}</span>
          GB
        </div>
      </>
    );
  }

  return (
    <>
      <Form.Item
        name={['resourceConfig', workSpace, 'clusterName']}
        rules={[{ required: true, message: i18n.t('please choose {name}', { name: i18n.t('cluster') }) }]}
        className="mb-0"
      >
        <CompactSelect title={i18n.t('cluster')}>
          <Select disabled={!canEdit}>
            {(clusterList || []).map((clusterItem: { id: string; name: string }) => (
              <Option key={clusterItem.id} value={clusterItem.name}>
                {clusterItem.name}
              </Option>
            ))}
          </Select>
        </CompactSelect>
      </Form.Item>
      {cluster && (
        <>
          <Row>
            <Col span={12}>
              <Form.Item
                name={['resourceConfig', workSpace, 'cpuQuota']}
                className="my-4 pr-1"
                rules={[
                  { required: true, message: i18n.t('please enter {name}', { name: 'CPU' }) },
                  {
                    validator: async (_rule: any, value: any) => {
                      if (value && (isNaN(+value) || +value < 0 || value.split('.')[1]?.length > 3)) {
                        throw new Error(i18n.t('Please enter the number of {min}-{max} decimal', { min: 1, max: 3 }));
                      }
                    },
                  },
                ]}
              >
                <Input disabled={!canEdit} addonBefore={i18n.t('CPU allocation')} addonAfter={i18n.t('core')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={['resourceConfig', workSpace, 'memQuota']}
                className="my-4 pl-1"
                rules={[
                  { required: true, message: i18n.t('please enter {name}', { name: i18n.t('memory') }) },
                  {
                    validator: async (_rule: any, value: any) => {
                      if (value && (isNaN(+value) || +value < 0 || value.split('.')[1]?.length > 3)) {
                        throw new Error(i18n.t('Please enter the number of {min}-{max} decimal', { min: 1, max: 3 }));
                      }
                    },
                  },
                ]}
              >
                <Input disabled={!canEdit} addonBefore={i18n.t('Memory allocation')} addonAfter="GB" />
              </Form.Item>
            </Col>
          </Row>

          {showTip && <Alert message={tip} type="info" className="mb-4" />}
          <Row className="mb-4">
            <Col span={12} className="flex pr-2">
              <span className="whitespace-nowrap">{i18n.t('Current distribution rate')}:</span>
              <Progress percent={cpuRate} status={'normal'} className="pl-2" />
            </Col>
            <Col span={12} className="pl-2">
              <Progress percent={memRate} status={'normal'} />
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default ClusterQuota;
