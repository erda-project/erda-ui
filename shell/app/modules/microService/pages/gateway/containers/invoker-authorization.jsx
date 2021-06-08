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

import Comp from '../components/invoker-authorization';
import { connectCube } from 'common';
import gatewayStore from 'microService/stores/gateway';
import { useLoading } from 'app/common/stores/loading';

const mapper = () => {
  const [consumer, apiList, needAuthApiList, needAuthApiPaging, consumerList, trafficControlPolicy, authData, authConsumer] = gatewayStore.useStore((s) => [s.consumer, s.apiList, s.needAuthApiList, s.needAuthApiListPaging, s.consumerList, s.trafficControlPolicy, s.authData, s.authConsumer]);
  const { getConsumer, createConsumer, getConsumerList, updateConsumerDetail, getAPIList, getNeedAuthAPIList, saveConsumerApi, getPolicyList, saveConsumerApiPolicy, deleteConsumer, getConsumerDetail } = gatewayStore.effects;
  const wrapper = (fun, payload) => (params = {}) => {
    return fun({ ...payload, ...params });
  };
  const [isFetching, isFetchingNeedAuthAPIList] = useLoading(gatewayStore, ['getConsumerList', 'getNeedAuthAPIList']);
  return {
    consumer,
    apiList,
    needAuthApiList,
    needAuthApiPaging,
    consumerList,
    trafficControlPolicy,
    authData,
    authConsumer,
    isFetchingNeedAuthAPIList,
    isFetching,
    getConsumer,
    createConsumer,
    getConsumerList,
    updateConsumerDetail,
    getAPIList,
    getNeedAuthAPIList,
    saveConsumerApi,
    getPolicyList: wrapper(getPolicyList, { category: 'trafficControl' }),
    saveConsumerApiPolicy,
    deleteConsumer,
    getConsumerDetail,

  };
};

export default connectCube(Comp, mapper);
