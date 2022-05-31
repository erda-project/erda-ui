import React from 'react';
import { Modal } from 'antd';
import { mergeLocalStorage2JSON } from '../../utils';
mergeLocalStorage2JSON();

const PublishModal = (props) => {
  const handleOk = () => {
    props.setPublishVisible(false);
  };

  const handleCancel = () => {
    props.setPublishVisible(false);
  };

  return (
    <>
      <Modal title="Publish i18n translation" visible={props.isPublishVisible} onOk={handleOk} onCancel={handleCancel}>
        <p>线上 事项协同链接</p>
        <p>下载修改后的json文件</p>
        <p>已修改的字段</p>
      </Modal>
    </>
  );
};

export default PublishModal;
