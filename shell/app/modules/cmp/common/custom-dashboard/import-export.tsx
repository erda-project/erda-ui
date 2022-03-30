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
import { Button, Modal, Spin, Radio, Space, Upload, message, Avatar, Select } from 'antd';
import { SimpleTabs, ErdaIcon, Badge } from 'common';
import { useUpdate } from 'common/use-hooks';
import { getUploadProps } from 'common/utils/upload-props';
import EmptySVG from 'app/images/upload_empty.svg';
import { useMount } from 'react-use';
import ErdaTable from 'common/components/table';
import { getDefaultPaging, setApiWithOrg, getAvatarChars, getOrgFromPath } from 'common/utils';
import { importExportFileRecord } from 'org/services/project-list';
import { ISSUE_TYPE } from 'project/common/components/issue/issue-config';
import i18n from 'i18n';
import { useUserMap } from 'core/stores/userMap';
import moment from 'moment';
import issueStore from 'project/stores/issues';
import { issueDownload } from 'project/services/issue';
import './import-export.scss';

interface IProps {
  issueType: string;
  projectId: string;
  queryObj: ISSUE.IssueListQuery;
  title?: string;
  tabs?: Array<{ key: string; text: string; disabled?: boolean }>;
  extraQuery?: { iterationID?: number };
}

const { Option } = Select;
const getRealIssueType = (issueType: string) => {
  if (issueType === ISSUE_TYPE.ALL) return [ISSUE_TYPE.REQUIREMENT, ISSUE_TYPE.TASK, ISSUE_TYPE.BUG];
  return issueType;
};

const defaultTabs = [
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
  {
    key: 'record',
    text: i18n.t('record'),
    disabled: false,
  },
];

const ImportExport = (props: IProps) => {
  const {
    issueType,
    projectId,
    queryObj,
    title = i18n.t('dop:export/import'),
    extraQuery = {},
    tabs = defaultTabs,
  } = props;
  const getDefaultTabs = () => tabs.find((item) => !item.disabled)?.key || 'record';

  const [{ modalVis, tabValue }, updater, update] = useUpdate({
    modalVis: false,
    tabValue: getDefaultTabs(),
  });

  const closeModal = () => {
    update({
      modalVis: false,
      tabValue: getDefaultTabs(),
    });
  };
  const toRecord = () => update({ tabValue: 'record' });

  const CompMap = {
    export: (
      <Export
        extraQuery={extraQuery}
        issueType={issueType}
        projectId={projectId}
        queryObj={queryObj}
        onClose={closeModal}
        toRecord={toRecord}
      />
    ),
    import: <Import issueType={issueType} projectId={projectId} onClose={closeModal} toRecord={toRecord} />,
    record: <Record projectId={projectId} />,
  };

  return (
    <>
      <Button onClick={() => updater.modalVis(true)}>{title}</Button>
      <Modal
        onCancel={closeModal}
        width={1000}
        destroyOnClose
        maskClosable={false}
        wrapClassName={'import-export-modal'}
        visible={modalVis}
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
  issueType: string;
  projectId: string;
  extraQuery: { iterationID?: number };
  queryObj: ISSUE.IssueListQuery;
  onClose: () => void;
  toRecord: () => void;
}

const Export = (props: ExportProps) => {
  const { projectId, issueType, onClose, toRecord, queryObj, extraQuery } = props;
  const [exportType, setExportType] = React.useState('condition');
  const [exportMode, setExportMode] = React.useState('all');
  const exportOption = [
    {
      key: 'condition',
      text: i18n.t('dop:export by filter condition'),
      desc: i18n.t('dop:export the data of the filter conditions'),
    },
    {
      key: 'all',
      text: i18n.t('dop:export all'),
      desc: i18n.t('dop:export all data'),
    },
  ];

  const exportModeOptions = [
    {
      label: '全部文件',
      value: 'all',
    },
    {
      label: '开发环境',
      value: 'dev',
    },
    {
      label: '测试环境',
      value: 'test',
    },
    {
      label: '预发环境',
      value: 'staging',
    },
  ];

  const onExport = () => {
    let query = {
      pageNo: 1,
      projectID: +projectId,
      type: getRealIssueType(issueType),
      IsDownload: false,
      ...extraQuery,
    };
    if (exportType === 'condition') {
      query = { ...queryObj, ...query };
    }

    issueDownload.fetch(query).then(() => {
      message.success(i18n.t('dop:start exporting, please view detail in records'));
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
          setExportMode('all');
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
                <Select
                  style={{ minWidth: 200 }}
                  className="absolute right-8"
                  value={exportType === item.key ? exportMode : 'all'}
                  mode="multiple"
                  onChange={(value) => {
                    setExportMode(value);
                  }}
                  disabled={exportType !== item.key}
                  onClick={(e) => {
                    // e.stopPropagation();
                    e.preventDefault();
                  }}
                >
                  {exportModeOptions.map((item) => (
                    <Option value={item.value}>{item.label}</Option>
                  ))}
                </Select>
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
  issueType: string;
  projectId: string;
  onClose: () => void;
  toRecord: () => void;
}

const Import = (props: ImportProps) => {
  const { issueType, projectId, onClose, toRecord } = props;
  const [fileId, setFileId] = React.useState('');
  const [fileStatus, setFileStatus] = React.useState('init');
  const { importIssueFile } = issueStore.effects;

  const templateUrl = setApiWithOrg(
    `/api/issues/actions/export-excel?IsDownload=true&type=${getRealIssueType(issueType)}&projectID=${projectId}`,
  );

  const uploadProps = getUploadProps({
    accept: '.json',
    showUploadList: {
      showRemoveIcon: false,
    },
    beforeUpload: (file: File) => {
      const isLt20M = file.size / 1024 / 1024 < 20;
      if (!isLt20M) {
        message.error(i18n.t('dop:file must be smaller than 20 MB'));
      }
      return isLt20M;
    },
    action: `/api/${getOrgFromPath()}/projects/template/actions/parse`,
    onChange: (fileObj) => {
      console.log(3333, fileObj.file);
      if (fileObj.file?.status === 'uploading') {
        console.log(222);
        setFileStatus('uploading');
      }
      if (fileObj.file?.status === 'done') {
        setFileStatus('done');
        console.log(1111);
        setFileId(fileObj.file.response?.data?.uuid);
      }
      if (fileObj.file?.status === 'error') {
        setFileStatus('error');
      }
    },
    maxCount: 1,
    iconRender: () => (
      <div className="flex-h-center">
        <ErdaIcon type="shenjirizhi" />
      </div>
    ),
    className: 'issue-import-upload',
    itemRender: (originNode: React.ReactElement) => {
      return <div className="hover:bg-default-08">{originNode}</div>;
    },
  });

  const importFile = () => {
    fileId &&
      importIssueFile({ fileID: fileId, issueType, projectID: projectId }).then(() => {
        message.success(i18n.t('dop:start importing, please view detail in records'));
        toRecord();
      });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto">
        <div className="bg-default-04 py-10 rounded-sm px-2 flex-all-center">
          <Upload {...uploadProps}>
            {fileStatus === 'init' && (
              <div className="flex-all-center cursor-pointer w-full">
                <img src={EmptySVG} style={{ height: 80 }} />
                <div className="flex flex-col ml-2">
                  <span className="text-base font-medium text-default ">{i18n.t('dop:upload files')}</span>
                  <span className="text-xs text-default-6">{i18n.t('dop:click this area to browse and upload')}</span>
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
                <div className="flex-h-center">
                  <span className="text-default-9 mr-1">{i18n.t('dop:applications')} </span>
                  <div className="bg-default-04 px-1 py-0.5 rounded-lg">
                    {/* {fileData?.response.data.applications?.length || 0} */}
                  </div>
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
                        // content: fileData?.response.err.msg,
                      });
                    }}
                  >
                    {i18n.t('error reason')}
                  </span>
                </div>
                <div className="flex-h-center">
                  <span className="text-default-9 mr-1">{i18n.t('dop:applications')}:</span>
                  <div className="bg-default-04 px-1 py-0.5 rounded-lg">0</div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex mt-2">
          <span onClick={() => window.open(templateUrl)} className="text-purple-deep cursor-pointer">
            {i18n.t('dop:download template')}
          </span>
        </div>
      </div>

      <div className="flex-h-center justify-end mt-4">
        <Button onClick={onClose}>{i18n.t('cancel')}</Button>
        <Button onClick={importFile} disabled={!fileId} className="ml-2" type="primary">
          {i18n.t('ok')}
        </Button>
      </div>
    </div>
  );
};

const Record = ({ projectId }: { projectId: string }) => {
  const [data, loading] = importExportFileRecord.useState();
  const userMap = useUserMap();
  const list = data?.list || [];

  const paging = data?.paging || getDefaultPaging();

  const getList = (q: { pageSize?: number; pageNo: number }) => {
    importExportFileRecord.fetch({
      pageSize: paging?.pageSize,
      projectId,
      ...q,
      types: ['issueImport', 'issueExport'],
    });
  };

  useMount(() => {
    getList({ pageNo: 1 });
  });

  const columns = [
    {
      dataIndex: 'id',
      title: 'ID',
    },
    {
      dataIndex: 'type',
      title: i18n.t('type'),
      render: (val: string) => {
        const typeMap = {
          issueImport: i18n.t('import'),
          issueExport: i18n.t('export'),
        };
        return typeMap[val] || '-';
      },
    },
    {
      dataIndex: 'operatorID',
      title: i18n.t('operator'),
      render: (val: string) => {
        const cU = userMap[val];
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
      dataIndex: 'state',
      title: i18n.t('status'),
      render: (val: string, record: IMPORT_EXPORT_FILE_LIST.FileRecord) => {
        const statusMap = {
          fail: {
            text: i18n.t('failed'),
            status: 'error',
            tip: record.errorInfo,
          },
          success: {
            text: i18n.t('succeed'),
            status: 'success',
          },
          pending: {
            text: i18n.t('waiting'),
            status: 'warning',
          },
          processing: {
            text: i18n.t('processing'),
            status: 'processing',
          },
        };
        return statusMap[val] ? <Badge {...statusMap[val]} showDot={false} /> : '-';
      },
    },
    {
      title: i18n.t('description'),
      dataIndex: 'description',
      key: 'description',
    },
  ];

  const actions = {
    render: (record: IMPORT_EXPORT_FILE_LIST.FileRecord) => {
      return record.apiFileUUID
        ? [
            {
              title: i18n.t('download'),
              onClick: () => {
                window.open(`/api/files/${record.apiFileUUID}`);
              },
            },
          ]
        : [];
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
      pagination={{ ...paging, current: paging.pageNo }}
      onChange={(pageInfo) => {
        getList({ pageNo: pageInfo.current || 1, pageSize: pageInfo.pageSize });
      }}
    />
  );
};

export default ImportExport;
