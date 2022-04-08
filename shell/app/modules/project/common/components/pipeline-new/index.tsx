import * as React from 'react';
import { useUpdate } from 'common/use-hooks';
import routeInfoStore from 'core/stores/route';
import PiplelineGuide from './guide';
import PiplelineCategory from './category';
import PipelineList from './list';
import PipelineFormDrawer from './form';

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

  return (
    <div className="h-full flex flex-col">
      <PiplelineGuide onAddPipeline={onAddPipeline} projectId={projectId} appId={appId} ref={guideRef} />
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
