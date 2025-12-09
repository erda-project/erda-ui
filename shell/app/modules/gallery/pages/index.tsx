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
import galleryHeader from 'app/images/gallery-header.jpg';
import { getServiceTypes, getServiceList } from 'gallery/services';
import routeInfoStore from 'core/stores/route';
import { SimpleTabs, ErdaIcon, Ellipsis, Responsive, EmptyHolder } from 'common';
import { useEffectOnce } from 'react-use';
import { Input, Spin } from 'antd';
import { debounce, throttle } from 'lodash';
import { useUpdateSearch } from 'common/use-hooks';
import defaultMarketServiceSvg from 'app/images/default-market-service.svg';
import { goTo } from 'app/common/utils';
import i18n from 'i18n';
import './index.scss';

const Market = () => {
  const routeQuery = routeInfoStore.useStore((s) => s.query);
  const [typesData] = getServiceTypes.useState();
  const [data, loading] = getServiceList.useState();
  const types = typesData?.list || [];
  const list = data?.list || [];
  const [subType, setSubType] = React.useState(routeQuery.subType);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [tabFixed, setTabFixed] = React.useState(false);
  const [searchKey, setSearchKey] = React.useState<string | undefined>(routeQuery.keyword);

  React.useEffect(() => {
    document.title = 'Gallery · Erda';

    return () => {
      document.title = 'Erda';
    };
  }, []);

  const [query, setQuery] = React.useState<MARKET.ServiceReq>({
    type: routeQuery.type || '',
    keyword: routeQuery.keyword,
  });

  const useTabs = (types || []).map((item) => {
    return {
      key: item.type,
      text: item.displayName,
      children: item.children?.map((subItem) => ({ ...subItem, text: subItem.name })),
    };
  });

  const [setUrlQuery] = useUpdateSearch({
    reload: (v?: Obj) => {
      if (v?.type) {
        const { subType: _subType, ...rest } = v || {};
        setSubType(_subType);
        setSearchKey(rest.keyword);
        setQuery((prev) => ({ ...prev, ...rest }));
      }
    },
  });

  React.useEffect(() => {
    setUrlQuery({ ...query, subType });
  }, [query, subType]);

  const debounceChange = React.useCallback(
    debounce((v) => setQuery((prev) => ({ ...prev, keyword: v })), 300),
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

  React.useEffect(() => {
    if (!query.type && types.length) {
      setQuery((prev) => ({ ...prev, type: types[0].type }));
    }
  }, [query.type, types]);

  React.useEffect(() => {
    query.type &&
      getServiceList.fetch({
        pageNo: 1,
        pageSize: 1000,
        ...query,
      });
  }, [query]);

  const useList = subType ? list?.filter((item) => item.catalog === subType) : list;

  return (
    <div className="h-full bg-white overflow-auto relative" ref={containerRef}>
      <div className="bg-cover mx-4 bg-top h-[200px] rounded-b" style={{ backgroundImage: `url(${galleryHeader})` }} />
      <div className={`pt-3 px-4 pb-2 w-full bg-white sticky top-0 z-10 ${tabFixed ? 'shadow' : ''}`}>
        <div className="w-[160] h-[26px] my-3 font-sans">
          <span className="text-blue-deep text-3xl font-bold leading-[26px]">G</span>
          <span className="text-3xl font-bold text-black  leading-[26px]">allery</span>
        </div>
        <div className="mt-4 flex-h-center justify-between">
          <SimpleTabs
            value={subType || query.type}
            tabs={useTabs}
            onSelect={(v: string, mainV = '') => {
              if (tabFixed) {
                containerRef.current && (containerRef.current.scrollTop = 200);
              }
              setSubType(mainV === v ? '' : v);
              if (mainV !== query.type) {
                setSearchKey(undefined);
                setQuery((prev) => ({ ...prev, keyword: undefined, type: mainV }));
              }
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
            <Responsive itemWidth={326} className="gallery-lists flex-1">
              {
                useList?.map((item) => {
                  return (
                    <ServiceCard
                      key={item.id}
                      data={item}
                      onClick={() => goTo(goTo.pages.galleryDetail, { id: item.id })}
                    />
                  );
                }) as Array<{ key: string }> | React.ReactChild
              }
            </Responsive>
          </div>
          {!useList?.length ? <EmptyHolder relative /> : null}
        </Spin>
      </div>
    </div>
  );
};

const ServiceCard = ({ data, onClick }: { data: MARKET.Service; onClick: () => void }) => {
  return (
    <div className="flex-h-center cursor-pointer py-4 gallery-service group" onClick={onClick}>
      <div className="w-16 h-16 mr-3 rounded p-2 bg-default-06">
        <img src={data.logoURL || defaultMarketServiceSvg} className="w-full h-full mr-3 rounded" />
      </div>
      <div className="w-[250px] info-container">
        <Ellipsis
          className="text-default group-hover:text-blue-deep leading-[22px]"
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
