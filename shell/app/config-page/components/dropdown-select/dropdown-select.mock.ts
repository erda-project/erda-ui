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

export const mockData: CP_DROPDOWN_SELECT.Spec = {
  type: 'DropdownSelect',
  props: {
    menuList:
      [
        {
          name: '组织B',
          key: 'organizeB',
          operations: {
            click: {
              key: 'click',
              show: false,
              reload: false,
              command: {
                key: 'goto',
                target: 'https://dice.terminus.io',
                jumpOut: false,
              },
            },
          },
        },
        {
          name: '组织A',
          key: 'organizeA',
          operations: {
            click: {
              key: 'click',
              show: false,
              reload: false,
              command: {
                key: 'goto',
                target: 'https://dice.terminus.io',
                jumpOut: false,
              },
            },
          },
        },
      ],
    buttonText: '组织A',
    jumpToOtherPage: [{ target: 'orgHome', label: '浏览公开组织' }],
  },
},