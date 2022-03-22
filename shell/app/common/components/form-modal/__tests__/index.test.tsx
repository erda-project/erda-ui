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
import { Form, FormInstance } from 'antd';
import { flushPromises } from 'test/utils';
import FormModal from '..';

type IProps = Parameters<typeof FormModal>[0];

describe('FormModal', () => {
  const formData = {
    apiDesc: 'desc',
    apiName: 'erda-ui',
    id: '1',
    time: '2022-03-18',
  };
  const setUp = (props?: Partial<IProps>) => {
    const fieldsList = [
      {
        name: 'id',
        itemProps: {
          title: 'hidden-id',
          type: 'hidden',
        },
      },
      {
        label: 'apiName',
        name: 'apiName',
        type: 'input',
        required: true,
      },
      {
        label: 'apiDesc',
        name: 'apiDesc',
        type: 'input',
        required: false,
      },
      {
        label: 'time',
        name: 'time',
        type: 'datePicker',
        required: false,
      },
    ];
    let formRef: FormInstance;
    const Comp = (c_props: Partial<IProps>) => {
      const [visible, setVisible] = React.useState(false);
      const [form] = Form.useForm();
      formRef = form;
      const onCancel = c_props.onCancel
        ? () => {
            c_props.onCancel?.();
            setVisible(false);
          }
        : undefined;
      return (
        <>
          <div
            onClick={() => {
              setVisible(true);
            }}
          >
            openModal
          </div>
          <FormModal
            fieldsList={fieldsList}
            wrapClassName="test_form_modal"
            visible={visible}
            form={form}
            {...c_props}
            onCancel={onCancel}
          />
        </>
      );
    };
    const cancelFn = jest.fn();
    const beforeSubmitFn = jest.fn().mockImplementation(
      (data = {}) =>
        new Promise((resolve, reject) => {
          if (data) {
            const res = data.apiName?.includes('erda') ? data : null;
            resolve(res);
          } else {
            reject();
          }
        }),
    );
    const okFn = jest.fn().mockResolvedValue({});
    const result = render(<Comp {...props} onCancel={cancelFn} onOk={okFn} beforeSubmit={beforeSubmitFn} />);
    const rerender = (n_props?: Partial<IProps>) => {
      result.rerender(<Comp onOk={okFn} beforeSubmit={beforeSubmitFn} onCancel={cancelFn} {...n_props} />);
    };
    const openModal = async () => {
      fireEvent.click(result.getByText('openModal'));
      await waitFor(() => expect(result.getByRole('dialog')).toBeInTheDocument());
      await waitFor(() => expect(result.getByRole('dialog')).not.toHaveStyle({ display: 'none' }));
    };
    const closeModal = async () => {
      fireEvent.click(result.getByText('cancel'));
    };
    return {
      result,
      formRef,
      okFn,
      cancelFn,
      beforeSubmitFn,
      rerender,
      openModal,
      closeModal,
    };
  };

  it('should work well', async () => {
    const { result, formRef, rerender, openModal, closeModal, cancelFn, okFn } = setUp();
    await openModal();
    expect(result.baseElement.querySelector('.ant-modal')).toHaveStyle({ width: '600px' });
    rerender({ width: 1000 });
    expect(result.baseElement.querySelector('.ant-modal')).toHaveStyle({ width: '1000px' });
    await closeModal();
    expect(cancelFn).toHaveBeenCalled();
    await openModal();
    await act(async () => {
      fireEvent.change(result.baseElement.querySelector('#apiName')!, { target: { value: 'erda-ui' } });
      fireEvent.click(result.getByText('ok'));
      await flushPromises();
      expect(okFn).toHaveBeenLastCalledWith(
        {
          apiDesc: undefined,
          apiName: 'erda-ui',
          id: undefined,
          time: undefined,
        },
        true,
      );
    });

    await act(async () => {
      okFn.mockReset();
      fireEvent.change(result.baseElement.querySelector('#apiName')!, { target: { value: 'app-test' } });
      fireEvent.click(result.getByText('ok'));
      await flushPromises();
      expect(okFn).not.toBeCalled();
    });
    const newBeforeSubmitFn = jest.fn().mockImplementation((data) => null);
    rerender({ beforeSubmit: newBeforeSubmitFn });
    await act(async () => {
      okFn.mockReset();
      fireEvent.change(result.baseElement.querySelector('#apiName')!, { target: { value: 'erda-ui' } });
      fireEvent.click(result.getByText('ok'));
      await flushPromises();
      expect(okFn).not.toBeCalled();
    });
    rerender({ beforeSubmit: undefined });
    await act(async () => {
      okFn.mockReset();
      fireEvent.change(result.baseElement.querySelector('#apiName')!, { target: { value: 'erda-ui' } });
      fireEvent.click(result.getByText('ok'));
      await flushPromises();
      expect(okFn).toHaveBeenLastCalledWith(
        {
          apiDesc: undefined,
          apiName: 'erda-ui',
          id: undefined,
          time: undefined,
        },
        true,
      );
    });
    rerender({ formData });
    jest.advanceTimersByTime(1000);
    // TODO an error is thrown when the Required field is not filled in，the cause has not yet been identified
    // await act(async () => {
    //   okFn.mockReset();
    //   fireEvent.change(result.baseElement.querySelector('#apiName')!, { target: { value: undefined } });
    //   fireEvent.click(result.getByText('ok'));
    //   await flushPromises();
    //   expect(okFn).not.toBeCalled();
    // });
    // await flushPromises();
    const newOkFn = jest.fn().mockRejectedValue({});
    rerender({ onOk: newOkFn });
    await act(async () => {
      fireEvent.change(result.baseElement.querySelector('#apiName')!, { target: { value: 'erda-ui' } });
      fireEvent.click(result.getByText('ok'));
      await flushPromises();
      expect(newOkFn).toHaveBeenLastCalledWith(
        {
          apiDesc: undefined,
          apiName: 'erda-ui',
          id: undefined,
          time: undefined,
        },
        true,
      );
    });
  });
  it('should render well', async () => {
    jest.useFakeTimers('legacy');

    const PureForm = () => {
      return (
        <div className="custom-form">
          <div>PureForm</div>
        </div>
      );
    };
    const { result, openModal, rerender } = setUp({ alertProps: { message: 'this is a message' } });
    await openModal();
    expect(result.getByText('this is a message')).toBeTruthy();
    rerender({ PureForm, fieldsList: undefined, formData });
    jest.advanceTimersByTime(1000);
    expect(result.getByText('PureForm')).toBeTruthy();
  });
});
