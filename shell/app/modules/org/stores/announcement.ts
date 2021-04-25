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

import layoutStore from 'layout/stores/layout';
import userStore from 'app/user/stores';
import { createStore } from 'app/cube';
import i18n from 'i18n';
import {
  getAnnouncementList,
  deleteAnnouncement,
  publishAnnouncement,
  updateAnnouncement,
  addAnnouncement,
  unPublishAnnouncement,
} from '../services/announcement';
import { getDefaultPaging } from 'common/utils';
import { eventHub } from 'common/utils/event-hub';
import orgStore from 'app/org-home/stores/org';

interface INotice extends IPagingResp<ORG_ANNOUNCEMENT.Item> {
  publishedList: ORG_ANNOUNCEMENT.Item[],
  noticePaging: any
}

const initState: INotice = {
  publishedList: [],
  list: [],
  total: 0,
  noticePaging: getDefaultPaging(),
};


const announcementStore = createStore({
  name: 'announcement',
  state: initState,
  subscriptions() {
    eventHub.once('layout/mount', () => {
      const loginUser = userStore.getState(s => s.loginUser);
      const orgId = orgStore.getState(s => s.currentOrg.id)
      // 非系统管理员
      if (!loginUser.isSysAdmin && orgId) {
        announcementStore.effects.getAllNoticeListByStatus('published').then(list => {
          layoutStore.reducers.setAnnouncementList(list);
        });
      }
    });
  },
  effects: {
    async getAnnouncementList({ call, update }, payload: ORG_ANNOUNCEMENT.QueryList) {
      const { list, total } = await call(getAnnouncementList, payload, { paging: { key: 'noticePaging' } });
      update({ list, total });
    },
    async getAllNoticeListByStatus({ call, update }, payload: ORG_ANNOUNCEMENT.Status) {
      const { list } = await call(getAnnouncementList, { status: payload });
      update({ publishedList: list });
      return list;
    },
    async addAnnouncement({ call }, payload: ORG_ANNOUNCEMENT.SaveNew) {
      return call(addAnnouncement, payload, { successMsg: i18n.t('default:save successfully') });
    },
    async updateAnnouncement({ call }, payload: ORG_ANNOUNCEMENT.SaveEdit) {
      return call(updateAnnouncement, payload, { successMsg: i18n.t('default:save successfully') });
    },
    async deleteAnnouncement({ call }, payload: ORG_ANNOUNCEMENT.Action) {
      return call(deleteAnnouncement, payload, { successMsg: i18n.t('default:deleted successfully') });
    },
    async publishAnnouncement({ call }, payload: ORG_ANNOUNCEMENT.Action) {
      return call(publishAnnouncement, payload, { successMsg: i18n.t('org:notice publish successfully') });
    },
    async unPublishAnnouncement({ call }, payload: ORG_ANNOUNCEMENT.Action) {
      return call(unPublishAnnouncement, payload, { successMsg: i18n.t('org:notice deprecate successfully') });
    },
  },
  reducers: {},
});
export default announcementStore;
