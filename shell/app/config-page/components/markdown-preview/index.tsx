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
import Markdown from 'common/utils/marked';
import EmptyHolder from 'common/components/empty-holder';
import './index.scss';

const CP_MarkdownPreview: React.FC<CP_MARKDOWN_PREVIEW.Props> = (props) => {
  const { data, props: configProps } = props;
  const { className = '', wrapperClassName = '' } = configProps || {};
  return (
    <div className={`cp-markdown-preview ${wrapperClassName}`}>
      {!data.content ? (
        <EmptyHolder relative />
      ) : (
        <article
          className={`markdown-content ${className}`}
          dangerouslySetInnerHTML={{ __html: Markdown(data.content) }}
        />
      )}
    </div>
  );
};

export default CP_MarkdownPreview;
