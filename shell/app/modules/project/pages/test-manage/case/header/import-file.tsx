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

import { isNumber } from 'lodash';
import React, { useState } from 'react';
import i18n from 'i18n';
import { Button, message } from 'app/nusi';

import { FileSelect, FormModal } from 'common';
import { useLoading } from 'app/common/stores/loading';
import testCaseStore from 'project/stores/test-case';
import './import-file.scss';

interface IProps {
  afterImport?: () => void;
}

const ImportFile = ({ afterImport }: IProps) => {
  const [uploadVisible, setUploadVisible] = useState(false);
  const { importTestCase } = testCaseStore.effects;
  const [confirmLoading] = useLoading(testCaseStore, ['importTestCase']);
  const handleCancel = () => {
    setUploadVisible(false);
  };

  const onSuccess = ({ successCount }: any) => {
    if (isNumber(successCount)) {
      message.success(i18n.t('project:imported {total} item successfully', { total: successCount }));
    } else {
      message.info(i18n.t('project:imported successfully'));
    }
    afterImport && afterImport();
    handleCancel();
  };

  const handleOk = (values: any) => {
    importTestCase(values).then((res: any) => {
      onSuccess(res);
    });
  };

  const toggleFileUpload = () => {
    setUploadVisible(!uploadVisible);
  };

  const fieldList = [
    {
      label: i18n.t('project:select a document'),
      name: 'file',
      getComp: () => (
        <FileSelect
          accept=".xlsx, .xls, .XLSX, .XLS, .xmind, .xmt, .xmap, .xmind, .xmt, .xmap"
          visible={uploadVisible}
        />
      ),
    },
  ];

  return (
    <>
      <Button type="primary" ghost onClick={toggleFileUpload}>
        {i18n.t('project:import')}
      </Button>
      <FormModal
        loading={confirmLoading}
        okButtonState={confirmLoading}
        title={i18n.t('project:upload files')}
        fieldsList={fieldList}
        visible={uploadVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <div className="modal-tip">
          1.{i18n.t('project:support-xmind-excel')}
          <p className="my12">
            &nbsp;&nbsp;{i18n.t('project:if you need to import with Excel, please')}
            <a href="/static/usecase_model.xlsx" className="modal-tip-link">
              {i18n.t('project:download template')}
            </a>
            ；
          </p>
          <p className="mb12">
            &nbsp;&nbsp;{i18n.t('project:if you want to import with XMind, please')}
            <a href="/static/usecase_model.xmind" className="modal-tip-link">
              {i18n.t('project:download template')}
            </a>
            。
          </p>
        </div>
        <div className="modal-tip">2.{i18n.t('project:xmind-import-tip')}</div>
      </FormModal>
    </>
  );
};

export default ImportFile;
