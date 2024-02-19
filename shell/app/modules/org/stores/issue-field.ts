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
import { ISSUE_TYPE } from 'project/common/issue-config';

import {
  getIssueTime,
  addFieldItem,
  updateFieldItem,
  deleteFieldItem,
  getFieldsByIssue,
  batchUpdateFieldsOrder,
  getSpecialFieldOptions,
  updateSpecialFieldOptions,
} from '../services/issue-field';

interface IState {
  issueTimeMap: ISSUE_FIELD.IIssueTime;
  fieldList: ISSUE_FIELD.IFiledItem[];
  bugStageList: ISSUE_FIELD.ISpecialOption[];
  taskTypeList: ISSUE_FIELD.ISpecialOption[];
}

const initState: IState = {
  issueTimeMap: {} as ISSUE_FIELD.IIssueTime,
  fieldList: [],
  bugStageList: [],
  taskTypeList: [],
};

const issueFieldStore = createStore({
  name: 'issueField',
  state: initState,
  effects: {
    async getIssueTime({ call, update, getParams }, payload: ISSUE_FIELD.IProjectIssueQuery) {
      const { projectId } = getParams();
      const issueTimeMap = await call(getIssueTime, addProjectId(projectId)(payload));
      update({ issueTimeMap });
    },
    async getFieldsByIssue({ call, update, getParams }, payload: ISSUE_FIELD.IFieldsByIssueQuery) {
      const { projectId } = getParams();
      const fieldList = await call(getFieldsByIssue, addProjectId(projectId)(payload));
      update({ fieldList: fieldList || [] });
      return fieldList || [];
    },
    async addFieldItem({ call, getParams }, payload: Omit<ISSUE_FIELD.IFiledItem, 'propertyID' | 'index'>) {
      const { projectId } = getParams();
      return call(addFieldItem, addProjectId(projectId)(payload), { successMsg: i18n.t('saved successfully') });
    },
    async updateFieldItem({ call, getParams }, payload: Omit<ISSUE_FIELD.IFiledItem, 'index'>) {
      const { projectId } = getParams();
      return call(updateFieldItem, addProjectId(projectId)(payload), { successMsg: i18n.t('updated successfully') });
    },
    async deleteFieldItem({ call, getParams }, payload: { propertyID: number }) {
      const { projectId } = getParams();
      return call(deleteFieldItem, addProjectId(projectId)(payload), { successMsg: i18n.t('deleted successfully') });
    },
    async batchUpdateFieldsOrder({ call, update, getParams }, payload: ISSUE_FIELD.IFiledItem[]) {
      const { projectId } = getParams();
      const fieldList = await call(batchUpdateFieldsOrder, addProjectId(projectId)(payload), {
        successMsg: i18n.t('updated successfully'),
      });
      update({ fieldList });
    },
    async getSpecialFieldOptions({ call, update, getParams }, payload: ISSUE_FIELD.ISpecialFieldQuery) {
      const { projectId } = getParams();
      const { issueType } = payload;
      let list = await call(
        getSpecialFieldOptions,
        addProjectId(projectId)({ ...payload, ...(projectId ? { onlyProject: true } : {}) }),
      );
      list = list || [];
      if (issueType === ISSUE_TYPE.BUG) {
        update({ bugStageList: list });
      } else if (issueType === ISSUE_TYPE.TASK) {
        update({ taskTypeList: list });
      }

      return list;
    },
    async updateSpecialFieldOptions({ call, getParams }, payload: ISSUE_FIELD.ISpecialFieldQuery) {
      const { projectId } = getParams();
      const list = await call(updateSpecialFieldOptions, addProjectId(projectId)(payload));

      return list;
    },
  },
  reducers: {
    clearFieldList(state) {
      // eslint-disable-next-line no-param-reassign
      state.fieldList = [];
    },
  },
});

const addProjectId = (projectId: string) => {
  return (params: any) => {
    if (Array.isArray(params)) {
      return params;
    }
    return {
      ...params,
      ...(projectId ? { scopeType: 'project', scopeID: projectId } : {}),
    };
  };
};

export default issueFieldStore;
