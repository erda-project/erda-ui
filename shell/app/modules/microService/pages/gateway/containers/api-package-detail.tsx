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

/* eslint-disable react-hooks/exhaustive-deps */
import * as React from 'react';
import { Button, Select, Modal, Input, Spin, Tooltip } from 'app/nusi';
import { pick, map, get, find } from 'lodash';
import { useEffectOnce } from 'react-use';
import { PagingTable, FormModal, useSwitch, ProtocolSelector } from 'common';
import { goTo } from 'common/utils';
import { HTTP_PREFIX, HTTP_METHODS, SORT_MAP, PACKAGE_DETAIL_COLS } from '../config';
import CallerAuthDrawer from 'microService/pages/gateway/containers/api-auth';
import { AppServiceFilter } from './app-service-filter';
import i18n from 'i18n';
import routeInfoStore from 'common/stores/route';
import gatewayStore from 'microService/stores/gateway';
import { useLoading } from 'app/common/stores/loading';
import './api-package-detail.scss';

const { Option } = Select;
const { confirm } = Modal;

interface IPackageApi {
  apiId: string;
  apiPath: string;
  method: string;
  diceApp: string;
  diceService: string;
  redirectPath: string;
  redirectAddr: string;
  aclType: string;
  createAt: string;
  description?: string;
  redirectService: string;
  redirectApp: string;
  redirectType: string;
  redirectRuntimeId: string;
  redirectRuntimeName: string;
}

const redirectTypeOpt = {
  service: { name: i18n.t('microService:forward by service'), value: 'service' },
  url: { name: i18n.t('microService:forward by address'), value: 'url' },
};

export const ApiPackageDetail = () => {
  const [modalVisible, openModal, closeModal] = useSwitch(false);
  const [protocol, setProtocol] = React.useState(HTTP_PREFIX);
  const [filter, setFilter] = React.useState({} as any); // 显示用的filter
  const [effectFilter, setEffectFilter] = React.useState({} as any); // 实际搜索用的filter
  const [formData, setFormData] = React.useState({} as any);
  const [chosenRedirectType, setChosenRedirectType] = React.useState(redirectTypeOpt.service.value);
  const [chosenApp, setChosenApp] = React.useState();
  const [authModal, setAuthModal] = React.useState(false);
  const [apiid, setAppid] = React.useState('');

  const [serviceOptions, setServiceOptions] = React.useState([] as string[]);
  const [chosenService, setChosenService] = React.useState();
  const [runtimeOptions, setRuntimeOptions] = React.useState([] as any[]);
  const [runtimeId, setRuntimeId] = React.useState();
  const [apiPrefixs, setApiPrefixs] = React.useState([] as string[]);
  const formRef = React.useRef(null);
  const mutable = formData.mutable === undefined ? true : formData.mutable;
  const params = routeInfoStore.useStore((s) => s.params);
  const [packageDetailApiList, paging, registerApps, apiPackageDetail] = gatewayStore.useStore((s) => [
    s.packageDetailApiList,
    s.packageDetailApiListPaging,
    s.registerApps,
    s.apiPackageDetail,
  ]);
  const {
    getPackageDetailApiList,
    getApiPackageDetail,
    createPackageApi,
    updatePackageApi,
    deletePackageApi,
    getServiceRuntime,
    getServiceApiPrefix,
  } = gatewayStore.effects;
  const { clearApiPackageDetail } = gatewayStore.reducers;
  const [isFetchList, isCreate, isUpdate] = useLoading(gatewayStore, [
    'getPackageDetailApiList',
    'createPackageApi',
    'updatePackageApi',
  ]);
  const isFetching = isFetchList || isCreate || isUpdate;

  const { total } = paging;
  const { sortField, sortType, method, apiPath } = filter;

  const onSearch = (pagination?: { pageNo: number }) => {
    const { pageNo = 1 } = pagination || {};
    getPackageDetailApiList({ ...effectFilter, apiPath: effectFilter.apiPath || undefined, pageNo });
  };

  useEffectOnce(() => {
    getApiPackageDetail();
    return () => {
      clearApiPackageDetail();
    };
  });

  React.useEffect(() => {
    onSearch();
  }, [effectFilter]);

  React.useEffect(() => {
    if (chosenApp) {
      setServiceOptions(get(find(registerApps, { name: chosenApp }), 'services', []));
      setChosenService(undefined);
    }
  }, [chosenApp, registerApps]);

  React.useEffect(() => {
    if (chosenService) {
      getServiceRuntime({ app: chosenApp, service: chosenService }).then((res) => {
        setRuntimeOptions(res);
        const curForm = get(formRef, 'current.props.form');
        const curData = curForm && curForm.getFieldsValue();
        if (curData && curData.redirectRuntimeId && !find(res, { runtime_id: curData.redirectRuntimeId })) {
          curForm.setFieldsValue({ redirectRuntimeId: undefined });
        }
      });
    } else {
      setRuntimeOptions([]);
    }
  }, [chosenService, chosenApp]);

  const tryGetServiceApiPrefix = () => {
    if (runtimeId) {
      getServiceApiPrefix({ runtimeId, app: chosenApp, service: chosenService }).then((res) => {
        setApiPrefixs(res);
      });
    } else {
      setApiPrefixs([]);
    }
  };

  React.useEffect(() => {
    tryGetServiceApiPrefix();
  }, [runtimeId, chosenApp, chosenService]);

  const onSearchClick = () => {
    setEffectFilter({ ...filter });
  };

  const onDelete = ({ apiId }: IPackageApi) => {
    deletePackageApi({ apiId }).then(() => onSearch());
  };

  const initForm = (restFields: Partial<IPackageApi>) => {
    setChosenApp(restFields.redirectApp);
    setChosenService(restFields.redirectService);
    setRuntimeId(restFields.redirectRuntimeId);
  };

  const editForm = (record: IPackageApi) => {
    const {
      apiPath: recordApiPath = '',
      redirectPath = '',
      redirectAddr = '',
      method: methodValue = 'all',
      ...restFields
    } = record;
    const [editProtocol, redirectAddrContent] = (redirectAddr || HTTP_PREFIX).split('//');
    setProtocol(`${editProtocol}//`);
    setChosenRedirectType(restFields.redirectType);
    initForm(restFields);

    setFormData({
      ...restFields,
      apiPath: recordApiPath,
      redirectPath,
      redirectAddr: redirectAddrContent,
      method: methodValue,
    });
    openModal();
  };

  React.useEffect(() => {
    const curForm = get(formRef, 'current.props.form');
    if (modalVisible && curForm && chosenRedirectType === redirectTypeOpt.service.value) {
      setTimeout(() => {
        curForm.setFieldsValue({ method: 'all' });
      }, 0);
    }
  }, [chosenRedirectType, modalVisible]);

  const handleAuth = ({ apiId }: { apiId: string }) => {
    setAuthModal(true);
    setAppid(apiId);
  };

  const addServiceAPI = () => {
    const curForm = get(formRef, 'current.props.form');
    const fields = curForm.getFieldsValue(['redirectApp', 'redirectService', 'redirectRuntimeId']);
    const _path = goTo.resolve.apiManageQuery({ ...params, ...fields });
    window.open(_path?.replace('?', '#'));
  };

  const domain = get(apiPackageDetail.bindDomain, '[0]', '');

  const columns = [
    {
      title: i18n.t('microService:URL path'),
      dataIndex: 'apiPath',
      key: 'apiPath',
      width: '30%',
      render: (text: string) => (
        <Tooltip title={`${domain}${text}`}>
          {domain}
          {text}
        </Tooltip>
      ),
    },
    ...PACKAGE_DETAIL_COLS,
    {
      title: i18n.t('operations'),
      width: 180,
      render: (record: any) => (
        <div className="table-operations">
          <span
            className={mutable ? 'table-operations-btn' : 'table-operations-btn not-allowed'}
            onClick={() => {
              if (mutable) editForm(record);
            }}
          >
            {i18n.t('microService:edit')}
          </span>
          <span
            className="table-operations-btn"
            onClick={() => goTo(goTo.pages.apiStrategy, { ...params, apiId: record.apiId })}
          >
            {i18n.t('microService:strategy', { packageId: record.id })}
          </span>
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
          {apiPackageDetail.scene === 'openapi' ? (
            <span
              className="table-operations-btn"
              onClick={() => {
                handleAuth(record);
              }}
            >
              {i18n.t('default:authorize')}
            </span>
          ) : null}
        </div>
      ),
    },
  ];

  const RedirectTypeFieldMap = {
    service: [
      {
        label: i18n.t('microService:application name'),
        type: 'select',
        name: 'redirectApp',
        options: map(registerApps, ({ name }) => ({ name, value: name })),
        itemProps: {
          showSearch: true,
          placeholder: i18n.t('please choose {name}', { name: i18n.t('microService:application name') }),
          onChange: (val: string) => {
            setChosenApp(val);
            setChosenService(undefined);
            setRuntimeId(undefined);
            const curForm = get(formRef, 'current.props.form');
            if (curForm) {
              curForm.setFieldsValue({
                redirectService: undefined,
                redirectRuntimeId: undefined,
                redirectPath: undefined,
              });
            }
          },
        },
      },
      {
        label: i18n.t('microService:service name'),
        type: 'select',
        name: 'redirectService',
        options: map(serviceOptions, (item) => ({ value: item, name: item })),
        itemProps: {
          showSearch: true,
          placeholder: i18n.t('please choose {name}', { name: i18n.t('microService:service name') }),
          onChange: (val: string) => {
            setChosenService(val);
            setRuntimeId(undefined);
            const curForm = get(formRef, 'current.props.form');
            if (curForm) {
              curForm.setFieldsValue({ redirectRuntimeId: undefined, redirectPath: undefined });
            }
          },
        },
      },
      {
        label: i18n.t('microService:deployment branch'),
        type: 'select',
        name: 'redirectRuntimeId',
        options: map(runtimeOptions, ({ runtime_name, runtime_id }) => ({ name: runtime_name, value: runtime_id })),
        itemProps: {
          showSearch: true,
          placeholder: i18n.t('please choose {name}', { name: i18n.t('microService:deployment branch') }),
          onChange: (val: string) => {
            setRuntimeId(val);
            const curForm = get(formRef, 'current.props.form');
            if (curForm) {
              curForm.setFieldsValue({ redirectPath: undefined });
            }
          },
        },
      },
      {
        label: i18n.t('microService:service API prefix'),
        name: 'redirectPath',
        type: 'select',
        options: map(apiPrefixs, (name) => ({ name, value: name })),
        rules: [
          {
            pattern: /^\//,
            message: i18n.t('path starts with /'),
          },
        ],
        itemProps: {
          disabled: !mutable,
          placeholder: i18n.t('microService:splice the URL with the prefix removed, and forward the request'),
          onFocus: tryGetServiceApiPrefix,
          dropdownRender: (menu: React.ReactElement) => (
            <>
              {menu}
              {apiPrefixs && apiPrefixs.length ? (
                <div className="border-top color-primary text-right">
                  <span className="mr-1 hover-text" onMouseDown={addServiceAPI}>
                    {i18n.t('microService:add {scope} API', { scope: i18n.t('microService:service') })}
                  </span>
                </div>
              ) : null}
            </>
          ),
        },
      },
    ],
    url: [
      {
        label: i18n.t('microService:forwarding address'),
        name: 'redirectAddr',
        itemProps: {
          spellCheck: false,
          addonBefore: <ProtocolSelector value={protocol} onChange={setProtocol} />,
          disabled: !mutable,
        },
      },
      {
        label: i18n.t('microService:API prefix'),
        name: 'redirectPath',
        rules: [
          {
            pattern: /^\//,
            message: i18n.t('path starts with /'),
          },
        ],
        itemProps: {
          disabled: !mutable,
          placeholder: i18n.t('microService:splice the URL with the prefix removed, and forward the request'),
        },
      },
    ],
  };

  const fieldsList = [
    {
      name: 'apiId',
      required: false,
      itemProps: { type: 'hidden' },
    },
    {
      label: i18n.t('microService:URL path prefix'),
      name: 'apiPath',
      rules: [
        {
          pattern: /^\//,
          message: i18n.t('path starts with /'),
        },
      ],
      itemProps: {
        disabled: !mutable,
        placeholder: i18n.t('microService:match the URL path prefix, and remove the prefix'),
      },
    },
    {
      // 转发方式
      label: i18n.t('microService:forwarding type'),
      name: 'redirectType',
      type: 'radioGroup',
      initialValue: redirectTypeOpt.service.value,
      options: map(redirectTypeOpt, ({ name, value }) => ({ value, name })),
      itemProps: {
        onChange: (e: any) => {
          const val = e.target.value;
          setChosenRedirectType(val);
          const curForm = get(formRef, 'current.props.form');
          if (val === 'service') {
            initForm(formData);
          }
          if (formData.redirectType === val) {
            if (curForm) {
              const { redirectApp, redirectService, redirectRuntimeId, redirectAddr, redirectPath } = formData;
              const valMap = {
                service: { redirectApp, redirectService, redirectRuntimeId, redirectPath },
                url: { redirectAddr, redirectPath },
              };
              setTimeout(() => {
                curForm.setFieldsValue({ ...valMap[val] });
              }, 0);
            }
          } else if (curForm) {
            setTimeout(() => {
              curForm.setFieldsValue({ redirectPath: undefined });
            }, 0);
          }
        },
      },
    },
    ...RedirectTypeFieldMap[chosenRedirectType],
    {
      label: i18n.t('microService:method'),
      type: 'select',
      name: 'method',
      options: [{ name: i18n.t('microService:all methods'), value: 'all' }, ...HTTP_METHODS],
      itemProps: {
        disabled: !mutable || chosenRedirectType === redirectTypeOpt.service.value,
      },
    },
    // {
    //   label: i18n.t('microService:independent authorization method'),
    //   name: 'aclType',
    //   type: 'select',
    //   required: false,
    //   options: Object.entries(ACL_TYPE_MAP_WITH_BLANK).map(([key, value]) => ({ value: key, name: value })),
    // },
    {
      label: i18n.t('microService:description'),
      name: 'description',
      rules: [{ max: 100, message: i18n.t('microService:please enter a description within 100 characters') }],
    },
  ];

  if (apiPackageDetail.scene === 'openapi') {
    fieldsList.splice(2, 0, {
      label: i18n.t('microService:skip authentication'),
      initialValue: false,
      name: 'allowPassAuth',
      type: 'switch',
    });
  }

  const onCloseModal = () => {
    setChosenService(undefined);
    setChosenApp(undefined);
    setRuntimeId(undefined);
    setChosenRedirectType(redirectTypeOpt.service.value);
    setFormData({});
    closeModal();
  };

  const onCreateUpdateApi = (data: any, addMode: any) => {
    const { apiPath: apiPathValue, redirectPath, redirectAddr, method: methodValue, allowPassAuth, ...restData } = data;
    const requestData = {
      ...restData,
      apiPath: `${apiPathValue || ''}`,
      redirectPath: `${redirectPath || ''}`,
      redirectAddr: redirectAddr ? `${protocol}${redirectAddr}` : redirectAddr,
      method: methodValue !== 'all' ? methodValue : undefined,
      allowPassAuth: allowPassAuth || false,
    };
    if (addMode) {
      createPackageApi(requestData).then(() => onSearch());
    } else {
      updatePackageApi(requestData).then(() => onSearch());
    }
    onCloseModal();
  };

  const updateAppService = (updateObj: any) => {
    setFilter({ ...filter, ...updateObj });
  };

  const setSortBy = (selectedType: string) => {
    const [field, type] = selectedType.split('-');
    setFilter({ ...filter, sortField: field, sortType: type });
  };

  const onReset = () => {
    setFilter({});
    setEffectFilter({});
  };

  return (
    <div className="api-package-detail">
      <Spin spinning={isFetching}>
        <div className="mb-4">
          {/* <Button type="primary" className="mr-4" onClick={importOn}>{i18n.t('microService:import service api')}</Button> */}
          <Button type="primary" className="mr-4" onClick={openModal}>
            {i18n.t('microService:create router')}
          </Button>
          <Button
            type="primary"
            className="mr-4"
            onClick={() => {
              goTo(goTo.pages.apiStrategy, params);
            }}
          >
            {i18n.t('microService:global strategy')}
          </Button>
        </div>
        <div className="mb-4 flex justify-between items-center">
          <div className="nowrap api-filter">
            <AppServiceFilter updateField={updateAppService} dataSource={pick(filter, ['diceApp', 'diceService'])} />
            <Select
              placeholder={i18n.t('microService:method')}
              value={method}
              onChange={(value: string) => setFilter({ ...filter, method: value })}
              className="filter-select mr-4"
            >
              {HTTP_METHODS.map(({ name, value }: { name: string; value: string }) => (
                <Option key={value} value={value}>
                  {name}
                </Option>
              ))}
            </Select>
            {/* <Select placeholder={i18n.t('microService:source')} value={origin} onChange={(value: string) => setFilter({ ...filter, origin: value })} className="filter-select mr-4">
              { Object.entries(ORIGIN_MAP).map(([key, value]) => <Option key={key} value={key}>{value}</Option>) }
            </Select> */}
            <Select
              placeholder={i18n.t('microService:api sorting')}
              value={sortField ? `${sortField}-${sortType}` : undefined}
              onChange={setSortBy}
              className="filter-select mr-4"
            >
              {Object.entries(SORT_MAP).map(([key, value]) => (
                <Option key={key} value={key}>
                  {value}
                </Option>
              ))}
            </Select>
            <Input
              placeholder={i18n.t('microService:search by API')}
              value={apiPath}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setFilter({ ...filter, apiPath: event.target.value })
              }
              className="filter-input"
            />
          </div>
          <div className="nowrap filter-btn">
            <Button className="ml-4 mr-2" onClick={onReset}>
              {i18n.t('microService:reset')}
            </Button>
            <Button type="primary" ghost onClick={onSearchClick}>
              {i18n.t('search')}
            </Button>
          </div>
        </div>
      </Spin>
      <PagingTable
        isForbidInitialFetch
        dataSource={packageDetailApiList}
        total={total}
        columns={columns}
        rowKey="apiId"
        getList={onSearch}
      />
      <FormModal
        width="600px"
        name={i18n.t('microService:router')}
        wrappedComponentRef={formRef}
        fieldsList={fieldsList}
        visible={modalVisible}
        formData={formData}
        onOk={onCreateUpdateApi}
        onCancel={onCloseModal}
      />
      <CallerAuthDrawer
        visible={authModal}
        apiId={apiid}
        onClose={() => {
          setAuthModal(false);
        }}
      />
    </div>
  );
};
