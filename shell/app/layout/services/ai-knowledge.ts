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

import agent from 'agent';
import { getGlobal } from 'core/global-space';

export interface FileSource {
  fileSource: string;
  id: string;
}

export interface QuestionKind {
  id: string;
  kind: string;
  kind_cn: string;
  source: string;
}

export interface Question {
  question: string;
  id: string;
}

export const getFileSources = (): RAW_RESPONSE<{ list: FileSource[]; total: number }> => {
  return agent.get(`/api/knowledgebase/file_sources`, { pageSize: 999, pageNum: 1 }).then((response: any) => {
    return JSON.parse(response.text);
  });
};

export const getQuestionKinds = ({
  source,
}: {
  source: string;
}): RAW_RESPONSE<{ list: QuestionKind[]; total: number }> => {
  return agent.get(`/api/knowledgebase/question-kinds`, { pageSize: 999, pageNum: 1, source }).then((response: any) => {
    return JSON.parse(response.text);
  });
};

export const getQuestions = ({
  source,
  pageSize,
  pageNum,
  kind,
  filter,
}: {
  source: string;
  pageSize: number;
  pageNum: number;
  kind?: string;
  filter: string;
}): RAW_RESPONSE<{ list: Question[]; total: number }> => {
  return agent
    .get(`/api/knowledgebase/questions`, { pageSize, pageNum, source, kind, filter })
    .then((response: any) => {
      return JSON.parse(response.text);
    });
};

export const queryKnowledge = (
  messages: string,
  userId: string,
  extension?: boolean,
): RAW_RESPONSE<{ answer: string; references: string[] }> => {
  const { currentOrg } = getGlobal('initData');
  const params = {
    messages: [
      {
        role: 'user',
        content: messages,
      },
    ],
  };

  const req = agent.post(`/api/query`);
  req.set('Erda-AI-Module', 'KnowledgeBase');
  req.set('Org-ID', currentOrg.id);
  req.set('User-ID', userId);
  if (extension) {
    req.set('Erda-AI-Response-Widely', extension);
  }

  return req.send(params).then((response: any) => response.body);
};
