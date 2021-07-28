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
import { useUpdate } from 'common';
import i18n from 'i18n';
import { Input } from 'app/nusi';
import { debounce } from 'lodash';
import TypeSelect, { Item } from 'msp/pages/configuration/type-select';
import { getAdapters } from 'msp/services/configuration';

type LangItem = Merge<CONFIGURATION.ILangConf, Item>;
type Strategy = Merge<CONFIGURATION.IStrategy, Item>;

const convertStrategies = (item: CONFIGURATION.IStrategy): Strategy => {
  return {
    ...item,
    key: item.strategy,
    type: item.strategy,
  };
};

const accessMethods: Item[] = [
  {
    displayName: i18n.t('msp:manual installation'),
    key: 'manual',
    type: 'manual',
    iconProps: {
      fill: 'primary',
      size: '30px',
    },
  },
  {
    displayName: i18n.t('msp:automatic installation'),
    key: 'automatic',
    type: 'automatic',
    iconProps: {
      fill: 'primary',
      size: '30px',
    },
  },
];

interface IProps {
  title: string;
  children: React.ReactNode;
}

interface IState {
  serverName: string;
  strategies: Strategy[];
  lang: string;
  strategy: string;
  data: CONFIGURATION.ILangConf[];
}

const ItemRender = ({ title, children }: IProps) => {
  return (
    <div className="mb-6">
      <div className="font-medium color-text mb-3 text-base">{title}</div>
      {children}
    </div>
  );
};

const Configuration = () => {
  const [{ serverName, lang, strategy, strategies, data }, updater, update] = useUpdate<IState>({
    data: [],
    serverName: '',
    strategies: [],
    lang: '',
    strategy: '',
  });

  React.useEffect(() => {
    getAdapters.fetch().then((res) => {
      if (res.data) {
        updater.data(res.data);
      }
    });
  }, []);

  const handleQuery = React.useCallback(
    debounce((payload: Omit<IState, 'strategies' | 'data'>) => {
      console.log(payload);
    }, 500),
    [],
  );
  React.useEffect(() => {
    if (serverName) {
      handleQuery({
        lang,
        strategy,
        serverName,
      });
    }
  }, [lang, strategy, serverName, handleQuery]);

  const langList: LangItem[] = React.useMemo(() => {
    const newList = data.map((item) => {
      return {
        ...item,
        key: item.language,
        type: item.language,
      };
    });
    const newStrategies = newList?.[0].strategies.map(convertStrategies).filter((t) => t.enable);
    update({
      lang: newList?.[0].type,
      strategies: newStrategies,
      strategy: newStrategies?.[0].type,
    });
    return newList;
  }, [data, update]);

  const handleChangeLang = (type: string, item: LangItem) => {
    const newStrategies = item.strategies.map(convertStrategies).filter((t) => t.enable);
    update({
      lang: type,
      strategies: newStrategies,
      strategy: newStrategies?.[0].type,
    });
  };

  const handleChangeStrategy = (type: string) => {
    updater.strategy(type);
  };

  return (
    <div>
      <ItemRender title={i18n.t('msp:choose your language')}>
        <TypeSelect<LangItem> value={lang} list={langList} onChange={handleChangeLang} />
      </ItemRender>
      <ItemRender title={i18n.t('msp:choose data collection method')}>
        <div className="mb-3 color-text-desc">{i18n.t('msp:data collection desc')}</div>
        <TypeSelect<Strategy> list={strategies} value={strategy} onChange={handleChangeStrategy} />
      </ItemRender>
      <ItemRender title={i18n.t('msp:service name')}>
        <Input
          className="w-64"
          placeholder={i18n.t('please enter')}
          value={serverName}
          onChange={(e) => {
            updater.serverName(e.target.value);
          }}
          allowClear
        />
      </ItemRender>
      <ItemRender title={i18n.t('msp:choose access method')}>
        <TypeSelect<Item> list={accessMethods} />
        {serverName ? <div className="min bo" /> : null}
      </ItemRender>
    </div>
  );
};

export default Configuration;
