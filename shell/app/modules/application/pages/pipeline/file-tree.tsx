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
import { TreeCategory, EmptyHolder, Icon as CustomIcon } from 'common';
import { useUnmount } from 'react-use';
import i18n from 'i18n';
import { get, find, map, isEmpty } from 'lodash';
import { updateSearch, insertWhen } from 'common/utils';
import fileTreeStore from 'common/stores/file-tree';
import { TreeNode } from 'common/components/tree/tree';
import routeInfoStore from 'core/stores/route';
import CaseEditForm from './config-detail/case-edit-form';
import projectStore from 'project/stores/project';
import appStore from 'application/stores/application';
import { scopeConfig } from './scope-config';
import { getBranchPath } from './config';
import { usePerm, WithAuth } from 'user/common';

interface IProps {
  scope: string;
  scopeParams: { scope: string; scopeID: string };
}

const FileTree = (props: IProps) => {
  const { scope, scopeParams } = props;
  const scopeConfigData = scopeConfig[scope];
  const [params, query] = routeInfoStore.useStore((s) => [s.params, s.query]);

  const { appId, projectId } = params;

  const branchInfo = appStore.useStore((s) => s.branchInfo); // 分支保护信息

  const {
    getCategoryByIdNew,
    createTreeNodeNew,
    deleteTreeNodeNew,
    getAncestorsNew,
    fuzzySearchNew,
    clearTreeNodeDetail,
  } = fileTreeStore;
  const [curNodeDetail] = fileTreeStore.useStore((s) => [s.curNodeDetail]);
  const [rootNode, setRootNode] = React.useState(null as TreeNode[] | null);
  const [editVis, setEditVis] = React.useState(false);
  const [editData, setEditData] = React.useState(undefined as any);
  const editHookRef = React.useRef(null as any);
  const projectInfo = projectStore.useStore((s) => s.info);
  const branchAuthObj = usePerm((s) => s.app.repo.branch);

  useUnmount(() => {
    clearTreeNodeDetail();
  });

  const rootPinode = btoa(`${projectId}/${appId}`);

  const getRootNode = React.useCallback(async () => {
    const rootArray = await getCategoryByIdNew({ pinode: rootPinode, ...scopeParams });
    setRootNode(map(rootArray, (item) => ({ ...item, iconType: 'fz' })));
  }, [getCategoryByIdNew, rootPinode, scopeParams]);

  React.useEffect(() => {
    if (projectInfo.name !== undefined) {
      // 延迟getRootNode，当路由上带pipelineID的时候，需要根据pipelineID获取到inode,再根据inode获取详情，此时触发寻组接口
      setTimeout(() => getRootNode(), 0);
    }
  }, [getRootNode, projectInfo]);

  const getAuthByNode = (node: TreeNode) => {
    const { branch } = getBranchPath(node.originData as TREE.NODE, appId);
    const isProtectBranch = get(find(branchInfo, { name: branch }), 'isProtect');
    const branchAuth = isProtectBranch ? branchAuthObj.writeProtected.pass : branchAuthObj.writeNormal.pass;
    const authTip = isProtectBranch ? i18n.t('application:branch is protected, you have no permission yet') : undefined;
    return { hasAuth: branchAuth, authTip };
  };

  const folderActions = (node: TreeNode) => {
    const isRootNode = get(node, 'originData.pinode') === rootPinode;
    const authObj = getAuthByNode(node);
    return [
      {
        node: scopeConfigData.text.addFolder,
        preset: 'newFolder',
        ...authObj,
      },
      {
        node: (
          <div>
            <WithAuth pass={authObj.hasAuth} noAuthTip={authObj.authTip}>
              <span>{scopeConfigData.text.addFile}</span>
            </WithAuth>
          </div>
        ),
        preset: 'customEdit',
        func: async (nodeKey: string, _node: any, hook: any) => {
          if (!authObj.hasAuth) return;
          showFormModal();
          editHookRef.current = {
            hook,
            nodeKey,
          };
        },
      },
      ...insertWhen(!isRootNode, [
        {
          node: i18n.t('project:rename'),
          preset: 'renameFolder',
          ...authObj,
        },
        {
          node: i18n.t('application:delete'),
          preset: 'delete',
          ...authObj,
        },
      ]),
    ];
  };

  const fileActions = (node: TreeNode) => {
    const authObj = getAuthByNode(node);

    return [
      {
        node: i18n.t('application:delete'),
        preset: 'delete',
        ...authObj,
      },
    ];
  };

  const onSelectNode = ({ inode, isLeaf }: { inode: string; isLeaf: boolean }) => {
    if (isLeaf && inode && query.nodeId !== inode) {
      clearTreeNodeDetail();
      setTimeout(() => {
        updateSearch({ nodeId: inode, pipelineID: undefined });
      }, 0);
    }
  };

  const showFormModal = (node?: any) => {
    setEditData(get(node, 'originData'));
    setEditVis(true);
  };

  const onOk = (val: any) => {
    if (editData) {
      // updateTreeNode({ ...editData, ...val }).then(() => {
      //   if (editHookRef.current && editHookRef.current.hook) {
      //     editHookRef.current.hook(editHookRef.current.nodeKey);
      //   }
      //   if (editData.inode === query.nodeId) {
      //     getCaseDetail({ id: editData.inode });
      //   }
      //   onClose();
      // });
    } else {
      createTreeNodeNew({ ...val, type: 'f', pinode: editHookRef.current.nodeKey, ...scopeParams }).then((res: any) => {
        if (editHookRef.current && editHookRef.current.hook) {
          editHookRef.current.hook(editHookRef.current.nodeKey, true);
        }
        onClose();
        const curInode = get(res, 'originData.inode');
        if (curInode) {
          setTimeout(() => {
            updateSearch({ nodeId: curInode, pipelineID: undefined });
          }, 0);
        }
      });
    }
  };

  const onClose = () => {
    setEditVis(false);
    editHookRef.current = null;
    setEditData(undefined);
  };

  const searchNodes = (payload: { fuzzy: string }) => {
    return fuzzySearchNew({ ...scopeParams, recursive: true, ...payload, fromPinode: rootPinode });
  };

  const currentKey = get(curNodeDetail, 'type') === 'f' ? `leaf-${curNodeDetail.inode}` : undefined;
  return (
    <>
      {rootNode && !isEmpty(rootNode) ? (
        <TreeCategory
          onSelectNode={onSelectNode}
          initTreeData={rootNode}
          iconMap={{
            fz: <CustomIcon type="fz" className="color-text-sub" />,
          }}
          currentKey={currentKey}
          searchGroup={{ file: scopeConfigData.text.searchFile, folder: scopeConfigData.text.searchFolder }}
          effects={{
            // moveNode: moveTreeNode,
            loadData: (p: any) => getCategoryByIdNew({ ...p, ...scopeParams }),
            deleteNode: async (key, isCurrentKeyDeleted) => {
              await deleteTreeNodeNew({ ...key, ...scopeParams });
              if (isCurrentKeyDeleted) {
                updateSearch({ nodeId: '', pipelineID: undefined });
              }
            },
            // updateNode: updateTreeNode,
            createNode: (p: any) => createTreeNodeNew({ ...p, ...scopeParams }),
            // copyNode: copyTreeNode,
            getAncestors: (p: any) => getAncestorsNew({ ...p, ...scopeParams }),
            fuzzySearch: searchNodes,
          }}
          actions={{
            folderActions,
            fileActions,
          }}
        />
      ) : (
        <EmptyHolder relative />
      )}
      <CaseEditForm editData={editData} visible={editVis} onOk={onOk} onClose={onClose} />
    </>
  );
};

export default FileTree;
