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
import i18n from 'i18n';
import { Switch, message } from 'app/nusi';
import { usePerm, WithAuth } from 'user/common';
import repoStore from 'application/stores/repo';

interface IProps {
  appDetail: IApplication;
}

const RepoSetting = (props: IProps) => {
  const { appDetail } = props;
  const [info] = repoStore.useStore(s => [s.info]);
  const [isLocked, setIsLocked] = React.useState(false);
  const operationAuth = usePerm(s => s.app.setting.repoSetting.lockRepo.pass);

  React.useEffect(() => {
    setIsLocked(info.isLocked);
  }, [info.isLocked]);

  const { setRepoLock } = repoStore.effects;

  const onLockChange = (checked: boolean) => {
    setRepoLock({ isLocked: checked }).then(() => {
      setIsLocked(checked);
      message.success(i18n.t('default:setting successfully'));
    });
  };

  return (
    <div className='mb12'>
      {i18n.t('lock repository')}：
      <WithAuth pass={operationAuth && !appDetail.isExternalRepo} >
        <Switch
          checkedChildren={i18n.t('open')}
          unCheckedChildren={i18n.t('close')}
          onChange={onLockChange}
          checked={isLocked}
        />
      </WithAuth>
    </div>
  );
};

export default RepoSetting;
