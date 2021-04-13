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
import { Drawer } from 'app/nusi';
import TestEnv from '../../../test-env/test-env';
import testEnvStore from 'project/stores/test-env';


const TestEnvDrawer = () => {
  const { envID, envType } = testEnvStore.useStore(s => s.envInfo);
  return (
    <Drawer
      destroyOnClose
      title={`${i18n.t('runtime:environment variable configs')}（#${envID}）`}
      width="50%"
      visible={!!envID}
      onClose={testEnvStore.closeEnvVariable}
    >
      <TestEnv envID={+envID} envType={envType} isSingle />
    </Drawer>
  );
};

export default TestEnvDrawer;
