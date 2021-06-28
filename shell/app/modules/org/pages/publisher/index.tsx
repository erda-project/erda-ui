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

import { createPublisherList } from 'app/modules/publisher/pages/publisher-manage/publisher-list';
import publisherStore from 'app/modules/publisher/stores/publisher';
import { useLoading } from 'core/stores/loading';
import { goTo } from 'common/utils';

const Mapper = () => {
  const [publisherList, publisherPaging] = publisherStore.useStore((s) => [s.publisherList, s.publisherPaging]);
  const [userLoading] = useLoading(publisherStore, ['getPublisherList']);
  const { getPublisherList, deletePublisher } = publisherStore.effects;
  const { clearPublisherList } = publisherStore.reducers;
  return {
    list: publisherList,
    paging: publisherPaging,
    isFetching: userLoading,
    getList: getPublisherList,
    clearList: clearPublisherList,
    deleteItem: deletePublisher,
    operationAuth: {
      // 编辑删除权限在具体的publisherId下，add权限等同企业中心菜单（企业管理员）
      delete: false,
      edit: false,
      add: true,
    },
    onItemClick: (publisher: PUBLISHER.IPublisher) => {
      goTo(`./${publisher.id}/setting`);
    },
  };
};

const PublisherList = createPublisherList(Mapper);
export default PublisherList;
