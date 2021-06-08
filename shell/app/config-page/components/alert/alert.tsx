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

import * as React from 'react';
import { Alert } from 'app/nusi';
import { isArray, map } from 'lodash';
import './alert.scss';

export default (props: CP_ALERT.Props) => {
  const { props: configProps } = props || {};
  const { message, visible = true, ...rest } = configProps || {};

  if (!visible) return null;
  const msgComp = isArray(message) ? (
    <div>
      {map(message, (item, idx) => <pre className="mb8" key={idx}>{item}</pre>)}
    </div>
  ) : message;
  return (
    <Alert className="config-page-alert" message={msgComp} showIcon {...rest} />
  );
};

