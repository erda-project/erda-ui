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

import { size } from 'lodash';
import React from 'react';
import i18n from 'i18n';
import { getChoosenInfo } from 'project/utils/test-case';
import testCaseStore from 'project/stores/test-case';

interface IProps {
  mode: TEST_CASE.PageScope;
}

const ChooseTitle = ({ mode }: IProps) => {
  const [choosenInfo, modalChoosenInfo, caseTotal, modalCaseTotal] = testCaseStore.useStore((s) => [
    s.choosenInfo,
    s.modalChoosenInfo,
    s.caseTotal,
    s.modalCaseTotal,
  ]);
  const { triggerChoosenAll } = testCaseStore.reducers;
  let total = 0;
  const info = getChoosenInfo(choosenInfo, modalChoosenInfo, mode);
  const { isAll, exclude, primaryKeys } = info;
  const isModal = mode === 'caseModal';
  if (isModal) {
    total = modalCaseTotal;
  } else {
    total = caseTotal;
  }
  const length = isAll ? total - size(exclude) : size(primaryKeys);
  const checked = isAll || !!size(primaryKeys);

  return !checked ? (
    <span>{i18n.t('project:use case title')}</span>
  ) : (
    <div>
      <span className="mr8">{i18n.t('project:selected {num} items', { num: length })} </span>
      <span className="mr8 fake-link" onClick={() => triggerChoosenAll({ isAll: true, scope: mode })}>
        {i18n.t('project:select all')}
      </span>
      <span className="mr8 fake-link" onClick={() => triggerChoosenAll({ isAll: false, scope: mode })}>
        {i18n.t('project:cancel selection')}
      </span>
    </div>
  );
};

export default ChooseTitle;
