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

import * as React from 'react';
import { useMount, useUpdateEffect } from 'react-use';
import { isEmpty, get, set, isEqual } from 'lodash';
import { produce } from 'immer';
import { Spin } from 'app/nusi';
import { useUpdate } from 'common';
import ConfigPageRender from './page-render';
import commonStore from 'common/stores/common';
import './index.scss';

interface IProps {
  inParams?: Obj;
  customProps?: Obj;
  scenarioType: string;
  scenarioKey: string;
  showLoading?: boolean;
  forceUpdateKey?: string[];
  debugConfig?: CONFIG_PAGE.RenderConfig;
  onExecOp?: any;
  forceMock?: boolean; // 使用mock
  useMock?: (params: Obj) => Promise<any>;
  updateConfig?: (params: Obj) => any;
}

const unProduct = process.env.NODE_ENV !== 'production';

const ConfigPage = React.forwardRef((props: IProps, ref: any) => {
  const { inParams = {}, customProps = {}, scenarioType, scenarioKey, showLoading = true, forceUpdateKey, useMock, forceMock, debugConfig, onExecOp, updateConfig } = props;
  const [{ pageConfig, fetching }, updater] = useUpdate({
    pageConfig: debugConfig || {
      scenario: {
        scenarioType,
        scenarioKey,
      },
      inParams,
    } as CONFIG_PAGE.RenderConfig,
    fetching: false,
  });
  // 在非生产环境里，url中带useMock
  const useMockMark = forceMock || (unProduct && location.search.includes('useMock'));
  const changeScenario = (s: {scenarioKey: string; scenarioType: string, inParams?: Obj}) => {
    const { scenarioType: newType, scenarioKey: newKey, inParams: newInParams } = s;
    newKey && queryPageConfig({
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
  }, [pageConfig]);

  React.useEffect(() => {
    if (!isEqual(inParams, inParamsRef.current) && !isEmpty(inParams)) {
      inParamsRef.current = inParams;
    }
  }, [inParams]);

  React.useEffect(() => {
    if (ref) {
      ref.current = {
        reload: (extra: any) => queryPageConfig({
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
  }, [ref]);

  useUpdateEffect(() => {
    if (forceUpdateKey?.includes('inParams')) {
      queryPageConfig();
    }
  }, [inParams]);

  const queryPageConfig = (p?: CONFIG_PAGE.RenderConfig, partial?: boolean, _showLoading = true) => {
    // 此处用state，为了兼容useMock的情况
    if (_showLoading)updater.fetching(true);
    ((useMockMark && useMock) || getRenderPageLayout)({ ...(p || pageConfig), inParams: inParamsRef.current }, partial).then((res: any) => {
      updater.fetching(false);
      if (partial) {
        const comps = get(res, 'protocol.components');
        const _curConfig = pageConfigRef.current as CONFIG_PAGE.RenderConfig;
        const newConfig = produce(_curConfig, (draft) => {
          if (draft.protocol?.components) {
            draft.protocol.components = { ...draft.protocol.components, ...comps };
          }
        });
        updateConfig ? updateConfig(newConfig) : updater.pageConfig(newConfig);
      } else {
        updateConfig ? updateConfig(res) : updater.pageConfig(res);
      }
    }).finally(() => {
      updater.fetching(false);
    });
  };

  const updateState = (dataKey: string, dataVal: Obj) => {
    const _curConfig = pageConfigRef.current as CONFIG_PAGE.RenderConfig;
    const newConfig = produce(_curConfig, (draft) => {
      if (dataKey) {
        const curData = get(draft, dataKey) || {};
        set(draft, dataKey, { ...curData, ...dataVal });
      }
    });
    updateConfig ? updateConfig(newConfig) : updater.pageConfig(newConfig);
  };

  const execOperation = (cId: string, op: { key: string, reload?: boolean; partial?: boolean; }, updateInfo?: { dataKey: string, dataVal: Obj }) => {
    const { key, reload = false, partial, ..._rest } = op;
    onExecOp && onExecOp({ cId, op, reload, updateInfo });
    if (reload) { // 需要请求后端接口
      const _curConfig = pageConfigRef.current as CONFIG_PAGE.RenderConfig;
      const newConfig = produce(_curConfig, (draft) => {
        if (updateInfo && !isEmpty(updateInfo)) { // 数据不为空,先更新后请求
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
      queryPageConfig(newConfig, partial, op.showLoading);
    } else if (updateInfo) {
      updateState(updateInfo.dataKey, updateInfo.dataVal);
    }
  };

  const pageProtocol = React.useMemo(() => get(pageConfig, 'protocol'), [pageConfig]);

  const Content = React.useMemo(() => {
    return (
      <ConfigPageRender
        pageConfig={pageProtocol as CONFIG_PAGE.PageConfig}
        updateState={updateState}
        changeScenario={changeScenario}
        execOperation={execOperation}
        customProps={customProps}
      />
    );
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  , [pageProtocol]);

  return (
    <div className='full-height'>
      <div className={`page-config-spin ${showLoading && fetching ? 'spinning' : ''} `}>
        <Spin spinning={(showLoading && fetching)} wrapperClassName='full-spin-height' />
      </div>
      {Content}
    </div>
  );
  // return <Spin spinning={showLoading && fetching} wrapperClassName='full-spin-height'>{Content}</Spin>;
});

export default ConfigPage;

