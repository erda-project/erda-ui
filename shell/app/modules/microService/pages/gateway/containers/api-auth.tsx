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

import React, { useEffect } from 'react';
import { Button, Spin, Drawer, Table } from 'app/nusi';
import { ColumnProps } from 'core/common/interface';
import i18n from 'i18n';
import { useLoading } from 'app/common/stores/loading';
import gatewayStore from 'microService/stores/gateway';
import routeInfoStore from 'common/stores/route';
import './api-auth.scss';

interface IProps {
  apiId: string;
  visible: boolean;
  onClose: () => void;
}
const ApiAuth = (props: IProps) => {
  const { visible, apiId, onClose } = props;
  const { packageId } = routeInfoStore.useStore((s) => s.params);
  const [authDataTouched, setAuthDataTouched] = React.useState(false);
  const [authInfoList, authInfoSelected] = gatewayStore.useStore((s) => [s.authInfoList, s.authInfoSelected]);
  const [isFetchInfo, isUpdateInfo] = useLoading(gatewayStore, ['getAuthinfo', 'updateAuthinfo']);
  const isloading = isFetchInfo || isUpdateInfo;
  useEffect(() => {
    if (visible) {
      gatewayStore.effects.getAuthinfo({ apiId, packageId });
    } else {
      gatewayStore.reducers.updateAuthInfoSelected([]);
    }
  }, [apiId, packageId, visible]);

  const column: Array<ColumnProps<any>> = [
    {
      title: i18n.t('microService:caller name'),
      dataIndex: 'name',
    },
    {
      title: i18n.t('microService:caller description'),
      dataIndex: 'description',
    },
  ];
  const handleClose = () => {
    setAuthDataTouched(false);
    onClose();
  };

  const handleChangeSelected = (selectedRowKeys: string[] | number[]) => {
    gatewayStore.reducers.updateAuthInfoSelected(selectedRowKeys);
    setAuthDataTouched(true);
  };

  const handleAuth = () => {
    gatewayStore.effects.updateAuthinfo({ apiId, packageId, consumers: authInfoSelected }).then((res) => {
      if (res) {
        onClose();
        gatewayStore.reducers.updateAuthInfoSelected([]);
        gatewayStore.reducers.updateAuthInfoList([]);
      }
    });
  };
  return (
    <Drawer visible={visible} onClose={handleClose} className={'api-auth-drawer'} width={600}>
      <Spin spinning={isloading}>
        <p className="api-auth-drawer_title">{i18n.t('microService:caller authorization')}</p>
        <Button disabled={!authDataTouched} type="primary" className="mb16" onClick={handleAuth}>
          {i18n.t('microService:confirm authorization')}
        </Button>
        <Table
          rowKey="id"
          rowSelection={{
            selectedRowKeys: authInfoSelected,
            onChange: handleChangeSelected,
          }}
          dataSource={authInfoList}
          columns={column}
          pagination={false}
        />
      </Spin>
    </Drawer>
  );
};

export default ApiAuth;
