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
import { ArtifactsInfo } from './artifacts-info';
import VersionList from './version-list';
import i18n from 'i18n';
import { RadioTabs } from 'common';
import { useUpdate } from 'common/use-hooks';
import Authenticate from '../authenticate';
import SafetyManage from '../safety-manage';
import Statistics from '../statistics';
import ErrorReport from '../error-report';
import { ArtifactsTypeMap } from './config';
import { insertWhen } from 'app/common/utils';

import './artifacts-detail.scss';

interface IProps {
  artifactsId: string;
  data: PUBLISHER.IArtifacts;
}

const ArtifactsDetail = ({ data, artifactsId }: IProps) => {
  const [{ chosenTab }, updater] = useUpdate({
    chosenTab: '',
  });

  React.useEffect(() => {
    updater.chosenTab('info');
  }, [artifactsId, updater]);

  const TabCompMap = {
    info: <ArtifactsInfo data={data} />,
    version: <VersionList artifacts={data} />,
    certification: <Authenticate artifacts={data} />,
    safety: <SafetyManage artifacts={data} />,
    statistics: <Statistics artifacts={data} />,
    errorReport: <ErrorReport artifacts={data} />,
  };
  const isMobileApp = data.type === ArtifactsTypeMap.MOBILE.value;

  const tabs = [
    { value: 'info', label: i18n.t('configuration information') },
    { value: 'version', label: i18n.t('publisher:version content') },
    ...insertWhen(isMobileApp, [
      { value: 'certification', label: i18n.t('publisher:authenticate list') },
      { value: 'safety', label: i18n.t('publisher:safety management') },
      { value: 'statistics', label: i18n.t('publisher:statistics dashboard') },
      { value: 'errorReport', label: i18n.t('publisher:error report') },
    ]),
  ];

  return (
    <>
      <RadioTabs value={chosenTab} options={tabs} onChange={(v) => updater.chosenTab(v)} />
      <div className={`artifacts-content ${['statistics', 'errorReport'].includes(chosenTab) ? 'bg-lotion' : ''}`}>
        {TabCompMap[chosenTab] || null}
      </div>
    </>
  );
};

export default ArtifactsDetail;
