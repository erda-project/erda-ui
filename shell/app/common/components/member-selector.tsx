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

/* eslint-disable react-hooks/exhaustive-deps */
import * as React from 'react';
import projectMemberStore from 'common/stores/project-member';
import orgMemberStore from 'common/stores/org-member';
import appMemberStore from 'common/stores/application-member';
import { map, debounce, isEmpty, get, isArray, isString, difference } from 'lodash';
import { getUsers, getMembers } from 'common/services';
import { MemberScope } from 'app/common/stores/_member';
import { LoadMoreSelector, ImgHolder } from 'common';
import { Tag, Select } from 'app/nusi';
import { useMount } from 'react-use';
import i18n from 'i18n';
import { ILoadMoreSelectorProps } from './load-more-selector';
import routeInfoStore from 'app/common/stores/route';
import orgStore from 'app/org-home/stores/org';
import userStore from 'app/user/stores';
import userMapStore from 'app/common/stores/user-map';

const storeMap = {
  [MemberScope.PROJECT]: projectMemberStore,
  [MemberScope.ORG]: orgMemberStore,
  [MemberScope.APP]: appMemberStore,
};

interface IOption {
  label: string;
  value: string | number;
}

interface IProps extends ILoadMoreSelectorProps {
  scopeType: 'org' | 'project' | 'app' | 'uc';
  showRole?:boolean;
  scopeId?: string;
  showSelfChosen?: boolean;
  quickSelectInOption?: boolean;
}

interface IPropsWithCategory extends ILoadMoreSelectorProps {
  categorys: IOption[];
  getData: (arg: any) => Promise<any>;
}

const { Option } = Select;

const optionRender = (user: IMember, roleMap?: object, _type?: string, showRole?:boolean) => {
  const { avatar, nick, name, roles } = user;
  return (
    <>
      <ImgHolder src={avatar} text={nick ? nick.substring(0, 1) : i18n.t('empty')} rect="20x20" type="avatar" />
      {
        <span className="ml8" title={name}>
          {nick || i18n.t('common:empty')}
          {(_type === 'normal' && roleMap && showRole) ? `(${map(roles, role => roleMap[role] || i18n.t('common:empty')).join(',')}` : ''}
        </span>
      }
    </>
  );
};

const valueItemRender = (size = 'normal') => (user: any, deleteValue: (item: any) => void, isMultiple?: boolean) => {
  const { avatar, nick, name, label, value } = user;
  const displayName = nick || label || value || i18n.t('common:empty');
  const cls = {
    normal: {
      img: '20x20',
      name: 'ml8 fz14',
      tag: 'py4 px8',
    },
    small: {
      img: '14x14',
      name: 'ml8',
      tag: 'py2 px4 member-value-small',
    },
  };
  const curCls = cls[size] || {};
  const item = (
    <>
      <ImgHolder src={avatar} text={nick ? nick.substring(0, 1) : i18n.t('empty')} rect={curCls.img} type="avatar" />
      <span className={curCls.name} title={name}>{displayName}</span>
    </>
  );
  if (!isMultiple) {
    return item;
  }
  return (
    <Tag key={name} size="small" closable className={curCls.tag} onClose={() => deleteValue(user)}>
      {item}
    </Tag>
  );
};

// existUser: 来自loginUser和userMap
export const chosenItemConvert = (values: any, existUser: object) => {
  // existUser
  const curValues = isArray(values) ? values : (values && [values]);
  const reValue = map(curValues, item => {
    const curUser = existUser[item.value] || {};
    return item.label ? item : { ...curUser, ...item, label: curUser.nick || curUser.name };
  });

  return reValue;
};

const getNotFoundContent = (scopeType: string) => {
  let tip;
  switch (scopeType) {
    case MemberScope.ORG:
      tip = i18n.t('common:please confirm that the user has joined the organization');
      break;
    case MemberScope.PROJECT:
      tip = i18n.t('common:please confirm that the user has joined the project');
      break;
    case MemberScope.APP:
      tip = i18n.t('common:please confirm that the user has joined the application');
      break;
    default:
      break;
  }
  return tip;
};
export const MemberSelector = React.forwardRef((props: XOR<IProps, IPropsWithCategory>, ref: any) => {
  const { scopeType = 'org', scopeId: _scopeId, showRole, type, notFoundContent, value, categorys: staticCagetory, getData: _getData, className = '', size, showSelfChosen = false, placeholder, quickSelectInOption, ...rest } = props;
  const { projectId, appId } = routeInfoStore.useStore(s => s.params);
  const { id: loginUserId } = userStore.getState(s => s.loginUser);
  const orgId = orgStore.useStore(s => s.currentOrg.id);
  const isUCMember = scopeType === 'uc';
  const scopeIdMap = {
    app: appId,
    project: projectId,
    org: orgId,
  };
  let scopeId = _scopeId;
  let getRoleMap = undefined as ((arg: any) => Promise<any>) | undefined;
  let roleMap = undefined as Obj | undefined;
  if (scopeType && !isUCMember) { // scope模式
    const memberStore = storeMap[scopeType];
    ({ getRoleMap } = memberStore.effects);
    scopeId = _scopeId || scopeIdMap[scopeType] as string;
    roleMap = memberStore.useStore(s => s.roleMap);
  }
  const [categories, setCategories] = React.useState([] as IOption[]);
  const [query, setQuery] = React.useState({} as any);
  const isCategoryMode = type === 'Category';
  const isStaticCategory = !isEmpty(staticCagetory);// 静态category模式
  const userMap = userMapStore.useStore(s => s);
  const loginUser = userStore.getState(s => s.loginUser);
  const existUser = {
    ...(userMap || {}),
    [loginUser.id]: { ...loginUser },
  };
  React.useEffect(() => {
    if (isStaticCategory) {
      setCategories(staticCagetory as IOption[]);
      return;
    }
    isCategoryMode && !isUCMember && setCategories(map(roleMap, (val, key) => ({ label: val, value: key })));
  }, [isCategoryMode, roleMap, isStaticCategory]);

  const getData = (q: any = {}) => {
    const { category, ...qRest } = q;
    setQuery(q);
    if (!scopeId) return;
    return getMembers({ scopeId, scopeType, roles: [category], ...qRest }).then((res: any) => res.data);
  };

  useMount(() => {
    !isUCMember && !isStaticCategory && getRoleMap && getRoleMap({ scopeType, scopeId });
  });
  const notFoundContentTip = !isUCMember && (notFoundContent || getNotFoundContent(scopeType || ''));

  if (isUCMember) {
    return <UserSelector {...(props as any)} />;
  }

  const selectSelf = () => {
    if (`${value}` !== `${loginUserId}`) rest?.onChange(rest?.mode === 'multiple' ? [loginUserId] : loginUserId);
  };

  const quickSelect = quickSelectInOption ? (
    <a onClick={() => !rest.disabled && selectSelf()} className={`${rest.disabled ? 'not-allowed' : 'always-active'}`}>{i18n.t('choose self')}</a>
  ) : null;

  return (
    <>
      <LoadMoreSelector
        getData={_getData || getData}
        type={type}
        allowClear
        key={`${scopeType}-${type}`}
        className={`member-selector ${className}`}
        notFoundContent={(notFoundContentTip && query.q) ? notFoundContentTip : undefined}
        placeholder={placeholder || i18n.t('please choose {name}', { name: i18n.t('user') })}
        category={categories}
        dataFormatter={({ list, total }) => ({
          total,
          list: map(list, ({ name, userId, nick, ..._rest }) => ({
            ..._rest, userId, nick, name, label: nick || name, value: userId,
          })),
        })}
        optionRender={(item, _type) => optionRender(item as any, roleMap, _type, isCategoryMode || showRole)} // 若为category模式，默认normal情况显示角色
        valueItemRender={valueItemRender(size)}
        chosenItemConvert={(v:any[]) => chosenItemConvert(v, existUser)}
        value={value}
        forwardedRef={ref}
        quickSelect={quickSelect}
        size={size}
        {...rest}
      />
      {
        showSelfChosen ? (
          <a onClick={() => !rest.disabled && selectSelf()} className={`${rest.disabled ? 'not-allowed' : 'always-active'} ml8`}>{i18n.t('choose self')}</a>
        ) : null
      }
    </>
  );
});

interface IAddProps extends ILoadMoreSelectorProps {
  scopeType: string;
  scopeId?: string;
}

const UserSelector = (props: any) => {
  const { value } = props;
  const [searchKey, setSearchKey] = React.useState('');
  const [searchResult, setSearchResult] = React.useState([] as any[]);
  const [searchLackUser, setSearchLackUser] = React.useState(false);

  React.useEffect(() => {
    if (!isEmpty(value)) { // 兼容选项有值无list情况
      const curValue = isString(value) ? [value] : value;
      const existUserId = map(searchResult || [], 'id');// 当前存在的user
      const lackUser = difference(curValue, existUserId);
      if (lackUser.length && !searchLackUser) {
        setSearchLackUser(true);// 请求过一次后就不再请求
        getUsers({ userID: lackUser }).then((res:any) => {
          setSearchResult(get(res, 'data.users'));
        });
      }
    }
  }, [value, searchResult, searchLackUser]);

  const handleSearch = (q: string) => {
    const query = {
      q,
      pageNo: 1,
      pageSize: 15,
    };
    setSearchKey(q);
    if (q.trim() !== '') {
      getUsers(query).then((res:any) => {
        setSearchResult(get(res, 'data.users'));
      });
    }
  };
  const userOptionRender = (member:IMember) => {
    const { avatar, nick, name } = member;
    const id = member.id || member.userId;
    return (
      <Option key={id} value={id}>
        <ImgHolder src={avatar} text={nick ? nick.substring(0, 1) : i18n.t('empty')} rect="20x20" type="avatar" />
        <span className="ml8" title={name}>{nick || i18n.t('common:empty')}</span>
      </Option>
    );
  };
  return (
    <Select
      className="full-width"
      showSearch
      notFoundContent={searchKey ? i18n.t('common:please confirm that the user is registered') : ''}
      showArrow={false}
      filterOption={false}
      defaultActiveFirstOption={false}
      placeholder={i18n.t('person select')}
      onSearch={debounce(handleSearch, 200, { maxWait: 500 })}
      {...props}
    >
      {(searchResult || []).map(userOptionRender)}
    </Select>
  );
};

// 添加企业成员时，请求用户接口不一样
export const AddMemberSelector = (props: IAddProps) => {
  const { scopeType } = props;
  const orgId = orgStore.useStore(s => s.currentOrg.id);
  const projectId = routeInfoStore.getState(s => s.params.projectId);

  const scopeInfoMap = {
    [MemberScope.ORG]: {}, // 添加企业成员，无scope
    [MemberScope.PROJECT]: { // 添加项目成员：从org成员中选择
      scopeType: MemberScope.ORG,
      scopeId: orgId,
    },
    [MemberScope.APP]: { // 添加项目成员：从project中选择
      scopeType: MemberScope.PROJECT,
      scopeId: projectId,
    },
  };
  return (
    scopeType === MemberScope.ORG ? (
      <UserSelector {...(props as any)} />
    ) : (
      <MemberSelector {...props} {...scopeInfoMap[scopeType]} />
    )
  );
};
