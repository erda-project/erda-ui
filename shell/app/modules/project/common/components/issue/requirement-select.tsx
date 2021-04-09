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

import * as React from 'react';
import i18n from 'i18n';
import { map, uniqBy, sortBy, find, get } from 'lodash';

import { getIssues as getRequirements, getIssueDetail } from 'project/services/issue';
import routeInfoStore from 'app/common/stores/route';
import { LoadMoreSelector } from 'common';
import { IOption } from 'common/components/load-more-selector';
import { PAGINATION } from 'app/constants';
import { ISSUE_TYPE } from 'project/common/components/issue/issue-config';

interface IProps {
  value?: any
  onChange?: (...val: any) => void
}

export default ({ value, onChange }: IProps) => {
  const [params, { iterationIDs = [] }] = routeInfoStore.useStore(s => [s.params, s.query]);
  const [list, setList] = React.useState([] as IOption[]);

  React.useEffect(() => {
    if (value && !find(list, (single) => String(single) === String(value))) {
      getIssueDetail({ id: value }).then((res: any) => {
        const detail = res.data;
        const nextList = [{ label: detail.title, value: detail.id }] as IOption[];
        setList(sortBy(uniqBy([...list, ...nextList], 'value'), 'value'));
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const _getRequirements = ({ q: title, ...rest }: any) => {
    return getRequirements({
      type: ISSUE_TYPE.REQUIREMENT,
      pageNo: 1,
      iterationIDs: map(iterationIDs, item => +item),
      pageSize: PAGINATION.pageSize,
      projectID: +params.projectId,
      title,
      ...rest,
    }).then((resData: any) => {
      const { list: resList } = resData.data;
      const nextList = map(resList, (single) => ({ label: single.title, value: single.id } as IOption));
      setList(sortBy(uniqBy([...list, ...nextList], 'value'), 'value'));
      return resData.data;
    });
  };

  return (
    <LoadMoreSelector
      getData={_getRequirements}
      placeholder={i18n.t('please choose {name}', { name: i18n.t('requirement') })}
      value={value}
      key={iterationIDs.join('') || 'all'}
      onChange={(...arg) => {
        onChange && onChange(...arg);
      }}
      allowClear
      valueItemRender={(item) => {
        return item.label || get(find(list, single => String(single.value) === String(item.value)), 'label');
      }}
      dataFormatter={({ list: originList, total }) => ({
        total,
        list: map(originList, ({ title, id: singleId, ..._rest }) => ({
          ..._rest, label: title, value: singleId,
        })),
      })}
    />
  );
};
