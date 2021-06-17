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
import { Button, Modal, Tooltip, Input } from 'app/nusi';
import { isEmpty, map } from 'lodash';
import moment from 'moment';
import { PagingTable, FormModal, useSwitch, Filter } from 'common';
import { goTo } from 'common/utils';
import { ACL_TYPE_MAP, AUTH_TYPE_MAP, SCENE_MAP } from '../config';
import i18n from 'i18n';
import { useEffectOnce } from 'react-use';
import gatewayStore from 'microService/stores/gateway';
import { useLoading } from 'app/common/stores/loading';

const { confirm } = Modal;

interface IApiPackage {
  id: number;
  name: string;
  bindDomain: string;
  authType: string;
  aclType: string;
  createAt: string;
  description?: string;
}

const apiPackageCols = [
  {
    title: i18n.t('microService:name'),
    dataIndex: 'name',
    key: 'name',
    width: '20%',
  },
  {
    title: i18n.t('microService:scene'),
    dataIndex: 'scene',
    key: 'scene',
    width: '13%',
    tip: true,
    render: (text: string) => SCENE_MAP[text] || i18n.t('none'),
  },
  {
    title: i18n.t('microService:binding domain'),
    dataIndex: 'bindDomain',
    key: 'bindDomain',
    width: '20%',
    render: (domains: string[]) => (
      <Tooltip
        title={
          <>
            {map(domains, (domain: string) => (
              <div key={domain}>{domain}</div>
            ))}
          </>
        }
      >
        {domains.join('; ')}
      </Tooltip>
    ),
  },
  {
    title: i18n.t('microService:description'),
    dataIndex: 'description',
    key: 'description',
    width: '15%',
  },
  {
    title: i18n.t('create time'),
    dataIndex: 'createAt',
    key: 'createAt',
    width: '18%',
    tip: true,
    render: (createAt: number) => moment(createAt).format('YYYY-MM-DD HH:mm:ss'),
  },
];

export const PureApiPackage = () => {
  const [apiPackageList, paging] = gatewayStore.useStore((s) => [s.apiPackageList, s.apiPackageListPaging]);
  const { getApiPackageList, createApiPackage, deletePackage, updateApiPackage } = gatewayStore.effects;
  const { clearApiPackageList } = gatewayStore.reducers;
  const [isFetching] = useLoading(gatewayStore, ['getApiPackageList']);
  const [modalVisible, openModal, closeModal] = useSwitch(false);
  const [formData, setFormData] = React.useState({} as any);
  const { total } = paging;

  useEffectOnce(() => {
    getApiPackageList({ pageNo: 1 });
    return () => {
      clearApiPackageList();
    };
  });

  const onDelete = ({ id }: IApiPackage) => {
    deletePackage({ packageId: id });
  };

  const onCloseModal = () => {
    setFormData({});
    closeModal();
  };

  const columns = [
    ...apiPackageCols,
    {
      title: i18n.t('operations'),
      width: 150,
      render: (record: any) => {
        // const { name } = record;
        // const auditLink = `./consumer-audit/consumer-analyze?${mergeSearch({ pack: name }, true)}`;
        const isUnity = record.scene === 'unity';
        return (
          <div className="table-operations">
            <span
              className={`table-operations-btn ${isUnity ? 'not-allowed' : ''}`}
              onClick={() => {
                !isUnity && goTo(`./${record.id}/edit`);
              }}
            >
              {i18n.t('microService:edit')}
            </span>
            <span className="table-operations-btn" onClick={() => goTo(`./${record.id}/detail`)}>
              {i18n.t('microService:details')}
            </span>
            {/* <span className="table-operations-btn" onClick={() => goTo(auditLink)}>{i18n.t('microService:audit')}</span> */}
            <span
              className="table-operations-btn"
              onClick={() =>
                confirm({
                  title: i18n.t('microService:confirm deletion?'),
                  onOk: () => onDelete(record),
                })
              }
            >
              {i18n.t('microService:delete')}
            </span>
          </div>
        );
      },
    },
  ];

  const fieldsList = [
    {
      name: 'id',
      required: false,
      itemProps: { type: 'hidden' },
    },
    {
      label: i18n.t('microService:name'),
      name: 'name',
      rules: [
        {
          pattern: /^\w{1,20}$/g,
          message: i18n.t('microService:Please enter a name consisting of letters and numbers within 20 characters.'),
        },
      ],
      itemProps: { disabled: !isEmpty(formData) },
    },
    {
      label: i18n.t('microService:binding domain'),
      name: 'bindDomain',
      rules: [
        {
          pattern: /^([a-z]|\d|-|\*)+(\.([a-z]|\d|-|\*)+)+$/g,
          message: i18n.t('microService:lowercase letters, numbers, dot, -, *'),
        },
      ],
      itemProps: {
        spellCheck: false,
      },
    },
    {
      label: i18n.t('microService:consumer authentication method'),
      type: 'select',
      name: 'authType',
      options: Object.entries(AUTH_TYPE_MAP).map(([key, value]) => ({ value: key, name: value })),
    },
    {
      label: i18n.t('microService:authorized access method'),
      type: 'select',
      name: 'aclType',
      options: Object.entries(ACL_TYPE_MAP).map(([key, value]) => ({ value: key, name: value })),
    },
    {
      label: i18n.t('microService:description'),
      name: 'description',
      rules: [{ max: 100, message: i18n.t('microService:please enter a description within 100 characters') }],
    },
  ];

  const onCreateUpdate = (data: any, addMode: any) => {
    if (addMode) {
      createApiPackage(data).then(() => getApiPackageList({ pageNo: 1 }));
    } else {
      updateApiPackage(data).then(() => getApiPackageList({ pageNo: 1 }));
    }
    onCloseModal();
  };

  const filterField = [
    {
      type: Input,
      name: 'domain',
      customProps: {
        placeholder: i18n.t('filter by {name}', { name: i18n.t('microService:domain name') }),
      },
    },
  ];

  const onFilter = (query: Obj = {}) => {
    getApiPackageList({ pageNo: 1, ...query });
  };

  const urlExtra = React.useMemo(() => {
    return { pageNo: paging.pageNo };
  }, [paging.pageNo]);

  return (
    <div className="api-package">
      <div className="mb16" style={{ float: 'right', zIndex: 1, position: 'relative' }}>
        <Button type="primary" onClick={() => goTo('./create')}>
          {i18n.t('microService:create a endpoint')}
        </Button>
      </div>
      <Filter config={filterField} onFilter={onFilter} connectUrlSearch urlExtra={urlExtra} />
      <PagingTable
        isForbidInitialFetch
        isFetching={isFetching}
        dataSource={apiPackageList}
        total={total}
        columns={columns}
        rowKey="id"
        getList={getApiPackageList}
      />
      <FormModal
        width="600px"
        name={i18n.t('microService:endpoint')}
        fieldsList={fieldsList}
        visible={modalVisible}
        formData={formData}
        onOk={onCreateUpdate}
        onCancel={onCloseModal}
      />
    </div>
  );
};

export const ApiPackage = PureApiPackage;
