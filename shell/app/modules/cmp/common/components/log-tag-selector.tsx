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
import { Input, Tag, Dropdown, Menu, Tooltip, message } from 'antd';
import { isEmpty, map, filter, uniq, set } from 'lodash';
import { Icon as CustomIcon, EmptyHolder } from 'common';
import { useUpdate } from 'common/use-hooks';
import ReactDOM from 'react-dom';
import { useEffectOnce } from 'react-use';
import { isPromise } from 'common/utils';
import LogAnalyzeStore from 'cmp/stores/log-analyze';
import { getJoinedProjects } from 'user/services/user';
import { getApps } from 'common/services';
import i18n from 'i18n';
import { Loading as IconLoading } from '@icon-park/react';
import './log-tag-selector.scss';
import routeInfoStore from 'core/stores/route';

const MenuItem = Menu.Item;

const KeyCode = {
  BACKSPACE: 8, // 删除键
};

const validValue = (val: string) => {
  const tagReg = /^[_a-zA-Z][a-zA-Z0-9_-]*[=]{1}[\s\S]+$/;
  if (tagReg.test(val)) {
    return true;
  } else {
    message.warning(`${val} ${i18n.t('cmp:is invalid tag')}`);
    return false;
  }
};

interface IOption {
  id: string | number;
  name: string;
  displayName: string;
}

interface IDynamicMenuData {
  dynamicMenu: LOG_ANALYZE.IDynamicChildren;
  parentQuery?: object;
  key?: string;
}
interface IProps {
  value: string[];
  placeholder?: string;
  className?: string;
  width?: number;
  size?: 'small' | 'normal';
  dropdownClassName?: string;
  onChange?: (val: string[] | undefined) => void;
  customValidValue?: (val: string, beforeVals: string[]) => boolean;
}

const noop = () => {};

const LogTagSelector = (props: IProps) => {
  const {
    value,
    onChange = noop,
    className = '',
    placeholder = i18n.t('search by labels'),
    width,
    dropdownClassName = '',
    size = 'normal',
    customValidValue = validValue,
  } = props;
  const inputRef = React.useRef(null as any);
  const inputMirrorRef = React.useRef(null as any);
  const valueRef = React.useRef(null as any);
  const menuRef = React.useRef(null as any);

  const { getTagsTree } = LogAnalyzeStore;
  const tagsTree = LogAnalyzeStore.useStore((s) => s.tagsTree);

  useEffectOnce(() => {
    document.body.addEventListener('click', dropdownHide);
    getTagsTree();
    return () => {
      document.body.removeEventListener('click', dropdownHide);
    };
  });

  const [{ inputValue, isFocus, dropDownVis }, updater] = useUpdate({
    // value: undefined as string[] | undefined,
    inputValue: undefined as string | undefined,
    isFocus: false,
    dropDownVis: false,
  });

  // React.useEffect(() => {
  //   onChange(value);
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [value]);

  // React.useEffect(() => {
  //   if (!isEqual(propsValue, value)) {
  //     updater.value(propsValue);
  //   }
  // }, [updater, value]);

  React.useEffect(() => {
    const inputMirrorRefObj = inputMirrorRef && (inputMirrorRef.current as any);
    const inputRefObj = inputRef && (inputRef.current as any);
    if (inputRefObj) {
      inputRefObj.input.style.width = `${inputMirrorRefObj.offsetWidth + 10}px`;
    }
  }, [inputValue]);

  const clickBox = () => {
    const inputRefObj = inputRef && (inputRef.current as any);
    if (inputRefObj) {
      inputRefObj.focus();
    }
    updater.dropDownVis(true);
  };

  const addValue = (val: string[] = []) => {
    if (!isEmpty(val)) {
      onChange(uniq((value || []).concat(val)));
    }
  };

  const deleteValue = (val: string) => {
    onChange(filter(value, (item) => item !== val));
  };

  const onKeyDown = (e: any) => {
    if (!inputValue && e && e.which === KeyCode.BACKSPACE) {
      value && value.length && deleteValue(value[value.length - 1]);
    }
  };

  const onSelect = (val: string[]) => {
    const newValues = [] as string[];
    let inputOnFocus = false;
    map(val, (item) => {
      if (item && item.endsWith('=')) {
        // 自定义值
        updater.inputValue(item);
        const inputRefObj = inputRef && (inputRef.current as any);
        if (inputRefObj) {
          inputRefObj.focus();
          inputOnFocus = true;
        }
      } else if (!(value || []).includes(item) && customValidValue(item, value)) {
        newValues.push(item);
      }
    });
    !isEmpty(newValues) && addValue(newValues);
    !inputOnFocus && updater.inputValue(undefined);
    updater.dropDownVis(false);
  };

  const getOverlay = () => {
    return (
      <Menu className="tag-dropdown-menu" ref={menuRef}>
        <MenuItem>
          <CascaderSelector data={tagsTree} visible={dropDownVis} onSelect={onSelect} />
        </MenuItem>
      </Menu>
    );
  };

  const dropdownHide = (e: any) => {
    // 点击外部，隐藏选项
    const menuEl = menuRef && menuRef.current;
    const valueEl = valueRef && valueRef.current;
    // eslint-disable-next-line react/no-find-dom-node
    const el1 = ReactDOM.findDOMNode(menuEl) as HTMLElement;
    // eslint-disable-next-line react/no-find-dom-node
    const el2 = ReactDOM.findDOMNode(valueEl) as HTMLElement;
    if (!((el1 && el1.contains(e.target)) || (el2 && el2.contains(e.target)))) {
      updater.dropDownVis(false);
    }
  };

  const onBlur = () => {
    updater.isFocus(false);
    if (inputValue) {
      onSelect([inputValue]);
    }
  };

  return (
    <div className={`log-tag-selector ${className} ${isFocus ? 'focus' : ''} ${size}`} style={{ width }}>
      <Dropdown
        overlay={getOverlay()}
        visible={dropDownVis}
        overlayClassName={`tag-selector-dropdown ${dropdownClassName}`}
      >
        <div className="tag-render" onClick={clickBox} ref={valueRef}>
          <div className="tag-value-wrap">
            {placeholder && isEmpty(value) && !inputValue ? <span className="placeholder">{placeholder}</span> : null}
            <span className="input-mirror" ref={inputMirrorRef}>
              &nbsp;{inputValue || ''}
            </span>
            <div className="value-list">
              {map(value || [], (item, idx) => (
                <div className="value-item" key={`${idx}-${item}`}>
                  <Tag className="value-tag" closable onClose={() => deleteValue(item)}>
                    {item}
                  </Tag>
                </div>
              ))}
              <div className="value-item">
                <Input
                  autoComplete="off"
                  className="display-input"
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e: any) => updater.inputValue(e.target.value)}
                  onBlur={onBlur}
                  onFocus={() => updater.isFocus(true)}
                  onPressEnter={() => inputValue && onSelect([inputValue])}
                  onKeyDown={onKeyDown}
                />
              </div>
            </div>
          </div>
        </div>
      </Dropdown>
    </div>
  );
};

interface ICascaderSelectorProps {
  data: any;
  visible: boolean;
  onSelect: (val: string[]) => void;
}
const CascaderSelector = (props: ICascaderSelectorProps) => {
  const { data, onSelect = noop } = props;

  const [menus, setMenus] = React.useState([] as any[]);

  React.useEffect(() => {
    if (!isEmpty(data)) {
      setMenus([{ menu: data }]);
    }
  }, [data]);

  const getParentTag = (idx: number) => {
    const pTags = [] as string[];
    map(menus, (item, mIdx) => {
      if (mIdx < idx) {
        pTags.push(item.key);
      }
    });
    return pTags;
  };

  const ChildrenTypeMap = {
    staticRender: (menuItem: any, { key, idx }: { key: string; idx: number }) => {
      const { tag, children, dynamic_children } = menuItem;
      const tip = (
        <div>
          <div>{tag.name}</div>
          {
            <div>
              {tag.value
                ? `${i18n.t('tag')}: ${tag.key}=${tag.value}`
                : `${i18n.t('tag')}: ${tag.key}=${i18n.t('customize')}`}
            </div>
          }
        </div>
      );
      const isActive = tag.value ? `${tag.key}=${tag.value}` === key : key?.includes(`${tag.key}=`);
      return (
        <div className={`menu-item ${isActive ? 'is-active' : ''}`} key={`${tag.name}${tag.key}`}>
          <span
            className="menu-name"
            onClick={() => {
              const curTag = tag.value ? `${tag.key}=${tag.value}` : `${tag.key}=`;
              const parentTags = getParentTag(idx);
              onSelect(parentTags.concat(curTag));
            }}
          >
            <Tooltip title={tip}>{tag.name}</Tooltip>
          </span>
          {children || dynamic_children ? (
            <CustomIcon
              type="chevronright"
              className="arrow"
              onClick={() => {
                setMenus((_menus) => {
                  const curDepth = idx + 1;
                  const preMenu = _menus.length > curDepth ? _menus.slice(0, curDepth) : [..._menus];
                  set(preMenu, `[${preMenu.length - 1}].key`, tag.value ? `${tag.key}=${tag.value}` : `${tag.key}=`);
                  return preMenu.concat({
                    menu: children,
                    dynamicMenu: dynamic_children,
                  });
                });
              }}
            />
          ) : null}
        </div>
      );
    },
    dynamicRender: (menuItem: any, { idx }: { idx: number }) => {
      const preChosenKey = menus[idx - 1] ? menus[idx - 1].key : '';
      return (
        <LoadMoreMenu
          menuInfo={menuItem}
          key={`${menuItem.dynamicMenu.dimension}${preChosenKey}`}
          setDynamicMenu={(dynamicMenu: IDynamicMenuData, preKey, parentQuery: any = {}) => {
            setMenus((_menus) => {
              const curDepth = idx + 1;
              const preMenu = _menus.length > curDepth ? _menus.slice(0, curDepth) : [..._menus];
              set(preMenu, `[${preMenu.length - 1}].key`, preKey);
              return preMenu.concat({
                ...dynamicMenu,
                parentQuery,
              });
            });
          }}
          onSelect={(curTag: string) => {
            const parentTags = getParentTag(idx);
            onSelect(parentTags.concat(curTag));
          }}
        />
      );
    },
  };
  return (
    <div className="log-tag-menu-selector">
      <div className="log-tag-menus">
        {map(menus, (item, idx: number) => {
          const { menu, key, dynamicMenu } = item;
          return menu ? (
            <div className="menu-box" key={`depth${idx}`}>
              {map(menu, (menuItem) => {
                const { tag } = menuItem;
                if (!isEmpty(tag)) {
                  return ChildrenTypeMap.staticRender(menuItem, { key, idx });
                } else {
                  return null;
                }
              })}
            </div>
          ) : dynamicMenu ? (
            ChildrenTypeMap.dynamicRender(item, { idx })
          ) : null;
        })}
      </div>
    </div>
  );
};

interface ILoadMoreProps {
  menuInfo: IDynamicMenuData;
  setDynamicMenu?: (arg: IDynamicMenuData, preKey: any, val: string | number) => void;
  onSelect?: (arg: string) => void;
}

const loadMap = {
  project: {
    loadData: getJoinedProjects,
    parentQuery: (val: any) => ({ projectId: val }),
  },
  app: {
    loadData: getApps,
    parentQuery: (val: any) => ({ applicationId: val }),
  },
};

const LoadMoreMenu = (props: ILoadMoreProps) => {
  const { menuInfo, setDynamicMenu = noop, onSelect = noop } = props;
  const { projectId } = routeInfoStore.useStore((s) => s.params);

  const [{ pageNo, pageSize, hasMore, list, loading }, updater] = useUpdate({
    pageNo: 1,
    pageSize: 10,
    hasMore: false,
    list: [] as IOption[],
    loading: false,
  });

  React.useEffect(() => {
    getData({ pageNo, pageSize, ...(menuInfo.parentQuery || {}) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNo, pageSize]);

  const getData = (query: any) => {
    const { dimension } = menuInfo.dynamicMenu;
    const loadFun = loadMap[dimension].loadData;
    const extraQuery = dimension === 'app' ? { projectId: query.projectId || projectId } : {};
    if (loadFun) {
      updater.loading(true);
      const res = loadFun({ ...query, ...extraQuery });
      if (res && isPromise(res)) {
        res.then((resData: any) => {
          const { total, list: curList } = resData.data || {};
          updater.hasMore(Math.ceil(total / pageSize) > query.pageNo);
          let newList = [];
          if (query.pageNo === 1) {
            newList = [...curList];
          } else {
            newList = [...list, ...curList];
          }
          updater.list(newList);
          updater.loading(false);
        });
      }
    }
  };
  const { dynamicMenu } = menuInfo;
  return (
    <div className="load-more-menu menu-box" key={dynamicMenu.dimension}>
      {map(list, (item) => {
        const tip = (
          <div>
            <div>{item.displayName || item.name}</div>
            {dynamicMenu.key ? (
              <div>
                {item.id
                  ? `${i18n.t('tag')}: ${dynamicMenu.key}=${item.id}`
                  : `${i18n.t('tag')}: ${dynamicMenu.key}=${i18n.t('customize')}`}
              </div>
            ) : null}
          </div>
        );
        const isActive = item.id
          ? `${dynamicMenu.key}=${item.id}` === `${menuInfo.key}`
          : menuInfo.key?.includes(dynamicMenu.key);
        return (
          <div key={item.id} className={`menu-item ${isActive ? 'is-active' : ''}`}>
            <span
              className="menu-name"
              onClick={() => {
                dynamicMenu.key && onSelect(item.id ? `${dynamicMenu.key}=${item.id}` : `${dynamicMenu.key}=`);
              }}
            >
              <Tooltip title={tip}>{item.name}</Tooltip>
            </span>
            {dynamicMenu.dynamic_children ? (
              <CustomIcon
                type="chevronright"
                className="arrow"
                onClick={() => {
                  setDynamicMenu(
                    {
                      dynamicMenu: dynamicMenu.dynamic_children,
                    },
                    `${dynamicMenu.key}=${item.id}`,
                    loadMap[dynamicMenu.dimension].parentQuery(item.id),
                  );
                }}
              />
            ) : null}
          </div>
        );
      })}
      {isEmpty(list) ? <EmptyHolder relative /> : null}
      {hasMore ? (
        <div
          className="cursor-pointer load-more"
          onClick={(e) => {
            e.stopPropagation();
            updater.pageNo(pageNo + 1);
          }}
        >
          <IconLoading spin={loading} strokeWidth={2} />
          {i18n.t('load more')}
        </div>
      ) : null}
    </div>
  );
};

export default LogTagSelector;
