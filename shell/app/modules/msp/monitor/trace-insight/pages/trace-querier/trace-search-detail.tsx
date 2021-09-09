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
import PureTraceDetail from './trace-detail-new';
import traceStore from '../../../../stores/trace';
import { useLoading } from 'core/stores/loading';

export default ({ traceId }: { traceId?: string }) => {
  const spanDetailContent = traceStore.useStore((s) => s.spanDetailContent);
  const { getTraceDetailContent, getSpanDetailContent } = traceStore;
  const [loading] = useLoading(traceStore, ['getTraceDetailContent']);
  const [{ traceRecords }, updater] = useUpdate({ traceRecords: {} });

  React.useEffect(() => {
    if (traceId) {
      getTraceDetailContent({ traceId }).then((content) => {
        updater.traceRecords(content);
      });
    }
  }, [getTraceDetailContent, traceId, updater]);

  return (
    <PureTraceDetail
      spanDetailContent={spanDetailContent}
      traceDetailContent={traceRecords}
      isTraceDetailContentFetching={loading}
      getSpanDetailContent={getSpanDetailContent}
    />
  );
};
