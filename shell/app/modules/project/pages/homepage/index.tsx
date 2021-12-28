import React from 'react';
import i18n from 'core/i18n';
import { map } from 'lodash';
import { ErdaIcon, Ellipsis, NewFormModal } from 'common';
import { regRules } from 'common/utils';
import './index.scss';

const links = [
  'www.github.com/erda-projec/erda-ui',
  'www.github.com/erda-project/erda-ui-enterprise',
  'www.github.com/erda-project…',
];

const LinkList = (props) => {
  const { item } = props;
  const [isHover, setIsHover] = React.useState(false);
  const onHover = () => setIsHover(true);
  const outHover = () => setIsHover(false);

  return (
    <div
      key={item}
      className={`${isHover ? 'cursor-pointer' : ''} flex items-center`}
      onMouseEnter={onHover}
      onMouseLeave={outHover}
    >
      <ErdaIcon type="link" />
      <div className={`${isHover ? 'cursor-pointer' : ''} ml-2 w-56 px-2 flex justify-between items-center`}>
        <div className="w-52">
          <Ellipsis className="text-purple-deep" title={item} />
        </div>
        <ErdaIcon type="edit" className={`${isHover ? 'inline' : 'hidden'} w-4 ml-2 self-center`} size={16} />
      </div>
    </div>
  );
};

export const ProjectHomepage = () => {
  const hasBrief = false;
  const [isVisible, setIsVisible] = React.useState(false);
  const handleLink = (id?: string) => {
    setIsVisible(true);
  };

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
      <div className="homepage-header">
        <div className="project-icon">3</div>
        <div className="project-name">Erda</div>
      </div>
      <div className="homepage-body flex justify-between px-4">
        <div className="homepage-markdown">markdown</div>
        <div className="homepage-info">
          <div className="info-title">{i18n.d('关于')}</div>
          <div className="info-brief mb-4">
            {hasBrief
              ? 'Enterprise-grade application building deployment monitoring platform (AnPaas)'
              : '用一句话讲述你的项目，让更多的人快速了解你的项目，前往 项目设置 进行配置'}
          </div>
          <div className="info-links">
            {map(links, (item) => (
              <LinkList item={item} />
            ))}
            <div className="flex items-center" onClick={handleLink}>
              <ErdaIcon type="link" />
              <div className={` ml-2 w-56 px-2 flex justify-between items-center`}>{i18n.d('点击添加URL地址')}</div>
            </div>
          </div>
        </div>
      </div>
      <NewFormModal
        onOk={() => console.log('ok')}
        onCancel={() => setIsVisible(false)}
        name={i18n.t('URL')}
        visible={isVisible}
        fieldsList={fieldsList}
        formData={{}}
      />
    </div>
  );
};
