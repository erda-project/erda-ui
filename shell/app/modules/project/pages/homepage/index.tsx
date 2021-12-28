import React from 'react';
import i18n from 'core/i18n';
import { map } from 'lodash';
import { ErdaIcon, Ellipsis, FormModal } from 'common';
import routeInfoStore from 'core/stores/route';
import { regRules, goTo } from 'common/utils';
import './index.scss';
import { useHoverDirty } from 'react-use';
import { ReadMeMarkdown } from './readme-markdown';

const LinkList = (props) => {
  const { item, handleEditLink } = props;
  const linkRef = React.useRef();
  const isHovering = useHoverDirty(linkRef);

  return (
    <div key={item.id} ref={linkRef} className={`${isHovering ? 'cursor-pointer' : ''} flex items-center`}>
      <ErdaIcon type="lianjie" />
      <div className={`${isHovering ? 'cursor-pointer' : ''} ml-2 w-56 px-2 flex justify-between items-center`}>
        <div className="w-52">
          <Ellipsis className="text-purple-deep" title={item.url} />
        </div>
        <ErdaIcon
          type="edit"
          className={`${isHovering ? 'inline' : 'hidden'} w-4 ml-2 self-center`}
          size={16}
          onClick={() => handleEditLink(item)}
        />
      </div>
    </div>
  );
};

const mockData = {
  readme: 'dasfds',
  links: [
    { id: '1', name: 'facebook', url: 'www.facebook.com' },
    { id: '2', name: 'google', url: 'www.google.com' },
  ],
};

export const ProjectHomepage = () => {
  const hasBrief = false;
  const { projectId } = routeInfoStore.useStore((s) => s.params);

  const [isVisible, setIsVisible] = React.useState(false);
  const [data, setData] = React.useState(mockData);
  const [currentLink, setCurrentLink] = React.useState(null);

  function handleDelete(targetIndex) {
    data.links.splice(targetIndex, 1);
    handleSave(data);
  }

  function handleEditLink(item) {
    setCurrentLink(item);
    setIsVisible(true);
  }

  function handleAdd() {
    setCurrentLink(null);
    setIsVisible(true);
  }

  function handleSave(data) {
    setIsVisible(false);
    setData({ ...data }); // 接口通后删掉，现在是用来测试
    // TODO: 调用接口 request(data)
  }

  // const maxMarkdownHeight = (document.documentElement.clientHeight - 86) * 0.7;
  const fieldsList = [
    {
      label: i18n.t('URL'),
      name: 'url',
      itemProps: {
        placeholder: i18n.d('请将地址粘贴至该处'),
      },
      rules: [
        { max: 255, message: i18n.t('dop:Up to 255 characters for directory name') },
        {
          validator: (_, value: string, callback: Function) => {
            return value && !regRules.ip.pattern.test(value) && !regRules.url.pattern.test(value)
              ? callback(i18n.t('please fill in the correct IP address or domain name!'))
              : callback();
          },
        },
      ],
    },
    {
      label: i18n.t('name'),
      required: false,
      name: 'message',
      itemProps: {
        placeholder: i18n.d('请给该地址取一个简单易懂的名称吧'),
        maxLength: 50,
      },
    },
  ];

  return (
    <div className="project-homepage">
      <div className="homepage-header bg-default">
        <div className="project-icon">3</div>
        <div className="project-name">Erda</div>
      </div>
      <div className="homepage-body flex justify-between px-4">
        <div className="homepage-markdown w-full mr-4">
          <ReadMeMarkdown
            value={
              '**\nREADME.md\n**\n\n### 【环境信息】\n\n\n### 【缺陷描述】*\n\n\n### 【重现步骤】\n\n\n### 【实际结果】\n\n\n### 【期望结果】*\n\n\n### 【修复建议】\n\n **\nREADME.md\n**\n\n### 【环境信息】\n\n\n### 【缺陷描述】*\n\n\n### 【重现步骤】\n\n\n### 【实际结果】\n\n\n### 【期望结果】*\n\n\n### \n\n'
            }
            onChange={''}
            onSave={(v, fieldType) => onChangeCb?.({ [name]: v }, fieldType)}
            originalValue={
              '**\nREADME.md\n**\n\n### 【环境信息】\n\n\n### 【缺陷描述】*\n\n\n### 【重现步骤】\n\n\n### 【实际结果】\n\n\n### 【期望结果】*\n\n\n### 【修复建议】\n\n **\nREADME.md\n**\n\n### 【环境信息】\n\n\n### 【缺陷描述】*\n\n\n### 【重现步骤】\n\n\n### 【实际结果】\n\n\n### 【期望结果】*\n\n\n### \n\n'
            }
          />
        </div>
        <div className="homepage-info py-3">
          <div className="info-title">{i18n.d('关于')}</div>
          <div className="info-brief mb-4">
            {hasBrief ? (
              'Enterprise-grade application building deployment monitoring platform (AnPaas)'
            ) : (
              <span>
                用一句话讲述你的项目，让更多的人快速了解你的项目，前往
                <span
                  onClick={() => goTo(goTo.pages.projectSetting, { projectId })}
                  className="text-purple-deep mx-1 cursor-pointer"
                >
                  项目设置
                </span>
                进行配置
              </span>
            )}
          </div>
          <div className="info-links">
            {map(data?.links, (item) => (
              <LinkList item={item} handleEditLink={handleEditLink} />
            ))}
            <div className="flex items-center" onClick={handleAdd}>
              <ErdaIcon type="lianjie" />
              <div className={` ml-2 w-56 px-2 flex justify-between items-center`}>{i18n.d('点击添加URL地址')}</div>
            </div>
          </div>
        </div>
      </div>
      <FormModal
        wrapClassName="new-form-modal"
        onOk={(res) => {
          if (currentLink) {
            const targetIndex = data.links.findIndex((x) => x.id === currentLink.id);
            Object.assign(data.links[targetIndex], res);
          } else {
            data.links.push(res);
          }

          handleSave(data);
        }}
        onCancel={() => setIsVisible(false)}
        name={i18n.t('URL')}
        visible={isVisible}
        fieldsList={fieldsList}
        formData={currentLink}
      />
    </div>
  );
};
