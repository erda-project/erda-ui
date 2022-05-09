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
import { SimpleTabs, ErdaIcon, Pagination, Ellipsis } from 'common';
import { useEffectOnce, useUpdateEffect } from 'react-use';
import { Input, Spin } from 'antd';
import { debounce, throttle } from 'lodash';
import { goTo, getDefaultPaging } from 'app/common/utils';
import i18n from 'i18n';
import './index.scss';

const Market = () => {
  const type = routeInfoStore.useStore((s) => s.params.type);
  const [types] = getServiceTypes.useState();
  const [data, loading] = getServiceList.useState();
  const list = data?.list || [];
  const paging = data?.paging || getDefaultPaging();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [searchKey, setSearchKey] = React.useState('');
  const [tabFixed, setTabFixed] = React.useState(false);
  const [width, setWidth] = React.useState<undefined | number>(0);
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

  const handleResize = React.useCallback(
    throttle(() => {
      setWidth(containerRef.current?.offsetWidth);
      handleScroll();
    }, 100),
    [],
  );

  useEffectOnce(() => {
    getServiceTypes.fetch();
    setWidth(containerRef.current?.offsetWidth);
    containerRef.current?.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeEventListener('scroll', handleScroll);
    };
  });

  useUpdateEffect(() => {
    setSearchKey('');
    setQuery((prev) => ({ ...prev, type, keyword: '', pageNo: 1 }));
  }, [type]);

  const fullTypes = React.useMemo(() => [{ name: 'all', displayName: '全部' }, ...(types || [])], [types]);

  React.useEffect(() => {
    getServiceList.fetch(query);
  }, [query]);

  return (
    <div className="h-full mr-4 bg-white overflow-auto relative" ref={containerRef}>
      <div className="px-2 marketplace">
        <div className="bg-cover bg-top h-[200px] rounded-b" style={{ backgroundImage: `url(${marketplaceHeader})` }} />
        <div className="mt-[88px]">
          <Spin spinning={loading}>
            <div className="flex flex-wrap marketplace-lists">
              {list?.map((item) => {
                return (
                  <ServiceCard
                    key={item.id}
                    data={item}
                    onClick={() => goTo(goTo.pages.marketplaceDetail, { type, id: item.id })}
                  />
                );
              })}
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
      <div
        className={`pt-3 px-2 pb-2 ${tabFixed ? 'marketplace-tab-fixed' : 'absolute top-[200px]'}`}
        style={{ width }}
      >
        <div className="w-[160px] h-[26px] flex-h-center my-3">
          <ErdaIcon type="Marketplace" size={160} />
        </div>
        <div className="mt-2 flex-h-center justify-between">
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
            value={searchKey}
            onChange={(e) => {
              setSearchKey(e.target.value);
              debounceChange(e.target.value);
            }}
            size="small"
          />
        </div>
      </div>
    </div>
  );
};

const ServiceCard = ({ data, onClick }: { data: MARKET.Service; onClick: () => void }) => {
  return (
    <div className="flex-h-center cursor-pointer py-4 marketplace-service" onClick={onClick}>
      <div className="w-16 h-16 mr-3 rounded p-2 bg-default-04">
        <img src={data.logoURL} className="w-full h-full mr-3 rounded" />
      </div>
      <div className="w-[180px] info-container">
        <div className="text-default leading-[22px]">{data.displayName || data.name}</div>
        <Ellipsis className="text-default-8 text-xs leading-5" title={data.summary} />
        <div className="text-default-6 text-xs leading-4">{data.type}</div>
        <div className="flex-h-center mt-2">
          <div className="flex-h-center bg-default-04 text-xs text-default-8 leading-6 px-3 rounded-2xl">
            {i18n.d('了解更多')}
          </div>
          <div className="text-default-6 leading-4 transform scale-75">{`by ${data.orgName}`}</div>
        </div>
      </div>
    </div>
  );
};

export default Market;
