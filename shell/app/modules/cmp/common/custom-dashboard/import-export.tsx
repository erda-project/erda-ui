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
import { Button, Modal, Spin, Radio, Space, Upload, message, Avatar, Select, Tooltip } from 'antd';
import { SimpleTabs, ErdaIcon, Badge } from 'common';
import { useUpdate } from 'common/use-hooks';
import { getUploadProps } from 'common/utils/upload-props';
import EmptySVG from 'app/images/upload_empty.svg';
import { useMount, useInterval } from 'react-use';
import ErdaTable from 'common/components/table';
import { getAvatarChars, getOrgFromPath, convertToFormData } from 'common/utils';
import { find, map } from 'lodash';
import {
  getDashboardOperationRecord,
  downloadApi,
  importCustomDashboard,
  exportCustomDashboard,
} from 'app/modules/cmp/services/_common-custom-dashboard';
import { CustomDashboardScope } from 'app/modules/cmp/stores/_common-custom-dashboard';
import i18n from 'i18n';
import { useUserMap } from 'core/stores/userMap';
import moment from 'moment';
import routeInfoStore from 'core/stores/route';
import './import-export.scss';

interface IProps {
  queryObj: Custom_Dashboard.CustomLIstQuery;
  scopeId: string;
  scope: string;
  visible: boolean;
  relationship?: Custom_Dashboard.Relationship[];
  title?: string;
  tabs?: Array<{ key: string; text: string; disabled?: boolean }>;
  setVisible: (visible: boolean) => void;
  getCustomDashboard: (pageNo: number) => void;
}

const { Option } = Select;

const defaultTabs = [
  {
    key: 'record',
    text: i18n.t('record'),
    disabled: false,
  },
  {
    key: 'export',
    text: i18n.t('export'),
    disabled: false,
  },
  {
    key: 'import',
    text: i18n.t('import'),
    disabled: false,
  },
];

const workSpaceMap = {
  All: {
    label: i18n.t('cmp:All files'),
    value: 'FILE',
  },
  DEV: {
    label: i18n.t('dev environment'),
    value: 'DEV',
  },
  TEST: {
    label: i18n.t('test environment'),
    value: 'TEST',
  },
  STAGING: {
    label: i18n.t('staging environment'),
    value: 'STAGING',
  },
  PROD: {
    label: i18n.t('prod environment'),
    value: 'PROD',
  },
};

const ImportExport = (props: IProps) => {
  const {
    queryObj,
    scope,
    scopeId,
    title = i18n.t('cmp:Export/Import'),
    tabs = defaultTabs,
    visible,
    relationship,
    setVisible,
    getCustomDashboard,
  } = props;

  const getDefaultTabs = () => tabs.find((item) => !item.disabled)?.key || 'record';
  const [{ tabValue }, updater, update] = useUpdate({
    tabValue: getDefaultTabs(),
  });

  const closeModal = () => {
    setVisible(false);
    update({
      tabValue: getDefaultTabs(),
    });
  };
  const toRecord = () => update({ tabValue: 'record' });

  const CompMap = {
    export: <Export scope={scope} scopeId={scopeId} queryObj={queryObj} onClose={closeModal} toRecord={toRecord} relationship={relationship}/>,
    import: (
      <Import
        scopeId={scopeId}
        scope={scope}
        onClose={closeModal}
        toRecord={toRecord}
        getCustomDashboard={getCustomDashboard}
      />
    ),
    record: <Record scope={scope} scopeId={scopeId} relationship={relationship}/>,
  };

  return (
    <>
      <Button onClick={() => setVisible(true)}>{title}</Button>
      <Modal
        onCancel={closeModal}
        width={1000}
        destroyOnClose
        maskClosable={false}
        wrapClassName={'import-export-modal'}
        visible={visible}
        footer={null}
        title={
          <div className="flex-h-center py-3 px-4 bg-default-02">
            <span className="text-base">{title}</span>
            <div className="w-px h-3 bg-default-1 mx-4" />
            <SimpleTabs
              mode="underline"
              className="text-sm font-normal"
              tabs={tabs}
              onSelect={(v) => updater.tabValue(v)}
              value={tabValue}
            />
          </div>
        }
      >
        <div className="w-full py-4">{CompMap[tabValue]}</div>
      </Modal>
    </>
  );
};

interface ExportProps {
  queryObj: Custom_Dashboard.CustomLIstQuery;
  scope: string;
  scopeId: string;
  relationship?: Custom_Dashboard.Relationship[];
  onClose: () => void;
  toRecord: () => void;
}

const Export = (props: ExportProps) => {
  const { onClose, toRecord, queryObj, scope, scopeId, relationship } = props;
  const [exportType, setExportType] = React.useState('condition');
  const [exportMode, setExportMode] = React.useState('FILE');
  const params = routeInfoStore.getState((s) => s.params);
  const { env } = params;
  const curProjectRelationships = relationship?.filter((item) => item.workspace !== env);

  const envOptions = map(curProjectRelationships, (item) => ({
    label: workSpaceMap[item.workspace].label,
    value: item.tenantId,
  }));

  const exportEnvOptions = [{ label: i18n.t('cmp:All files'), value: 'FILE' }, ...envOptions];

  const exportOption = [
    {
      key: 'condition',
      text: i18n.t('cmp:Export by filter condition'),
      desc: i18n.t('cmp:Export the data of the filter conditions'),
    },
    {
      key: 'all',
      text: i18n.t('cmp:Export all'),
      desc: i18n.t('cmp:Export all data'),
    },
  ];

  const onExport = () => {
    let query = {
      pageNo: 1,
      scope,
      scopeId,
    } as Custom_Dashboard.ExportParams;

    if (exportType === 'condition') {
      const { createdAt, ...rest } = queryObj || {};
      const [startTime, endTime] = createdAt || [];
      if (createdAt) {
        query = { ...rest, startTime, endTime, ...query };
      } else {
        query = { ...rest, ...query };
      }
    }

    if (exportMode !== 'FILE') {
      query = { ...query, targetScope: scope, targetScopeId: exportMode };
    }

    exportCustomDashboard.fetch(query).then(() => {
      message.success(i18n.t('cmp:Start exporting, please view detail in records'));
      toRecord();
    });
  };

  return (
    <div className="h-full flex flex-col">
      <Radio.Group
        className="w-full flex-1 overflow-auto"
        onChange={(e) => {
          const v = e.target.value;
          setExportType(v);
          setExportMode('FILE');
        }}
        value={exportType}
      >
        <Space direction="vertical" className="w-full">
          {exportOption.map((item) => (
            <Radio
              value={item.key}
              key={item.key}
              className={`py-4 rounded-sm px-2 flex-h-center relative ${
                exportType === item.key ? 'bg-default-04' : ''
              } hover:bg-default-04`}
            >
              <div className="flex-h-center justify-around">
                <div className="flex flex-col">
                  <span className="font-medium">{item.text}</span>
                  <span className="text-default-6 text-xs">{item.desc}</span>
                </div>
                {scope === CustomDashboardScope.MICRO_SERVICE && (
                  <Select
                    style={{ minWidth: 200 }}
                    className="absolute right-8"
                    value={exportType === item.key ? exportMode : 'FILE'}
                    onChange={(value) => {
                      setExportMode(value);
                    }}
                    disabled={exportType !== item.key}
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                  >
                    {exportEnvOptions.map((option) => (
                      <Option value={option.value} key={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                )}
              </div>
            </Radio>
          ))}
        </Space>
      </Radio.Group>
      <div className="flex-h-center justify-end mt-4">
        <Button onClick={onClose}>{i18n.t('cancel')}</Button>
        <Button onClick={onExport} className="ml-2" type="primary">
          {i18n.t('ok')}
        </Button>
      </div>
    </div>
  );
};

interface ImportProps {
  scopeId: string;
  scope: string;
  onClose: () => void;
  toRecord: () => void;
  getCustomDashboard: (pageNo: number) => void;
}

const Import = (props: ImportProps) => {
  const { scopeId, scope, onClose, toRecord, getCustomDashboard } = props;
  const [fileStatus, setFileStatus] = React.useState('init');
  const [fileData, setFileData] = React.useState(null as unknown as Custom_Dashboard.FileData);

  const showUploadList = {
    showRemoveIcon: true,
    removeIcon: (
      <ErdaIcon
        type="remove"
        onClick={() => {
          setFileStatus('init');
          setFileData(null as unknown as Custom_Dashboard.FileData);
        }}
      />
    ),
  };

  const uploadProps = getUploadProps({
    accept: '.json',
    showUploadList,
    beforeUpload: (file: File) => {
      const isLt20M = file.size / 1024 / 1024 < 20;
      if (!isLt20M) {
        message.error(i18n.t('cmp:File must be smaller than 20 MB'));
      }
      return isLt20M;
    },
    action: `/api/${getOrgFromPath()}/dashboard/blocks/parse`,
    onChange: ({ file }: any) => {
      setFileData(file);
      if (file.status === 'uploading') {
        setFileStatus('uploading');
      }
      if (file.status === 'done') {
        setFileStatus('done');
      }
      if (file.status === 'error') {
        setFileStatus('error');
      }
    },
    maxCount: 1,
    iconRender: () => (
      <div className="flex-h-center">
        <ErdaIcon type="shenjirizhi" />
      </div>
    ),
    className: 'custom-dashboard-import-upload',
    itemRender: (originNode: React.ReactElement) => {
      return <div className="hover:bg-default-08">{originNode}</div>;
    },
  });

  const importFile = () => {
    fileData &&
      importCustomDashboard({
        file: convertToFormData({ file: fileData.originFileObj, scope, scopeId }),
        $options: { uploadFileKey: 'file' },
      }).then((res) => {
        if (res?.success) {
          onClose();
          message.success(i18n.t('cmp:Start importing, please view detail in records'));
          getCustomDashboard(1);
        } else {
          toRecord();
        }
      });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto">
        <div className="bg-default-04 py-10 rounded-sm px-2 flex-v-center">
          <Upload {...uploadProps}>
            {fileStatus === 'init' && (
              <div className="flex-all-center cursor-pointer w-full">
                <img src={EmptySVG} style={{ height: 80 }} />
                <div className="flex flex-col ml-2">
                  <span className="text-base font-medium text-default ">{i18n.t('cmp:Upload File')}</span>
                  <span className="text-xs text-default-6">{i18n.t('cmp:Click this area to browse and upload')}</span>
                </div>
              </div>
            )}
          </Upload>
          <div className="bg-default-01 py-2 2 px-1">
            {fileStatus === 'uploading' && (
              <div className="flex-h-center text-info">
                <Spin spinning size="small" className="flex-all-center" />
                <span className="ml-1">{i18n.t('parsing')}...</span>
              </div>
            )}
            {fileStatus === 'done' && (
              <div className="flex-v-center flex-col">
                <div className="text-success mb-2 flex-h-center">
                  <ErdaIcon type="check" size={12} />
                  <span className="ml-1">{i18n.t('parsing succeeded')}</span>
                </div>
              </div>
            )}
            {fileStatus === 'error' && (
              <div>
                <div className="flex-h-center text-error mb-2">
                  <ErdaIcon type="guanbi" size={12} />
                  <span className="mx-1">{i18n.t('parsing failed')}, </span>
                  <span
                    className="underline cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      Modal.error({
                        title: i18n.t('error reason'),
                        content: fileData?.response.err.msg,
                      });
                    }}
                  >
                    {i18n.t('error reason')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-h-center justify-end mt-4">
        <Button onClick={onClose}>{i18n.t('cancel')}</Button>
        <Button onClick={importFile} disabled={fileStatus !== 'done'} className="ml-2" type="primary">
          {i18n.t('ok')}
        </Button>
      </div>
    </div>
  );
};

const Record = ({ scope, scopeId, relationship }: { scope: string; scopeId: string,relationship?:Custom_Dashboard.Relationship[] }) => {
  const [data, loading] = getDashboardOperationRecord.useState();
  const [hasError, setHasError] = React.useState(false);
  const [isFinished, setIsFinished] = React.useState(false);
  const [paging, setPaging] = React.useState({ pageNo: 1, pageSize: 10 });
  const userMap = useUserMap();

  const list = data?.histories || [];
  const total = data?.total;

  const getList = React.useCallback(
    (q?: { pageSize?: number; pageNo: number }) => {
      const { pageSize, pageNo } = q || {};
      getDashboardOperationRecord
        .fetch({
          scope,
          scopeId,
          pageSize: pageSize || paging.pageSize,
          pageNo: pageNo || paging.pageNo,
        })
        .then((res) => {
          if (res.data?.histories.every((item) => ['Success', 'Failure'].includes(item.status))) {
            setIsFinished(true);
          }
        })
        .catch(() => {
          setHasError(true);
        });
    },
    [paging?.pageSize, scope, scopeId],
  );

  useInterval(
    () => {
      getList();
    },
    isFinished || hasError ? null : 5000,
  );

  useMount(() => {
    getList({ pageNo: 1 });
  });

  const columns = [
    {
      dataIndex: 'id',
      title: 'ID',
      render: (val: string) => <Tooltip title={val}>{val.slice(0, 8)}</Tooltip>,
    },
    {
      dataIndex: 'type',
      title: i18n.t('type'),
      render: (val: string, record: Custom_Dashboard.OperationHistory) => {
        const CMPTypeMap = {
          Import: i18n.t('import'),
          Export: i18n.t('export'),
        };

        const MSPTypeMap = {
          Export: i18n.t('cmp:Export file'),
          Import: i18n.t('import'),
        };

        if (scope === CustomDashboardScope.ORG) {
          return CMPTypeMap[val];
        }
        if (scope === CustomDashboardScope.MICRO_SERVICE) {
          const workspace = find(relationship, (item) => item.tenantId === record.targetScopeId)?.workspace;
          if (record.targetScopeId && workspace) {
            const exportEnv = workSpaceMap[workspace].label;
            return `${i18n.t('cmp:Export to')}${exportEnv}`;
          }

          return MSPTypeMap[val];
        }
        return '-';
      },
    },
    {
      dataIndex: 'operatorId',
      title: i18n.t('operator'),
      render: (val: string) => {
        const cU = userMap[Number(val)];
        if (!val) {
          return '-';
        }
        return (
          <span>
            <Avatar size="small" src={cU?.avatar}>
              {cU.nick ? getAvatarChars(cU.nick) : i18n.t('none')}
            </Avatar>
            <span className="ml-0.5 mr-1" title={cU.name}>
              {cU.nick || cU.name || val || i18n.t('common:none')}
            </span>
          </span>
        );
      },
    },
    {
      dataIndex: 'createdAt',
      title: i18n.t('time'),
      render: (val: string) => (val ? moment(val).format('YYYY/MM/DD HH:mm:ss') : '-'),
    },
    {
      dataIndex: 'status',
      title: i18n.t('status'),
      render: (val: string, record: IMPORT_EXPORT_FILE_LIST.FileRecord) => {
        const statusMap = {
          Failure: {
            text: i18n.t('failed'),
            status: 'error',
            tip: record.errorInfo,
          },
          Success: {
            text: i18n.t('succeed'),
            status: 'success',
          },
          Processing: {
            text: i18n.t('processing'),
            status: 'processing',
          },
        };
        return statusMap[val] ? <Badge {...statusMap[val]} showDot={false} /> : '-';
      },
    },
  ];

  const actions = {
    render: (record: Custom_Dashboard.OperationHistory) => {
      const { download, viewResult } = {
        download: {
          title: i18n.t('download'),
          onClick: () => {
            downloadApi.fetch({
              uuid: record.fileUuid,
              $options: {
                isDownload: true,
              },
            });
          },
        },
        viewResult: {
          title: i18n.t('view results'),
          onClick: () => {
            if (record.status === 'Success') {
              Modal.success({
                title: i18n.t('view results'),
                content: (
                  <span className="font-medium text-base text-default text-success">
                    {record.type === 'Import' ? i18n.t('imported successfully') : i18n.t('exported successfully')}!
                  </span>
                ),
              });
            }
            if (record.status === 'Failure') {
              Modal.error({
                title: i18n.t('view results'),
                content: <span className="font-medium text-base text-default">{record.errorMessage}</span>,
              });
            }
            if (record.status === 'Processing') {
              Modal.info({
                title: i18n.t('view results'),
                content: i18n.t('no results yet'),
              });
            }
          },
        },
      };

      return record.fileUuid ? [download, viewResult] : [viewResult];
    },
  };

  return (
    <ErdaTable
      rowKey="id"
      loading={loading}
      columns={columns}
      wrapperClassName="h-full"
      actions={actions}
      dataSource={list}
      pagination={{ ...paging, current: paging.pageNo || 1, total }}
      onChange={(pageInfo) => {
        setPaging({ ...pageInfo, pageNo: pageInfo.current });
        getList({ pageNo: pageInfo.current || 1, pageSize: pageInfo.pageSize });
      }}
    />
  );
};

export default ImportExport;
