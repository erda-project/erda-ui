import userMapStore from 'app/common/stores/user-map';
import { notify } from './common/utils';

export default (body: any, params: any, apiConfig: any) => {
  if ('success' in body && 'err' in body) {
    const { data, success, err, userInfo } = body;
    if (userInfo) {
      userMapStore.reducers.setUserMap(userInfo);
    }

    if (params && 'pageNo' in params) {
      // it's a paging api, generate paging obj automatically
      const { total } = data;
      const { pageNo, pageSize = 15 } = params;
      const hasMore = Math.ceil(total / +pageSize) > +pageNo;
      data.paging = { pageNo, pageSize, total, hasMore };
      data.list = data.list || data.data;
    }

    if (success) {
      const successMsg = params?.$options?.successMsg || apiConfig?.successMsg;
      successMsg && notify('success', successMsg);
    } else if (err) {
      const errorMsg = err?.msg || params?.$options?.errorMsg || apiConfig?.errorMsg;
      errorMsg && notify('error', errorMsg);
    }
  }
};
