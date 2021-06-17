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

import { createStore } from 'app/cube';
import loadingStore, { useLoading } from 'core/stores/loading';
import { DomainManageService } from 'dataCenter/services/domain-manage';

/**
 * @deprecated use useLoading instead
 */
export function useSpace<T>(store: T & { name: string }): EffectKeys<ValueOf<T, 'effects' | '_effects'>> {
  const loadingSpace = loadingStore.useStore((s) => s[store.name]) || {};
  // add proxy to avoid return undefined in isLoading
  const loadingSpaceProxy = new Proxy(loadingSpace, {
    get: (target, propKey) => {
      return !!Reflect.get(target, propKey);
    },
  });
  return loadingSpaceProxy;
}

const serviceLoadingStore = createStore({
  name: 'shellServiceLoading',
  state: {
    serviceLoading: {} as any,
  },
  reducers: {
    setServiceLoading(state, ns: string, serviceName, status: boolean) {
      state.serviceLoading[ns] = state.serviceLoading[ns] || {};
      state.serviceLoading[ns][serviceName] = status;
    },
  },
});

interface ServiceNamespace {
  'domain-manage': DomainManageService;
}

function useServiceLoading<T extends keyof ServiceNamespace>(
  ns: T,
  serviceNames: Array<keyof ServiceNamespace[T]>,
): boolean {
  return serviceLoadingStore.useStore((s) =>
    serviceNames
      .map((n) => (s.serviceLoading[ns] && s.serviceLoading[ns][n]) || false)
      .reduce((acc, current) => acc || current, false),
  ) as Readonly<boolean>;
}

export default loadingStore;
export { useLoading, useServiceLoading, serviceLoadingStore };
