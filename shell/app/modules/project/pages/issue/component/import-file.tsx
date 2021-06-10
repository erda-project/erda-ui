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

import React, { useState } from 'react';
import i18n from 'i18n';
import { message, Modal } from 'app/nusi';
import { FileSelect, FormModal } from 'common';
import { useLoading } from 'app/common/stores/loading';
import issueStore from 'project/stores/issues';

interface IProps {
  issueType: string;
  download: string;
  visible: boolean;
  projectID: number | string;
  onClose: () => void;
  afterImport?: () => void;
}

const ImportFile = ({ afterImport, issueType, download, projectID, visible, onClose }: IProps) => {
  const [uploadLoading, setUploadLoading] = useState(false);
  const { importIssueFile } = issueStore.effects;
  const [confirmLoading] = useLoading(issueStore, ['importIssueFile']);
  const beforeUpload = (file: any) => {
    const isLt20M = file.size / 1024 / 1024 < 20;
    if (!isLt20M) {
      message.error(i18n.t('project:file must smaller than 20MB!'));
    }
    return isLt20M;
  };

  const handleCancel = () => {
    onClose();
    setUploadLoading(false);
  };

  const onSuccess = (res: any) => {
    const { successNumber, falseNumber, uuid } = res;
    if (falseNumber === 0) {
      message.success(i18n.t('project:imported {total} item successfully', { total: successNumber }));
    } else if (successNumber || falseNumber) {
      Modal.info({
        title: i18n.t('project:import results'),
        content: (
          <div>
            <br />
            <p>{i18n.t('project:imported {total} item successfully', { total: successNumber })}</p>
            <div>
              <span>{i18n.t('project:imported {total} item unsuccessfully', { total: falseNumber })}</span>
              {uuid && (
                <>
                  <span> —— </span>
                  <span className="color-primary hover-text" onClick={() => window.open(`/api/files/${uuid}`)}>
                    {i18n.t('project:download failed file')}
                  </span>
                </>
              )}
            </div>
          </div>
        ),
        onOk() {},
      });
    }

    afterImport && afterImport();
    handleCancel();
  };

  const handleOk = (values: any) => {
    setUploadLoading(true);
    importIssueFile({ file: values, issueType, projectID }).then((res: any) => {
      onSuccess(res);
      setUploadLoading(false);
    });
  };

  const fieldList = [
    {
      label: i18n.t('project:select a document'),
      name: 'file',
      getComp: () => <FileSelect accept=".xlsx, .xls, .XLSX, .XLS" visible={visible} beforeUpload={beforeUpload} />,
    },
  ];

  return (
    <>
      <FormModal
        loading={uploadLoading}
        tip={i18n.t('project:uploading, please do not leave')}
        title={i18n.t('project:import file')}
        fieldsList={fieldList}
        visible={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        okButtonState={uploadLoading}
        modalProps={{
          confirmLoading,
          maskClosable: !uploadLoading,
        }}
      >
        <div className="modal-tip">
          <span onClick={() => window.open(download)} className="color-primary hover-text">
            {i18n.t('project:download template')}
          </span>
        </div>
      </FormModal>
    </>
  );
};

export default ImportFile;
