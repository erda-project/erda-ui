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

const mockData: Array<MockSpec<CP_MARKDOWN_PREVIEW.Spec>> = [
  {
    _meta: {
      title: 'Markdown Preview',
      desc: 'markdown 预览',
    },
    type: 'MarkdownPreview',
    props: {
      wrapperClassName: 'py-4',
    },
    data: {
      content: '## markdown 预览\n [erda cloud](https://www.erda.cloud)',
    },
  },
];

export default mockData;
