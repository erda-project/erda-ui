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
import routeInfoStore from 'core/stores/route';
import { getReleaseDetail } from 'project/services/release';
import ReleaseForm from './form';
import ReleaseApplicationDetail from './application-detail';

const ReleaseUpdate = () => {
  const { params } = routeInfoStore.getState((s) => s);
  const { releaseID } = params;
  const [releaseDetail, setReleaseDetail] = React.useState<RELEASE.ReleaseDetail>({} as RELEASE.ReleaseDetail);
  const { isProjectRelease } = releaseDetail;

  const getDetail = React.useCallback(async () => {
    if (releaseID) {
      const res = await getReleaseDetail({ releaseID });
      const { data } = res;
      if (data) {
        setReleaseDetail(data);
      }
    }
  }, [releaseID, setReleaseDetail]);

  React.useEffect(() => {
    getDetail();
  }, [getDetail]);

  return <div>{isProjectRelease ? <ReleaseForm /> : <ReleaseApplicationDetail isEdit={true} />}</div>;
};

export default ReleaseUpdate;
