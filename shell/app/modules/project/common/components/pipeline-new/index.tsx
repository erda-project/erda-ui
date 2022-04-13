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
import { Spin, message } from 'antd';
import { useUpdate } from 'common/use-hooks';
import routeInfoStore from 'core/stores/route';
import PiplelineGuide from './guide';
import PiplelineCategory from './category';
import PipelineList from './list';
import PipelineFormDrawer from './form';
import { oneClickCreatePipeline } from 'project/services/pipeline';

import './index.scss';

interface IState {
  categoryAdd: { appID: number; visible: boolean };
  chosenCategory: undefined | { key: string; rules?: string[] };
}

interface ReloadRef {
  reload: () => void;
}

const Pipeline = () => {
  const [{ projectId, appId }, { pipelineCategory }] = routeInfoStore.useStore((s) => [s.params, s.query]);

  const [loading, setLoading] = React.useState(false);

  const listRef = React.useRef<ReloadRef>(null);
  const guideRef = React.useRef<ReloadRef>(null);
  const categoryRef = React.useRef<ReloadRef>(null);

  const [{ categoryAdd, chosenCategory }, updater, update] = useUpdate<IState>({
    categoryAdd: {
      appID: 0,
      visible: false,
    },
    chosenCategory: undefined,
  });

  const onChangeCategory = (category: { key: string; rules?: string[] }) => {
    updater.chosenCategory(category);
  };

  const onAddPipeline = (_appId = 0) => {
    updater.categoryAdd({ appID: _appId, visible: true });
  };
  const onAddCategaryClose = React.useCallback(() => {
    updater.categoryAdd({ appID: 0, visible: false });
  }, [updater]);

  const addPipeliningQuickly = (appID: string, branch: string, ymls: string[]) => {
    const params = {
      projectID: projectId,
      appID,
      sourceType: 'erda',
      ref: branch,
      pipelineYmls: ymls,
    };

    setLoading(true);

    oneClickCreatePipeline
      .fetch(params)
      .then((res) => {
        const { success, data } = res;
        const { errMsg } = data || {};
        if (success) {
          categoryRef.current?.reload();
          listRef.current?.reload();
          guideRef.current?.reload();
        }

        if (errMsg) {
          message.warn({
            content: errMsg,
            style: { whiteSpace: 'pre-wrap' },
          });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="h-full flex flex-col">
      <Spin spinning={loading}>
        <PiplelineGuide
          addPipeliningQuickly={addPipeliningQuickly}
          projectId={projectId}
          appId={appId}
          ref={guideRef}
        />
      </Spin>
      <div className="common-pipeline flex-1 flex bg-white min-h-0 mb-4">
        <PiplelineCategory
          ref={categoryRef}
          appId={appId}
          onChange={onChangeCategory}
          projectId={projectId}
          className="pipeline-category-container flex-shrink-0"
        />
        <div className="flex-1 pt-2 h-full min-w-0">
          {pipelineCategory ? (
            <PipelineList
              ref={listRef}
              appId={appId}
              projectId={projectId}
              onAddPipeline={onAddPipeline}
              pipelineCategory={pipelineCategory}
              updateCategory={() => {
                categoryRef.current?.reload();
              }}
            />
          ) : null}
        </div>
      </div>

      <PipelineFormDrawer
        {...categoryAdd}
        fixedApp={appId}
        onCancel={onAddCategaryClose}
        pipelineCategory={chosenCategory}
        onOk={() => {
          categoryRef.current?.reload();
          listRef.current?.reload();
          guideRef.current?.reload();
          onAddCategaryClose();
        }}
      />
    </div>
  );
};

export default Pipeline;
