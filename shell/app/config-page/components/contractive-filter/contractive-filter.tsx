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
import { ContractiveFilter } from 'common';
import { useMount } from 'react-use';


export const Filter = (props: CP_FILTER.Props) => {
  const { state, execOperation, operations, props: configProps, customProps } = props;
  const { delay, visible = true, fullWidth = false } = configProps || {};

  const [conditions, setConditions] = React.useState([] as CP_FILTER.Condition[]);
  const conditionsRef = React.useRef(null as any);

  const onConditionsChange = React.useCallback((c: CP_FILTER.Condition[]) => {
    setConditions(c);
  }, []);

  React.useEffect(() => {
    conditionsRef.current = conditions;
  }, [conditions]);

  const { values, conditions: stateConditions } = state || {};

  useMount(() => {
    customProps?.onFilterChange && customProps.onFilterChange(state);
  });

  React.useEffect(() => {
    customProps?.onFilterChange && customProps.onFilterChange(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  const onChange = (value: Obj) => {
    execOperation(operations?.filter, { values: value, conditions: conditionsRef.current });
    customProps?.onFilterChange && customProps.onFilterChange(value);
  };

  const onQuickSelect = ({ key, value }: { key: string, value: any }) => {
    execOperation(operations && operations[key], { values, conditions: conditionsRef.current });
  };

  if (!visible) {
    return null;
  }

  return (
    <ContractiveFilter conditions={stateConditions as any} values={values} delay={delay || 1000} onChange={onChange} onQuickSelect={onQuickSelect} onConditionsChange={onConditionsChange} fullWidth={fullWidth} />
  );
};
