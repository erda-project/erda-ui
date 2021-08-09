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

import { createStore } from 'core/cube';
import { getServiceMenu, getInstanceList, getBaseInfo } from '../services/common';
import breadcrumbStore from 'app/layout/stores/breadcrumb';

interface IState {
  headMenu: Array<{ key: string; value: string }>;
  baseInfo: MONITOR_SI.IBaseInfo;
  instanceMap: any;
  chosenInstance: any;
}

const initState: IState = {
  headMenu: [],
  baseInfo: {} as MONITOR_SI.IBaseInfo,
  instanceMap: {},
  chosenInstance: {},
};

const Common = createStore({
  name: 'SICommon',
  state: initState,
  subscriptions({ listenRoute }: IStoreSubs) {
    listenRoute(({ params, isIn, isLeaving }) => {
      if (isIn('serviceInsight')) {
        const { terminusKey, serviceName, applicationId } = params;
        const runtimeName = decodeURIComponent(params.runtimeName);
        Common.effects
          .getSIBaseInfo({
            runtimeName,
            terminusKey,
            applicationId,
            serviceName,
          })
          .then((res: any) => {
            res &&
              Common.effects.getSIHeadMenu({
                terminus_key: terminusKey,
                runtime_name: runtimeName,
                application_id: applicationId,
                service_name: serviceName,
              });
          });
      }
      if (isLeaving('serviceInsight')) {
        Common.reducers.clearSIHeadMenu();
        Common.reducers.clearSIBaseInfo();
      }
    });
  },
  effects: {
    async getSIHeadMenu({ call, update }, payload: MONITOR_SI.IMenuQuery) {
      const headMenu = await call(getServiceMenu, payload);
      update({ headMenu });
    },
    async getInstanceList(
      { call },
      payload: { type: string; query: MONITOR_SI.IChartQuery; fetchApi: string; dataHandler: (arg: any) => any },
    ) {
      const { type, query, fetchApi, dataHandler } = payload;
      const list = await call(getInstanceList, { fetchApi, ...query });
      await Common.reducers.getInstanceListSuccess({ type, list, dataHandler });
    },
    async getSIBaseInfo(
      { call, update },
      payload: { runtimeName: string; serviceName: string; applicationId: string; terminusKey: string },
    ) {
      const { runtimeName, serviceName, applicationId, terminusKey } = payload;
      const prevBaseInfo = Common.getState((s) => s.baseInfo);
      if (!(prevBaseInfo && prevBaseInfo.runtimeName === runtimeName)) {
        const query = {
          runtime_name: runtimeName,
          terminus_key: terminusKey,
          application_id: applicationId,
        };
        let baseInfo = await call(getBaseInfo, query);
        baseInfo = { ...baseInfo, serviceName };
        update({ baseInfo });
        breadcrumbStore.reducers.setInfo('SIBaseInfo', baseInfo);
        return true;
      }
      return false;
    },
  },
  reducers: {
    getInstanceListSuccess(state, payload: { type: string; list: IChartResult; dataHandler: (arg: any) => any }) {
      const { instanceMap } = state;
      const { type, list, dataHandler } = payload;
      state.instanceMap = { ...instanceMap, [type]: dataHandler(list) };
    },
    setChosenInstance(state, payload: { type: string; instance: string }) {
      const { type, instance } = payload;
      const { chosenInstance } = state;
      state.chosenInstance = { ...chosenInstance, [type]: instance };
    },
    clearChosenInstance(state) {
      state.chosenInstance = {};
    },
    clearSIHeadMenu(state) {
      state.headMenu = [];
    },
    clearSIBaseInfo(state) {
      state.baseInfo = {} as MONITOR_SI.IBaseInfo;
    },
  },
});

export default Common;
