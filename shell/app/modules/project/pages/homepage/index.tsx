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
import i18n from 'core/i18n';
import { map, uniqueId } from 'lodash';
import { ErdaIcon, FormModal } from 'common';
import routeInfoStore from 'core/stores/route';
import { Avatar, Spin, Tooltip, Popconfirm, message } from 'antd';
import { regRules, goTo } from 'common/utils';
import { getAvatarChars } from 'app/common/utils';
import moment from 'moment';
import { useHoverDirty, useMount } from 'react-use';
import { ReadMeMarkdown } from './readme-markdown';
import defaultProjectMainBg from 'app/images/default-project-main-bg.webp';
import projectStore from 'app/modules/project/stores/project';
import { useUserMap } from 'core/stores/userMap';
import { getProjectHomepage, saveProjectHomepage } from 'project/services/project';
import './index.scss';

interface LinkItem {
  id: string | number;
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

const emptyMarkdownContent = i18n.t('dop:empty-markdown-content');

const iconStyle = {
  className: 'text-default-4',
  size: 20,
};

const MAX_LINKS_LENGTH = 5;

const LinkRow = (props: LinkRowProps) => {
  const { item, handleEditLink, handleDelete } = props;
  const linkRef = React.useRef(null);
  const isHovering = useHoverDirty(linkRef);

  return (
    <div key={item.id} ref={linkRef} className="cursor-pointer flex items-center homepage-link mb-1">
      <ErdaIcon type="lianjie" {...iconStyle} />
      <div className="cursor-pointer ml-2 w-64 px-2 py-1 flex justify-between items-center hover:bg-default-04">
        <div className="w-52 truncate text-purple-deep">
          <Tooltip title={item.name || item.url} placement="left" overlayClassName="homepage-tooltip">
            <span
              className="text-purple-deep hover:underline"
              onClick={() => {
                if (item.url.startsWith('www')) {
                  window.open(`http://${item.url}`);
                }
                window.open(item.url);
              }}
            >
              {item.url}
            </span>
          </Tooltip>
        </div>
        <div className={`${isHovering ? 'homepage-link-operation' : 'hidden'} flex justify-between items-center`}>
          <Tooltip title={i18n.t('edit')} overlayClassName="homepage-tooltip">
            <ErdaIcon
              type="correction"
              className={'w-4 mx-2 self-center text-default-4 hover:text-default-8'}
              size={16}
              onClick={() => handleEditLink(item)}
            />
          </Tooltip>

          <Popconfirm
            placement="bottomLeft"
            overlayClassName="homepage-link-delete-confirm"
            title={`${i18n.t('confirm deletion')}?`}
            icon={null}
            onConfirm={() => handleDelete(item.id)}
          >
            <Tooltip title={i18n.t('delete')} overlayClassName="homepage-tooltip">
              <ErdaIcon type="remove" size={16} className="text-default-4 hover:text-default-8" />
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
  const { getProjectInfo } = projectStore.effects;
  const [projectHomepageInfo, loading] = getProjectHomepage.useState();
  const [isVisible, setIsVisible] = React.useState(false);
  const [data, setData] = React.useState(projectHomepageInfo || { links: [], readme: '' });
  const [currentLink, setCurrentLink] = React.useState<LinkItem | null>(null);
  const [markdownContent, setMarkdownContent] = React.useState(projectHomepageInfo?.readme);
  const [disabledMarkdownBtn, setDisabledMarkdownBtn] = React.useState(false);
  const { createdAt, owners, logo, displayName, name, desc } = info;
  const userMap = useUserMap();
  const projectOwner = userMap[owners?.[0]];

  useMount(() => getProjectInfo(projectId));

  React.useEffect(() => {
    projectId && getProjectHomepage.fetch({ projectID: projectId });
  }, [projectId]);

  React.useEffect(() => {
    setData(projectHomepageInfo);
    setMarkdownContent(projectHomepageInfo?.readme);
  }, [projectHomepageInfo]);

  function handleDelete(id: number) {
    data.links = data?.links.filter((x) => x.id !== id);
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
      projectId && getProjectHomepage.fetch({ projectID: projectId });
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
    <div className="full-spin-height">
      <Spin spinning={loading}>
        <div className="project-homepage bg-white">
          <div
            className="homepage-header relative bg-cover bg-center"
            style={{ backgroundImage: `url(${defaultProjectMainBg})` }}
          >
            <div style={{ transform: 'scale(0.8)' }} className="absolute top-2 -right-1 text-xs text-white-4">
              {i18n.t('dop:project-img-copyright-tip')}
            </div>
            <div className="project-icon bg-white">
              {logo ? (
                <img className="big-icon" src={logo} width={64} height={64} />
              ) : (
                <ErdaIcon type="morenxiangmu" size={64} />
              )}
            </div>
            <div className="project-name">{displayName || name}</div>
          </div>
          <div className="homepage-body pb-4 flex justify-between px-4">
            <div className="homepage-markdown w-full mr-4">
              <ReadMeMarkdown
                value={markdownContent || emptyMarkdownContent}
                onSave={(v: string) => handleSave({ ...data, readme: v })}
                onChange={(v: string) => {
                  if (v.length > 65535) {
                    setDisabledMarkdownBtn(true);
                    message.warning(i18n.t('dop:Markdown content length cannot exceed 65535 characters!'));
                  } else {
                    setDisabledMarkdownBtn(false);
                  }
                }}
                disabled={disabledMarkdownBtn}
                originalValue={projectHomepageInfo?.readme || emptyMarkdownContent}
              />
            </div>
            <div className="homepage-info py-3 text-default">
              <div className="info-title">{i18n.t('dop:About')}</div>
              <div className="info-brief mb-4">
                {desc || (
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
                {data?.links.length < MAX_LINKS_LENGTH && (
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
                const targetIndex = data?.links.findIndex((x) => x.id === currentLink.id);
                Object.assign(data?.links[targetIndex], res);
              } else {
                data?.links.push({ ...res, id: uniqueId() });
              }
              handleSave(data);
            }}
            onCancel={() => setIsVisible(false)}
            name=" URL "
            visible={isVisible}
            fieldsList={fieldsList}
            modalProps={{ destroyOnClose: true, closeIcon: <ErdaIcon type="guanbi" /> }}
            formData={currentLink as LinkItem}
          />
        </div>
      </Spin>
    </div>
  );
};
