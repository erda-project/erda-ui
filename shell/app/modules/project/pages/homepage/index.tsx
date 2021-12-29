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
import { getProjectHomepage, saveProjectHomepage } from 'project/services/project';
import './index.scss';

interface LinkItem {
  id?: string | number;
  name?: string;
  url: string;
}
interface LinkRowProps {
  item: LinkItem;
  handleEditLink: (item: LinkItem) => void;
  handleDelete: (id: number) => void;
}

interface DataProps {
  readme: string;
  links: LinkItem[];
}

const emptyMarkdownContent =
  '## 一个改变世界的项目 \n*用酷酷的一段话来介绍你的项目吧，让所有成员都清楚项目的背景和目标* \n### 介绍 \n*可以用一段视频或者图片来展示产品/项目的亮点* \n![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2021/png/286919/1640771214185-f4cc490e-78c4-4c07-9355-dbfdfd0ad485.png#clientId=ud159ea74-2305-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=564&id=ua2ee1ea3&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1128&originWidth=2496&originalType=binary&ratio=1&rotation=0&showTitle=false&size=827709&status=done&style=none&taskId=ue4c866ba-a91b-46b1-9821-4d546ef02b6&title=&width=1248) \n**知识库** \n---\n _罗列项目知识库内容_ \n| 产品 PRD | 设计文档  | \n | --- | --- | \n | [一个改变世界的需求 - PRD](https://www.erda.cloud) | [一个改变世界的需求 - PRD](https://www.erda.cloud) |';

const iconStyle = {
  className: 'text-default-4',
  size: 20,
};

const LinkRow = (props: LinkRowProps) => {
  const { item, handleEditLink, handleDelete } = props;
  const linkRef = React.useRef(null);
  const isHovering = useHoverDirty(linkRef);

  return (
    <div key={item.id} ref={linkRef} className="cursor-pointer flex items-center homepage-link mb-1">
      <ErdaIcon type="lianjie" {...iconStyle} />
      <div className="cursor-pointer ml-2 w-64 px-2 py-1 flex justify-between items-center hover:bg-default-04">
        <div className="w-52 hover:w-44 truncate text-purple-deep">
          <Tooltip title={item.name || item.url} placement="bottomLeft" overlayClassName="homepage-tooltip">
            <span className="text-purple-deep hover:underline" onClick={() => window.open(item.url)}>
              {item.url}
            </span>
          </Tooltip>
        </div>
        <div className={`${isHovering ? 'homepage-link-operation' : 'hidden'} flex justify-between items-center`}>
          <Tooltip title={i18n.t('edit')} overlayClassName="homepage-tooltip">
            <ErdaIcon
              type="edit"
              className={'w-4 mx-2 self-center text-default-4'}
              size={16}
              onClick={() => handleEditLink(item)}
            />
          </Tooltip>

          <Popconfirm
            placement="bottomLeft"
            overlayClassName="homepage-link-delete-confirm"
            title={`${i18n.t('confirm deletion')}?`}
            icon={<></>}
            onConfirm={() => handleDelete(item.id)}
          >
            <Tooltip title={i18n.t('delete')} overlayClassName="homepage-tooltip">
              <ErdaIcon type="remove" size={16} className="text-default-4" />
            </Tooltip>
          </Popconfirm>
        </div>
      </div>
    </div>
  );
};

export const ProjectHomepage = () => {
  const { projectId } = routeInfoStore.useStore((s) => s.params);
  const info = projectStore.useStore((s) => s.info);
  const [projectHomepageInfo, loading] = getProjectHomepage.useState();
  const [isVisible, setIsVisible] = React.useState(false);
  const [data, setData] = React.useState(projectHomepageInfo);
  const [currentLink, setCurrentLink] = React.useState(null as LinkItem | null);
  const [markdownContent, setMarkdownContent] = React.useState(projectHomepageInfo?.readme);
  const { createdAt, owners, logo, displayName, name, desc } = info;
  const userMap = useUserMap();
  const projectOwner = userMap[owners?.[0]];

  useMount(() => {
    getProjectHomepage.fetch({ projectID: projectId });
  });

  React.useEffect(() => {
    setData(projectHomepageInfo);
    setMarkdownContent(projectHomepageInfo?.readme);
  }, [projectHomepageInfo]);

  function handleDelete(id: number) {
    const targetIndex = data?.links.findIndex((x) => x.id === id) as number;
    data?.links.splice(targetIndex, 1);
    handleSave(data);
  }

  function handleEditLink(item: LinkItem) {
    setCurrentLink(item);
    setIsVisible(true);
  }

  function handleAdd() {
    setCurrentLink(null);
    setIsVisible(true);
  }

  function handleSave(newData: DataProps) {
    setIsVisible(false);
    saveProjectHomepage.fetch({ ...newData, projectID: projectId }).then(() => {
      getProjectHomepage.fetch({ projectID: projectId });
    });
  }

  const fieldsList = [
    {
      label: 'URL',
      name: 'url',
      itemProps: {
        placeholder: i18n.t('dop:paste the url path here'),
      },
      rules: [
        { max: 255, message: i18n.t('dop:Up to 255 characters for url path') },
        {
          validator: (_, value: string, callback: Function) => {
            return value && !regRules.url.pattern.test(value)
              ? callback(i18n.t('dop:please fill in the correct the url path!'))
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
        placeholder: i18n.t('dop:please give the url path a simple and understandable name'),
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
              onSave={(v: string) => handleSave({ ...data, readme: v })}
              originalValue={projectHomepageInfo?.readme || emptyMarkdownContent}
            />
          </div>
          <div className="homepage-info py-3 text-default">
            <div className="info-title">{i18n.t('dop:About')}</div>
            <div className="info-brief mb-4">
              {desc ? (
                'Enterprise-grade application building deployment monitoring platform (AnPaas)'
              ) : (
                <span>
                  {i18n.t(
                    'dop:Tell about your project in one sentence, so that more people can quickly understand your project, go to',
                  )}
                  <span
                    onClick={() => goTo(goTo.pages.projectSetting, { projectId })}
                    className="text-purple-deep mx-1 cursor-pointer"
                  >
                    {i18n.t('project setting')}
                  </span>
                  {i18n.t('dop:to configure')}
                </span>
              )}
            </div>
            <div className="info-links">
              {map(data?.links, (item) => (
                <LinkRow item={item} handleEditLink={handleEditLink} handleDelete={handleDelete} key={item.id} />
              ))}
              {data?.links.length < 5 && (
                <div className="flex items-center mb-4 cursor-pointer" onClick={handleAdd}>
                  <ErdaIcon type="lianjie" {...iconStyle} />
                  <div
                    className={
                      'ml-2 w-64 px-2 py-1 flex justify-between items-center text-default-3 hover:bg-default-04'
                    }
                  >
                    {i18n.t('dop:click to add URL path')}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center mb-2">
              <ErdaIcon type="zerenren" {...iconStyle} />
              <span className="ml-4">
                <Avatar size={24} src={projectOwner?.avatar || undefined}>
                  {projectOwner?.nick ? getAvatarChars(projectOwner?.nick) : i18n.t('none')}
                </Avatar>
                {projectOwner?.name && (
                  <span className="text-default-8 ml-1">{projectOwner?.name || projectOwner?.nick || '-'}</span>
                )}
              </span>
            </div>
            <div className="flex items-center mb-2">
              <ErdaIcon type="chuangjianshijian" {...iconStyle} />
              <span className="ml-4 text-default-8">{moment(createdAt).format('YYYY/MM/DD')}</span>
            </div>
          </div>
        </div>
        <FormModal
          wrapClassName="new-form-modal"
          onOk={(res: LinkItem) => {
            if (currentLink) {
              const targetIndex = data.links.findIndex((x) => x.id === currentLink.id);
              Object.assign(data.links[targetIndex], res);
            } else {
              data.links.push(res);
            }
            handleSave(data);
          }}
          onCancel={() => setIsVisible(false)}
          name=" URL "
          visible={isVisible}
          fieldsList={fieldsList}
          modalProps={{ destroyOnClose: true }}
          formData={currentLink as LinkItem}
        />
      </div>
    </Spin>
  );
};
