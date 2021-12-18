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
import { Menu, Tooltip, Dropdown } from 'antd';
import { isEmpty, isString, map } from 'lodash';
import { Ellipsis, ErdaIcon, Badge } from 'common';
import ImgMap, { getImg } from 'app/config-page/img-map';
import { iconMap } from 'common/components/erda-icon';

const getPrefixImg = (prefixImg: string, prefixImgCircle?: boolean) => {
  if (Object.keys(ImgMap).includes(prefixImg)) {
    return (
      <div>
        <img src={getImg(prefixImg)} className={`item-prefix-img ${prefixImgCircle ? 'prefix-img-circle' : ''}`} />
      </div>
    );
  } else if (Object.keys(iconMap).includes(prefixImg)) {
    return <ErdaIcon type={prefixImg} size="76" className={`${prefixImgCircle ? 'prefix-img-circle' : ''}`} />;
  } else {
    return (
      <div>
        <img src={prefixImg} className={`item-prefix-img rounded-sm ${prefixImgCircle ? 'prefix-img-circle' : ''}`} />
      </div>
    );
  }
};

const ListItem = (props: ERDA_LIST.ItemProps) => {
  const { data } = props;
  const {
    prefixImg,
    title,
    label,
    titlePrefixIcon,
    prefixImgCircle,
    titlePrefixIconTip,
    titleSuffixIcon,
    titleSuffixIconTip,
    description = '',
    metaInfos,
    extra,
    backgroundImg,
    operations,
    itemProps,
  } = data || {};

  const outOperations: JSX.Element[] = [];
  const menuOverlay = operations?.length ? (
    <Menu style={{ minWidth: 80 }}>
      {operations.map((action) => {
        if (action.icon) {
          outOperations.push(
            <ErdaIcon type={action.icon} color={'gray'} className="mr-4" size={18} onClick={action?.onClick} />,
          );
          return null;
        } else {
          const { key, text, onClick } = action;
          return (
            <Menu.Item key={key} onClick={(item) => onClick?.(item.domEvent as any)}>
              {text}
            </Menu.Item>
          );
        }
      })}
    </Menu>
  ) : null;

  return (
    <div
      className={`erda-list-item cursor-pointer rounded-sm`}
      {...itemProps}
      style={backgroundImg ? { backgroundImage: `url(${getImg(backgroundImg)})` } : {}}
    >
      <div className="flex">
        {isString(prefixImg) ? (
          <div className="erda-list-item-prefix-img">{getPrefixImg(prefixImg, prefixImgCircle)}</div>
        ) : prefixImg ? (
          <div className="erda-list-item-prefix-img">{prefixImg}</div>
        ) : null}
        <div className="flex flex-1">
          <div className="flex-1">
            <div className="body-title">
              {titlePrefixIcon && (
                <Tooltip title={titlePrefixIconTip}>
                  <ErdaIcon type={titlePrefixIcon} className="title-icon mr-2" />
                </Tooltip>
              )}
              <Ellipsis className="font-bold title-text" title={title} />
              {titleSuffixIcon && (
                <Tooltip title={titleSuffixIconTip}>
                  <ErdaIcon type={titleSuffixIcon} className="title-icon ml-2" />
                </Tooltip>
              )}
              {map(label, (item) => (
                <Badge {...item} className="ml-2" text={item.key} />
              ))}
            </div>
            <If condition={description !== undefined}>
              <Ellipsis className="body-description" title={description || '-'} />
            </If>
            <If condition={!!metaInfos?.length}>
              <div className="body-meta-info flex">
                {map(metaInfos, (info) => {
                  return (
                    <Tooltip key={info.key} title={info.tooltip}>
                      <span className={`info-item type-${info.type || 'normal'}`} {...info.extraProps}>
                        {info.icon ? (
                          <ErdaIcon type={info.icon} isConfigPageIcon size="14" className="mr-1" />
                        ) : (
                          <span className="info-text truncate">{info.key}</span>
                        )}
                        <span className="info-value truncate">{info.value}</span>
                      </span>
                    </Tooltip>
                  );
                })}
              </div>
            </If>
          </div>
          <div className="flex items-center">
            {menuOverlay || outOperations.length ? (
              <div className={`flex items-center ${extra ? 'self-start' : ''}`} onClick={(e) => e.stopPropagation()}>
                {outOperations}
                {menuOverlay && (
                  <Dropdown
                    overlay={menuOverlay}
                    overlayClassName={'erda-list-operations'}
                    overlayStyle={{ zIndex: 1000 }}
                    trigger={['click']}
                  >
                    <ErdaIcon
                      type="more"
                      size={18}
                      className="hover-active p-1 rounded hover:bg-hover-gray-bg"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Dropdown>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <If condition={!isEmpty(extra)}>
        <div className="py-1">{extra}</div>
      </If>
    </div>
  );
};

export default ListItem;
