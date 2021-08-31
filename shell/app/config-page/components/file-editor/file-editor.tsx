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
import { FileEditor as PureFileEditor } from 'common';

const FileEditor = (props: CP_FILE_EDITOR.Props) => {
  const { props: pProps, state } = props;
  const [value, setValue] = React.useState(state.value);

  React.useEffect(() => {
    setValue(state.value);
  }, [state.value]);

  const onChange = (val: string) => {
    setValue(val);
  };

  return <PureFileEditor fileExtension="json" value={value} onChange={onChange} {...pProps} />;
};

export default FileEditor;
