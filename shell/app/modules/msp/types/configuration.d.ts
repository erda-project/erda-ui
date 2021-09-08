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

declare namespace CONFIGURATION {
  type ILang = 'DOT_NET' | 'GO' | 'JAVA' | 'NODEJS' | 'PHP';

  type ILangConf = {
    language: string;
    displayName: string;
  };

  interface IStrategy {
    displayName: string;
    strategy: string;
    languages: Array<ILangConf>;
  }

  interface IDocs {
    language: string;
    strategy: string;
  }

  interface IAllkey {
    subjectType: number;
    subject: string;
    accessKey?: string;
    pageNo: number;
    pageSize: number;
    scope: string;
    scopeId: string;
  }

  interface ICreateKey {
    description?: string;
    subject: string;
    subjectType: number;
    scope: string;
    scopeId: string;
  }

  interface IDelAndFindKey {
    id: string;
  }

  interface IDocData {
    data: string;
  }

  interface IAllkeyData {
    accessKey: string;
    createdAt: string;
    description: string;
    id: string;
    secretKey: string;
    status: string;
    subject: string;
    subjectType: string;
    scope: string;
    scopeId: string;
    width?: number;
  }

  interface IkeyList {
    list: IAllkeyData[];
    total: number;
  }
}
