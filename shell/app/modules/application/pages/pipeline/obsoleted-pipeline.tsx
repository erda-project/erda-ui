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
import { Alert } from 'antd';
import { goTo } from 'common/utils';
import ObsoletedPipeline from 'application/pages/obsoleted-pipeline';
import i18n from 'i18n';

const Pipeline = () => {
  return (
    <div className="flex flex-col h-full">
      <Alert
        type="info"
        message={
          <span className="">
            {i18n.t(
              'dop:The new pipeline page is in the trial stage, you can manually switch to the new version to experience.',
            )}
            <span
              onClick={() => {
                goTo(goTo.pages.pipelineNewRoot);
              }}
              className="text-blue-deep cursor-pointer"
            >
              {i18n.t('dop:Try it right now')}
            </span>
          </span>
        }
        className="mb-2 bg-blue-1 border-blue"
      />
      <ObsoletedPipeline />
    </div>
  );
};

export default Pipeline;
