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
import { EmptyHolder } from 'common';
import Workflow from 'project/common/components/workflow/index';
import { getFlowList } from 'project/services/project-workflow';

interface IProps {
  projectID: number;
  id: number;
}

const MrWorkflow: React.FC<IProps> = ({ projectID, id }) => {
  const devFlowInfos = getFlowList.useData();
  const getFlowNodeList = React.useCallback(() => {
    getFlowList.fetch({
      mergeID: id,
      projectID,
    });
  }, [projectID, id]);
  React.useEffect(() => {
    getFlowNodeList();
  }, [getFlowNodeList]);
  return (
    <div>
      {devFlowInfos?.devFlowInfos?.length ? (
        <Workflow scope="MR" projectID={projectID} getFlowNodeList={getFlowNodeList} flowInfo={devFlowInfos} />
      ) : (
        <EmptyHolder relative />
      )}
    </div>
  );
};

export default MrWorkflow;
