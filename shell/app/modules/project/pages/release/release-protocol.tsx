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
import DiceConfigPage, { useMock } from 'app/config-page';
import { RadioTabs } from 'common';
import { usePerm, WithAuth } from 'user/common';
import { Button } from 'antd';
import routeInfoStore from 'core/stores/route';
import i18n from 'i18n';
import { goTo } from 'common/utils';

interface IProps {
  isProjectRelease: boolean;
  applicationID?: number;
}

const ReleaseProtocol = ({ isProjectRelease, applicationID }: IProps) => {
  const [{ projectId }] = routeInfoStore.useStore((s) => [s.params]);
  const [canCreateRelease] = usePerm((s) => [s.project.release.create.pass]);
  const [isFormal, setIsFormal] = React.useState<string | number>('informal');
  const inParams = {
    isProjectRelease,
    isFormal: isFormal === 'formal',
    projectID: +projectId,
    applicationID,
  };

  const reloadRef = React.useRef<{ reload: () => void }>(null);

  React.useEffect(() => {
    reloadRef.current?.reload();
  }, [isFormal, applicationID]);

  const onCreate = () => {
    goTo(goTo.pages.projectReleaseCreate);
  };

  const options = [
    { value: 'informal', label: i18n.t('dop:informal') },
    { value: 'formal', label: i18n.t('dop:formal') },
  ];

  return (
    <>
      {isProjectRelease ? (
        <div className="top-button-group">
          <WithAuth pass={canCreateRelease}>
            <Button type={'primary'} onClick={onCreate}>
              {i18n.t('new {name}', { name: i18n.t('Artifact') })}
            </Button>
          </WithAuth>
        </div>
      ) : null}

      <RadioTabs
        options={options}
        value={isFormal}
        onChange={(v?: string | number) => {
          setIsFormal(v as string | number);
        }}
        className={`mb-2 ${isProjectRelease ? '' : 'pl-4'}`}
      />
      <DiceConfigPage
        scenarioKey="release-manage"
        scenarioType="release-manage"
        showLoading
        inParams={inParams}
        ref={reloadRef}
        customProps={{
          releaseTable: {
            props: {
              onRow: (record: RELEASE.ApplicationDetail) => ({
                onClick: () => {
                  record.id && goTo(`${record.id}`);
                },
              }),
            },
          },
        }}
      />
    </>
  );
};

export default ReleaseProtocol;
