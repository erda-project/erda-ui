import * as React from 'react';
import DiceConfigPage from 'config-page/index';
import { Card } from 'nusi';
import i18n from 'i18n';
import erda_png from 'app/images/Erda.png';
import './org-home.scss';

export const CreateOrg = () => {
  return (

    <div className='org-home-list'>
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
              label: "谁可以看该组织",
              component: "radio",
              required: true,
              key: "谁可以看该组织",
              dataSource: {
                static: [
                  {
                    name: "私人的",
                    value: "小组及项目只能由成员查看"
                  },
                  {
                    name: "公开的",
                    value: "无需任何身份验证即可查看该组织和任何公开项目"
                  }
                ]
              },
              componentProps: {
                radioType: "radio"
              },
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