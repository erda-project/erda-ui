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
import LocaleContext from '../locale-provider/context';
import { Locale } from '../locale-provider';
import defaultLocaleValues from '../locale/default';

interface IContext {
  clsPrefix: string;
}

export const Context = React.createContext<IContext>({
  clsPrefix: 'erda',
});

const ContextProvider = ({
  children,
  locale,
  clsPrefix,
}: Partial<IContext> & { children: React.ReactNode; locale?: Locale }) => {
  const contextValue = React.useMemo(() => ({ clsPrefix: clsPrefix ?? 'erda' }), [clsPrefix]);

  return (
    <Context.Provider value={contextValue}>
      <LocaleContext.Provider value={locale ?? defaultLocaleValues}>{children}</LocaleContext.Provider>
    </Context.Provider>
  );
};

export default ContextProvider;
