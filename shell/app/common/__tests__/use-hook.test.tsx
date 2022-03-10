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

import { act, renderHook } from '@testing-library/react-hooks';
import { useSwitch } from '../use-hooks';

describe('use-hooks', () => {
  describe('useSwitch', () => {
    const setUp = (init: boolean) => renderHook(() => useSwitch(init));
    it('should be defined', () => {
      expect(useSwitch).toBeDefined();
    });
    it('should work well', () => {
      const { result } = setUp(true);
      const [bool, on, off, toggle] = result.current;
      expect(bool).toEqual(true);
      act(() => {
        off();
      });
      expect(result.current[0]).toEqual(false);
      act(() => {
        on();
      });
      expect(result.current[0]).toEqual(true);
      act(() => {
        toggle();
      });
      expect(result.current[0]).toEqual(false);
    });
  });
});
