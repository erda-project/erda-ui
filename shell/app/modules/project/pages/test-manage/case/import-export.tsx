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
import { Button, Modal, Radio, Space, Upload, message, Avatar } from 'antd';
import { SimpleTabs, ErdaIcon, Badge } from 'common';
import { isEmpty } from 'lodash';
import { useUpdate } from 'common/use-hooks';
import { getUploadProps } from 'common/utils/upload-props';
import EmptySVG from 'app/images/upload_empty.svg';
import { useMount, useInterval } from 'react-use';
import ErdaTable from 'common/components/table';
import userStore from 'app/user/stores';
import { getDefaultPaging, setApiWithOrg, getAvatarChars } from 'common/utils';
import { importExportFileRecord } from 'org/services/project-list';
import testCaseStore from 'project/stores/test-case';
import i18n, { isZh } from 'i18n';
import { useUserMap } from 'core/stores/userMap';
import moment from 'moment';
import { useLoading } from 'core/stores/loading';
import issueStore from 'project/stores/issues';

import './import-export.scss';

interface IProps {
  testSetId: number;
  setShowRefresh: (b: boolean) => void;
  title?: string;
  tabs?: Array<{ key: string; text: string; disabled?: boolean }>;
}

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
  const { testSetId, setShowRefresh, title = i18n.t('dop:export/import'), tabs = defaultTabs } = props;
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
    export: <Export onClose={closeModal} toRecord={toRecord} />,
    import: <Import onClose={closeModal} toRecord={toRecord} />,
    record: <Record testSetId={testSetId} setShowRefresh={setShowRefresh} />,
  };

  return (
    <>
      <Button ghost type="primary" onClick={() => updater.modalVis(true)}>
        {title}
      </Button>
      <Modal
        onCancel={closeModal}
        width={700}
        destroyOnClose
        maskClosable={false}
        wrapClassName={'test-manage-import-export-modal'}
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
  onClose: () => void;
  toRecord: () => void;
}

const Export = (props: ExportProps) => {
  const { exportFile } = testCaseStore.effects;
  const { onClose, toRecord } = props;
  const [exportType, setExportType] = React.useState('excel');

  const exportOption = [
    {
      key: 'excel',
      text: i18n.t('dop:export Excel'),
    },
    {
      key: 'xmind',
      text: i18n.t('dop:export Xmind'),
    },
  ];

  const onExport = () => {
    exportFile(exportType).then(() => {
      message.success(i18n.t('dop:The export task has been created, please check the progress in the record'), 4);
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
        }}
        value={exportType}
      >
        <Space direction="vertical" className="w-full">
          {exportOption.map((item) => (
            <Radio
              value={item.key}
              key={item.key}
              className={`py-4 rounded-sm px-2 flex-h-center ${
                exportType === item.key ? 'bg-default-04' : ''
              } hover:bg-default-04`}
            >
              <div className="flex flex-col">
                <span className="font-medium">{item.text}</span>
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
  onClose: () => void;
  toRecord: () => void;
}

const Import = (props: ImportProps) => {
  const { onClose, toRecord } = props;
  const { importTestCase } = testCaseStore.effects;
  const [chosenFile, setChosenFile] = React.useState<File | null>(null);
  const locale = isZh() ? 'zh' : 'en';
  const uploadProps = getUploadProps({
    accept: '.xlsx, .xls, .XLSX, .XLS, .xmind, .xmt, .xmap, .xmind, .xmt, .xmap',
    showUploadList: {
      showRemoveIcon: false,
    },
    customRequest: ({ file, onSuccess }: { file: File; onSuccess: () => void }) => {
      setChosenFile(file);
      onSuccess();
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
    chosenFile &&
      importTestCase({ file: chosenFile }).then(() => {
        message.success(i18n.t('dop:start importing, please view detail in records'));
        toRecord();
      });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto">
        <div className="bg-default-04 py-10 rounded-sm px-2 flex-all-center">
          <Upload {...uploadProps}>
            <div className="flex-all-center cursor-pointer w-full">
              <img src={EmptySVG} style={{ height: 80 }} />
              <div className="flex flex-col ml-2">
                <span className="text-base font-medium text-default ">{i18n.t('dop:upload files')}</span>
                <span className="text-xs text-default-6">{i18n.t('dop:click this area to browse and upload')}</span>
              </div>
            </div>
          </Upload>
        </div>
        <div className="flex flex-col mt-2">
          1.{i18n.t('dop:currently supports importing Xmind and Excel files')}
          <p className="my-3">
            &nbsp;&nbsp;{i18n.t('dop:if you need to import with Excel, please')}
            <a href={`/static/usecase_model_${locale}.xlsx`} className="text-purple-deep">
              {i18n.t('dop:download template')}
            </a>
            ；
          </p>
          <p className="mb-3">
            &nbsp;&nbsp;{i18n.t('dop:if you want to import with XMind, please')}
            <a href={`/static/usecase_model_${locale}.xmind`} className="text-purple-deep">
              {i18n.t('dop:download template')}
            </a>
            。
          </p>
          <div className="">2.{i18n.t('dop:xmind-import-tip')}</div>
        </div>
      </div>

      <div className="flex-h-center justify-end mt-4">
        <Button onClick={onClose}>{i18n.t('cancel')}</Button>
        <Button onClick={importFile} disabled={!chosenFile} className="ml-2" type="primary">
          {i18n.t('ok')}
        </Button>
      </div>
    </div>
  );
};

const Record = ({ testSetId, setShowRefresh }: { testSetId: number; setShowRefresh: (b: boolean) => void }) => {
  const [hasError, setHasError] = React.useState(false);
  const [isFinished, setIsFinished] = React.useState(false);
  const loginUser = userStore.useStore((s) => s.loginUser);
  const [list, setList] = React.useState<TEST_CASE.ImportExportRecordItem[]>([]);

  const [counter, setCounter] = React.useState<TEST_CASE.ImportExportCounter>({});
  const { getImportExportRecords } = testCaseStore.effects;
  const [loading] = useLoading(testCaseStore, ['getImportExportRecords']);
  const userMap = useUserMap();

  const getData = (firstTime = false) => {
    const query = {
      types: ['import', 'export'],
    };
    getImportExportRecords(query)
      .then((result: TEST_CASE.ImportExportResult) => {
        if (result?.list.every((item) => ['success', 'fail'].includes(item.state))) {
          setIsFinished(true);
        }

        if (!isEmpty(result)) {
          if (!firstTime) {
            let haveJustFinishedJob = false;
            const myProcessingJob: Record<string, boolean> = {};
            list.forEach((item) => {
              if (item.operatorID === loginUser.id && ['processing', 'pending'].includes(item.state)) {
                myProcessingJob[item.id] = true;
              }
            });
            let haveJustSuccessJob = false;
            result?.list.forEach((item) => {
              if (
                item.operatorID === loginUser.id &&
                ['success', 'fail'].includes(item.state) &&
                myProcessingJob[item.id]
              ) {
                haveJustFinishedJob = true;
              }
              // new result state is success and not existing in list cache,  means it's newly import record
              const previousItem = list.find((origin) => origin.id === item.id);
              if (
                item.state === 'success' &&
                item.testSetID === testSetId &&
                (!previousItem || previousItem.state !== 'success')
              ) {
                haveJustSuccessJob = true;
              }
            });
            if (haveJustFinishedJob) {
              message.info(
                i18n.t('dop:The import and export tasks you submitted have status updates, please check the records'),
                4,
              );
            }
            if (haveJustSuccessJob) {
              setShowRefresh(true);
              setList(result?.list);
            }
          }

          setList(result?.list);
          setCounter(result?.counter);
        }
      })
      .catch(() => {
        setHasError(true);
      });
  };

  useMount(() => {
    getData(true);
  });

  useInterval(
    () => {
      getData(false);
    },
    isFinished || hasError ? null : 5000,
  );

  let badgeCount = 0;
  list.forEach((item) => {
    if (['pending', 'processing'].includes(item.state)) {
      badgeCount += 1;
    }
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
          import: i18n.t('import'),
          export: i18n.t('export'),
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
      render: (val: string) => {
        const statusMap = {
          fail: {
            text: i18n.t('failed'),
            status: 'error',
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
    render: (record: TEST_CASE.ImportExportRecordItem) => {
      return record.apiFileUUID && ['success', 'fail'].includes(record.state)
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
      onReload={() => getData(false)}
      dataSource={list}
    />
  );
};

export default ImportExport;
