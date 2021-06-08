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

import * as React from 'react';
import { AddonCardList } from 'addonPlatform/pages/common/components/addon-card-list';
import i18n from 'i18n';
import workBenchStore from 'workBench/stores';
import { useLoading } from 'app/common/stores/loading';
import { useEffectOnce } from 'react-use';


const AddonCategory = () => {
  const addonCategory = workBenchStore.useStore((s) => s.addonCategory);
  const [loading] = useLoading(workBenchStore, ['getWorkBenchAddons']);
  useEffectOnce(() => {
    workBenchStore.getWorkBenchAddons();

    return () => workBenchStore.clearWorkBenchAddons();
  });
  return (
    <AddonCardList
      addonCategory={addonCategory}
      isFetching={loading}
      searchProps={['projectName', 'applicationName']}
      searchPlaceHolder={i18n.t('workBench:search by owning project')}
    />
  );
};

const AddonCategoryWrapper = AddonCategory;

export { AddonCategoryWrapper as AddonCategory };
