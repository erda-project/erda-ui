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

expect.extend({
  isExit(received, selector, expect) {
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
          this.utils.matcherHint(`${this.isNot ? '.not' : ''}.isExit`, selector, expect.toString()),
          `Expected: ${this.utils.EXPECTED_COLOR(expect)}`,
          `Received: ${this.utils.EXPECTED_COLOR(count)}`,
        ].join('\n');
      },
    };
  },
});
