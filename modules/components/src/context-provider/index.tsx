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
