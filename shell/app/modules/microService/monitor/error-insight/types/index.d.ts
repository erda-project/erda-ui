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

declare namespace MONITOR_ERROR {

  interface IErrorQuery {
    startTime: number;
    endTime: number;
    workspace: string;
    offset?: number;
    projectId?: string;
  }

  interface IErrorResp {
    errors: IError[];
    limit: number;
    offset: number;
    total: number;
  }

  interface IError{
    applicationId: string;
    className: string;
    createTime:string;
    errorId: string;
    eventCount: number;
    exceptionMessage:string;
    file: string;
    methodName: string;
    runtimeId: string;
    serviceName: string;
    terminusKey: string;
    type: string;
    updateTime: string;
  }

  interface IEventIdsQuery {
    id: string;
    errorType: string;
    terminusKey: string;
  }

  interface IEventDetailQuery {
    id: string;
    terminusKey: string;
  }

  interface IEventDetail {
    eventId: string;
    timestamp: string;
    requestSampled: boolean;
    tags: Obj<string>;
    stacks: IStacks[];
    metaData: Obj<string>;
    requestId?: string;
    requestContext: Obj<string>;
    requestHeaders: Obj<string>;
  }

  interface IStacks {
    className: string;
    fileName: string;
    index: number;
    line: number;
    methodName: string;
  }

}
