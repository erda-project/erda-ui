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
import DiceConfigPage from 'app/config-page';
import { RadioTabs, ErdaIcon } from 'common';
import { usePerm, WithAuth } from 'user/common';
import { Button, Dropdown, Menu } from 'antd';
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

  const onCreate = (type: string) => {
    goTo(goTo.resolve.projectReleaseCreate({ type }));
  };

  const options = [
    { value: 'informal', label: i18n.t('dop:informal') },
    { value: 'formal', label: i18n.t('dop:formal') },
  ];

  const addDropdownMenu = (
    <Menu className="bg-default">
      <Menu.Item onClick={() => onCreate('app')} key={'app'} className="bg-default hover:bg-white-08">
        <div className="flex-h-center text-white-9">
          <ErdaIcon type="tj1" size={16} className="mr-1" />
          {i18n.t('dop:select apps create')}
        </div>
      </Menu.Item>
      <Menu.Item onClick={() => onCreate('file')} key={'file'} className="bg-default hover:bg-white-08">
        <div className="flex-h-center text-white-9">
          <ErdaIcon type="upload" size={16} className="mr-1" />
          {i18n.t('dop:select file create')}
        </div>
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      {isProjectRelease ? (
        <div className="top-button-group">
          <WithAuth pass={canCreateRelease}>
            <Dropdown overlay={addDropdownMenu} placement="bottomRight" trigger={['click']}>
              <Button type={'primary'} className="bg-default flex-h-center">
                {i18n.t('new {name}', { name: i18n.t('Artifact') })}
                <ErdaIcon type="caret-down" size="18" color="currentColor" className="ml-1 text-white-400" />
              </Button>
            </Dropdown>
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
