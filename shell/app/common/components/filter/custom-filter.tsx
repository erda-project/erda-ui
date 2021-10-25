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
import BaseFilter, { FilterItemConfig } from './base-filter';
import { Pagination, Input, Select } from 'antd';
import { FilterBarHandle } from 'common';
import { useUpdate } from 'common/use-hooks';
import { setSearch } from 'common/utils';
import { forIn, set, get, every, omit, isEqual, isEmpty, map, mapValues, some, debounce, sortBy } from 'lodash';
import moment, { Moment } from 'moment';
import { useDeepCompareEffect, useUpdateEffect } from 'react-use';
import routeInfoStore from 'core/stores/route';
import { IUseFilterProps, IUseMultiFilterProps } from 'app/interface/common';
import classNames from 'classnames';
import { PAGINATION } from 'app/constants';

interface IFilterProps {
  prefixCls?: string;
  className?: string | string[];
  instanceKey?: string;
  config: FilterItemConfig[];
  title?: string;
  width?: number;
  showSolutionConfig?: boolean;
  isConnectQuery?: boolean;
  showCollapse?: boolean;
  onSubmit?: (value: Obj) => void;
  onReset?: (value: Obj) => void;
  actions?: JSX.Element[];
  wrappedComponentRef?: React.MutableRefObject<any>;
  skipInit?: boolean; // 当有多个Filter实例的情况下， 如果两个Filter同时init，其中一个不需要初始化拿url的参数
  showButton?: boolean;
}

export const CustomFilter = (props: IFilterProps) => {
  const {
    config,
    className,
    onReset,
    onSubmit,
    skipInit,
    isConnectQuery = false,
    showButton,
    actions,
    ...restProps
  } = props;
  const actionsHasPadding = config.some((t) => t.label);

  const [query] = routeInfoStore.useStore((s) => [s.query]);
  const filterRef: any = React.useRef(null as any);
  const [prevQuery, setPrevQuery] = React.useState({});

  const search = React.useCallback(
    debounce(() => {
      filterRef && filterRef.current && filterRef.current.search();
    }, 400),
    [],
  );

  const transformConfig = React.useCallback(
    (c: FilterItemConfig) => {
      const { type, ...cRest } = c;
      let _type = type;
      const Comp = type;
      if (!showButton) {
        switch (_type) {
          case Input:
          case Input.Search:
            _type = React.forwardRef((inputProps: any, ref) => {
              const { onChange, ...rest } = inputProps;
              return (
                <Comp
                  ref={ref}
                  onChange={(e: any) => {
                    onChange(e.target.value || undefined);
                    search();
                  }}
                  allowClear
                  {...rest}
                />
              );
            });
            break;
          case Select:
            _type = React.forwardRef((selectProps: any, ref) => {
              const { onChange, options, ...rest } = selectProps;
              return (
                <Select
                  ref={ref}
                  onChange={(v: string) => {
                    onChange(v);
                    filterRef && filterRef.current && filterRef.current.search();
                  }}
                  allowClear
                  {...rest}
                >
                  {typeof options === 'function' ? options() : options}
                </Select>
              );
            });
            break;
          default:
            _type = React.forwardRef((compProps: any, ref) => {
              const { onChange, ...rest } = compProps;
              return (
                <Comp
                  forwardedRef={ref}
                  onChange={(v: any) => {
                    onChange(v);
                    filterRef && filterRef.current && filterRef.current.search();
                  }}
                  {...rest}
                />
              );
            });
            break;
        }
      }
      return { type: _type, ...cRest };
    },
    [filterRef, search, showButton],
  );

  const fields = filterRef && filterRef.current && filterRef.current.form.getFieldsValue();

  // 受控Filter，受控于query
  React.useEffect(() => {
    const curFilterForm = filterRef.current && filterRef.current.form;
    if (!isConnectQuery || isEqual(prevQuery, query) || isEmpty(fields)) return;
    setPrevQuery(query);
    map(config, (item) => {
      const { name, customTransformer, valueType = 'string' } = item;
      // const _type = transformConfig(item);

      if (valueType === 'range') {
        let startName = `${name}From`;
        let endName = `${name}To`;
        const rangeNames = name.split(',');
        if (rangeNames.length === 2) {
          [startName, endName] = rangeNames;
        }

        const startValue = query[startName];
        const endValue = query[endName];
        if (startValue && endValue) {
          curFilterForm &&
            curFilterForm.setFieldsValue({
              [name]: [
                moment(isNaN(+startValue) ? startValue : +startValue), // 如果是时间戳字符串，应转为number类型
                moment(isNaN(+endValue) ? endValue : +endValue),
              ],
            });
        } else {
          curFilterForm && curFilterForm.setFieldsValue([]);
        }
        return;
      }

      if (query[name] !== undefined) {
        curFilterForm &&
          curFilterForm.setFieldsValue({
            [name]: customTransformer
              ? customTransformer(query[name], query)
              : valueType === 'number'
              ? Number(query[name])
              : valueType === 'boolean'
              ? !!query[name]
              : query[name],
          });
      } else {
        // 置为空
        curFilterForm && curFilterForm.setFieldsValue({ [name]: undefined });
      }
    });
  }, [query, config, fields, isConnectQuery, setPrevQuery, prevQuery]);

  const realConfig = React.useMemo<FilterItemConfig[]>(() => {
    // const initFilterConfig = !skipInit ? initConfig(config) : config;
    return map(config, (item) => {
      return transformConfig(item);
    });
  }, [config, transformConfig]);

  const filterClassName = classNames({
    'erda-custom-filter': true,
    'actions-no-padding': !actionsHasPadding,
    'my-3': true,
    className,
  });

  return (
    <BaseFilter
      className={filterClassName}
      config={realConfig}
      onReset={onReset}
      onSubmit={onSubmit}
      ref={filterRef}
      actions={showButton ? actions || undefined : []}
      {...restProps}
    />
  );
};

const convertFilterParamsToUrlFormat =
  (fullRange?: boolean, dateFormat?: string) =>
  (
    condition: { [prop: string]: any },
    fieldConvertor?: {
      [k: string]: (value: any, allQuery?: any) => string | string[] | undefined;
    },
  ) => {
    const formatCondition = {};
    forIn(condition, (v, k) => {
      const fieldConvertFunc = get(fieldConvertor, k);
      if (Array.isArray(v) && v.length === 2 && every(v, (item) => moment.isMoment(item))) {
        // handle date range
        const [start, end] = v as [Moment, Moment];
        const format = dateFormat || 'YYYY-MM-DD HH:mm:ss';
        let startName = `${k}From`;
        let endName = `${k}To`;
        const rangeNames = k.split(',');
        if (rangeNames.length === 2) {
          [startName, endName] = rangeNames;
        }
        const startMoment = fullRange ? start.startOf('day') : start;
        const endMoment = fullRange ? end.endOf('day') : end;
        set(formatCondition, startName, format === 'int' ? startMoment.valueOf() : startMoment.format(format));
        set(formatCondition, endName, format === 'int' ? endMoment.valueOf() : endMoment.format(format));
      } else if (fieldConvertFunc) {
        // handle custom field
        set(formatCondition, k, fieldConvertFunc(v, condition));
      } else {
        set(formatCondition, k, v);
      }
    });
    return formatCondition;
  };

interface IProps {
  fieldConvertor?: {
    [k: string]: (value: any, allQuery?: any) => string | string[] | undefined;
  };
  excludeQuery?: string[];
  pageSize?: number;
  fullRange?: boolean;
  dateFormat?: string;
  requiredKeys?: string[];
}

interface ISingleFilterProps<T = any> extends IProps {
  getData: (query: any) => Promise<T> | void;
  extraQuery?: Obj;
  loadMore?: boolean;
  debounceGap?: number;
  localMode?: boolean;
  lazy?: boolean;
  initQuery?: Obj;
}

/**
 * Filter功能的包装hook, 可以实现自动管理分页跳转、查询条件贮存url，当页面中仅有一个Filter时使用此hook
 * @param getData 必传 用于取列表数据的effect
 * @param fieldConvertor 选传 用于对特殊自定义类型的域的值进行转换
 * @param pageSize 选传 不传默认为10
 * @param extraQuery 选传 查询时需要加入但不存在Filter组件中的参数 注意!!! extraQuery不能直接依赖于路由参数本身,如果必须依赖那就建立一个本地state来替代。否则在前进后退中会额外触发路由变化引起崩溃。另外extraQuery不要和searchQuery混在一起，更新searchQuery用onSubmit, 更新extraQuery直接更新对象, extraQuery的优先级大于searchQuery
 * @param excludeQuery 选传 在映射url时，将查询条件以外的query保留
 * @param fullRange 选传 date类型是否无视时间（仅日期） 时间从前一天的0点到后一天的23:59:59
 * @param dateFormat 选传 日期类型域的toString格式
 * @param requiredKeys 选传 当requiredKeys中的任何参数为空时，终止search行为，当下一次参数有值了才查询。用于页面初始化时某key参数需要异步拿到，不能直接查询的场景
 * @param loadMore 选传 当列表是使用loadMore组件加载时，不在url更新pageNo, LoadMore组件需要关闭initialLoad
 * @param debounceGap 选传 当需要在输入时搜索，加入debounce的时间间隔，不传默认为0
 * @param localMode 选传 为true时，与url切断联系，状态只保存在state中
 * @param lazy 选传 为true时，首次query必须由onSubmit触发
 * @param initQuery 选传 当初次加载页面时filter组件的默认值，如果url上的query不为空，则此值无效
 * @return {queryCondition, onSubmit, onReset, onPageChange, pageNo, fetchDataWithQuery }
 */
export function useFilter<T>(props: ISingleFilterProps<T>): IUseFilterProps<T> {
  const {
    getData,
    excludeQuery = [],
    fieldConvertor,
    extraQuery = {},
    fullRange,
    dateFormat,
    requiredKeys = [],
    loadMore = false,
    debounceGap = 0,
    localMode = false,
    lazy = false,
    initQuery = {},
  } = props;
  const [query, currentRoute] = routeInfoStore.useStore((s) => [s.query, s.currentRoute]);
  const { pageNo: pNo, ...restQuery } = query;

  const [state, update, updater] = useUpdate({
    searchQuery: localMode
      ? {}
      : isEmpty(restQuery)
      ? initQuery
      : !isEmpty(excludeQuery)
      ? omit(restQuery, excludeQuery)
      : { ...initQuery, ...restQuery },
    pageNo: Number(localMode ? 1 : pNo || 1),
    loaded: false,
    pageSize: PAGINATION.pageSize,
    currentPath: currentRoute.path,
  });

  const { searchQuery, pageNo, pageSize, loaded, currentPath } = state;

  const fetchData = React.useCallback(
    debounce((q: any) => {
      const { [FilterBarHandle.filterDataKey]: _Q_, ...restQ } = q;
      getData({ ...restQ });
    }, debounceGap),
    [getData],
  );

  const updateSearchQuery = React.useCallback(() => {
    // 这里异步处理一把是为了不出现dva报错。dva移除后可以考虑放开
    setTimeout(() => {
      setSearch({ ...searchQuery, ...extraQuery, pageNo: loadMore ? undefined : pageNo }, excludeQuery, true);
    });
  }, [excludeQuery, extraQuery, loadMore, pageNo, searchQuery]);

  useDeepCompareEffect(() => {
    const payload = { pageSize, ...searchQuery, ...extraQuery, pageNo };
    const unableToSearch = some(requiredKeys, (key) => payload[key] === '' || payload[key] === undefined);
    if (unableToSearch || (lazy && !loaded)) {
      return;
    }
    pageNo && fetchData(payload);
    updateSearchQuery();
  }, [pageNo, pageSize, searchQuery, extraQuery]);

  // useUpdateEffect 是当mounted之后才会触发的effect
  // 这里的目的是当用户点击当前页面的菜单路由时，url的query会被清空。此时需要reset整个filter
  useUpdateEffect(() => {
    // 当点击菜单时，href会把query覆盖，此时判断query是否为空并且路径没有改变的情况下重新初始化query
    if (isEmpty(query) && currentPath === currentRoute.path) {
      onReset();
      updateSearchQuery();
    }
  }, [query, currentPath, currentRoute]);

  const fetchDataWithQuery = (pageNum?: number) => {
    if (pageNum && pageNum !== pageNo && !loadMore) {
      update.pageNo(pageNum);
    } else {
      const { [FilterBarHandle.filterDataKey]: _Q_, ...restSearchQuery } = searchQuery;
      return getData({
        pageSize,
        ...extraQuery,
        ...restSearchQuery,
        pageNo: pageNum || pageNo,
      });
    }
  };

  const onSubmit = (condition: { [prop: string]: any }) => {
    const formatCondition = convertFilterParamsToUrlFormat(fullRange, dateFormat)(condition, fieldConvertor);
    if (isEqual(formatCondition, searchQuery)) {
      // 如果查询条件没有变化，重复点击查询，还是要强制刷新
      fetchDataWithQuery(1);
    } else {
      update.searchQuery({ ...formatCondition, pageNo: 1 }); // 参数变化时始终重置pageNo
      update.pageNo(1);
    }
    update.loaded(true);
  };

  const onReset = () => {
    if (isEmpty(searchQuery)) {
      fetchDataWithQuery(1);
    } else {
      // reset之后理论上值要变回最开始？
      update.searchQuery(
        localMode
          ? {}
          : isEmpty(restQuery)
          ? initQuery
          : !isEmpty(excludeQuery)
          ? omit(restQuery, excludeQuery)
          : restQuery,
      );
      update.pageNo(1);
    }
  };

  const onPageChange = (currentPageNo: number, currentPageSize?: number) => {
    updater({
      pageNo: currentPageNo,
      pageSize: currentPageSize,
    });
  };

  const onTableChange = (pagination: PaginationConfig, _filters: any, sorter: SorterResult<any>) => {
    if (!isEmpty(sorter)) {
      const { field, order } = sorter;
      if (order) {
        update.searchQuery({ ...searchQuery, orderBy: field, asc: order === 'ascend' });
      } else {
        update.searchQuery({ ...searchQuery, orderBy: undefined, asc: undefined });
      }
    }
    if (!isEmpty(pagination)) {
      const { pageSize: pSize, current } = pagination;
      update.searchQuery({ ...searchQuery, pageSize: pSize, pageNo: current });
      update.pageNo(current || 1);
    }
  };

  const sizeChangePagination = (paging: IPaging) => {
    const { pageSize: pSize, total } = paging;
    let sizeOptions = PAGINATION.pageSizeOptions;
    if (!sizeOptions.includes(`${pageSize}`)) {
      // 备选项中不存在默认的页数
      sizeOptions.push(`${pageSize}`);
    }
    sizeOptions = sortBy(sizeOptions, (item) => +item);
    return (
      <div className="mt-4 flex items-center flex-wrap justify-end">
        <Pagination
          current={pageNo}
          pageSize={+pSize}
          total={total}
          onChange={onPageChange}
          showSizeChanger
          pageSizeOptions={sizeOptions}
        />
      </div>
    );
  };
  return {
    queryCondition: searchQuery,
    onSubmit, // 包装原始onSubmit, 当搜索时自动更新url
    onReset, // 包装原始onReset, 当重置时自动更新url
    onPageChange, // 当Table切换页码时记录PageNo并发起请求
    pageNo, // 返回当前pageNo，与paging的PageNo理论上相同
    fetchDataWithQuery, // 当页面表格发生操作（删除，启动，编辑）后，进行刷新页面，如不指定pageNum则使用当前页码
    autoPagination: (paging: IPaging) => ({
      total: paging.total,
      current: paging.pageNo,
      pageSize: paging.pageSize,
      // hideOnSinglePage: true,
      onChange: (n: number) => onPageChange(n),
    }),
    onTableChange, // Filter/Sort/Paging变化
    sizeChangePagination,
  };
}

interface IMultiModeProps extends IProps {
  // 是否单页面有多个Filter，一般为Tab切换模式
  multiGroupEnums: string[];
  groupKey?: string;
  getData: Array<(param?: any) => Promise<any>>;
  shareQuery?: boolean;
  activeKeyInParam?: boolean;
  extraQueryFunc?: (activeGroup: string) => Obj;
  checkParams?: string[];
}

/**
 * Filter功能的包装hook, 可以实现自动管理分页跳转、查询条件贮存url，当页面中有多个Filter（不论是多个实例还是逻辑上的多个Filter）时使用此hook
 * @param getData 必传 用于取列表数据的effect
 * @param multiGroupEnums 必传 各个Filter的key
 * @param groupKey 选传 用于在url标示Filter Key属性的key， 默认是type
 * @param shareQuery 选传 多个Filter之间是否共享查询条件，默认是false
 * @param activeKeyInParam 选传 groupKey属性时存在于query还是params， 默认是在query
 * @param fieldConvertor 选传 用于对特殊自定义类型的域的值进行转换
 * @param pageSize 选传 不传默认为10
 * @param extraQueryFunc 选传 查询时需要加入但不存在Filter组件中的参数
 * @param excludeQuery 选传 在映射url时，将查询条件以外的query保留
 * @param fullRange 选传 date类型是否无视时间（仅日期） 时间从前一天的0点到后一天的23:59:59
 * @param dateFormat 选传 日期类型域的toString格式
 * @param requiredKeys 选传 当requiredKeys中的任何参数为空时，终止search行为，当下一次参数有值了才查询。用于页面初始化时某key参数需要异步拿到，不能直接查询的场景
 * @return {queryCondition, onSubmit, onReset, onPageChange, pageNo, fetchDataWithQuery }
 */
export const useMultiFilter = (props: IMultiModeProps): IUseMultiFilterProps => {
  const {
    getData,
    excludeQuery = [],
    fieldConvertor,
    pageSize = PAGINATION.pageSize,
    multiGroupEnums,
    groupKey = 'type',
    extraQueryFunc = () => ({}),
    fullRange,
    dateFormat,
    shareQuery = false,
    activeKeyInParam = false,
    requiredKeys = [],
    checkParams = [],
  } = props;
  const wholeExcludeKeys = activeKeyInParam ? excludeQuery : excludeQuery.concat([groupKey]);
  const [query, params, currentRoute] = routeInfoStore.useStore((s) => [s.query, s.params, s.currentRoute]);
  const { pageNo: pNo, ...restQuery } = query;

  const pickQueryValue = React.useCallback(() => {
    return omit(restQuery, wholeExcludeKeys) || {};
  }, [restQuery, wholeExcludeKeys]);

  const activeType = (activeKeyInParam ? params[groupKey] : query[groupKey]) || multiGroupEnums[0];

  const [state, update] = useUpdate({
    groupSearchQuery: multiGroupEnums.reduce((acc, item) => {
      acc[item] = item === activeType || shareQuery ? pickQueryValue() : {};
      return acc;
    }, {}),
    groupPageNo: multiGroupEnums.reduce((acc, item) => {
      acc[item] = item === activeType ? Number(pNo || 1) : 1;
      return acc;
    }, {}),
    activeGroup: activeType,
    currentPath: currentRoute.path,
  });

  const { groupSearchQuery, groupPageNo, activeGroup, currentPath } = state;
  const extraQuery = extraQueryFunc(activeGroup);

  const pageNo = React.useMemo(() => {
    if (activeGroup) {
      return groupPageNo[activeGroup];
    }
    return 1;
  }, [activeGroup, groupPageNo]);

  useDeepCompareEffect(() => {
    // 因为multiGroupEnums随着渲染一直变化引用，所以使用useDeepCompareEffect
    if (activeType !== activeGroup) {
      update.activeGroup(activeType);
    }
  }, [multiGroupEnums, groupKey, activeKeyInParam, params, query, update]);
  useUpdateEffect(() => {
    // 当点击菜单时，href会把query覆盖，此时判断query是否为空并且路径没有改变的情况下重新初始化query
    if (isEmpty(query) && currentPath === currentRoute.path) {
      onReset();
      updateSearchQuery();
    }
  }, [query, currentPath, currentRoute]);

  const currentFetchEffect = getData.length === 1 ? getData[0] : getData[multiGroupEnums.indexOf(activeGroup)];

  const searchQuery = React.useMemo(() => {
    if (activeGroup) {
      return groupSearchQuery[activeGroup];
    }
    return {};
  }, [groupSearchQuery, activeGroup]);

  const updateSearchQuery = React.useCallback(() => {
    setTimeout(() => {
      setSearch({ ...searchQuery, pageNo }, wholeExcludeKeys, true);
    }, 0);
  }, [searchQuery, pageNo, wholeExcludeKeys]);

  const fetchData = (pageNum?: number) => {
    if (checkParams.length) {
      const checked = checkParams.every((key) => !isEmpty(extraQuery[key]));
      if (!checked) {
        return;
      }
    }
    currentFetchEffect({
      pageSize,
      ...extraQuery,
      ...searchQuery,
      pageNo: pageNum || pageNo,
    });
  };

  useDeepCompareEffect(() => {
    const payload = { pageSize, ...extraQuery, ...searchQuery, pageNo };
    const unableToSearch = some(requiredKeys, (key) => payload[key] === '' || payload[key] === undefined);
    if (unableToSearch) {
      return;
    }
    fetchData();
    updateSearchQuery();
  }, [pageNo, pageSize, searchQuery, extraQuery]);

  const fetchDataWithQuery = (pageNum?: number) => {
    if (pageNum && pageNum !== pageNo) {
      onPageChange(pageNum);
    } else {
      fetchData(pageNum);
    }
  };

  const onSubmit = (condition: { [prop: string]: any }) => {
    const formatCondition = convertFilterParamsToUrlFormat(fullRange, dateFormat)(condition, fieldConvertor);
    if (isEqual(formatCondition, searchQuery)) {
      // 如果查询条件没有变化，重复点击查询，还是要强制刷新
      fetchDataWithQuery(1);
    } else if (shareQuery) {
      update.groupSearchQuery(mapValues(groupSearchQuery, () => formatCondition));
      update.groupPageNo(mapValues(groupPageNo, () => 1));
    } else {
      update.groupSearchQuery({
        ...groupSearchQuery,
        [activeGroup]: formatCondition,
      });
      update.groupPageNo({ ...groupPageNo, [activeGroup]: 1 });
    }
  };

  const onReset = () => {
    if (isEmpty(searchQuery)) {
      fetchDataWithQuery(1);
    } else {
      update.groupSearchQuery({ ...groupSearchQuery, [activeGroup]: {} });
      update.groupPageNo({ ...groupPageNo, [activeGroup]: 1 });
    }
  };

  const onPageChange = (currentPageNo: number) => {
    update.groupPageNo({ ...groupPageNo, [activeGroup]: currentPageNo });
  };

  return {
    queryCondition: searchQuery,
    onSubmit, // 包装原始onSubmit, 当搜索时自动更新url
    onReset, // 包装原始onReset, 当重置时自动更新url
    onPageChange, // 当Table切换页码时记录PageNo并发起请求
    pageNo, // 返回当前pageNo，与paging的PageNo理论上相同
    fetchDataWithQuery, // 当页面表格发生操作（删除，启动，编辑）后，进行刷新页面，如不指定pageNum则使用当前页码
    activeType: activeGroup,
    onChangeType: (t: string | number) => setSearch({ [groupKey || 'type']: t }, wholeExcludeKeys, true),
    autoPagination: (paging: IPaging) => ({
      total: paging.total,
      current: paging.pageNo,
      // hideOnSinglePage: true,
      onChange: (n: number) => onPageChange(n),
    }),
  };
};
