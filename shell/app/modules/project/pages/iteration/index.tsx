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

import iterationStore from 'app/modules/project/stores/iteration';
import { DeleteConfirm, EmptyListHolder, IF, MenuPopover, useUpdate } from 'common';
import { useLoading } from 'app/common/stores/loading';
import i18n from 'i18n';
import { isEmpty, map } from 'lodash';
import moment from 'moment';
import { Button, Pagination, Spin } from 'app/nusi';
import * as React from 'react';
import { useMount } from 'react-use';
import IterationModal from './iteration-modal';
import { WithAuth, usePerm } from 'user/common';

export const Iteration = () => {
  const [list, paging] = iterationStore.useStore((s) => [s.iterationList, s.iterationPaging]);
  const { getIterations: getList, deleteIteration } = iterationStore.effects;
  const [isFetching] = useLoading(iterationStore, ['getIterations']);
  const editAuth = usePerm((s) => s.project.iteration.operation.pass);
  const { total, pageNo, pageSize } = paging;
  const [state, updater] = useUpdate({
    modalVisible: false,
    curDetail: null,
  });

  useMount(() => {
    getList({ pageNo });
  });

  const onDelete = (id: number) => {
    deleteIteration(id).then(() => {
      getList({ pageNo });
    });
  };

  const onEdit = (item: ITERATION.Detail) => {
    updater.curDetail(item);
    updater.modalVisible(true);
  };

  const onCreate = () => {
    updater.modalVisible(true);
  };

  const renderMenuPopover = (iteration: ITERATION.Detail) => (
    setVisible: Function,
  ) => {
    return (
      <div>
        <WithAuth pass={editAuth} >
          <div
            className="popover-item"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(iteration);
              setVisible(false);
            }}
          >
            {i18n.t('edit')}
          </div>
        </WithAuth>
        <DeleteConfirm
          onConfirm={() => {
            onDelete(iteration.id);
            setVisible(false);
          }}
          onShow={() => { setVisible(false); }}
        >
          <WithAuth pass={editAuth} >
            <div className="popover-item">{i18n.t('delete')}</div>
          </WithAuth>
        </DeleteConfirm>
      </div>
    );
  };

  const renderIteration = (iteration: ITERATION.Detail) => {
    const { id, title, content, startedAt, finishedAt } = iteration;
    return (
      <div key={id} className="common-list-item hover-active-bg flex-box">
        <div className="list-item-left">
          <div className="nowrap title flex-box bold-500">
            <span>
              {title}
            </span>
            <MenuPopover
              styleName="color-text-desc"
              content={renderMenuPopover(iteration)}
              placement="left"
            />
          </div>
          <div className="nowrap color-text-sub mt4">{content}</div>
          <div className="nowrap color-text-desc mt12">
            <span className="mr16">
              {i18n.t('common:start at')}：{moment(startedAt).format('YYYY-MM-DD HH:mm:ss')}
            </span>
            <span>
              {i18n.t('common:end at')}：{moment(finishedAt).format('YYYY-MM-DD HH:mm:ss')}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const onPageChange = (no: number) => {
    getList({ pageNo: no });
  };

  const handleClose = (isSave: boolean) => {
    updater.modalVisible(false);
    updater.curDetail(null);
    isSave && getList({ pageNo });
  };

  const addAuth = usePerm((s) => s.project.iteration.operation.pass);
  return (
    <div className="iteration">
      <div className="top-button-group">
        <WithAuth pass={addAuth} tipProps={{ placement: 'bottom' }}>
          <Button type="primary" onClick={onCreate}>
            {i18n.t('project:new iteration')}
          </Button>
        </WithAuth>
      </div>
      <IF check={!isFetching && isEmpty(list)}>
        <EmptyListHolder />
      </IF>
      <Spin spinning={isFetching}>
        {map(list, renderIteration)}
        <div className="mt16 right-flex-box">
          <Pagination
            current={pageNo}
            pageSize={pageSize}
            total={total}
            onChange={onPageChange}
          />
        </div>
      </Spin>
      <IterationModal
        visible={state.modalVisible}
        data={state.curDetail as ITERATION.Detail}
        onClose={handleClose}
      />
    </div>
  );
};
