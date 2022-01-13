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

import { Upload, Spin, Modal, message } from 'antd';
import i18n from 'i18n';
import React from 'react';
import { ErdaIcon } from 'common';
import EmptySVG from 'app/images/upload_empty.svg';
import { getOrgFromPath } from 'common/utils';
import { FormInstance } from 'core/common/interface';
import { UploadFile } from 'app/interface/common';
import { getUploadProps } from 'common/utils/upload-props';
import './import-project-template.scss';

export const ImportProjectTemplate = ({ form }: { form: FormInstance }) => {
  const [fileStatus, setFileStatus] = React.useState('init');
  const [fileData, setFileData] = React.useState(null as unknown as PROJECT_LIST.FileData);

  function handleChange({ file }: { file: PROJECT_LIST.FileData }) {
    if (file.status === 'uploading') {
      setFileStatus('uploading');
    }
    if (file.status === 'done') {
      setFileStatus('done');
      setFileData(file);
      form.setFieldsValue({
        projectTemplate: file,
      });
    }
    if (file.status === 'error') {
      setFileStatus('error');
    }
  }

  const showUploadList = {
    showRemoveIcon: true,
    removeIcon: (
      <ErdaIcon
        type="remove"
        onClick={() => {
          setFileStatus('init');
          setFileData(null);
        }}
      />
    ),
  };

  function beforeUpload(file: UploadFile) {
    const UPLOAD_SIZE_LIMIT = 10; // M
    const isLtSize = (file.size || 0) / 1024 / 1024 < UPLOAD_SIZE_LIMIT;
    const isLtType = file.type === 'application/zip';
    if (!isLtSize) {
      message.warning(i18n.t('common:the uploaded file must not exceed {size}M', { size: UPLOAD_SIZE_LIMIT }));
    }
    if (!isLtType) {
      message.warning(i18n.t('please upload the zip file'));
    }

    return isLtSize && isLtType ? true : Upload.LIST_IGNORE;
  }

  const uploadProps = getUploadProps({
    accept: '.zip',
    showUploadList,
    beforeUpload,
    action: `/api/${getOrgFromPath()}/projects/template/actions/parse`,
    onChange: handleChange,
    iconRender: () => <ErdaIcon type="shenjirizhi" />,
    className: `w-full ${fileStatus === 'init' ? 'flex-all-center' : ''}`,
  });

  return (
    <div
      className={`import-project-template relative ${
        fileStatus === 'init' ? 'flex-all-center bg-default-04 py-5' : ''
      } `}
    >
      <Upload {...uploadProps}>
        {fileStatus === 'init' && (
          <div className="flex-all-center cursor-pointer">
            <img src={EmptySVG} style={{ height: 80 }} />
            <div className="flex-h-center flex-col ml-2">
              <span className="text-base font-medium text-default ">{i18n.t('upload project template file')}</span>
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
                {fileData?.response.data.applications?.length || 0}
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
                    content: fileData?.response.err.msg,
                  });
                }}
              >
                {i18n.t('error reason')}
              </span>
            </div>
            <div className="flex-h-center">
              <span className="text-default-9 mr-1">
                {i18n.t('dop:applications')}:{fileData?.response.data.applications?.length}
              </span>
              <div className="bg-default-04 px-1 py-0.5 rounded-lg">0</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
