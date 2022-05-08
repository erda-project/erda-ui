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

import { isEqual } from 'lodash';

expect.extend({
  isExist(received, selector, expect) {
    let pass = false;
    let count = 0;
    if (received) {
      count = received.querySelectorAll(selector).length;
      pass = count === expect;
    }
    return {
      pass,
      message: () => {
        return [
          this.utils.matcherHint(`${this.isNot ? '.not' : ''}.isExist`, selector, expect.toString()),
          `Expected: ${this.utils.EXPECTED_COLOR(expect)}`,
          `Received: ${this.utils.RECEIVED_COLOR(count)}`,
        ].join('\n');
      },
    };
  },
  isExistClass(received, selector, expect) {
    let classList: string[] = [];
    if (received) {
      const ele = received.querySelector(selector);
      classList = Array.from(ele?.classList || []);
    }
    const pass = classList.includes(expect);
    return {
      pass,
      message: () => {
        return [
          this.utils.matcherHint(`${this.isNot ? '.not' : ''}.isExistClass`, selector, expect.toString()),
          `Expected: ${this.utils.EXPECTED_COLOR(expect)}`,
          `Received: ${this.utils.RECEIVED_COLOR(classList.join(', '))}`,
        ].join('\n');
      },
    };
  },
  toHaveBeenLastCalledWithNth(received: jest.Mock, nthParams, expectParams) {
    const matcherName = 'toHaveBeenLastCalledWithNth';
    const callTimes = received.mock.calls.length;
    let pass = false;
    const options = {
      comment: 'deep equality',
      isNot: this.isNot,
      promise: this.promise,
    };
    if (!callTimes) {
      return {
        pass,
        message: () => {
          return [
            this.utils.matcherHint(matcherName, undefined, undefined, options),
            `Expected: ${this.utils.EXPECTED_COLOR('number of calls: >= 1')}`,
            `Received: ${this.utils.RECEIVED_COLOR('number of calls:    0')}`,
          ].join('\n');
        },
      };
    }
    const lastCalled = received.mock.calls[callTimes - 1];
    const params = lastCalled[nthParams];
    const isExpand = (expand?: boolean): boolean => expand !== false;
    if (typeof params === 'object') {
      pass = isEqual(params, expectParams);
    } else {
      pass = params === expectParams;
    }
    const message = pass
      ? () =>
          `${this.utils.matcherHint(matcherName, undefined, undefined, options)}\n\n` +
          `Expected: not ${this.utils.printExpected(expectParams)}\n${
            this.utils.stringify(expectParams) !== this.utils.stringify(params)
              ? `Received:     ${this.utils.printReceived(params)}`
              : ''
          }`
      : () =>
          `${this.utils.matcherHint(matcherName, undefined, undefined, options)}\n\n${this.utils.printDiffOrStringify(
            expectParams,
            params,
            'Expected',
            'Received',
            isExpand(this.expand),
          )}`;
    return {
      pass,
      message,
    };
  },
});
