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

import React from 'react';
import FixedWidget from './fixed-widget';
import EditModal from './edit-modal';
import PublishModal from './publish-modal';
import { getEditCount } from '../utils';
import { isAccess } from '../index';

// insert in root dom
// erda-ui/shell/app/layout/pages/page-container/components/shell/index.tsx
const I18nEditPage: React.FC = () => {
  const [isPublishVisible, setPublishVisible] = React.useState(false);
  const [editCount, setEditCount] = React.useState(getEditCount());
  if (!isAccess) return null;
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
