import React from 'react';
import FixedWidget from './fixed-widget';
import EditModal from './edit-modal';
import PublishModal from './publish-modal';
import { getEditCount } from '../utils';

// 在页面根 dom 中引入
// erda-ui/shell/app/layout/pages/page-container/components/shell/index.tsx
const I18nEditPage: React.FC = () => {
  const [isPublishVisible, setPublishVisible] = React.useState(false);
  const [editCount, setEditCount] = React.useState(getEditCount());
  return (
    <div className="i18n-page-edit">
      <EditModal setEditCount={setEditCount} />
      <PublishModal isPublishVisible={isPublishVisible} setPublishVisible={setPublishVisible} />
      <FixedWidget setPublishVisible={setPublishVisible} editCount={editCount} />
    </div>
  );
};

export default I18nEditPage;
