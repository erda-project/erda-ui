import React from 'react';
import FixedWidget from './fixed-widget';
import EditModal from './edit-modal';
import PublishModal from './publish-modal';
import { getEditCount, isEditAccess } from '../utils';

// insert in root dom
// erda-ui/shell/app/layout/pages/page-container/components/shell/index.tsx
const I18nEditPage: React.FC = () => {
  const [isPublishVisible, setPublishVisible] = React.useState(false);
  const [editCount, setEditCount] = React.useState(getEditCount());
  if (!isEditAccess()) return null;
  return (
    <div className="i18n-page-edit">
      <EditModal setEditCount={setEditCount} />
      <PublishModal
        isPublishVisible={isPublishVisible}
        setPublishVisible={setPublishVisible}
        setEditCount={setEditCount}
      />
      <FixedWidget setPublishVisible={setPublishVisible} editCount={editCount} />
    </div>
  );
};

export default I18nEditPage;
