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
import { getServiceDetail } from 'gallery/services';
import routeInfoStore from 'core/stores/route';
import { ErdaIcon, MarkdownRender, Ellipsis, TextBlockInfo, TagsRow } from 'common';
import defaultMarketServiceSvg from 'app/images/default-market-service.svg';
import { useMount } from 'react-use';
import { goTo } from 'common/utils';
import { Dropdown, Menu, Tooltip } from 'antd';
import i18n from 'i18n';
import './detail.scss';

const Detail = () => {
  const [{ id, type }, markedRoutePreview] = routeInfoStore.useStore((s) => [s.params, s.markedRoutePreview]);

  const [data] = getServiceDetail.useState();
  const [curVersion, setCurVersion] = React.useState<MARKET.Version | null>(null);

  useMount(() => {
    getServiceDetail.fetch({ id });
  });

  React.useEffect(() => {
    document.title = `${data?.displayName || data?.name} · Erda`;
    return () => {
      document.title = 'Erda';
    };
  }, [data]);

  React.useEffect(() => {
    const versions = data?.versions || [];
    if (versions?.length) {
      setCurVersion(versions?.[0]);
    }
  }, [data]);

  const menu = (
    <Menu
      onClick={(e) => {
        setCurVersion(data?.versions?.find((item) => item.version === e.key) || null);
      }}
      className="p-3 w-[200px] h-[310px] overflow-y-auto"
    >
      <Menu.Item key={'chosen'} disabled className="text-default-6 text-xs mb-3">
        {i18n.t('please select version')}
      </Menu.Item>
      {(data?.versions || []).map((item) => {
        return (
          <Menu.Item key={item.version}>
            <div className="flex-h-center justify-between">
              <div className="flex-h-center flex-1 overflow-hidden">
                <ErdaIcon size={16} type="version" />
                <Ellipsis className="ml-2 text-default" title={item.version} />
              </div>
              {curVersion?.version === item.version ? (
                <ErdaIcon type="check" className="text-purple-deep mr-1" />
              ) : null}
            </div>
          </Menu.Item>
        );
      })}
    </Menu>
  );

  const blockTexts = [
    { main: curVersion?.version || '-', sub: i18n.t('Version') },
    { main: data?.orgName || '-', sub: i18n.t('Publisher') },
  ];

  const infos = [
    {
      icon: 'link',
      link: `${curVersion?.homepageURL}`,
      text: `${curVersion?.homepageName || curVersion?.homepageURL}`,
      show: !!curVersion?.homepageURL,
    },
    {
      icon: 'link',
      link: curVersion?.opensourceURL,
      text: curVersion?.opensourceURL,
      show: !!curVersion?.opensourceURL,
    },
    {
      icon: 'zerenren',
      text: `${curVersion?.contactEmail}`,
      show: !!curVersion?.contactEmail,
    },
  ].filter((item) => item.show);

  const downloadAttr: [() => void, string] =
    curVersion?.isDownloadable && curVersion?.downloadURL
      ? [
          () => {
            window.open(curVersion.downloadURL);
          },
          '',
        ]
      : [() => {}, 'cursor-not-allowed	'];

  return (
    <div className="bg-white py-3 px-4 h-full gallery-detail overflow-auto flex flex-col">
      <div
        className="flex-h-center"
        onClick={() => {
          if (markedRoutePreview.gallery) {
            window.history.back();
          } else {
            goTo(goTo.pages.galleryRoot);
          }
        }}
      >
        <ErdaIcon type="arrow-left" size="20" className="cursor-pointer text-gray mr-1" />
        <div className="text-xl truncate inline-flex items-center cursor-pointer">
          {data?.displayName || data?.name}
        </div>
      </div>
      <div className="flex justify-between mt-4 flex-1 overflow-auto">
        <div className=" px-4 flex-1 overflow-auto">
          <MarkdownRender value={curVersion?.readme || i18n.t('No description')} />
        </div>
        <div className="py-3 text-default overflow-auto pr-4">
          <div className="w-[296px] pl-4 border-left pt-2">
            <div className="flex-h-center w-full">
              <div className="w-16 h-16 mr-3 rounded p-2 bg-default-06">
                <img src={curVersion?.logoURL || defaultMarketServiceSvg} className="w-full h-full mr-3 rounded" />
              </div>
              <div className="flex-1 w-[180px]">
                <Ellipsis className="text-default leading-[22px]" title={data?.displayName || data?.name} />
                <Ellipsis className="text-default-8 text-xs leading-5" title={curVersion?.summary} />
                <Dropdown.Button
                  icon={<ErdaIcon type="caret-down" className="opacity-40 hover:opacity-100 mt-0.5" />}
                  type="primary"
                  size="small"
                  className="gallery-detail-download mt-2"
                  overlay={menu}
                  placement={'bottomRight'}
                >
                  <span onClick={() => downloadAttr[0]?.()} className={`px-1 ${downloadAttr[1]}`}>
                    {i18n.t('dop:Download Version')}
                  </span>
                </Dropdown.Button>
              </div>
            </div>
            <div className="flex-h-center mt-5 mb-6 py-3">
              {blockTexts.map((item) => (
                <TextBlockInfo
                  {...item}
                  size="small"
                  align={'center'}
                  className="flex-1 overflow-hidden"
                  key={item.sub}
                />
              ))}
            </div>
            {curVersion?.desc ? (
              <div>
                <div className="mb-2 font-bold">{i18n.t('Introduction')}</div>
                <div className="leading-[22px] mb-4">{curVersion.desc || '-'}</div>
              </div>
            ) : null}

            {curVersion?.labels?.length ? (
              <div className="mt-6">
                <div className="mb-2 font-bold">{i18n.t('Label')}</div>
                <div className="">
                  <TagsRow
                    labels={curVersion.labels.map((l) => ({ label: l }))}
                    showCount={curVersion.labels.length}
                    containerClassName="ml-2"
                    labelsClassName={'flex-wrap'}
                  />
                </div>
              </div>
            ) : null}

            <div className="mt-6">
              <div className="mb-2 font-bold">{i18n.t('Information')}</div>
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
