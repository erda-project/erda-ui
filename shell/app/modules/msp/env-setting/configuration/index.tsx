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
import './index.scss';
import { ColumnProps } from 'core/common/interface';
import { useUpdate, ErdaCustomIcon, Copy, EmptyHolder } from 'common';
import { setApiWithOrg } from 'common/utils';
import i18n from 'i18n';
import { Button, Table, Modal, Alert, Popconfirm, message, Spin } from 'core/nusi';
import TypeSelect, { Item } from 'msp/env-setting/configuration/type-select';
import { PAGINATION } from 'app/constants';
import { usePerm, WithAuth } from 'user/common';
import moment from 'moment';
import {
  getAcquisitionAndLang,
  getDetailKey,
  deleteDetailKey,
  getInfo,
  getAllKey,
  createAccessKey,
  downloadCsvUrl,
} from 'msp/services/configuration';
import routeInfoStore from 'core/stores/route';
import { Download as IconDownload, Copy as IconCopy } from '@icon-park/react';

type LangItem = Merge<CONFIGURATION.ILangConf, Item>;
type Strategy = Merge<CONFIGURATION.IStrategy, Item>;

const convertLanguages = (item: CONFIGURATION.ILangConf): LangItem => {
  return {
    ...item,
    key: item.language,
    type: item.language,
    displayName: item.language,
  };
};

interface IProps {
  title: string;
  children: React.ReactNode;
}

interface IState {
  lang: string;
  strategy: string;
  languages: LangItem[];
  modalShow: boolean;
  keyDetailShow: boolean;
  currentPage: number;
}

const ItemRender = ({ title, children }: IProps) => {
  return (
    <div className="mb-6">
      <div className="font-medium color-text mb-3 text-base">{title}</div>
      {children}
    </div>
  );
};

const Configuration = () => {
  const { projectId, tenantGroup, env } = routeInfoStore.useStore((s) => s.params);

  const accessPerm = usePerm((s) => s.project.microService.accessConfiguration);
  const [{ lang, currentPage, strategy, languages, modalShow, keyDetailShow }, updater, update] = useUpdate<IState>({
    lang: '',
    strategy: '',
    languages: [],
    modalShow: false,
    keyDetailShow: false,
    currentPage: 1,
  });

  const [allKey, allKeyLoading] = getAllKey.useState();
  const [acquisitionAndLangData, acquisitionAndLangDataLoading] = getAcquisitionAndLang.useState();
  const [keyDetailInfo, keyDetailInfoLoading] = getDetailKey.useState();
  const [infoData, infoDataLoading] = getInfo.useState();
  const [createKeyInfo, createKeyInfoLoading] = createAccessKey.useState();

  React.useEffect(() => {
    getAcquisitionAndLang.fetch();
    getAllKey.fetch({
      subjectType: 3,
      subject: projectId,
      pageNo: 1,
      pageSize: PAGINATION.pageSize,
      scope: `msp_${env}`,
      scopeId: tenantGroup,
    });
  }, []);

  const strategies: Strategy[] = React.useMemo(() => {
    const newList = acquisitionAndLangData?.map((item) => {
      return {
        ...item,
        key: item.strategy,
        type: item.strategy,
        displayName: item.strategy,
      };
    });
    const newLanguages = newList?.[0].languages.map(convertLanguages);
    update({
      languages: newLanguages,
      lang: newLanguages?.[0].type,
      strategy: newList?.[0].type,
    });
    return newList || [];
  }, [acquisitionAndLangData, update]);

  const handleChangeStrategy = (type: string, item: Strategy) => {
    const newLanguages = item.languages.map(convertLanguages);
    update({
      languages: newLanguages,
      lang: newLanguages?.[0].type,
      strategy: type,
    });
  };
  const handleChangeLang = (type: string) => {
    updater.lang(type);
  };

  const columns: Array<ColumnProps<CONFIGURATION.IAllKeyData>> = [
    { title: 'accessKey', dataIndex: 'accessKey', key: 'accessKey' },
    {
      title: i18n.t('create time'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (_: unknown, record?: CONFIGURATION.IAllKeyData) =>
        moment(record?.createdAt).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: i18n.t('application:operation'),
      width: 200,
      dataIndex: 'operation',
      key: 'operation',
      render: (_: unknown, record: CONFIGURATION.IAllKeyData) => (
        <div className="table-operations">
          <a onClick={() => getDetail(record.id)} className="table-operations-btn">
            {i18n.t('dcos:see details')}
          </a>
          {accessPerm.createAccessKey.pass ? (
            <Popconfirm onConfirm={() => deleteKey(record.id)} title={`${i18n.t('common:confirm to delete')}?`}>
              <a className="table-operations-btn">{i18n.t('application:delete')}</a>
            </Popconfirm>
          ) : null}
        </div>
      ),
    },
  ];

  const getDetail = async (id: string) => {
    await getDetailKey.fetch({
      id,
    });
    update({
      keyDetailShow: true,
    });
  };

  const createKey = async () => {
    await createAccessKey.fetch({
      subject: projectId,
      subjectType: 3,
      scope: `msp_${env}`,
      scopeId: tenantGroup,
    });

    await getAllKey.fetch({
      subjectType: 3,
      subject: projectId,
      pageNo: 1,
      pageSize: PAGINATION.pageSize,
      scope: `msp_${env}`,
      scopeId: tenantGroup,
    });

    update({
      modalShow: true,
      currentPage: 1,
    });
  };

  const deleteKey = async (id: string) => {
    await deleteDetailKey.fetch({
      id,
    });
    await getAllKey.fetch({
      subjectType: 3,
      subject: projectId,
      pageNo: 1,
      pageSize: PAGINATION.pageSize,
      scope: `msp_${env}`,
      scopeId: tenantGroup,
    });
    update({
      currentPage: 1,
    });
    message.success(i18n.t('application:deleted successfully'));
  };

  React.useEffect(() => {
    if (strategy && lang) {
      getInfo.fetch({
        language: lang,
        strategy,
      });
    }
  }, [strategy, lang]);

  const downloadCsvFile = (id: string) => {
    window.open(setApiWithOrg(`${downloadCsvUrl}?id=${id}`));
  };

  const pageChange = (page: number) => {
    update({
      currentPage: page,
    });
    getAllKey.fetch({
      subjectType: 3,
      subject: projectId,
      pageNo: page,
      pageSize: PAGINATION.pageSize,
      scope: `msp_${env}`,
      scopeId: tenantGroup,
    });
  };
  return (
    <Spin
      spinning={
        acquisitionAndLangDataLoading ||
        allKeyLoading ||
        keyDetailInfoLoading ||
        infoDataLoading ||
        createKeyInfoLoading
      }
    >
      <div>
        <Modal
          onCancel={() =>
            update({
              keyDetailShow: false,
            })
          }
          width={720}
          title={i18n.t('msp:accessKey details')}
          visible={keyDetailShow}
          footer={[
            <Button
              onClick={() =>
                update({
                  keyDetailShow: false,
                })
              }
            >
              {i18n.t('application:close')}
            </Button>,
          ]}
        >
          <div className="rounded-sm p-4 container-key text-gray mb-2">
            <div className="flex items-center mb-2">
              <span>accessKey ID</span>
              <span className="ml-32">{keyDetailInfo?.accessKey}</span>
            </div>
            <div className="flex items-center">
              <span>accessKey Secret</span>
              <span className="ml-24">{accessPerm.viewAccessKeySecret.pass ? keyDetailInfo?.secretKey : '***'}</span>
            </div>
          </div>
        </Modal>

        <Modal
          onCancel={() => {
            update({
              modalShow: false,
            });
          }}
          width={720}
          title={i18n.t('msp:create AccessKey')}
          visible={modalShow}
          footer={[
            <Button
              key="close"
              onClick={() =>
                update({
                  modalShow: false,
                })
              }
            >
              {i18n.t('application:close')}
            </Button>,
          ]}
        >
          <Alert message={i18n.t('msp:createAccessKey info')} type="warning" showIcon />
          <div className="flex items-center ml-4 my-8">
            <ErdaCustomIcon className="mr-2" size="18" type="yuanxingxuanzhong-fill" />
            <h3>{i18n.t('msp:created successfully, please save in time')}</h3>
          </div>
          <div className="rounded-sm container-key p-4 text-gray mb-2">
            <div className="flex items-center mb-2">
              <span>accessKey ID</span>
              <span className="ml-32">{createKeyInfo?.accessKey}</span>
            </div>
            <div className="flex items-center">
              <span>accessKey Secret</span>
              <span className="ml-24">{createKeyInfo?.secretKey}</span>
            </div>
          </div>
          <div className="flex items-center text-primary">
            <div className="cursor-pointer" onClick={() => createKeyInfo && downloadCsvFile(createKeyInfo.id)}>
              <IconDownload size="14" />
              <span className="mr-8">{i18n.t('msp:download csv file')}</span>
            </div>
            <IconCopy size="14" />
            <Copy selector=".container-key" copyText={`${createKeyInfo?.accessKey}\n${createKeyInfo?.secretKey}`}>
              {i18n.t('copy')}
            </Copy>
          </div>
        </Modal>

        <WithAuth pass={accessPerm.createAccessKey.pass}>
          <Button className="top-button-group font-bold m4 add-key" type="primary" onClick={createKey}>
            {i18n.t('msp:create AccessKey')}
          </Button>
        </WithAuth>
        <Table
          className="mt-2 mb-4"
          columns={columns}
          dataSource={allKey?.list || []}
          scroll={{ x: '100%' }}
          rowKey={(record) => `${record?.accessKey}` || 'accessKey'}
          pagination={{
            current: currentPage,
            pageSize: PAGINATION.pageSize,
            total: allKey?.total,
            onChange: pageChange,
          }}
        />

        <ItemRender title={i18n.t('msp:choose data collection method')}>
          <div className="mb-3 text-gray">{i18n.t('msp:data collection desc')}</div>
          <TypeSelect<Strategy> list={strategies || []} value={strategy} onChange={handleChangeStrategy} />
        </ItemRender>

        {!languages ? (
          <EmptyHolder relative />
        ) : (
          <ItemRender title={i18n.t('msp:choose the language you want to connect')}>
            <TypeSelect<LangItem> value={lang} list={languages || []} onChange={handleChangeLang} />
          </ItemRender>
        )}

        <div className="h-full bg-grey border-all p-4 mt-2 rounded">
          <span className="text-sm">{infoData || ''}</span>
        </div>
      </div>
    </Spin>
  );
};

export default Configuration;
