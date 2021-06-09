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

import { map } from 'lodash';
import * as React from 'react';
import moment from 'moment';
import AnsiUp from 'ansi_up';
import 'common/components/log-content.scss';

const AU = new AnsiUp();

const TimeLogContent = ({ logs }) => {
  return (
    <div className="log-list-box">
      {map(logs, (log, i) => {
        return (
          <div key={i} className="log-item">
            <span className="log-item-logtime">
              {moment(parseInt(log.timestamp / 1000000, 10)).format('YYYY-MM-DD HH:mm:ss')}
            </span>
            <pre className="log-item-content" dangerouslySetInnerHTML={{ __html: AU.ansi_to_html(log.message) }} />
          </div>
        );
      })}
    </div>
  );
};
export default TimeLogContent;
