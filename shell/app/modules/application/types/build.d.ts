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

declare namespace BUILD {

  interface IStage {
    id: number;
    pipelineID: number;
    name: string;
    status: string;
    costTimeSec: number;
    timeBegin: string;
    timeEnd: string;
    pipelineTasks: ITask[];
  }

  interface ITask {
    id: number;
    pipelineID: number;
    stageID: number;
    name: string;
    type: string;
    status: string;
    costTimeSec: number;
    extra: {
      uuid: string;
      allowFailure: boolean;
    };
    result: {
      metadata?: MetaData[];
    };
  }

  interface IComboPipeline {
    branch: string;
    source: string;
    ymlName: string;
    pagingYmlNames: string[];
    pipelineID: number;
    status: string;
    workspace: string;
    triggerMode: 'manual' | 'cron';
    timeCreated: string;
    cancelUser: {} | { name: string };
    commit: string;
    costTimeSec?: number;
  }

  interface IPipelineDetail {
    extra: {
      diceWorkspace: string;
      showMessage?: {
        msg: string;
        stacks: string[];
      }
    };
    id: number;
    status: string;
    source: string;
    env: string;
    branch: string;
    ymlName: string;
    commitId: string;
    costTimeSec: string;
    commit: string;
    commitDetail: {
      author: string;
      time: string;
      comment: string;
    };
    pipelineButton: {
      canManualRun: boolean;
      canCancel: boolean;
      canForceCancel: boolean;
      canRerun: boolean;
      canRerunFailed: boolean;
      canStartCron: boolean;
      canStopCron: boolean;
      canPause: boolean;
      canUnpause: boolean;
      canDelete: boolean;
    };
    pipelineCron: { [key: string]: any; id: number };
    pipelineStages: IStage[];
    pipelineTaskActionDetails: Obj<ITaskActionDetail>
  }

  interface ITaskActionDetail {
    displayName: string;
    logoUrl: string;
  }

  interface IRerunResponse {
    id: number;
    ymlSource: string;
    ymlName: string;
    source: string;
    branch: string;
    extra: {
      diceWorkspace: string;
    }
  }

  interface IGetExecRecordsReq {
    appID: number;
    branches: string;
    sources: string
    ymlNames: string;
    pageNum: number;
    pageSize: number;
  }

  interface IActiveItem {
    branch: string;
    ymlName: string;
    source: string;
  }

  type MetaData = { name: string, value: string };

  type ExecuteRecord = Omit<IPipelineDetail, 'pipelineButton'>;

  interface PipelineNode extends ITask {
    isType: Function;
    starting: boolean;
    stage: string;
    _runtimeDetail: RUNTIME.Detail;
    displayName: string;
    logoUrl: string;
    findInMeta(fn: (item: BUILD.MetaData) => boolean): BUILD.MetaData | null;
  }

  interface IPipelineLogQuery {
    resourceId: string;
    resourceType: string;
    scopeId: string;
    scopeType: string;
    startTime?: string;
  }

  interface IPipelineLog {
    occurrenceTime: string;
    humanLog: string;
    level: string;
    primevalLog: string;
  }

  interface CreatePipelineBody {
    branch: string;
    pipelineYmlName: string;
  }

  interface PipelineYmlListQuery {
    branch: string;
    appID: string;
  }

}

