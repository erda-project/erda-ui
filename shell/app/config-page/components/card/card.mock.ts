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

const mockData: CP_CARD.Spec = {
  type: 'Card',
  props: {
    cardType: 'string',
  },
  data: {
    title: '标题',
    titleSummary: '标题描述',
    cards: [
      {
        id: 'id',
        icon: 'unlock',
        star: true,
        title: 'title',
        extraInfo: {},
        titleState: [
          {
            status: 'success',
            text: 'success',
          },
        ],
        textMeta: [
          {
            mainText: 'mainText',
            subText: 'subText',
          },
        ],
        iconOperations: [],
      },
      {
        id: 'id',
        icon: 'lock',
        star: true,
        title: 'title',
        extraInfo: {},
        titleState: [
          {
            status: 'error',
            text: 'error',
          },
        ],
        textMeta: [
          {
            mainText: 'mainText',
            subText: 'subText',
          },
        ],
        iconOperations: [],
      },
    ],
  },
};

export default mockData;
