import React from 'react';
import FixedWidget from './fixed-widget';
import EditModal from './edit-modal';

// 在页面根 dom 中引入
// erda-ui/shell/app/layout/pages/page-container/components/shell/index.tsx
const I18nEditPage: React.FC = () => {
  return (
    <>
      <EditModal />
      <FixedWidget />
    </>
  );
};

export default I18nEditPage;
