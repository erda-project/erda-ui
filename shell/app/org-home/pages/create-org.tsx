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

import * as React from 'react';
import DiceConfigPage from 'config-page/index';
import './create-org.scss';

export const CreateOrg = () => {
  return (

    <div className='create-org-page'>
      <DiceConfigPage
        scenarioType='create-organization'
        scenarioKey='create-organization'
        useMock={location.search.includes('useMock') ? useMock : undefined}
      />
    </div>
  );
};

const mock: CONFIG_PAGE.RenderConfig = {
  scenario: {
    scenarioKey: 'create-organization',
    scenarioType: 'create-organization', // 后端定义
  },
  protocol: {
    hierarchy: {
      root: 'page',
      structure: {
        page: ['createOrgForm'],
      },
    },
    components: {
      page: {
        type: 'Container',
      },
      createOrgForm: {
        type: 'Form',
        state: {
          formData: undefined,
        },
        props: {
          visible: true,
          fields: [
            {
              label: "组织名称",
              component: "input",
              required: true,
              key: "组织名称"
            },
            {
              label: "组织域名",
              component: "input",
              required: true,
              key: "组织域名",
              componentProps: {
                addonBefore: "erda://"
              }
            },
            {
              label: "备注",
              component: "textarea",
              key: "备注",
              componentProps: {
                autoSize: {
                  minRows: 4,
                  maxRows: 8
                }
              }
            },
            {
              label: "谁可以看到该组织",
              component: "radio",
              required: true,
              key: "谁可以看到该组织",
              componentProps: {
                radioType: "radio",
                displayDesc: true
              },
              dataSource: {
                static: [
                  {
                    name: "私人的",
                    desc: "小组及项目只能由成员查看",
                    value: "private"
                  },
                  {
                    name: "公开的",
                    desc: "无需任何身份验证即可查看该组织和任何公开项目",
                    value: "public"
                  },
                ]
              }
            },
            {
              label: "组织图标",
              component: "upload",
              key: "组织图标",
              componentProps: {
                uploadText: "上传图片",
                sizeLimit: 2,
                supportFormat: [
                  "png",
                  "jpg",
                  "jpeg",
                  "gif",
                  "bmp"
                ]
              }
            },
          ],
          readOnly: false, // 查看详情时，设置为true
        },
        operations: {
          submit: {
            key: 'submit',
            reload: true,
          },
          cancel: {
            reload: false,
            key: 'cancel',
            command: {
              key: 'set',
              target: 'addAppDrawer',
              state: { visible: false },
            },
          },
        },
      },
    },
  },
};

const useMock = (payload: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mock);
    }, 500);
  });
};