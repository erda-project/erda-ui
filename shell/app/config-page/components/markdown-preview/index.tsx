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
import MarkdownRender from 'common/components/markdown-render';
import EmptyHolder from 'common/components/empty-holder';

const CP_MarkdownPreview: React.FC<CP_MARKDOWN_PREVIEW.Props> = (props) => {
  const { data, props: configProps } = props;
  const { className = '', wrapperClassName = '' } = configProps || {};
  return (
    <div className={`cp-markdown-preview ${wrapperClassName}`}>
      {!data.content ? (
        <EmptyHolder relative />
      ) : (
        <MarkdownRender value={data.content} className={`p-0 ${className}`} />
      )}
    </div>
  );
};

export default CP_MarkdownPreview;
