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
import { Button, Input } from 'app/nusi';
import i18n from 'i18n';

import './app-merge-description.scss';

const { TextArea } = Input;

export const MergeDes = () => {
  const placeholder = `### MR ${i18n.t('type')}
  - Bugfix (non-breaking change)
  - New feature (non-breaking change, ${i18n.t('application:just add new features')})
  - Breaking change (${i18n.t('application:modified or added features affect the original functionality')})
  - Refactor (non-breaking change)、

  ### ${i18n.t('application:what did this MR do?')}？
  > ${i18n.t('application:describe this mr here')}

  ### ${i18n.t('application:self-test situation')}
  > ${i18n.t('application:describe the situation of manual testing here')}
  > ${i18n.t('application:what-not-cover')}

  ### ${i18n.t('application:mr-tpl-unit-test')}
  > 1. ${i18n.t('application:prove-bug-fix')}
  > 2. ${i18n.t('application:local execution results of dev ut')}

  ### ${i18n.t('application:integration testing')}

  ### ${i18n.t('application:modification of diceyml')}
  > ${i18n.t('application:update-dice-yml-env')}`;

  return (
    <div className="merge-des">
      <Button disabled >{i18n.t('application:edit')}</Button>
      <div className="des-template">
        <div className="title">{i18n.t('application:description template')}</div>
        <TextArea disabled placeholder={placeholder} autoSize />
      </div>
    </div>
  );
};
