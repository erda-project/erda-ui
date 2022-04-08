import * as React from 'react';
import { getGuidesList, cancelGuide } from 'project/services/pipeline';
import { Alert, Modal } from 'antd';
import i18n from 'i18n';
import { ErdaIcon } from 'common';
import { fromNow } from 'common/utils';

import './guide.scss';

interface IProps {
  projectId: string;
  appId?: string;
  onAddPipeline: (appId: number) => void;
}

interface GuideItem {
  id: string;
  appID: number;
  branch: string;
  appName: string;
  timeCreated: string;
}

const Guide = React.forwardRef((props: IProps, ref: React.Ref<{ reload: () => void }>) => {
  const { onAddPipeline, projectId, appId } = props;
  const [guidesList] = getGuidesList.useState();
  const guidesFirst = guidesList?.[0];
  const [expanded, setExpanded] = React.useState(false);

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

  return guidesFirst ? (
    <Alert
      type="info"
      className="pipeline-guide-blue mb-2 py-0"
      message={
        <div className="overflow-hidden">
          <div
            className={`flex-h-center py-2 pipeline-guide-item ${
              expanded ? 'border-default-1 border-b border-t-0 border-l-0 border-r-0 border-solid' : ''
            }`}
          >
            {guidesList?.length !== 1 ? (
              <ErdaIcon
                type="caret-down"
                size="20"
                className={`text-default-6 mr-1 cursor-pointer ${expanded ? '' : '-rotate-90'}`}
                onClick={() => setExpanded((prev) => !prev)}
              />
            ) : null}

            <ErdaIcon type="daimafenzhi" size="20" className="text-blue mr-1" />
            <span className="font-medium mr-5">
              {i18n.t('dop:pipeline files were discovered in the {branch} branch of the {app} application today', {
                branch: guidesFirst.branch || '-',
                app: guidesFirst.appName || '-',
                interpolation: { escapeValue: false },
              })}
            </span>
            <span className="mr-1">
              {i18n.t('at')} {fromNow(guidesFirst.timeCreated)}
            </span>
            <div className="flex-1 justify-end flex-h-center">
              <div className="mr-4 remove-btn" onClick={() => removeAlert(guidesFirst)}>
                {i18n.t('Remove')}
              </div>
              <span
                className="cursor-pointer hover:text-purple-deep"
                onClick={() => {
                  onAddPipeline(guidesFirst.appID);
                }}
              >
                {i18n.t('Add')}
              </span>
            </div>
          </div>
          <div className="pl-5" style={expanded ? {} : { display: 'none' }}>
            {guidesList?.slice(1).map((item, index) => (
              <div
                key={item.id}
                className={`flex-h-center py-2 pl-2 pipeline-guide-item ${
                  index !== 0 ? 'border-default-1 border-t border-b-0 border-l-0 border-r-0 border-solid' : ''
                }`}
              >
                <ErdaIcon type="daimafenzhi" size="20" className="text-blue mr-1" />
                <span className="font-medium mr-5">
                  {i18n.t('dop:pipeline files were discovered in the {branch} branch of the {app} application today', {
                    branch: item.branch || '-',
                    app: item.appName || '-',
                    interpolation: { escapeValue: false },
                  })}
                </span>
                <span className="mr-1">
                  {i18n.t('at')} {fromNow(item.timeCreated)}
                </span>
                <div className="flex-1 justify-end flex-h-center">
                  <div className="mr-4 remove-btn" onClick={() => removeAlert(item)}>
                    {i18n.t('Remove')}
                  </div>
                  <span
                    className="cursor-pointer hover:text-purple-deep"
                    onClick={() => {
                      onAddPipeline(item.appID);
                    }}
                  >
                    {i18n.t('Add')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      }
    />
  ) : null;
});

export default Guide;
