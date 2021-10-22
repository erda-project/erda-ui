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
import { useUpdate, Icon as CustomIcon, Copy } from 'common';
import { ShareOne as IconShareOne } from '@icon-park/react';
import PureTraceDetail from './trace-detail-new';
import monitorCommonStore from 'app/common/stores/monitorCommon';
import { useUnmount } from 'react-use';
import traceStore from '../../../../stores/trace';
import routeInfoStore from 'core/stores/route';
import { useLoading } from 'core/stores/loading';
import i18n from 'i18n';
import './trace-search-detail.scss';
import { goTo } from 'app/common/utils';

export default ({ traceId }: { traceId?: string }) => {
  const { getTraceDetailContent } = traceStore;
  const [loading] = useLoading(traceStore, ['getTraceDetailContent']);
  const [{ traceRecords }, updater] = useUpdate({ traceRecords: {} });
  const [{ traceId: _traceId }, currentRoute] = routeInfoStore.useStore((s) => [s.params, s.currentRoute]);
  const { setIsShowTraceDetail } = monitorCommonStore.reducers;
  const isShowTraceDetail = monitorCommonStore.useStore((s) => s.isShowTraceDetail);
  const id = traceId || _traceId;
  const [pathname, query] = window.location.href.split('?');
  const copyPath = _traceId ? pathname : `${pathname}/trace-detail/${traceId}${query ? `?${query}` : ''}`;

  React.useEffect(() => {
    if (_traceId) {
      setIsShowTraceDetail(true);
    }
    if (id) {
      getTraceDetailContent({ traceId: id }).then((content) => {
        updater.traceRecords(content);
      });
    }
  }, [_traceId, getTraceDetailContent, id, setIsShowTraceDetail, updater]);

  useUnmount(() => {
    setIsShowTraceDetail(false);
  });

  if (!isShowTraceDetail) {
    return null;
  }

  return (
    <div className="p-4 trace-search-detail">
      <div className="text-base mb-4 flex items-center">
        <CustomIcon
          type="arrow-left"
          className="text-3xl text-light-gray cursor-pointer"
          onClick={() => {
            setIsShowTraceDetail(false);
            if (_traceId) {
              if (currentRoute?.path?.includes('transaction')) {
                goTo(goTo.pages.mspServiceTransaction);
              } else if (currentRoute?.path?.includes('trace/debug')) {
                goTo(goTo.pages.mspTraceDebug);
              } else {
                goTo(goTo.pages.microTrace);
              }
            }
          }}
        />
        {i18n.t('msp:trace id')}: {id}
        <Copy selector=".cursor-copy">
          <span className="cursor-copy hover-text" data-clipboard-text={copyPath} data-clipboard-tip={i18n.t('link')}>
            <IconShareOne className="hover-active ml-5" size="16px" />
          </span>
        </Copy>
      </div>
      <PureTraceDetail traceDetailContent={traceRecords} isTraceDetailContentFetching={loading} />
    </div>
  );
};
