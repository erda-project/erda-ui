import React from 'react';
import { Modal, Button, message } from 'antd';
import { mergeLocalStorage2JSON, clearLocalStorage } from '../../utils';
import moment from 'moment';
interface IProps {
  setPublishVisible: (value: boolean) => {};
  setEditCount: (value: number) => {};
  isPublishVisible: boolean;
}
const PublishModal = (props: IProps) => {
  const downloadHandler = () => {
    const fileContent = mergeLocalStorage2JSON();
    if (fileContent) {
      // create a element, click to download the file
      const file = new Blob([fileContent], { type: 'text/plain' });
      const element = document.createElement('a');
      element.href = URL.createObjectURL(file);
      element.download = `i18n-${moment().format('YYYY-MM-DD')}.json`;
      element.click();
    } else {
      message.error('No modified translation');
    }
  };
  const handleClear = () => {
    clearLocalStorage();
    props.setPublishVisible(false);
    props.setEditCount(0);
    location.reload();
  };

  const handleCancel = () => {
    props.setPublishVisible(false);
  };

  return (
    <>
      <Modal
        className="i18n-publish-modal"
        title="Publish i18n translation"
        visible={props.isPublishVisible}
        onOk={handleClear}
        onCancel={handleCancel}
        okText="Done and Clear"
        cancelText="Close"
      >
        <p>
          Step1: Download the JSON file.&nbsp;&nbsp;
          <Button type="default" size="small" className="text-purple-deep" onClick={downloadHandler}>
            Download
          </Button>
        </p>
        <p>
          Step2: Go to the collaboration link.&nbsp;&nbsp;
          <Button type="default" size="small" className="text-purple-deep">
            <a href="https://erda.cloud/erda/dop/projects/387/issues/all" target="_blank">
              Go to Link
            </a>
          </Button>
        </p>
        <p>Step3: Add a new requirement or task and upload the JSON file.</p>
      </Modal>
    </>
  );
};

export default PublishModal;
