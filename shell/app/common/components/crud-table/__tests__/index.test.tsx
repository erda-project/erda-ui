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

import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { flushPromises } from 'test/utils';
import { Input } from 'antd';
import { createStore } from 'core/cube';
import { setConfig } from 'core/config';
import CRUDTable, { ITableProps } from '..';

interface IListItem {
  name: string;
  id: number;
}

type IProps = ITableProps<IListItem>;

describe('CRUDTable', () => {
  const filterConfig = [
    {
      type: Input,
      name: 'name',
      initialValue: 'erda',
    },
    {
      type: Input,
      name: 'org',
    },
  ];

  const list: IListItem[] = [
    {
      id: 1,
      name: 'erda cloud',
    },
  ];

  const getColumns = ({ onEdit, reloadList }) => {
    return [
      {
        title: 'NAME',
        dataIndex: 'name',
      },
      {
        title: 'operation',
        dataIndex: 'id',
        render: (v, record) => {
          return (
            <>
              <span
                onClick={() => {
                  onEdit(record);
                }}
              >
                editItem
              </span>
              <span onClick={reloadList}>reloadList</span>
            </>
          );
        },
      },
    ];
  };
  const getFieldsList = () => {
    return [
      {
        name: 'name',
        label: 'NAME',
      },
    ];
  };
  const setUp = (props?: Partial<IProps>) => {
    const clearListFn = jest.fn();
    const submitFn = jest.fn();
    const onModalCloseFn = jest.fn();
    const Comp = (c_props?: Partial<IProps>) => {
      return (
        <CRUDTable
          name="project"
          showTopAdd
          addAuthTooltipTitle="noAuth"
          handleFormSubmit={submitFn}
          {...(c_props as IProps)}
          getList={jest.fn()}
          getColumns={getColumns}
          clearList={clearListFn}
          onModalClose={onModalCloseFn}
        />
      );
    };
    const result = render(<Comp {...props} />);
    const rerender = (n_props?: Partial<IProps>) => {
      result.rerender(<Comp {...n_props} />);
    };
    return {
      result,
      rerender,
      clearListFn,
      submitFn,
      onModalCloseFn,
    };
  };
  beforeAll(() => {
    const browserHistory = {
      replace: jest.fn(),
    };
    setConfig('history', browserHistory);
  });
  afterAll(() => {
    setConfig('history', undefined);
  });

  it('should CRUDTable work well', async () => {
    const extraOperation = <div className="extraOperation">extraOperation</div>;
    const { result, rerender, clearListFn, onModalCloseFn, submitFn } = setUp({ showTopAdd: false });
    expect(result.baseElement).isExist('.top-button-group', 0);
    rerender({ extraOperation });
    expect(result.baseElement).isExist('.top-button-group', 1);
    expect(result.baseElement).isExist('.extraOperation', 1);
    expect(result.queryByText('add project')).toBeNull();
    rerender({
      extraOperation: () => {
        return <div className="fun-extraOperation">funExtraOperation</div>;
      },
    });
    expect(result.baseElement).isExist('.fun-extraOperation', 1);
    rerender({ getFieldsList, list });
    expect(result.queryByText('add project')).not.toBeNull();
    // open edit modal
    fireEvent.click(result.getByText('editItem'));
    await waitFor(() => expect(result.getByRole('dialog')).toBeInTheDocument());
    // close add/edit modal
    fireEvent.click(result.getByText('Cancel'));
    expect(onModalCloseFn).toHaveBeenCalled();
    // open add modal
    fireEvent.click(result.getByText('add project'));
    await waitFor(() => expect(result.getByRole('dialog')).toBeInTheDocument());
    fireEvent.change(result.getByRole('textbox'), { target: { value: 'erda' } });
    await flushPromises();
    await act(async () => {
      fireEvent.click(result.getByText('Ok'));
      await flushPromises();
    });
    expect(submitFn).toHaveBeenLastCalledWithNth(0, { name: 'erda' });
    const handleFormSubmitFn = jest.fn().mockResolvedValue({});
    rerender({ getFieldsList, handleFormSubmit: handleFormSubmitFn });
    // open add modal
    fireEvent.click(result.getByText('add project'));
    await waitFor(() => expect(result.getByRole('dialog')).toBeInTheDocument());
    fireEvent.change(result.getByRole('textbox'), { target: { value: 'erda' } });
    await flushPromises();
    await act(async () => {
      fireEvent.click(result.getByText('Ok'));
      await flushPromises();
    });
    expect(handleFormSubmitFn).toHaveBeenLastCalledWithNth(0, { name: 'erda' });
    rerender({ filterConfig });
    expect(result.container).isExist('form', 1);
    result.unmount();
    expect(clearListFn).toHaveBeenCalled();
  });
  it('should CRUDStoreTable work well', async () => {
    const getColumnsInStoreTable = (effect, { onEdit, reloadList }) => {
      return getColumns({ onEdit, reloadList });
    };
    const assertOperation = async (mockFn: jest.Mock, text: string) => {
      fireEvent.click(result.getByText(text));
      await waitFor(() => expect(result.getByRole('dialog')).toBeInTheDocument());
      fireEvent.change(result.getByRole('textbox'), { target: { value: 'erda' } });
      await flushPromises();
      await act(async () => {
        fireEvent.click(result.getByText('Ok'));
        await flushPromises();
      });
      expect(mockFn).toHaveBeenLastCalledWithNth(0, { name: 'erda' });
    };
    const getList = jest.fn();
    const addItem = jest.fn();
    const updateItem = jest.fn();
    const handleFormSubmitFn = jest.fn();
    const paging = { pageNo: 1 };
    const store = createStore({
      name: 'CRUDTable.StoreTable',
      state: {
        list,
        paging,
      },
    });
    const effects = {
      getList,
      addItem,
      updateItem,
    };
    const result = render(
      <CRUDTable.StoreTable
        showTopAdd
        name="project"
        store={{ ...store, effects }}
        getColumns={getColumnsInStoreTable}
        getFieldsList={getFieldsList}
        handleFormSubmit={handleFormSubmitFn}
      />,
    );
    await assertOperation(handleFormSubmitFn, 'add project');
    result.rerender(
      <CRUDTable.StoreTable
        showTopAdd
        name="project"
        store={{ ...store, effects }}
        getColumns={getColumnsInStoreTable}
        getFieldsList={getFieldsList}
      />,
    );
    await assertOperation(addItem, 'add project');
    await assertOperation(updateItem, 'editItem');
  });
});
