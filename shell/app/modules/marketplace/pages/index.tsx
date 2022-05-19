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
import marketplaceHeader from 'app/images/marketplace-header.jpeg';
import { getServiceTypes, getServiceList } from 'marketplace/services';
import routeInfoStore from 'core/stores/route';
import { SimpleTabs, ErdaIcon, Pagination, Ellipsis, Responsive } from 'common';
import { useEffectOnce, useUpdateEffect } from 'react-use';
import { Input, Spin } from 'antd';
import { debounce, throttle } from 'lodash';
import defaultMarketServiceSvg from 'app/images/default-market-service.svg';
import { goTo, getDefaultPaging } from 'app/common/utils';
import i18n from 'i18n';
import './index.scss';

const Market = () => {
  const type = routeInfoStore.useStore((s) => s.params.type);
  const [typesData] = getServiceTypes.useState();
  const [data, loading] = getServiceList.useState();
  const types = typesData?.list || [];
  const list = data?.list || [];
  const paging = data?.paging || getDefaultPaging();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [tabFixed, setTabFixed] = React.useState(false);
  const [searchKey, setSearchKey] = React.useState('');

  React.useEffect(() => {
    document.title = `${i18n.t('Marketplace')} · Erda`;

    return () => {
      document.title = 'Erda';
    };
  }, []);

  const [query, setQuery] = React.useState<MARKET.ServiceReq>({
    pageNo: paging.pageNo,
    pageSize: paging.pageSize,
    type,
    keyword: '',
  });

  const debounceChange = React.useCallback(
    debounce((v) => setQuery((prev) => ({ ...prev, keyword: v, pageNo: 1 })), 300),
    [],
  );

  const handleScroll = React.useCallback(
    throttle(() => {
      setTabFixed((containerRef.current?.scrollTop || 0) > 200);
    }, 100),
    [],
  );

  useEffectOnce(() => {
    getServiceTypes.fetch();
    containerRef.current?.addEventListener('scroll', handleScroll);
    return () => {
      containerRef.current?.removeEventListener('scroll', handleScroll);
    };
  });

  useUpdateEffect(() => {
    setSearchKey('');
    setQuery((prev) => ({ ...prev, type, keyword: '', pageNo: 1 }));
  }, [type]);

  const fullTypes = React.useMemo(
    () => [{ type: 'all', name: 'all', displayName: i18n.t('common:All') }, ...(types || [])],
    [types],
  );

  React.useEffect(() => {
    types.length &&
      getServiceList.fetch({
        ...query,
        type: query.type === 'all' ? undefined : fullTypes.find((item) => item.name === query.type)?.type,
      });
  }, [query, types]);

  return (
    <div className="h-full bg-white overflow-auto relative" ref={containerRef}>
      <div
        className="bg-cover mx-4 bg-top h-[200px] rounded-b"
        style={{ backgroundImage: `url(${marketplaceHeader})` }}
      />
      <div className={`pt-3 px-4 pb-2 w-full bg-white sticky top-0 z-10 ${tabFixed ? 'shadow' : ''}`}>
        <div className="w-[160px] h-[26px] flex-h-center my-3">
          <ErdaIcon type="Marketplace" size={160} />
        </div>
        <div className="mt-4 flex-h-center justify-between">
          <SimpleTabs
            value={type}
            tabs={(fullTypes || []).map((item) => ({ key: item.name, text: item.displayName }))}
            onSelect={(v) => {
              goTo(goTo.pages.marketplaceRoot, { type: v });
            }}
          />
          <Input
            className="bg-black-06 w-[180px]"
            placeholder={i18n.t('Search by keyword-char')}
            bordered={false}
            prefix={<ErdaIcon type="search" size="16" fill="default-3" />}
            value={searchKey}
            onChange={(e) => {
              setSearchKey(e.target.value);
              debounceChange(e.target.value);
            }}
            size="small"
          />
        </div>
      </div>

      <div className="px-4">
        <Spin spinning={loading}>
          <div className="flex flex-wrap ">
            <Responsive itemWidth={326} className="marketplace-lists flex-1">
              {
                list?.map((item) => {
                  return (
                    <ServiceCard
                      key={item.id}
                      data={item}
                      onClick={() => goTo(goTo.pages.marketplaceDetail, { type, id: item.id })}
                    />
                  );
                }) as Array<{ key: string }> | React.ReactChild
              }
            </Responsive>
          </div>
        </Spin>
        <Pagination
          onChange={(no: number, size: number) => {
            setQuery((prev) => ({ ...prev, pageSize: size, pageNo: no }));
          }}
          current={paging.pageNo}
          total={paging.total}
          pageSize={paging.pageSize}
        />
      </div>
    </div>
  );
};

const ServiceCard = ({ data, onClick }: { data: MARKET.Service; onClick: () => void }) => {
  return (
    <div className="flex-h-center cursor-pointer py-4 marketplace-service group" onClick={onClick}>
      <div className="w-16 h-16 mr-3 rounded p-2 bg-default-06">
        <img src={data.logoURL || defaultMarketServiceSvg} className="w-full h-full mr-3 rounded" />
      </div>
      <div className="w-[250px] info-container">
        <Ellipsis
          className="text-default group-hover:text-purple-deep leading-[22px]"
          title={data.displayName || data.name}
        />
        <Ellipsis className="text-default-8 text-xs leading-5" title={data.summary || '-'} />
        <div className="text-default-6 text-xs leading-4">{`${i18n.t('by {name}', { name: data.orgName })}`}</div>
        <div className="flex-h-center mt-2">
          <div className="flex-h-center bg-default-06 text-xs text-default-8 leading-6 px-2 rounded-2xl">
            {data.typeName || '-'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Market;
