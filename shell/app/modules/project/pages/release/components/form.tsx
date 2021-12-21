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
import { Button } from 'antd';
import { RenderForm } from 'common';
import i18n from 'i18n';

import './form.scss';

const ReleaseForm = ({ match }) => {
  const { params } = match;
  console.log(params);
  const list = [
    {
      label: '名称',
      name: 'name',
      type: 'input',
      itemProps: {
        placeholder: i18n.t('dop:submit information'),
        maxLength: 30,
      },
    },
    {
      label: '备注',
      name: 'desc',
      type: 'input',
      itemProps: {
        placeholder: i18n.t('dop:submit information'),
        maxLength: 30,
      },
    },
    {
      label: '应用制品',
      name: 'release',
      type: 'listSelect',
      itemProps: {
        renderSelectedItem: (item) => {
          return (
            <div className="flex justify-between items-center">
              <div>
                <div className="text-white-9 text-hover">{item.title}</div>
                <div className="text-xs flex mt-1">
                  <div className="text-white-6">所属应用</div>
                  <div className="ml-2 rounded-lg bg-white-04">{item.application}</div>
                </div>
              </div>
              <div className="text-white-800">{item.createdAt}</div>
            </div>
          );
        },
        renderItem: (item) => {
          return (
            <div className="flex justify-between items-center">
              <span>{item.title}</span>
              <span className="text-xs text-white-6">{item.time}</span>
            </div>
          );
        },
        menus: [
          { id: 1, title: '应用名称' },
          { id: 2, title: '应用名称' },
        ],
        list: [
          { id: 1, pid: 1, title: '这里是版本名称', time: '2021/09/09 22:09:09' },
          { id: 2, pid: 1, title: '这里是版本名称', time: '2021/09/09 22:09:09' },
          { id: 3, pid: 1, title: '这里是版本名称', time: '2021/09/09 22:09:09' },
          { id: 4, pid: 1, title: '这里是版本名称', time: '2021/09/09 22:09:09' },
        ],
      },
    },
    {
      label: '内容',
      name: 'content',
      type: 'markdown',
    },
  ];
  return (
    <div className="release-form">
      <RenderForm layout="vertical" list={list} />
      <div className="mb-2">
        <Button className="mr-3" type="primary">
          提交
        </Button>
        <Button>返回上一页面</Button>
      </div>
    </div>
  );
};

export default ReleaseForm;
