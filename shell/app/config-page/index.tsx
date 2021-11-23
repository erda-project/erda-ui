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
import { useMount, useUpdateEffect } from 'react-use';
import { isEmpty, get, set, isEqual, forEach } from 'lodash';
import { produce } from 'immer';
import { Spin, message } from 'antd';
import { notify } from 'common/utils';
import { useUpdate } from 'common/use-hooks';
import { useMock } from './mock/index';
import ConfigPageRender from './page-render';
import commonStore from 'common/stores/common';

interface ICustomProps {
  [p: string]: {
    op?: Obj;
    props?: Obj;
  };
}
interface IProps {
  inParams?: Obj;
  customProps?: ICustomProps;
  scenarioType: string;
  scenarioKey: string;
  showLoading?: boolean;
  forbiddenRequest?: boolean;
  forceUpdateKey?: string[];
  debugConfig?: CONFIG_PAGE.RenderConfig;
  onExecOp?: any;
  fullHeight?: boolean;
  forceMock?: boolean; // 使用mock
  useMock?: (params: Obj) => Promise<any>;
  updateConfig?: (params: Obj) => any;
  operationCallBack?: (
    reqConfig: CONFIG_PAGE.RenderConfig,
    resConfig?: CONFIG_PAGE.RenderConfig,
    op?: CP_COMMON.Operation,
  ) => void;
}

const unProduct = process.env.NODE_ENV !== 'production';

const ConfigPage = React.forwardRef((props: IProps, ref: any) => {
  const {
    fullHeight = true,
    inParams = {},
    customProps = {},
    scenarioType,
    scenarioKey,
    showLoading = true,
    forbiddenRequest,
    forceUpdateKey,
    useMock: _useMock,
    forceMock,
    debugConfig,
    onExecOp,
    updateConfig,
    operationCallBack,
  } = props;
  const [{ pageConfig, fetching }, updater] = useUpdate({
    pageConfig:
      debugConfig ||
      ({
        scenario: {
          scenarioType,
          scenarioKey,
        },
        inParams,
      } as CONFIG_PAGE.RenderConfig),
    fetching: false,
  });
  const opIndexRef = React.useRef(0);
  const timerRef = React.useRef<any>();
  // 在非生产环境里，url中带useMock
  const useMockMark = forceMock || (unProduct && location.search.includes('useMock'));
  const changeScenario = (s: { scenarioKey: string; scenarioType: string; inParams?: Obj }) => {
    const { scenarioType: newType, scenarioKey: newKey, inParams: newInParams } = s;
    newKey &&
      queryPageConfig({
        scenario: {
          scenarioType: newType,
          scenarioKey: newKey,
        },
        inParams: {
          ...inParamsRef.current,
          ...(newInParams || {}),
        },
      });
  };

  const pageConfigRef = React.useRef(null as any);
  const inParamsRef = React.useRef(inParams as any);
  const fetchingRef = React.useRef(false);
  // 此处需要使用store，因为接口中有userInfo需要被解析
  const { getRenderPageLayout } = commonStore.effects;

  useMount(() => {
    queryPageConfig(); // 第一次请求界面
  });

  React.useEffect(() => {
    if (debugConfig) {
      updater.pageConfig(debugConfig);
    }
  }, [debugConfig, updater]);

  React.useEffect(() => {
    pageConfigRef.current = pageConfig;
    clearTimeout(timerRef.current);
    if (pageConfigRef.current.protocol?.syncInterval) {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        queryPageConfig();
      }, pageConfigRef.current.protocol?.syncInterval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageConfig]);

  React.useEffect(() => {
    if (!isEqual(inParams, inParamsRef.current) && !isEmpty(inParams)) {
      inParamsRef.current = inParams;
    }
  }, [inParams]);
  React.useEffect(() => {
    if (ref) {
      ref.current = {
        reload: (extra: any) =>
          queryPageConfig({
            scenario: {
              scenarioType,
              scenarioKey,
            },
            inParams: inParamsRef.current,
            ...extra,
          }),
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, _useMock]);

  const inParamsStr = JSON.stringify(inParams);

  useUpdateEffect(() => {
    if (forceUpdateKey?.includes('inParams')) {
      queryPageConfig();
    }
  }, [inParamsStr]);

  const queryPageConfig = (
    p?: CONFIG_PAGE.RenderConfig,
    partial?: boolean,
    op?: CP_COMMON.Operation,
    callBack?: Function,
  ) => {
    if (fetchingRef.current || forbiddenRequest) return; // forbidden request when fetching
    // 此处用state，为了兼容useMock的情况
    if (!op?.async && !pageConfigRef.current?.protocol.syncInterval) {
      updater.fetching(true);
      fetchingRef.current = true;
    }
    const reqConfig = { ...(p || pageConfig), inParams: inParamsRef.current };
    ((useMockMark && _useMock) || getRenderPageLayout)(reqConfig, partial)
      .then((res: any) => {
        if (partial) {
          const comps = get(res, 'protocol.components');
          const _curConfig = pageConfigRef.current as CONFIG_PAGE.RenderConfig;
          const newConfig = produce(_curConfig, (draft) => {
            if (draft.protocol?.components) {
              draft.protocol.components = { ...draft.protocol.components, ...comps };
            }
          });
          callBack?.(newConfig);
          operationCallBack?.(reqConfig, newConfig, op);
          updateConfig ? updateConfig(newConfig) : updater.pageConfig(newConfig);
        } else if ((op?.index && opIndexRef.current === op?.index) || op?.index === undefined) {
          // Retain the response data that matches the latest operation
          callBack?.(res);
          operationCallBack?.(reqConfig, res, op);
          updateConfig ? updateConfig(res) : updater.pageConfig(res);
        }
        if (op?.successMsg) notify('success', op.successMsg);
      })
      .catch(() => {
        if (op?.errorMsg) notify('error', op.errorMsg);
      })
      .finally(() => {
        updater.fetching(false);
        fetchingRef.current = false;
      });
  };

  const updateState = (dataKey: string, dataVal: Obj, callBack?: Function) => {
    const _curConfig = pageConfigRef.current as CONFIG_PAGE.RenderConfig;
    const newConfig = produce(_curConfig, (draft) => {
      if (dataKey) {
        const curData = get(draft, dataKey) || {};
        set(draft, dataKey, { ...curData, ...dataVal });
      }
    });
    callBack?.(newConfig);
    updateConfig ? updateConfig(newConfig) : updater.pageConfig(newConfig);
  };

  const execOperation = (
    cId: string,
    op: CP_COMMON.Operation,
    updateInfo?: { dataKey: string; dataVal: Obj },
    extraUpdateInfo?: Obj,
  ) => {
    const { key, reload = false, partial, ..._rest } = op;
    const loadCallBack = (_pageData: CONFIG_PAGE.RenderConfig) => {
      op?.callBack?.();
      onExecOp && onExecOp({ cId, op, reload, updateInfo, pageData: _pageData });
    };
    if (reload) {
      // 需要请求后端接口
      const _curConfig = pageConfigRef.current as CONFIG_PAGE.RenderConfig;
      const newConfig = produce(_curConfig, (draft) => {
        if (extraUpdateInfo && !isEmpty(extraUpdateInfo)) {
          // 数据不为空,先更新后请求
          const { dataKey, dataVal } = extraUpdateInfo;
          if (dataKey) {
            const curData = get(draft, dataKey) || {};
            set(draft, dataKey, { ...curData, ...dataVal });
          }
        }
        if (updateInfo && !isEmpty(updateInfo)) {
          // 数据不为空,先更新后请求
          const { dataKey, dataVal } = updateInfo;
          if (dataKey) {
            const curData = get(draft, dataKey) || {};
            set(draft, dataKey, { ...curData, ...dataVal });
          }
        }
        draft.event = {
          component: cId,
          operation: key,
          operationData: _rest,
        };
      });

      const formatConfig = clearLoadMoreData(newConfig);
      opIndexRef.current += 1;
      queryPageConfig(formatConfig, partial, { ...op, index: opIndexRef.current }, loadCallBack);
    } else if (updateInfo) {
      updateState(updateInfo.dataKey, updateInfo.dataVal, loadCallBack);
    }
  };

  const clearLoadMoreData = (newConfig: CONFIG_PAGE.RenderConfig) => {
    const formatConfig = produce(newConfig, (draft) => {
      const comps = get(draft, 'protocol.components');
      forEach(comps, (comp, compName) => {
        const ignoreData = {};
        const ignoreKeys: string[] = comp?.props?.requestIgnore || [];
        if (comp?.props?.isLoadMore) ignoreKeys.push('data');
        ignoreKeys.forEach((_key) => {
          ignoreData[_key] = undefined;
        });
        comps[compName] = { ...comp, ...ignoreData };
      });
    });

    return formatConfig;
  };

  const pageProtocol = React.useMemo(() => get(pageConfig, 'protocol'), [pageConfig]);
  const Content = React.useMemo(
    () => {
      return (
        <ConfigPageRender
          pageConfig={pageProtocol as CONFIG_PAGE.PageConfig}
          updateState={updateState}
          changeScenario={changeScenario}
          execOperation={execOperation}
          customProps={customProps}
        />
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pageProtocol],
  );

  return showLoading ? (
    <Spin spinning={showLoading && fetching} wrapperClassName={`${fullHeight ? 'full-spin-height' : ''}`}>
      <div className="h-full">{Content}</div>
    </Spin>
  ) : (
    Content
  );
});

export { useMock };
export default React.memo(ConfigPage);
