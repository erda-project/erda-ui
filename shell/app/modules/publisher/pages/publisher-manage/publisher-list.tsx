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
import { Input, Popconfirm, Button } from 'app/nusi';
import { useDebounce, useUnmount } from 'react-use';
import i18n from 'i18n';
import { Icon as CustomIcon, EmptyListHolder, LoadMore, IF, connectCube, useUpdate } from 'common';
import { ossImg } from 'common/utils';
import PublisherFormModal from './publisher-form-modal';
import fbck_svg from 'app/images/fbck.svg';
import './publisher-list.scss';

const { Search } = Input;

interface IMapperProps {
  list: PUBLISHER.IPublisher[];
  paging: IPaging;
  isFetching: boolean;
  getList: (payload: PUBLISHER.PublisherListQuery) => Promise<{
    list: PUBLISHER.IPublisher[];
    total: number;
  }>;
  clearList: () => void;
  deleteItem?: (payload: any) => Promise<any>;
  operationAuth?: { delete: boolean; edit: boolean; add: boolean };
  onItemClick: (item: PUBLISHER.IPublisher) => void;
}

export interface IPubliserListProps extends IMapperProps {
  placeHolderMsg?: string;
  getList: (p: any) => Promise<any>;
}

export const PurePublisherList = ({
  list = [],
  paging,
  getList,
  clearList,
  isFetching,
  deleteItem,
  placeHolderMsg = i18n.t('publisher:search by name'),
  operationAuth = { delete: false, edit: false, add: false },
  onItemClick,
}: IPubliserListProps) => {
  const [{ q, formVisible, editData }, updater] = useUpdate({
    q: undefined as string | undefined,
    formVisible: false,
    editData: undefined as PUBLISHER.IPublisher | undefined,
  });
  useUnmount(clearList);

  useDebounce(
    () => {
      getList({
        q,
        pageNo: 1,
      });
    },
    600,
    [q],
  );

  const onSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    updater.q(value);
  };

  const goToPublisher = (item: PUBLISHER.IPublisher) => {
    onItemClick(item);
  };

  const load = () => {
    return getList({
      q,
      loadMore: true,
      pageNo: paging.pageNo + 1,
    });
  };

  const openFormModal = (item?: PUBLISHER.IPublisher) => {
    updater.editData(item);
    updater.formVisible(true);
  };
  const closeFormModal = () => {
    updater.formVisible(false);
    updater.editData(undefined);
  };

  const reLoadList = () => {
    getList({
      q,
      pageNo: 1,
    });
  };

  const afterSubmit = () => {
    reLoadList();
  };

  const onDelete = (item: PUBLISHER.IPublisher) => {
    deleteItem &&
      deleteItem({ publisherId: item.id }).then((res) => {
        res && reLoadList();
      });
  };

  const Holder = ({ children }: any) => (isFetching || list.length ? children : <EmptyListHolder />);
  return (
    <div className="publisher-list-section">
      {operationAuth.add ? (
        <div className="top-button-group">
          <Button type="primary" onClick={() => openFormModal()}>
            {i18n.t('publisher:add repository')}
          </Button>
        </div>
      ) : null}
      <Search className="search-input" placeholder={placeHolderMsg} value={q} onChange={onSearch} />
      <Holder>
        <ul>
          {list.map((item: any) => {
            return (
              <li key={item.name} className="publisher-item">
                <div className="item-container" onClick={() => goToPublisher(item)}>
                  <div className="item-img">
                    <IF check={item.logo}>
                      <img src={ossImg(item.logo, { w: 64 })} alt="logo" />
                      <IF.ELSE />
                      <img src={fbck_svg} />
                    </IF>
                  </div>
                  <div className="item-content">
                    <div className="item-name nowrap font-medium">{item.name}</div>
                    <div className="item-desc nowrap">
                      {item.desc || i18n.t('publisher:edit description in edit mode')}
                    </div>
                  </div>
                  <div className="item-operation" onClick={(e: any) => e.stopPropagation()}>
                    {operationAuth.edit ? (
                      <CustomIcon
                        type="bj"
                        onClick={(e) => {
                          e.stopPropagation();
                          openFormModal(item);
                        }}
                      />
                    ) : null}
                    {operationAuth.delete ? (
                      <Popconfirm
                        title={i18n.t('is it confirmed?')}
                        onConfirm={(e: any) => {
                          e.stopPropagation();
                          onDelete(item);
                        }}
                      >
                        <CustomIcon type="sc1" className="ml-1" onClick={(e) => e.stopPropagation()} />
                      </Popconfirm>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Holder>
      <LoadMore load={load} hasMore={paging.hasMore} isLoading={isFetching} />
      <PublisherFormModal
        visible={formVisible}
        formData={editData}
        onCancel={closeFormModal}
        afterSubmit={afterSubmit}
      />
    </div>
  );
};

export const createPublisherList = (Mapper: () => IMapperProps) => connectCube(PurePublisherList, Mapper);
