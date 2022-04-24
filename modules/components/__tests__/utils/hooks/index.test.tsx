import { renderHook } from '@testing-library/react-hooks';
import { usePrefixCls } from '../../../src/_util/hooks';

describe('test hooks', () => {
  it('should render usePrefixCls well', async () => {
    const { result } = renderHook(() => usePrefixCls('table'));
    expect(result.current).toEqual(['erda-table', 'ant-table']);
  });
});
