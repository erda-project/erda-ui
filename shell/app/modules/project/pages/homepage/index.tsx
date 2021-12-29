import React from 'react';
import i18n from 'core/i18n';
import { map } from 'lodash';
import { ErdaIcon, Ellipsis, FormModal } from 'common';
import routeInfoStore from 'core/stores/route';
import { Avatar, Spin, Tooltip } from 'antd';
import devopsSvg from 'app/images/devops.svg';
import { regRules, goTo } from 'common/utils';
import moment from 'moment';
import { useHoverDirty, useMount } from 'react-use';
import { ReadMeMarkdown } from './readme-markdown';
import projectStore from 'app/modules/project/stores/project';
import { getProjectHomepage, saveProjectHomepage } from 'project/services/project';
import './index.scss';

const LinkList = (props) => {
  const { item, handleEditLink, handleDelete } = props;
  const linkRef = React.useRef(null);
  const isHovering = useHoverDirty(linkRef);
  console.log(item, 'item');
  return (
    <div key={item.id} ref={linkRef} className={`cursor-pointer flex items-center homepage-link`}>
      <ErdaIcon type="lianjie" />
      <div className={`cursor-pointer ml-2 w-56 px-2 flex justify-between items-center`}>
        <div className="w-52">
          <Tooltip title={item.name || item.url} placement="bottom" overlayClassName="homepage-link-tooltip">
            {/* TODO: window.open 还带有前缀 */}
            <span className="text-purple-deep truncate w-48" onClick={() => window.open(item.url)}>
              {item.url}
            </span>
          </Tooltip>
          {/* <Ellipsis className="text-purple-deep" title={item.url} /> */}
        </div>
        <div className={`${isHovering ? 'homepage-link-operation' : 'hidden'} flex justify-between items-center`}>
          <ErdaIcon type="edit" className={` w-4 ml-2 self-center`} size={16} onClick={() => handleEditLink(item)} />
          <ErdaIcon type="remove" size={16} onClick={() => handleDelete(item.id)} />
        </div>
      </div>
    </div>
  );
};

const mockData = {
  readme: 'dasfds',
  links: [
    { id: '1', name: 'facebook', url: 'www.facebook.com' },
    { id: '2', name: 'google', url: 'www.google.comddddddddwerw3r' },
    { id: '3', name: 'google', url: 'www.google.com' },
  ],
};

export const ProjectHomepage = () => {
  const hasBrief = false;
  const { projectId } = routeInfoStore.useStore((s) => s.params);
  const info = projectStore.useStore((s) => s.info);
  const [projectHomepageInfo, loading] = getProjectHomepage.useState();
  const [isVisible, setIsVisible] = React.useState(false);
  const [data, setData] = React.useState(projectHomepageInfo);
  const [currentLink, setCurrentLink] = React.useState(null);
  const [markdownContent, setMarkdownContent] = React.useState(projectHomepageInfo?.readme);
  const { createdAt, owners, logo, displayName, name } = info;

  // console.log({ info, projectHomepageInfo }, moment(createdAt).format('YYYY/MM/DD'));
  useMount(() => {
    getProjectHomepage.fetch({ projectID: projectId });
  });
  console.log({ data, projectHomepageInfo });
  // React.useEffect(() => {
  //   getNotifyChannels.fetch({ pageNo: paging.current, pageSize: paging.pageSize, type: activeTab });
  // }, [paging, activeTab]);

  React.useEffect(() => {
    setData(projectHomepageInfo);
    setMarkdownContent(projectHomepageInfo?.readme);
  }, [projectHomepageInfo]);

  function handleDelete(targetIndex) {
    console.log('delete');
    data?.links.splice(targetIndex, 1);
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
    saveProjectHomepage.fetch({ ...data, projectID: projectId }).then(() => {
      console.log(data, 111111);
      getProjectHomepage.fetch({ projectID: projectId });
    });
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
      name: 'name',
      itemProps: {
        placeholder: i18n.d('请给该地址取一个简单易懂的名称吧'),
        maxLength: 50,
      },
    },
  ];

  return (
    <div className="project-homepage">
      <div className="homepage-header bg-default">
        <div className="project-icon bg-default">
          {logo ? (
            <img className="big-icon" src={logo} width={64} height={64} />
          ) : (
            <img className="big-icon" src={devopsSvg} width={64} height={64} />
          )}
        </div>
        <div className="project-name">{displayName || name}</div>
      </div>
      <div className="homepage-body flex justify-between px-4">
        <div className="homepage-markdown w-full mr-4">
          <ReadMeMarkdown
            value={markdownContent}
            onSave={(v) => handleSave({ ...data, readme: v })}
            originalValue={projectHomepageInfo?.readme}
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
              <LinkList item={item} handleEditLink={handleEditLink} handleDelete={handleDelete} key={item.id} />
            ))}
            {data?.links.length < 5 && (
              <div className="flex items-center" onClick={handleAdd}>
                <ErdaIcon type="lianjie" />
                <div className={` ml-2 w-56 px-2 flex justify-between items-center`}>{i18n.d('点击添加URL地址')}</div>
              </div>
            )}
          </div>
          <div className="flex items-center">
            <ErdaIcon type="zerenren" />
            <Avatar size={24} src={undefined}>
              33
              {/* {nick ? getAvatarChars(nick) : i18n.t('none')} */}
            </Avatar>
          </div>
          <div className="flex items-center">
            <ErdaIcon type="chuangjianshijian" />
            <span className="ml-2">{moment(createdAt).format('YYYY/MM/DD')}</span>
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
          console.log('okokok');
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
