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
import { Build } from './build';
import { goTo } from 'app/common/utils';
import BuildForm from './build-form';
import i18n from 'i18n';
import buildStore from 'application/stores/build';
import routeInfoStore from 'app/common/stores/route';

const setup = { type: 'pipeline', addTitle: i18n.t('application:add pipeline'), categoryTitle: i18n.t('all branches'), iconType: 'fz' };

export const Pipeline = () => {
  const [visible, setVisible] = React.useState(false);
  const params = routeInfoStore.useStore(s => s.params);
  const { addPipeline: addPipelineCall, getComboPipelines } = buildStore.effects;

  const goToDetailLink = React.useCallback(({ pipelineID }: { comboPipelines?: BUILD.IComboPipeline[], branch?: string, ymlName?: string, pipelineID?: number }, replace?: boolean) => {
    const { projectId, appId } = params;
    pipelineID && goTo(goTo.pages.pipeline, { projectId, appId, pipelineID, replace });
  }, [params]);

  const addPipeline = (data: BUILD.CreatePipelineBody) => {
    addPipelineCall(data).then((detail: { id: number }) => {
      getComboPipelines().then(() => goToDetailLink({ pipelineID: detail.id }));
    });
    setVisible(false);
  };

  const renderCreateModal = () => (
    <BuildForm
      visible={visible}
      onCancel={() => { setVisible(false); }}
      title={i18n.t('application:add pipeline')}
      onOk={addPipeline}
    />
    // <FormModal
    //   title={i18n.t('application:add pipeline')}
    //   PureForm={BuildForm}
    //   onOk={addPipeline}
    //   modalProps={{
    //     footer:
    //   }}
    // />
  );

  return (
    <Build
      goToDetailLink={goToDetailLink}
      setup={setup}
      renderCreateModal={renderCreateModal}
      showModal={() => { setVisible(true); }}
    />
  );
};
