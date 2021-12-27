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
import i18n from 'i18n';
import {
  getReleaseDetail,
  getAppList,
  getReleaseList,
  addRelease,
  updateRelease,
  formalRelease,
} from '../services/release';

interface IState {
  releaseDetail: RELEASE.ReleaseDetail;
  appList: RELEASE.AppDetail[];
  releaseList: RELEASE.ReleaseDetail[];
  releaseTotal: number;
}

const initState: IState = {
  releaseDetail: {} as RELEASE.ReleaseDetail,
  appList: [] as RELEASE.AppDetail[],
  releaseList: [] as RELEASE.ReleaseDetail[],
  releaseTotal: 0,
};

const releaseStore = createStore({
  name: 'releaseStore',
  state: initState,
  effects: {
    async getReleaseDetail({ call, update }, payload: { releaseID?: string }) {
      const releaseDetail = await call(getReleaseDetail, payload);
      update({ releaseDetail });
    },
    async getAppList({ call, update }, payload: RELEASE.AppListQuery) {
      const res = await call(getAppList, payload);
      const { list } = res;
      update({ appList: list.map((item) => ({ ...item, title: item.displayName })) });
    },
    async getReleaseList({ call, update }, payload: RELEASE.ReleaseListQuery) {
      const res = await call(getReleaseList, payload);
      const { list, total } = res;
      update({ releaseList: list, releaseTotal: total });
    },
    async addRelease({ call, getParams }, payload): Promise<{ success: boolean }> {
      const { projectId } = getParams();
      return call(
        addRelease,
        { ...payload, projectID: +projectId },
        {
          successMsg: i18n.t('created successfully'),
          fullResult: true,
        },
      );
    },
    async updateRelease({ call, getParams }, payload): Promise<{ success: boolean }> {
      const { projectId } = getParams();
      return call(
        updateRelease,
        { ...payload, projectID: +projectId },
        {
          successMsg: i18n.t('edited successfully'),
          fullResult: true,
        },
      );
    },
    async formalRelease({ call }, payload): Promise<{ success: boolean }> {
      return call(
        formalRelease,
        { ...payload },
        {
          successMsg: i18n.t('{action} successfully', { action: i18n.t('dop:be formal') }),
          fullResult: true,
        },
      );
    },
  },
  reducers: {
    updateReleaseDetail(state, releaseDetail) {
      state.releaseDetail = releaseDetail;
    },
  },
});

export default releaseStore;
