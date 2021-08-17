import * as React from 'react';
import { TiledFilter } from 'common';

const FiledFilter = (props: CP_TILED_FILTER.Props) => {
  const { execOperation, operations, props: configProps, state } = props;
  const { fields, visible, ...rest } = configProps || {};

  const onChange = (val: Object) => {
    operations?.filter && execOperation(operations?.filter, { values: val });
  };
  if (visible) return null;

  return <TiledFilter {...rest} fields={fields} onChange={onChange} value={state.values} />;
};

export default FiledFilter;
