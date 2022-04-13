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
import fileTreeStore from 'project/stores/file-tree';
import buildStore from 'application/stores/build';
import { useUnmount, useUpdateEffect } from 'react-use';
import Editor from './editor';
import { Tooltip } from 'antd';
import Execute from './execute';
import { useLoading } from 'core/stores/loading';
import { getBranchPath } from 'application/pages/pipeline/config';
import repoStore from 'application/stores/repo';
import { EmptyHolder, ErdaIcon } from 'common';
import { goTo } from 'app/common/utils';
import { encode } from 'js-base64';
import i18n from 'i18n';

interface IProps {
  appId: string;
  projectId: string;
  pipelineDefinitionID: string;
  nodeId: string;
  pipelineId?: string;
  pipelineName: string;
  projectName: string;
  appName: string;
  branchExist?: boolean;
  setNewPipelineUsed?: (v: boolean) => void;
}

export enum DetailMode {
  file = 'file', // file mode, editable
  edit = 'edit',
  execute = 'execute', // execute mode
  empty = '',
}

const Pipeline = (props: IProps) => {
  const {
    appId,
    nodeId,
    pipelineId: _pipelineId,
    branchExist,
    projectId,
    pipelineName,
    appName,
    setNewPipelineUsed,
    projectName,
    pipelineDefinitionID,
  } = props;
  const { getTreeNodeDetailNew } = fileTreeStore;
  const [pipelineId, setPipelineId] = React.useState(_pipelineId);
  const { commit } = repoStore.effects;
  const [commitLoading] = useLoading(repoStore, ['commit']);
  const { getPipelineDetail } = buildStore.effects;
  const { clearPipelineDetail } = buildStore.reducers;
  const [pipelineDetail, setPipelineDetail] = React.useState<BUILD.IPipelineDetail>();
  const [nodeDetail, setNodeDetail] = React.useState<TREE.NODE>();
  const [mode, setMode] = React.useState<DetailMode>(DetailMode.empty);
  const [initPipeline, setInitPipeline] = React.useState(false);
  const [fileChanged, setFileChanged] = React.useState(false);

  // mobile_init is a special node, only allowed to run pipeline
  const isMobileInit = nodeId === 'mobile_init';
  useUnmount(() => {
    clearPipelineDetail();
  });

  React.useEffect(() => {
    if (pipelineId) {
      getPipelineDetail({ pipelineID: +pipelineId }).then((res) => {
        setPipelineDetail(res);
      });
    } else {
      setMode(DetailMode.file);
    }
  }, [pipelineId, getPipelineDetail]);

  React.useEffect(() => {
    pipelineDetail && setInitPipeline(true);
  }, [pipelineDetail]);

  useUpdateEffect(() => {
    initPipeline && initMode();
  }, [initPipeline]);

  const getNodeDetail = React.useCallback(() => {
    getTreeNodeDetailNew({ id: nodeId, scope: 'project-app', scopeID: appId }).then((res) => setNodeDetail(res));
  }, [nodeId, appId, getTreeNodeDetailNew]);

  React.useEffect(() => {
    getNodeDetail();
  }, [getNodeDetail]);

  const onUpdate = (ymlStr: string) => {
    const fileName = nodeDetail?.name;
    const { branch, path } = getBranchPath(nodeDetail);

    return commit({
      repoPrefix: `${projectName}/${appName}`,
      branch,
      message: `Update ${fileName}`,
      actions: [
        {
          content: ymlStr,
          path,
          action: 'update',
          pathType: 'blob',
        },
      ],
    }).then(() => {
      getNodeDetail();
    });
  };

  const initMode = () => {
    const pipelineYmlContent = pipelineDetail?.ymlContent;
    setMode(pipelineYmlContent ? DetailMode.execute : DetailMode.file);
  };

  React.useEffect(() => {
    const fileYmlContent = nodeDetail?.meta?.pipelineYml;
    const pipelineYmlContent = pipelineDetail?.ymlContent;

    if (fileYmlContent) {
      if (pipelineYmlContent) setFileChanged(fileYmlContent !== pipelineYmlContent);
      if (fileYmlContent === pipelineYmlContent) setMode(DetailMode.execute);
    }
  }, [pipelineDetail, nodeDetail, branchExist, isMobileInit, initPipeline]);

  const editAuth = { hasAuth: true };
  const deployAuth = { hasAuth: true };

  if (!branchExist && !pipelineId) return <EmptyHolder />;
  const editPipeline = () => {
    setMode(DetailMode.edit);
  };

  const extraTitle = (
    <Tooltip title={i18n.t('dop:check execution history')}>
      <ErdaIcon
        onClick={() => {
          goTo(goTo.pages.projectPipelineRecords, {
            projectId,
            query: {
              // fix with base64 RFC 4648
              customFilter__urlQuery: encode(`{"title":"${pipelineName}"}`).replaceAll('/', '_').replaceAll('+', '-'),
            },
            jumpOut: true,
          });
        }}
        fill="black-4"
        size="18"
        type="jsjl"
        className="cursor-pointer ml-2"
      />
    </Tooltip>
  );

  return mode && mode !== DetailMode.execute ? (
    <Editor
      mode={mode}
      projectId={projectId}
      loading={commitLoading}
      switchToExecute={() => setMode(DetailMode.execute)}
      setEditMode={(v) => setMode(v)}
      fileChanged={fileChanged}
      setPipelineId={(v) => {
        setPipelineId(v);
        setNewPipelineUsed?.(true);
      }}
      extraTitle={extraTitle}
      editAuth={editAuth.hasAuth}
      pipelineDefinitionID={pipelineDefinitionID}
      deployAuth={deployAuth.hasAuth}
      pipelineFileDetail={nodeDetail}
      onUpdate={onUpdate}
    />
  ) : pipelineId ? (
    <Execute
      appId={appId}
      setPipelineId={(v) => {
        setPipelineId(v);
        setNewPipelineUsed?.(true);
      }}
      projectId={projectId}
      pipelineId={pipelineId}
      switchToEditor={() => setMode(DetailMode.file)}
      pipelineDefinitionID={pipelineDefinitionID}
      extraTitle={extraTitle}
      fileChanged={fileChanged}
      deployAuth={deployAuth}
      pipelineDetail={pipelineDetail}
      pipelineFileDetail={nodeDetail}
      editPipeline={editPipeline}
    />
  ) : null;
};

// deploy auth;
// const useDeployAuth = ({ nodeDetail, appId }: { nodeDetail?: TREE.NODE; appId: string }) => {
//   const envBlockKeyMap = {
//     DEV: 'blockDev',
//     TEST: 'blockTest',
//     PROD: 'blockProd',
//     STAGE: 'blockStage',
//   };

//   const [appInfo, setAppInfo] = React.useState<IApplication | null>(null);

//   React.useEffect(() => {
//     getAppInfo.fetch({ appId }).then((res) => setAppInfo(res.data));
//   }, [appId]);

//   const { env } = getBranchPath(nodeDetail, appId);
//   const orgBlockoutConfig = orgStore.useStore((s) => s.currentOrg.blockoutConfig);
//   const envBlocked = get(orgBlockoutConfig, envBlockKeyMap[env], false);
//   const deployPerm = usePerm((s) => s.app.runtime);
//   const getDeployAuth = () => {
//     // depoloy auth, same to deploy center
//     if (envBlocked && appInfo?.blockStatus !== 'unblocked') {
//       // network blocked
//       return {
//         hasAuth: false,
//         authTip: i18n.t('dop:Function unavailable in network block period.'),
//       };
//     }
//     if (!deployPerm[`${(env || 'dev').toLowerCase()}DeployOperation`]) {
//       // no auth
//       return { hasAuth: false };
//     } else {
//       return { hasAuth: true };
//     }
//   };

//   const authObj = React.useMemo(() => getDeployAuth(), [appInfo, envBlocked]);

//   return authObj;
// };

// auth to edit pipeline;
// const useEditAuth = ({ nodeDetail, appId }: { nodeDetail?: TREE.NODE; appId: string }) => {
//   const { branch } = getBranchPath(nodeDetail, appId);
//   const branchAuthObj = usePerm((s) => s.app.repo.branch);
//   const [branchInfo, setBranchInfo] = React.useState<APPLICATION.IBranchInfo[]>([]);
//   React.useEffect(() => {
//     appId && appStore.effects.getBranchInfo({ appId }).then((res) => setBranchInfo(res));
//   }, [appId]);

//   const getEditAuth = () => {
//     // edit auth, same to repo
//     const isProtectBranch = get(find(branchInfo, { name: branch }), 'isProtect');
//     const branchAuth = isProtectBranch ? branchAuthObj.writeProtected.pass : branchAuthObj.writeNormal.pass;
//     const authTip = isProtectBranch ? i18n.t('dop:branch is protected, you have no permission yet') : undefined;
//     return { hasAuth: branchAuth, authTip };
//   };

//   const authObj = React.useMemo(() => getEditAuth(), [branchInfo]);
//   return authObj;
// };

export default Pipeline;
