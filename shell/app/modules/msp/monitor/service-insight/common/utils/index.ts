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

import { mapKeys } from 'lodash';
import routeInfoStore from 'app/common/stores/route';

interface IProps {
  baseInfo: MONITOR_SI.IBaseInfo;
}

export const getFilterParams = (props: IProps, { prefix }: { prefix: string }) => {
  const { baseInfo } = props;
  const { serviceName } = routeInfoStore.useStore((s) => s.params);
  const { applicationId, terminusKey, runtimeName } = baseInfo;

  const filters = {
    application_id: applicationId,
    runtime_name: runtimeName,
    service_name: serviceName,
    terminus_key: terminusKey,
  };
  const shouldLoad = applicationId !== undefined && terminusKey && runtimeName && serviceName;

  const filterQuery = mapKeys(filters, (_val, key) => `${prefix}${key}`);
  return { shouldLoad, filterQuery };
};
