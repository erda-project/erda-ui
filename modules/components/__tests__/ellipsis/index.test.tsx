import React from 'react';
import { act, fireEvent, render, RenderResult, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Ellipsis from '../../src/ellipsis';

describe('Ellipsis', () => {
  const setDomBounding = (data: Partial<HTMLElement>) => {
    Object.keys(data ?? {}).forEach((prop) => {
      Object.defineProperty(HTMLElement.prototype, prop, {
        configurable: true,
        writable: true,
        // @ts-ignore no fix
        value: data[prop],
      });
    });
  };
  const title = 'this is a very long text';
  const triggerEvent = (result: RenderResult) => {
    act(() => {
      fireEvent.mouseEnter(result.getByText(title));
      jest.runAllTimers();
      userEvent.hover(result.container.querySelector('.erda-ellipsis')!);
    });
  };
  it('should work well', async () => {
    jest.useFakeTimers();
    const result = render(<Ellipsis title={title} />);
    triggerEvent(result);
    await waitFor(() => expect(result.queryByRole('tooltip')).not.toBeInTheDocument());
    setDomBounding({ offsetWidth: 200, scrollWidth: 199, clientWidth: 200 });
    triggerEvent(result);
    await waitFor(() => expect(result.queryByRole('tooltip')).not.toBeInTheDocument());
    setDomBounding({ offsetWidth: 100, scrollWidth: 200, clientWidth: 100 });
    triggerEvent(result);
    await waitFor(() => expect(result.queryByRole('tooltip')).toBeInTheDocument());
    expect(result.getAllByText(title)).toHaveLength(2);
    jest.useRealTimers();
  });
});
