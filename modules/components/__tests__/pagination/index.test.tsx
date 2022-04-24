import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErdaPagination from '../../src/pagination';
import userEvent from '@testing-library/user-event';

const TestPaginationComp = () => {
  const [current, setCurrent] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const onChange = (pageNo: number, size: number) => {
    setCurrent(pageNo);
    setPageSize(size);
  };

  return <ErdaPagination total={99} pageSize={pageSize} onChange={onChange} current={current} />;
};

describe('test Erda Pagination', () => {
  it('render basic pagination', () => {
    const { container } = render(<TestPaginationComp />);
    expect(screen.getByText('1 / 10')).toBeInTheDocument();
    const nextBtn = container.querySelector('.erda-pagination-next');
    expect(nextBtn).toBeVisible();
    userEvent.click(nextBtn!);
    expect(screen.getByText('2 / 10')).toBeInTheDocument();
  });
  it('render pagination quick jump', async () => {
    const { container } = render(<TestPaginationComp />);
    const preBtn = container.querySelector('.erda-pagination-pre');
    expect(preBtn).toHaveClass('disabled');

    const showBtn = container.querySelector('.erda-pagination-center');
    expect(showBtn).toBeVisible();
    userEvent.click(showBtn!);

    await waitFor(() => {
      const jumpContent = container.querySelector('.erda-pagination-jump');
      expect(jumpContent).toBeInTheDocument();
    });
    // @ts-ignore antd workaround
    document.getElementsByClassName('ant-popover')[0].style['pointer-events'] = 'auto';

    userEvent.type(container.querySelector('.paging-input')!, '3');
    const jumpBtn = container.querySelector('.erda-pagination-jump .erda-icon');
    userEvent.type(jumpBtn!, '{enter}');
    expect(screen.getByText('3 / 10')).toBeInTheDocument();

    // test page too large
    userEvent.click(showBtn!);
    userEvent.type(container.querySelector('.paging-input')!, '30');
    userEvent.type(jumpBtn!, '{enter}');
    expect(screen.getByText('10 / 10')).toBeInTheDocument();

    // test disable status
    const nextBtn = container.querySelector('.erda-pagination-next');
    expect(nextBtn).toHaveClass('disabled');
  });
});
