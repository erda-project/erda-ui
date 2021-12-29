import React from 'react';
import i18n from 'core/i18n';
import { map } from 'lodash';
import { ErdaIcon, FormModal } from 'common';
import routeInfoStore from 'core/stores/route';
import { Avatar, Spin, Tooltip, Modal, Popconfirm } from 'antd';
import devopsSvg from 'app/images/devops.svg';
import { regRules, goTo } from 'common/utils';
import { getAvatarChars } from 'app/common/utils';
import moment from 'moment';
import { useHoverDirty, useMount } from 'react-use';
import { ReadMeMarkdown } from './readme-markdown';
import projectStore from 'app/modules/project/stores/project';
import { useUserMap } from 'core/stores/userMap';
import { getProjectInfo, getProjectHomepage, saveProjectHomepage } from 'project/services/project';
import './index.scss';

const emptyMarkdownContent =
  '## 一个改变世界的项目 \n*用酷酷的一段话来介绍你的项目吧，让所有成员都清楚项目的背景和目标* \n### 介绍 \n*可以用一段视频或者图片来展示产品/项目的亮点* \n![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2021/png/286919/1640771214185-f4cc490e-78c4-4c07-9355-dbfdfd0ad485.png#clientId=ud159ea74-2305-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=564&id=ua2ee1ea3&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1128&originWidth=2496&originalType=binary&ratio=1&rotation=0&showTitle=false&size=827709&status=done&style=none&taskId=ue4c866ba-a91b-46b1-9821-4d546ef02b6&title=&width=1248) \n**知识库** \n---\n _罗列项目知识库内容_ \n| 产品 PRD | 设计文档  | \n | --- | --- | \n | [一个改变世界的需求 - PRD](https://www.erda.cloud) | [一个改变世界的需求 - PRD](https://www.erda.cloud) |';
const LinkList = (props) => {
  const { item, handleEditLink, handleDelete } = props;
  const linkRef = React.useRef(null);
  const isHovering = useHoverDirty(linkRef);
  return (
    <div key={item.id} ref={linkRef} className={`cursor-pointer flex items-center homepage-link mb-1`}>
      <ErdaIcon type="lianjie" className="text-default-4" />
      <div className={`cursor-pointer ml-2 w-64 px-2 py-1 flex justify-between items-center hover:bg-default-04 `}>
        <div className="w-52 hover:w-44 truncate text-purple-deep">
          <Tooltip title={item.name || item.url} placement="bottom" overlayClassName="homepage-link-tooltip">
            {/* TODO: window.open 还带有前缀 */}
            <span className="text-purple-deep hover:underline" onClick={() => window.open(item.url)}>
              {item.url}
            </span>
          </Tooltip>
          {/* <Ellipsis className="text-purple-deep" title={item.url} /> */}
        </div>
        <div className={`${isHovering ? 'homepage-link-operation' : 'hidden'} flex justify-between items-center`}>
          <ErdaIcon
            type="edit"
            className={` w-4 mx-2 self-center text-default-4`}
            size={16}
            onClick={() => handleEditLink(item)}
          />
          <Popconfirm
            placement="bottomLeft"
            overlayClassName="homepage-link-delete-confirm"
            title="确定删除？"
            icon={<></>}
            onConfirm={() => handleDelete(item.id)}
          >
            <ErdaIcon type="remove" size={16} className="text-default-4" />
          </Popconfirm>
        </div>
      </div>
    </div>
  );
};

const mockData = {
  readme: 'dasfds',
  links: [
    { id: '1', name: 'facebook', url: 'www.facebook.com' },
    { id: '2', name: 'google', url: 'www.google.comddddddddwerw3r44552' },
    { id: '3', name: 'google', url: 'www.google.com' },
  ],
};

export const ProjectHomepage = () => {
  const { projectId } = routeInfoStore.useStore((s) => s.params);
  // const { getProjectInfo } = projectStore.effects;
  const info = projectStore.useStore((s) => s.info);
  const [projectHomepageInfo, loading] = getProjectHomepage.useState();
  const [isVisible, setIsVisible] = React.useState(false);
  // TODO: 假数据
  const [data, setData] = React.useState(mockData);
  const [currentLink, setCurrentLink] = React.useState(null);
  const [markdownContent, setMarkdownContent] = React.useState(projectHomepageInfo?.readme);
  const { createdAt, owners, logo, displayName, name, desc } = info;
  const userMap = useUserMap();
  const projectOwner = userMap[owners?.[0]];

  useMount(() => {
    getProjectHomepage.fetch({ projectID: projectId });
    getProjectInfo(projectId).then((res) => console.log(res, 333));
  });

  // React.useEffect(() => {
  //   setData(projectHomepageInfo);
  //   setMarkdownContent(projectHomepageInfo?.readme);
  // }, [projectHomepageInfo]);

  function handleDelete(targetIndex) {
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
        placeholder: i18n.d('请给该地址取一个简单易懂的名称'),
        maxLength: 50,
      },
    },
  ];

  return (
    <Spin spinning={loading}>
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
              value={markdownContent || emptyMarkdownContent}
              onSave={(v) => handleSave({ ...data, readme: v })}
              originalValue={projectHomepageInfo?.readme || emptyMarkdownContent}
            />
          </div>
          <div className="homepage-info py-3 text-default">
            <div className="info-title">{i18n.d('关于')}</div>
            <div className="info-brief mb-4">
              {desc ? (
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
                <div className="flex items-center mb-4 cursor-pointer" onClick={handleAdd}>
                  <ErdaIcon type="lianjie" className="text-default-4" />
                  <div className={` ml-2 w-56 px-2 flex justify-between items-center text-default-3`}>
                    {i18n.d('点击添加URL地址')}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center mb-2">
              <ErdaIcon type="zerenren" className="mr-4 text-default-4" />
              <Avatar size={24} src={projectOwner?.avatar || undefined}>
                {projectOwner?.nick ? getAvatarChars(projectOwner?.nick) : i18n.t('none')}
              </Avatar>
              {projectOwner?.name && (
                <span className="text-default-8 ml-1">{projectOwner?.name || projectOwner?.nick}</span>
              )}
            </div>
            <div className="flex items-center mb-2">
              <ErdaIcon type="chuangjianshijian" className="mr-2 text-default-4" />
              <span className="ml-2 text-default-8">{moment(createdAt).format('YYYY/MM/DD')}</span>
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
    </Spin>
  );
};
