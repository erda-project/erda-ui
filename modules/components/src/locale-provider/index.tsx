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
import LocaleContext from './context';
import defaultLocaleData from '../locale/default';

export type LocaleComponentName = Exclude<keyof Locale, 'locale'>;

export interface Locale {
  locale: string;
  FormModal: {
    newForm: string;
    editForm: string;
  };
  Table: {
    emptyText: string;
    firstPage: string;
    ascend: string;
    descend: string;
    cancelSort: string;
    batchOperation: string;
    selectedItemsText: string;
    operation: string;
  };
  Pagination: {
    goToPage: string;
    totalText: string;
    pageSizeText: string;
  };
}

export interface LocaleProviderProps {
  locale: Locale;
  children?: React.ReactNode;
}

export function useLocaleReceiver<T extends LocaleComponentName>(
  componentName: T,
  defaultLocale?: Locale[T] | Function,
): [Locale[T]] {
  const erdaLocale = React.useContext(LocaleContext);

  const componentLocale = React.useMemo(() => {
    const locale = defaultLocale || defaultLocaleData[componentName || 'global'];
    const localeFromContext = componentName && erdaLocale ? erdaLocale[componentName] : {};

    return {
      ...(typeof locale === 'function' ? (locale as Function)() : locale),
      ...(localeFromContext || {}),
    };
  }, [componentName, defaultLocale, erdaLocale]);

  return [componentLocale];
}

/**
 * Replace with template.
 *   `I'm ${name}` + { name: 'bamboo' } = I'm bamboo
 */
export function replaceMessage(template: string, kv: Record<string, string>): string {
  return template.replace(/\$\{\w+\}/g, (str: string) => {
    const key = str.slice(2, -1);
    return kv[key];
  });
}
