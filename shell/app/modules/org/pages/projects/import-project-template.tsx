import { Badge, Button, Checkbox, Input, Upload, Spin, Modal, message } from 'antd';
import i18n from 'i18n';
import React from 'react';
import { ErdaIcon, ImageUpload, RenderForm } from 'common';
import EmptySVG from 'app/images/upload_empty.svg';
import { getCookies, getOrgFromPath } from 'common/utils';
import './create-project.scss';

export const ImportProjectTemplate = ({ setFileData, fileData, form }) => {
  const [fileStatus, setFileStatus] = React.useState('init');
  const [isVisible, setIsVisible] = React.useState(false);

  function handleChange({ file }: any) {
    setFileData(file);
    if (file.status === 'uploading') {
      setFileStatus('uploading');
    }
    if (file.status === 'done') {
      setFileStatus('done');
      form.setFieldsValue({
        projectTemplate: file,
      });
    }
    if (file.status === 'error') {
      setFileStatus('error');
    }
  }

  function beforeUpload(file: any) {
    const UPLOAD_SIZE_LIMIT = 10; // M
    const isLtSize = file.size / 1024 / 1024 < UPLOAD_SIZE_LIMIT;
    if (!isLtSize) {
      message.warning(i18n.t('common:the uploaded file must not exceed {size}M', { size: UPLOAD_SIZE_LIMIT }));
    }
    return isLtSize;
  }
  return (
    <div className={`relative bg-default-04 h-32 p-2 ${fileStatus === 'init' ? 'flex-all-center' : ''} `}>
      {fileStatus !== 'init' && (
        <div className="mb-3 flex-h-center">
          <ErdaIcon type="shenjirizhi" />
          <span className="ml-1">{fileData?.name}</span>
        </div>
      )}
      <Upload
        accept={'.zip'}
        showUploadList={false}
        onChange={handleChange}
        action={`/api/${getOrgFromPath()}/projects/template/actions/parse`}
        headers={{ 'OPENAPI-CSRF-TOKEN': getCookies('OPENAPI-CSRF-TOKEN'), org: getOrgFromPath() }}
        beforeUpload={beforeUpload}
        className={`w-full  ${fileStatus === 'init' ? 'flex-all-center' : ''}`}
      >
        {fileStatus === 'init' && (
          <div className="flex-all-center cursor-pointer">
            <img src={EmptySVG} style={{ height: 80 }} />
            <div className="flex-h-center flex-col">
              <span className="text-base font-medium text-default ">{i18n.d('上传项目模板文件')}</span>
              <span className="text-xs text-default-6">{i18n.d('点击此区域进行浏览上传')}</span>
            </div>
          </div>
        )}
        {fileStatus === 'uploading' && (
          <div className="flex-all-center">
            <div className="flex-h-center text-info">
              <Spin spinning />
              <span className="ml-1">{i18n.d('正在解析中')}</span>
            </div>
          </div>
        )}
        {fileStatus === 'done' && (
          <div className="flex-v-center flex-col">
            <div className="text-success mb-2">
              <ErdaIcon type="check" />
              <span className="ml-1">{i18n.d('解析成功')}</span>
            </div>
            <div className="flex-all-center">
              <span className="text-default-9 mr-1">{i18n.d('应用列表')} </span>
              <div className="bg-default-04 px-1 py-0.5 rounded-lg">
                {fileData?.response?.data?.applications?.length}
              </div>
            </div>
          </div>
        )}
        {fileStatus === 'error' && (
          <div>
            <div className="flex-v-center text-error mb-2">
              <ErdaIcon type="guanbi" />
              <span className="mx-1">{i18n.d('解析失败')}, </span>
              <span className="underline cursor-pointer" onClick={() => setIsVisible(true)}>
                {i18n.d('错误原因')}
              </span>
            </div>
            <div>
              {i18n.d('应用列表')}:{fileData?.response?.data?.applications?.length}
            </div>
          </div>
        )}
      </Upload>
      <Modal title={i18n.d('错误原因')} visible={isVisible} onCancel={() => setIsVisible(false)}>
        {fileData?.response?.err?.msg}
      </Modal>
    </div>
  );
};
