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
import { Button, Tabs, Spin, Modal } from 'antd';
import moment from 'moment';
import i18n from 'i18n';
import { goTo } from 'common/utils';
import { UserInfo, FileEditor } from 'common';
import Table from 'common/components/table';
import releaseStore from 'project/stores/release';
import routeInfoStore from 'core/stores/route';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import FileContainer from 'application/common/components/file-container';

import { useLoading } from 'core/stores/loading';

import './form.scss';

const { TabPane } = Tabs;

const ReleaseApplicationDetail = () => {
  const { params } = routeInfoStore.getState((s) => s);
  const { releaseID } = params;
  const { releaseDetail } = releaseStore.getState((s) => s);
  const { getReleaseDetail, formalRelease } = releaseStore.effects;
  const { updateReleaseDetail } = releaseStore.reducers;
  const [loading] = useLoading(releaseStore, ['getReleaseDetail']);

  const {
    releaseName,
    applicationName,
    userId,
    createdAt,
    labels = {} as RELEASE.Labels,
    markdown,
    images = [],
    isFormal,
  } = releaseDetail;

  React.useEffect(() => {
    if (releaseID) {
      getReleaseDetail({ releaseID });
    }

    return () => {
      updateReleaseDetail({});
    };
  }, [releaseID, getReleaseDetail, updateReleaseDetail]);

  const submit = () => {
    Modal.confirm({
      title: i18n.t('dop:be sure to make {name} official?', {
        name: releaseName,
        interpolation: { escapeValue: false },
      }),
      onOk: () => {
        formalRelease({ releaseID }).then((res) => {
          if (res.success) {
            getReleaseDetail({ releaseID });
          }
        });
      },
    });
  };

  return (
    <div className="release-releaseDetail">
      <Spin spinning={loading}>
        <Tabs defaultActiveKey="1">
          <TabPane tab={i18n.t('dop:basic information')} key="1">
            <div className="mb-4">
              <div className="mb-2">
                <div className="text-black-400 mb-2">{i18n.t('name')}</div>
                <div>{releaseName || '-'}</div>
              </div>
              <div className="mb-2">
                <div className="text-black-400 mb-2">{i18n.t('dop:app name')}</div>
                <div>{applicationName || '-'}</div>
              </div>
              <div className="mb-2">
                <div className="text-black-400 mb-2">{i18n.t('creator')}</div>
                <div>{userId ? <UserInfo id={userId} /> : '-'}</div>
              </div>
              <div className="mb-2">
                <div className="text-black-400 mb-2">{i18n.t('create time')}</div>
                <div>{(createdAt && moment(createdAt).format('YYYY/MM/DD HH:mm:ss')) || '-'}</div>
              </div>
              <div className="mb-2">
                <div className="text-black-400 mb-2">{i18n.t('dop:code branch')}</div>
                <div>{labels.gitBranch || '-'}</div>
              </div>
              <div className="mb-2">
                <div className="text-black-400 mb-2">commitId</div>
                <div>{labels.gitCommitId || '-'}</div>
              </div>
              <div className="mb-2">
                <div className="text-black-400 mb-2">{i18n.t('content')}</div>
                <div>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown || i18n.t('dop:no content yet')}</ReactMarkdown>
                </div>
              </div>
            </div>
          </TabPane>
          <TabPane tab={i18n.t('dop:images list')} key="2">
            <Table
              columns={[{ title: i18n.t('dop:image name'), dataIndex: 'name' }]}
              dataSource={images.map((item: string) => ({ name: item }))}
              onChange={() => getReleaseDetail({ releaseID })}
            />
          </TabPane>
          <TabPane tab="dice.yml" key="3">
            <FileContainer className="mt-3" name="dice.yml">
              <FileEditor name="dice.yml" fileExtension="yml" value={releaseDetail.diceyml} readOnly />
            </FileContainer>
          </TabPane>
        </Tabs>
      </Spin>

      <div className="mb-2 mt-4">
        {!isFormal ? (
          <Button className="mr-3 bg-default" type="primary" onClick={submit}>
            {i18n.t('dop:be formal')}
          </Button>
        ) : null}
        <Button className="bg-default-06 border-default-06" onClick={() => goTo(goTo.pages.projectRelease)}>
          {i18n.t('return to previous page')}
        </Button>
      </div>
    </div>
  );
};

export default ReleaseApplicationDetail;
