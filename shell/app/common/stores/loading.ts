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

import loadingStore, { useLoading } from 'core/stores/loading';

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

export default loadingStore;
export { useLoading };
