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
import { Button, Modal, Tabs } from 'antd';
import moment from 'moment';
import i18n from 'i18n';
import { goTo } from 'common/utils';
import { ErdaIcon, Ellipsis } from 'common';
import { TagItem } from 'app/common/components/tags';
import routeInfoStore from 'core/stores/route';
import { getReleaseDetail, formalRelease } from 'project/services/release';
import AddonInfo from './addon';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Mode {
  dependOn?: string[];
  applicationReleaseList: Application[][];
  expose: boolean;
}

interface Application {
  applicationName: string;
  releaseName: string;
  version: string;
  createdAt: string;
  releaseID: string;
}

const { TabPane } = Tabs;

const ReleaseProjectDetail = () => {
  const { params } = routeInfoStore.getState((s) => s);
  const { releaseID } = params;
  const releaseDetail = getReleaseDetail.useData();
  const { isFormal, version: releaseName, addons, addonYaml, changelog = '-', modes, tags } = releaseDetail || {};

  React.useEffect(() => {
    getReleaseDetail.fetch({ releaseID });
  }, [releaseID]);

  const submit = () => {
    Modal.confirm({
      title: i18n.t('dop:be sure to make {name} official?', {
        name: releaseName,
        interpolation: { escapeValue: false },
      }),
      onOk: async () => {
        await formalRelease({
          releaseID,
          $options: { successMsg: i18n.t('{action} successfully', { action: i18n.t('dop:To Formal') }) },
        });
        getReleaseDetail.fetch({ releaseID });
      },
    });
  };

  const fieldsList = [
    {
      label: i18n.t('Version'),
      content: releaseName,
      style: { width: '50%' },
    },
    ...(tags?.length
      ? [
          {
            label: i18n.t('label'),
            content: tags?.map((tag) => <TagItem label={{ label: tag.name, color: tag.color }} readOnly />),
            style: { width: '50%' },
          },
        ]
      : []),
    {
      label: i18n.t('dop:deployment mode'),
      style: { width: '50%' },
      noWrapper: true,
      content: <ModesList value={modes} />,
    },
    {
      label: i18n.t('content'),
      content: <MarkdownReadOnlyRender value={changelog} />,
    },
  ];

  return (
    <div className="text-default">
      <Tabs defaultActiveKey="1" className="h-full">
        <TabPane tab={i18n.t('dop:basic information')} key="1">
          <div>
            {fieldsList.map((item) => (
              <div className="mb-4" key={item.label}>
                <div className="font-medium mb-1.5">{item.label}</div>
                <div className={item.noWrapper ? '' : 'px-2.5 py-1.5 rounded-sm bg-default-04'} style={item.style}>
                  {item.content}
                </div>
              </div>
            ))}
          </div>
        </TabPane>

        {addons || addonYaml ? (
          <TabPane tab="Addons" key="2">
            <AddonInfo addons={addons} addonYaml={addonYaml} />
          </TabPane>
        ) : null}
      </Tabs>
      <div className="mb-2">
        {!isFormal ? (
          <Button className="mr-3 bg-default" type="primary" onClick={submit}>
            {i18n.t('dop:To Formal')}
          </Button>
        ) : null}
      </div>
    </div>
  );
};

const MarkdownReadOnlyRender = ({ value }: { value: string }) => {
  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{value || i18n.t('No description')}</ReactMarkdown>;
};

const onExpand = (key: string | number, list: Array<string | number>) => {
  const _list = [...list];
  const index = _list.findIndex((item) => item === key);
  if (index !== -1) {
    _list.splice(index, 1);
  } else {
    _list.push(key);
  }
  return _list;
};

const ModesList = ({ value }: { value?: { [keys: string]: Mode } }) => {
  const [expandedKeys, setExpandedKeys] = React.useState<Array<string | number>>([]);

  React.useEffect(() => {
    setExpandedKeys([Object.keys(value || {})[0]]);
  }, [value]);

  const expand = React.useCallback(
    (key: string) => {
      setExpandedKeys(onExpand(key, expandedKeys));
    },
    [expandedKeys, setExpandedKeys],
  );

  return (
    <div>
      {Object.keys(value || {})
        .filter((key) => value?.[key].expose)
        .map((key: string) => {
          const mode = value?.[key] || ({} as Mode);
          return (
            <div className="bg-default-04 mb-2 text-default" key={key}>
              <div className="px-2 py-3 flex-h-center cursor-pointer" onClick={() => expand(key)}>
                <ErdaIcon
                  type="right-4ffff0i4"
                  size="20"
                  className={`${
                    expandedKeys.includes(key) ? 'text-default-6 rotate-90' : 'text-default-3'
                  } duration-300`}
                />
                {key}
              </div>

              <div className={`overflow-hidden ${expandedKeys.includes(key) ? '' : 'h-0'}`}>
                <div className="px-6 pb-6">
                  {mode.dependOn?.length ? (
                    <>
                      <div className="text-xs text-default-6 mb-1">{i18n.t('dop:dependence')}</div>
                      <Ellipsis
                        className="hover:text-purple-deep hover:underline mb-4"
                        title={(mode.dependOn || []).join(' ')}
                      />
                    </>
                  ) : null}

                  <div>
                    <div className="text-xs text-default-6 mb-2">{i18n.t('dop:app release')}</div>
                    <div>
                      <GroupsList value={mode.applicationReleaseList || []} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
};

const GroupsList = ({ value }: { value: Application[][] }) => {
  const [expandedKeys, setExpandedKeys] = React.useState<Array<string | number>>([0]);

  const expand = React.useCallback(
    (key: number) => {
      setExpandedKeys(onExpand(key, expandedKeys));
    },
    [expandedKeys, setExpandedKeys],
  );

  return (
    <div>
      {value.map((item, index) => (
        <div className="bg-white rounded-sm border-default-1 border-solid border">
          <div className="px-2 py-3 flex-h-center cursor-pointer" onClick={() => expand(index)}>
            <ErdaIcon
              type="right-4ffff0i4"
              size="20"
              className={`${expandedKeys.includes(index) ? 'text-default-6 rotate-90' : 'text-default-3'} duration-300`}
            />
            {i18n.t('dop:group {index}', { index: index + 1 })}
            <div className="bg-default-1 rounded-full px-2 py-0.5 text-xs ml-1">{item.length}</div>
          </div>
          <div className={`overflow-hidden ${expandedKeys.includes(index) ? '' : 'h-0'}`}>
            <div className="px-7 pb-4">
              {item.map((app) => (
                <div className="hover:bg-default-06 px-4 py-2" key={app.releaseID}>
                  <div
                    className="mb-1 hover:text-purple-deep truncate cursor-pointer"
                    onClick={() =>
                      goTo(goTo.resolve.applicationReleaseDetail({ releaseId: app.releaseID }), { jumpOut: true })
                    }
                  >
                    {app.version}
                  </div>
                  <div className="flex-h-center text-xs">
                    <div className="text-default-6 pr-2">{i18n.t('dop:owned application')}</div>
                    <div className="bg-default-04 rounded-3xl px-2 py-1">{app.applicationName}</div>
                    <div className="flex-1 text-right text-default-6">
                      {app.createdAt ? moment(app.createdAt).format('YYYY/MM/DD HH:mm:ss') : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReleaseProjectDetail;
