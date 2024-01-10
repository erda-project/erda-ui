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
import { Tree, TreeDataNode, Pagination } from 'antd';
import SimpleChat from './simple-chat';
import { getFileSources, getQuestionKinds, getQuestions, Question } from 'layout/services/ai-knowledge';

const PAGE_SIZE = 15;

const KnowledgeBase = () => {
  const [tree, setTree] = React.useState<
    Array<{ title: string; key: string; children?: Array<{ title: string; key: string }> }>
  >([]);
  const [source, setSource] = React.useState<string>();
  const [kind, setKind] = React.useState<string>();
  const [pageNum, setPageNum] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const chatRef = React.useRef<{ enter: (message: string) => void }>();

  React.useEffect(() => {
    getTree();
  }, []);

  const getTree = async () => {
    const res = await getFileSources();
    if (res.success) {
      setTree(res.data?.list.map((item) => ({ title: item.fileSource, key: item.fileSource })));
      res.data?.list?.[0] && setSource(res.data?.list?.[0].fileSource);
    }
  };

  const getKinds = async (key: string) => {
    const res = await getQuestionKinds({ source: key });
    if (res.success && res.data.list.length) {
      const list = tree.map((item) => {
        if (item.key === key) {
          item.children = res.data.list.map((kind) => ({
            title: kind.kind_cn,
            key: kind.kind,
            isLeaf: true,
            source: kind.source,
          }));
        }
        return item;
      });
      setTree(list);
    }
  };

  const onLoadData = async (treeNode: TreeDataNode) => {
    getKinds(`${treeNode.key}`);
  };

  React.useEffect(() => {
    getList();
  }, [source, kind, pageNum]);

  const getList = async () => {
    if (!source) {
      return;
    }
    const res = await getQuestions({ source, kind, pageNum, pageSize: PAGE_SIZE });

    if (res.success) {
      setQuestions(res.data.list || []);
      setTotal(res.data.total || 0);
    }
  };

  const enter = (message: string) => {
    chatRef.current?.enter?.(message);
  };

  return (
    <div className="flex gap-x-2 h-full knowledge-base">
      <div className="flex-[1] bg-white rounded-[4px] overflow-y-auto pr-4 py-4">
        <Tree
          className="w-full"
          treeData={tree}
          blockNode
          titleRender={(data) => <div className="font-medium">{data.title}</div>}
          selectedKeys={[kind, source].filter(Boolean) as []}
          onSelect={(_key, { node: { isLeaf, key, source } }) => {
            if (isLeaf) {
              setKind(`${key}`);
              setSource(source);
            } else {
              setKind(undefined);
              setSource(`${key}`);
            }
          }}
          loadData={onLoadData}
        />
      </div>
      <div className="flex-[1] bg-white rounded-[4px] p-4 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {questions.map((item) => (
            <div className="text-blue my-1 cursor-pointer" onClick={() => enter(item.question)}>
              {item.question}
            </div>
          ))}
        </div>
        <Pagination total={total} current={pageNum} pageSize={PAGE_SIZE} simple onChange={(page) => setPageNum(page)} />
      </div>
      <div className="flex-[2] bg-white rounded-[4px] overflow-y-auto">
        <SimpleChat ref={chatRef} />
      </div>
    </div>
  );
};

export default KnowledgeBase;
