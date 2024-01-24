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
import { Tree, TreeDataNode, Pagination, Input } from 'antd';
import i18n from 'i18n';
import { ErdaIcon } from 'common';
import SimpleChat from './simple-chat';
import { getFileSources, getQuestionKinds, getQuestions, Question } from 'layout/services/ai-knowledge';

const PAGE_SIZE = 10;

const KnowledgeBase = () => {
  const [tree, setTree] = React.useState<
    Array<{ title: string; key: string; children?: Array<{ title: string; key: string }> }>
  >([]);
  const [source, setSource] = React.useState<string>();
  const [kind, setKind] = React.useState<string>();
  const [pageNum, setPageNum] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [searchVal, setSearchVal] = React.useState<string>('');
  const [inputVal, setInputVal] = React.useState<string>('');
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
  }, [source, kind, pageNum, searchVal]);

  const getList = async () => {
    if (!source) {
      return;
    }
    const res = await getQuestions({ source, kind, pageNum, pageSize: PAGE_SIZE, filter: searchVal });

    if (res.success) {
      setQuestions(res.data.list || []);
      setTotal(res.data.total || 0);
    }
  };

  const enter = (message: string) => {
    chatRef.current?.enter?.(message);
  };

  const search = (val: string) => {
    setSearchVal(val);
    setPageNum(1);
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
            setPageNum(1);
            setInputVal('');
            setSearchVal('');
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
      <div className="flex-[2] bg-white rounded-[4px] flex flex-col">
        <div className="mx-4 mt-4">
          <Input
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            prefix={<ErdaIcon type="search" size="16" className="text-darkgray" />}
            onBlur={(e) => search(e.target.value)}
            onPressEnter={(e) => search(e.target.value)}
            size="small"
            placeholder={i18n.t('search knowledge base questions')}
          />
        </div>
        <div className="flex-1 overflow-y-auto mx-4 mb-4">
          {questions.map((item) => (
            <div className="text-blue my-3 cursor-pointer" onClick={() => enter(item.question)} key={item.question}>
              {item.question}
            </div>
          ))}
        </div>
        <Pagination
          className="mb-4"
          size="small"
          showTotal={() => ''}
          total={total}
          current={pageNum}
          pageSize={PAGE_SIZE}
          onChange={(page) => setPageNum(page)}
        />
      </div>
      <div className="flex-[3] bg-white rounded-[4px] overflow-y-auto">
        <SimpleChat ref={chatRef} />
      </div>
    </div>
  );
};

export default KnowledgeBase;
