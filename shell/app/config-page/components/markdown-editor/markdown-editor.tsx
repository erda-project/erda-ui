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
import { MarkdownEditor } from 'common';

export default (props: CP_MARKDOWN_EDITOR.Props) => {
  const { props: configProps, state, operations, execOperation } = props || {};
  const [value, setValue] = React.useState(state.value);

  const { visible, ...rest } = configProps || {};

  React.useEffect(() => {
    setValue(state.value);
  }, [state.value]);

  const onChange = (val: string) => {
    setValue(val);
  };

  const onSubmit = operations?.submit
    ? () => {
        execOperation(operations.submit, { value });
      }
    : undefined;

  if (visible === false) return null;

  return <MarkdownEditor {...rest} value={value} onChange={onChange} onSubmit={onSubmit} />;
};
