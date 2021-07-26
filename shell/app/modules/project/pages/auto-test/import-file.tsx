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
import { message } from 'app/nusi';
import { FileSelect, FormModal } from 'common';
import { useLoading } from 'core/stores/loading';
import testCaseStore from 'project/stores/test-case';
import './import-file.scss';

interface IProps {
  visible: boolean;
  onClose: () => void;
}

const ImportFile = ({ visible, onClose }: IProps) => {
  const [uploadVisible, setUploadVisible] = useState(visible);
  const { importAutoTestCase } = testCaseStore.effects;
  const [confirmLoading] = useLoading(testCaseStore, ['importAutoTestCase']);
  const handleCancel = () => {
    onClose();
  };

  React.useEffect(() => {
    setUploadVisible(visible);
  }, [visible]);

  const onSuccess = () => {
    message.success(i18n.t('project:start importing, please view detail in records'));
    handleCancel();
  };

  const handleOk = (values: any) => {
    importAutoTestCase(values).then((res: any) => {
      onSuccess();
    });
  };

  const fieldList = [
    {
      label: i18n.t('project:select a document'),
      name: 'file',
      getComp: () => <FileSelect accept=".xlsx, .xls, .XLSX, .XLS" visible={uploadVisible} />,
    },
  ];

  return (
    <>
      <FormModal
        loading={confirmLoading}
        okButtonState={confirmLoading}
        title={i18n.t('project:upload files')}
        fieldsList={fieldList}
        visible={uploadVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <div className="modal-tip">{i18n.t('project:currently supports importing Excel files')}</div>
      </FormModal>
    </>
  );
};

export default ImportFile;
