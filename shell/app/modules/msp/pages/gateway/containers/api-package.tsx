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
import gatewayStore from 'msp/stores/gateway';
import { useLoading } from 'core/stores/loading';

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
    title: i18n.t('msp:name'),
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: i18n.t('msp:scene'),
    dataIndex: 'scene',
    key: 'scene',
    render: (text: string) => <Tooltip>{SCENE_MAP[text] || i18n.t('none')}</Tooltip>,
  },
  {
    title: i18n.t('msp:binding domain'),
    dataIndex: 'bindDomain',
    key: 'bindDomain',
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
    title: i18n.t('msp:description'),
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: i18n.t('create time'),
    dataIndex: 'createAt',
    key: 'createAt',
    render: (createAt: number) => <Tooltip>{moment(createAt).format('YYYY-MM-DD HH:mm:ss')}</Tooltip>,
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
      fixed: 'right',
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
              {i18n.t('msp:edit')}
            </span>
            <span className="table-operations-btn" onClick={() => goTo(`./${record.id}/detail`)}>
              {i18n.t('msp:details')}
            </span>
            {/* <span className="table-operations-btn" onClick={() => goTo(auditLink)}>{i18n.t('msp:audit')}</span> */}
            <span
              className="table-operations-btn"
              onClick={() =>
                confirm({
                  title: i18n.t('msp:confirm deletion?'),
                  onOk: () => onDelete(record),
                })
              }
            >
              {i18n.t('msp:delete')}
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
      label: i18n.t('msp:name'),
      name: 'name',
      rules: [
        {
          pattern: /^\w{1,20}$/g,
          message: i18n.t('msp:Please enter a name consisting of letters and numbers within 20 characters.'),
        },
      ],
      itemProps: { disabled: !isEmpty(formData) },
    },
    {
      label: i18n.t('msp:binding domain'),
      name: 'bindDomain',
      rules: [
        {
          pattern: /^([a-z]|\d|-|\*)+(\.([a-z]|\d|-|\*)+)+$/g,
          message: i18n.t('msp:lowercase letters, numbers, dot, -, *'),
        },
      ],
      itemProps: {
        spellCheck: false,
      },
    },
    {
      label: i18n.t('msp:consumer authentication method'),
      type: 'select',
      name: 'authType',
      options: Object.entries(AUTH_TYPE_MAP).map(([key, value]) => ({ value: key, name: value })),
    },
    {
      label: i18n.t('msp:authorized access method'),
      type: 'select',
      name: 'aclType',
      options: Object.entries(ACL_TYPE_MAP).map(([key, value]) => ({ value: key, name: value })),
    },
    {
      label: i18n.t('msp:description'),
      name: 'description',
      rules: [{ max: 100, message: i18n.t('msp:please enter a description within 100 characters') }],
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
        placeholder: i18n.t('filter by {name}', { name: i18n.t('msp:domain name') }),
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
      <div className="mb16" style={{ cssFloat: 'right', zIndex: 1, position: 'relative' }}>
        <Button type="primary" onClick={() => goTo('./create')}>
          {i18n.t('msp:create a endpoint')}
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
        name={i18n.t('msp:endpoint')}
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
