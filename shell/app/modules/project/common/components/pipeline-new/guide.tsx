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
import { getGuidesList, cancelGuide } from 'project/services/pipeline';
import { Alert, Modal } from 'antd';
import moment from 'moment';
import i18n from 'i18n';
import { ErdaIcon } from 'common';

import './guide.scss';

interface IProps {
  projectId: string;
  appId?: string;
  addPipeliningQuickly: (appId: string, branch: string, ymls: string[]) => void;
}

interface GuideItem {
  id: string;
  appID: number;
  branch: string;
  appName: string;
  timeCreated: string;
}

const expanded = (_list: string[], id: string) => {
  const list = [..._list];
  const index = list.findIndex((key) => key === id);
  if (index === -1) {
    list.push(id);
  } else {
    list.splice(index, 1);
  }

  return list;
};

const Guide = React.forwardRef((props: IProps, ref: React.Ref<{ reload: () => void }>) => {
  const { addPipeliningQuickly, projectId, appId } = props;
  const [guidesList] = getGuidesList.useState();
  const [expandedKeys, setExpandedKeys] = React.useState<string[]>([]);

  const getGuides = React.useCallback(() => {
    getGuidesList.fetch({ kind: 'pipeline', projectID: projectId, appID: appId });
  }, [projectId, appId]);

  React.useImperativeHandle(ref, () => ({
    reload: getGuides,
  }));

  React.useEffect(() => {
    getGuides();
  }, [getGuides]);

  const removeAlert = (guide: GuideItem) => {
    const { appName, branch, id } = guide;
    Modal.confirm({
      title: i18n.t('is it confirmed {action}?', {
        action: `${i18n.t('Remove')}${i18n.t('dop:tips of branch {branch} under application {application}', {
          branch,
          application: appName,
          interpolation: { escapeValue: false },
        })}`,
        interpolation: { escapeValue: false },
      }),
      onOk: () => {
        cancelGuide({ id }).then(() => {
          getGuides();
        });
      },
      onCancel() {},
    });
  };

  return (
    <div>
      {guidesList
        ?.filter((guide) => guide.content && guide.content !== 'null')
        .map((guide) => {
          const { id, appName, timeCreated, appID, content: _content } = guide;
          const content = (_content && JSON.parse(_content)) || {};
          const { pipelineYmls = [], branch } = content;

          return (
            <Alert
              type="info"
              className="pipeline-guide-blue mb-2 py-0"
              message={
                <div className="overflow-hidden">
                  <div
                    className={`flex-h-center py-2 pipeline-guide-item ${
                      expandedKeys.includes(id)
                        ? 'border-default-1 border-b border-t-0 border-l-0 border-r-0 border-solid'
                        : ''
                    }`}
                  >
                    <ErdaIcon
                      type="caret-down"
                      size="20"
                      className={`text-default-6 mr-1 cursor-pointer ${expandedKeys.includes(id) ? '' : '-rotate-90'}`}
                      onClick={() => setExpandedKeys((prev) => expanded(prev, id))}
                    />

                    <ErdaIcon type="daimafenzhi" size="20" className="text-blue mr-1" />
                    <span className="font-medium mr-5">
                      {i18n.t('dop|{app}: {branch}, gets new pipelines {time}', {
                        branch: branch || '-',
                        app: appName || '-',
                        time: moment(timeCreated).fromNow(),
                        interpolation: { escapeValue: false },
                        nsSeparator: '|',
                      })}
                    </span>
                    <div className="flex-1 justify-end flex-h-center">
                      <div className="mr-4 remove-btn" onClick={() => removeAlert(guide)}>
                        {i18n.t('Remove')}
                      </div>
                      <span
                        className="cursor-pointer hover:text-purple-deep"
                        onClick={() => {
                          addPipeliningQuickly(appID, branch, pipelineYmls);
                        }}
                      >
                        {i18n.t('dop:Add all')}
                      </span>
                    </div>
                  </div>
                  <div className="pl-5" style={expandedKeys.includes(id) ? {} : { display: 'none' }}>
                    {pipelineYmls?.map((yml: string, index: number) => (
                      <div
                        key={yml}
                        className={`flex-h-center py-2 pl-2 pipeline-guide-item ${
                          index !== 0 ? 'border-default-1 border-t border-b-0 border-l-0 border-r-0 border-solid' : ''
                        }`}
                      >
                        <ErdaIcon type="wenjian" size="20" className="text-blue mr-1" />
                        <span>{yml}</span>
                        <div className="flex-1 justify-end flex-h-center">
                          <span
                            className="cursor-pointer hover:text-purple-deep"
                            onClick={() => {
                              addPipeliningQuickly(appID, branch, [yml]);
                            }}
                          >
                            {i18n.t('dop:Create')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              }
            />
          );
        })}
    </div>
  );
});

export default Guide;
