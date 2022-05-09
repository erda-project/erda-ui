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
import { getServiceDetail } from 'marketplace/services';
import routeInfoStore from 'core/stores/route';
import { ErdaIcon, MarkdownRender, Ellipsis, TextBlockInfo, TagsRow } from 'common';
import { useMount } from 'react-use';
import { Dropdown, Spin, Menu, Tooltip } from 'antd';
import i18n from 'i18n';

const Detail = () => {
  const { id } = routeInfoStore.useStore((s) => s.params);
  const [data, loading] = getServiceDetail.useState();
  const [content, setContent] = React.useState<MARKET.Service | null>(null);

  useMount(() => {
    getServiceDetail.fetch({ id });
  });

  React.useEffect(() => {
    const list = data?.list || [];
    if (!content) {
      setContent(list?.[0]);
    }
  }, [data, content]);

  const menu = (
    <Menu
      onClick={(e) => {
        setContent(data?.list?.find((item) => item.version === e.key) || null);
      }}
      className="p-3 w-[200px]"
    >
      <Menu.Item key={'chosen'} disabled className="text-default-6 text-xs mb-3">
        {'选择版本'}
      </Menu.Item>
      {(data?.list || []).map((item) => {
        return (
          <Menu.Item key={item.version}>
            <div className="flex-h-center justify-between">
              <div className="flex-h-center ">
                <ErdaIcon size={16} type="version" />
                <span className="ml-2 text-default">{item.version}</span>
              </div>
              {content?.version === item.version ? <ErdaIcon type="check" className="text-purple-deep" /> : null}
            </div>
          </Menu.Item>
        );
      })}
    </Menu>
  );

  const blockTexts = [
    { main: content?.version || '-', sub: i18n.d('版本') },
    { main: content?.orgName || '-', sub: i18n.d('发布者') },
  ];
  const curPresentation = content?.presentation;

  const infos = [
    {
      icon: 'link',
      link: curPresentation?.homepageURL,
      text: curPresentation?.homepageName || curPresentation?.homepageURL,
    },
    { icon: 'link', link: curPresentation?.opensourceURL, text: curPresentation?.opensourceURL },
    {
      icon: 'zerenren',
      text: `${curPresentation?.contactName}  ${curPresentation?.contactEmail}`,
    },
  ];

  return (
    <div className="bg-white py-3 pl-3 pr-10">
      <div>
        <ErdaIcon type="arrow-left" size="20" className="cursor-pointer text-gray mr-3" onClick={() => {}} />
      </div>
      <div className="flex justify-between">
        <div className="w-full">
          <MarkdownRender value={content?.presentation?.readme || i18n.t('No description')} />
        </div>
        <div className="py-3 text-default">
          <div className="w-[296px] pl-4 border-left pt-2">
            <div className="flex-h-center w-full">
              <div className="w-16 h-16 mr-3 rounded p-2 bg-default-04">
                <img src={content?.logoURL} className="w-full h-full mr-3 rounded" />
              </div>
              <div className="flex-1 w-[180px]">
                <div className="text-default leading-[22px]">{content?.displayName || content?.name}</div>
                <Ellipsis className="text-default-8 text-xs leading-5" title={content?.summary} />
                <Dropdown.Button
                  icon={<ErdaIcon type="caret-down" className="opacity-30 hover:opacity-100 mt-0.5" />}
                  type="primary"
                  size="small"
                  className="rounded-2xl mt-2"
                  overlay={menu}
                  placement={'bottomRight'}
                >
                  <span className="px-1">{i18n.d('下载该版本')}</span>
                </Dropdown.Button>
              </div>
            </div>
            <div className="flex-h-center my-8">
              {blockTexts.map((item) => (
                <TextBlockInfo {...item} size="small" align={'center'} className="flex-1" key={item.sub} />
              ))}
            </div>
            <div>
              <div className="mb-2 font-bold">{i18n.d('简介')}</div>
              <div className="leading-[22px] mb-4">{content?.presentation?.desc || '-'}</div>
            </div>

            <div className="mt-6">
              <div className="mb-2 font-bold">{i18n.d('标签')}</div>
              <div className="">
                <TagsRow
                  labels={(content?.labels || []).map((l) => ({ label: l }))}
                  showCount={content?.labels.length}
                  containerClassName="ml-2"
                  labelsClassName={'flex-wrap'}
                />
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-2 font-bold">{i18n.d('信息')}</div>
              {infos.map((item, idx) => (
                <div key={item.text || `${idx}`} className="flex items-center h-8 mb-2">
                  <ErdaIcon type={item.icon} size={16} className="text-default-3 mr-2" />
                  <div className="cursor-pointer w-64 px-2 py-1 truncate">
                    {item.link ? (
                      <Tooltip title={item.link} placement="left">
                        <a
                          className="underline"
                          style={{ color: 'rgba(66,76,166,0.90)' }}
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {item.text}
                        </a>
                      </Tooltip>
                    ) : (
                      <span>{item.text}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detail;
