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
import { Form, Button } from 'antd';
import i18n from 'i18n';
import { ErdaIcon, RenderFormItem } from 'common';

interface IProps {
  onCancel: () => void;
}

const PipelineForm = ({ onCancel }: IProps) => {
  return (
    <div className="project-pipeline-form flex flex-col h-full">
      <div className="header py-2.5 pl-4 bg-default-02 flex-h-center">
        <span className="text-base text-default">创建流水线</span>
        <ErdaIcon type="zhedie" className="ml-1" />
        <div className="flex-1 flex">
          <div className="flex-h-center ml-2 bg-default-08 px-2 py-1">
            <ErdaIcon type="wodeyingyong" className="mr-0.5" size={18} />
            这里是应用的名称
          </div>
        </div>
        <div className="flex-h-center cursor-pointer mx-2 px-2 py-1">
          <ErdaIcon type="guanbi" size="20" onClick={() => onCancel()} />
        </div>
      </div>

      <div className="flex-1 min-h-0 pl-4 pt-4 w-1/2">
        <Form>
          <RenderFormItem
            name={'version'}
            type={'input'}
            rules={[
              { required: true, message: i18n.t('please enter {name}', { name: i18n.t('dop:release name') }) },
              { max: 30, message: i18n.t('dop:no more than 30 characters') },
              {
                pattern: /^[A-Za-z0-9._-]+$/,
                message: i18n.t('dop:Must be composed of letters, numbers, underscores, hyphens and dots.'),
              },
            ]}
            itemProps={{
              className: 'border-transparent shadow-none pl-0',
              placeholder: i18n.t('please enter {name}', { name: i18n.t('dop:release name') }),
            }}
          />
          <div>
            <div className="text-default">代码源</div>
            <CodeResource />
          </div>
          <div>
            <div className="text-default mb-3">配置</div>
            <div>
              <div className="flex-h-center">
                <div className="mb-6 w-28 text-default-6a">分支</div>
                <div className="flex-1">
                  <RenderFormItem
                    name="branch"
                    type="select"
                    itemProps={{
                      className: 'bg-default-06',
                    }}
                  />
                </div>
              </div>
            </div>
            <div>
              <div className="flex-h-center">
                <div className="mb-6 w-28 text-default-6a">pipeline文件</div>
                <div className="flex-1">
                  <RenderFormItem
                    name="file"
                    type="select"
                    itemProps={{
                      className: 'bg-default-06',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Form>
      </div>

      <div className="py-3 px-4">
        <Button type="primary" className="mr-2">
          创建
        </Button>
        <Button className="bg-default-06 border-default-06 text-default-8" onClick={() => onCancel()}>
          取消
        </Button>
      </div>
    </div>
  );
};

const CodeResource = () => {
  const list = [
    {
      icon: <ErdaIcon type="Erdadaimacangku" size={30} />,
      label: '内置代码库',
    },
  ];
  return (
    <div className="my-6 flex">
      {list.map((item) => (
        <div className="flex-h-center">
          <div className="w-5 h-5 inline-block rounded-full border border-solid border-white-300 flex-all-center bg-purple-deep border-purple-deep mr-2">
            <ErdaIcon type="check" className="text-white" size="12" />
          </div>
          <div className="mr-2 flex-h-center">{item.icon}</div>
          <div className="text-default-9">{item.label}</div>
        </div>
      ))}
    </div>
  );
};

export default PipelineForm;
