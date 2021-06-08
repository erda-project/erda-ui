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
import { Button, Popconfirm, Timeline, message, Tooltip, Radio, Menu, Dropdown, Popover } from 'app/nusi';
import moment from 'moment';
import i18n from 'i18n';
import { map, isEmpty, get, find } from 'lodash';
import publisherStore from '../../stores/publisher';
import { useUpdate, Icon as CustomIcon, Holder, LoadMore, IF } from 'common';
import VersionFormModal from './version-form-modal';
import './vsrsion-list.scss';
import { useLoading } from 'app/common/stores/loading';
import { WithAuth, usePerm } from 'user/common';
import routeInfoStore from 'common/stores/route';
// import { ArtifactsTypeMap } from 'publisher/pages/artifacts/config';
import GrayFormModal from './gray-form-modal';
import { ArtifactsTypeMap } from './config';
import { useUnmount, useMount } from 'react-use';
import UploadModal from './upload-modal';
import { Android as IconAndroid, Apple as IconApple } from '@icon-park/react';

const { Item: TimelineItem } = Timeline;

const versionTypeDic = {
  release: i18n.t('publisher:release version'),
  beta: i18n.t('publisher:preview version'),
};
interface IProps {
  artifacts: PUBLISHER.IArtifacts;
}

const VersionList = (props: IProps) => {
  const { artifacts } = props;
  const { id: artifactsId } = artifacts || {};
  const { getVersionList, setGrayAndPublish, getOnlineVersionData, getH5PackageNames } = publisherStore.effects;
  const [list, paging, onlineVersionData] = publisherStore.useStore((s) => [s.versionList, s.versionPaging, s.onlineVersionData]);
  const [isFetching] = useLoading(publisherStore, ['getVersionList']);
  const publishOperationAuth = usePerm((s) => s.org.publisher.operation.pass);
  const { mode, publisherItemId } = routeInfoStore.useStore((s) => s.params);
  const isMobile = mode === ArtifactsTypeMap.MOBILE.value;
  const [{ pageNo, formModalVis, h5packageNames, curPackageName, curMobileType, grayModalVisible, versionGrayData, uploadModalVisible }, updater] = useUpdate({
    pageNo: 1,
    formModalVis: false,
    h5packageNames: [],
    curPackageName: '',
    curMobileType: 'ios' as PUBLISHER.MobileType,
    grayModalVisible: false,
    versionGrayData: {} as PUBLISHER.IVersion | Obj,
    uploadModalVisible: false,
  });
  const isH5 = curMobileType === 'h5';

  const mobileType = isMobile ? curMobileType : undefined;
  const packageName = isH5 ? curPackageName : undefined;

  useMount(() => {
    getH5PackageNames({ publishItemId: artifactsId }).then((names) => {
      updater.h5packageNames(names);
      names[0] && updater.curPackageName(names[0]);
    });
  });

  const getList = React.useCallback((q?: Obj) => {
    getVersionList({
      pageNo,
      artifactsId,
      mobileType,
      packageName,
      ...q,
      pageSize: 15,
    });
    getOnlineVersionData({ publishItemId: +publisherItemId, mobileType, packageName });
  }, [artifactsId, getOnlineVersionData, getVersionList, mobileType, packageName, pageNo, publisherItemId]);

  React.useEffect(() => {
    getList();
  }, [getList]);

  const loadmore = () => getList({ pageNo: paging.pageNo + 1 });

  useUnmount(() => {
    publisherStore.reducers.clearVersionList();
  });

  const openFormModal = () => {
    updater.formModalVis(true);
  };
  const closeFormModal = () => {
    updater.formModalVis(false);
  };
  const reloadVersionList = () => {
    getList({ pageNo: 1, mobileType: curMobileType });
  };

  const daySplit = {};
  list.forEach((item) => {
    const day = item.createdAt.slice(0, 10);
    daySplit[day] = daySplit[day] || [];
    daySplit[day].push(item);
  });

  const setGray = (record: PUBLISHER.IVersion) => {
    updater.versionGrayData({ ...record, versionStates: record.versionStates || 'beta' });
    updater.grayModalVisible(true);
  };

  const disableVersionConf = (record: PUBLISHER.IVersion) => {
    return onlineVersionData.length === 2 && !record.versionStates;
  };

  const onCloseGrayModal = () => {
    updater.grayModalVisible(false);
    updater.versionGrayData({});
  };

  const onAfterPublishHandle = () => {
    onCloseGrayModal();
    reloadVersionList();
    getOnlineVersionData({ publishItemId: +publisherItemId, mobileType: curMobileType, packageName });
  };

  const openGrayModal = (record: PUBLISHER.IVersion) => {
    if (isEmpty(onlineVersionData)) {
      setGrayAndPublish({
        versionStates: 'release',
        action: 'publish',
        publishItemID: +publisherItemId,
        publishItemVersionID: +record.id,
        packageName,
      }).then(() => {
        onAfterPublishHandle();
      });
      return;
    }

    if (record.public) {
      setGrayAndPublish({
        action: 'unpublish',
        publishItemID: +publisherItemId,
        publishItemVersionID: +record.id,
        versionStates: record.versionStates,
        packageName,
      }).then(() => {
        onAfterPublishHandle();
      });
    } else {
      if (isEmpty(onlineVersionData)) {
        return message.warn(i18n.t('publisher:tips of setting gray'));
      }
      setGray(record);
    }
  };
  const versionStateRender = (record: PUBLISHER.IVersion) => {
    const { versionStates, grayLevelPercent } = record;
    if (versionStates) {
      let content: string = versionTypeDic[versionStates];
      if (versionStates === 'beta') {
        content += `:${grayLevelPercent}%`;
      }
      return <span className="tag-success ml8">({content})</span>;
    } else {
      return null;
    }
  };

  const handleUploadSuccess = (type: PUBLISHER.OfflinePackageType) => {
    if (type === curMobileType) {
      getList();
    } else {
      updater.curMobileType(type);
    }
  };

  return (
    <div className="publisher-version-list">
      {
        // 由于后端逻辑问题，3.15先移除此按钮，
        // mode === ArtifactsTypeMap.MOBILE.value ? <Button type="primary" className="mt8 mb16" ghost onClick={openFormModal}>{i18n.t('publisher:add version')}</Button> : null
      }
      {
        isMobile && (
          <div className="flex-box">
            <Radio.Group
              buttonStyle="solid"
              className="mb16"
              onChange={(e) => {
                updater.curMobileType(e.target.value);
              }}
              value={curMobileType}
            >
              <Radio.Button value="ios">iOS</Radio.Button>
              <Radio.Button value="android">Android</Radio.Button>
              {
                curPackageName ? (
                  <Dropdown overlay={(
                    <Menu onClick={(sel) => {
                      updater.curMobileType('h5');
                      updater.curPackageName(sel.key);
                    }}
                    >
                      {
                          h5packageNames.map((n) => (
                            <Menu.Item key={n}>
                              {n}
                            </Menu.Item>
                          ))
                        }
                    </Menu>
                    )}
                  >
                    <Radio.Button value="h5">H5{curPackageName ? `(${curPackageName})` : null} <CustomIcon style={{ lineHeight: 1 }} type="caret-down" /></Radio.Button>
                  </Dropdown>
                )
                  : <Radio.Button value="h5">H5</Radio.Button>
              }
            </Radio.Group>
            <WithAuth pass={publishOperationAuth} disableMode>
              <Button onClick={() => { updater.uploadModalVisible(true); }}>{i18n.t('upload offline package')}</Button>
            </WithAuth>
          </div>
        )
      }
      <Holder when={isEmpty(daySplit) && !isFetching}>
        <Timeline className="version-list">
          {
            map(daySplit, (items: [], day) => {
              return (
                <TimelineItem key={day}>
                  <div className="day-split mb16">{day}</div>
                  <div className="version-day-list">
                    {
                      map(items, (record: PUBLISHER.IVersion) => {
                        const { id, buildId, public: isPublic, version, createdAt, meta, versionStates, targetMobiles, resources } = record;
                        const { appName, projectName } = meta || {} as PUBLISHER.IMeta;
                        const _targetMobiles = targetMobiles || { ios: [], android: [] };
                        const appStoreURL = get(find(resources, ({ type }) => type === 'ios'), 'meta.appStoreURL');
                        return (
                          <div key={id} className="version-item">
                            <div className={`version-number mb12 ${isPublic ? 'on' : 'off'}`}>
                              <CustomIcon type={isPublic ? 'yuanxingxuanzhongfill' : 'tishi'} />
                              <span className="number">V{version} ({buildId})</span>
                              {versionStateRender(record)}
                            </div>
                            <div className="version-tips">
                              <CustomIcon type="xm-2" /><span className="text">{appName}</span>
                              <CustomIcon type="yy-4" /><span className="text">{projectName}</span>
                              <CustomIcon type="shijian" /><span className="text">{createdAt ? moment(createdAt).format('HH:mm:ss') : '-'}</span>
                              {
                                curMobileType === 'ios' && appStoreURL ? (
                                  <>
                                    <CustomIcon type="app" />
                                    <a className="nowrap app-store-url" target="_blank" rel="noopener noreferrer" href={appStoreURL} >{appStoreURL}</a>
                                  </>
                                ) : null
                              }
                              {
                                isH5 && (
                                  <>
                                    <Popover
                                      title={i18n.t('Supported iOS package versions')}
                                      placement="bottom"
                                      content={(
                                        <div>
                                          {map(_targetMobiles.ios, (n) => (<span className="tag-default mr4 mb4" key={n}>{n}</span>))}
                                        </div>
                                      )}
                                    >
                                      <span className="text"><IconApple size="16px" /> {_targetMobiles.ios?.length || 0}个版本</span>
                                    </Popover>
                                    <Popover
                                      title={i18n.t('Supported Android package versions')}
                                      placement="bottom"
                                      content={(
                                        <div>
                                          {map(_targetMobiles.android, (n) => (<span className="tag-default mr4 mb4" key={n}>{n}</span>))}
                                        </div>
                                      )}
                                    >
                                      <span className="text"><IconAndroid size="16px" /> {_targetMobiles.android?.length || 0}个版本</span>
                                    </Popover>
                                  </>
                                )
                              }
                            </div>
                            <div className="version-op right-flex-box">
                              <IF check={versionStates === 'beta'}>
                                <WithAuth pass={publishOperationAuth} >
                                  <Button className="mr8" onClick={() => { setGray(record); }}>{i18n.t('publisher:set gray release')}</Button>
                                </WithAuth>
                              </IF>
                              <Popconfirm
                                title={i18n.t('is it confirmed {action}?', { action: isPublic ? i18n.t('publisher:withdraw') : i18n.t('publisher:shelf') })}
                                onConfirm={() => { openGrayModal(record); }}
                              >
                                <WithAuth pass={publishOperationAuth} >
                                  <Tooltip title={disableVersionConf(record) ? i18n.t('publisher:tips of gray setting and publish') : undefined}>
                                    <Button disabled={disableVersionConf(record)}>{isPublic ? i18n.t('publisher:withdraw') : i18n.t('publisher:shelf')}</Button>
                                  </Tooltip>
                                </WithAuth>
                              </Popconfirm>
                            </div>
                          </div>
                        );
                      })
                    }
                  </div>
                </TimelineItem>
              );
            })
          }
        </Timeline>
      </Holder>
      <VersionFormModal
        visible={formModalVis}
        artifacts={artifacts}
        onCancel={closeFormModal}
        afterSubmit={reloadVersionList}
      />
      <LoadMore load={loadmore} hasMore={paging.hasMore} isLoading={isFetching} />
      <GrayFormModal
        visible={grayModalVisible}
        onOk={onAfterPublishHandle}
        formData={versionGrayData}
        onCancel={onCloseGrayModal}
      />
      <UploadModal
        visible={uploadModalVisible}
        onCancel={() => { updater.uploadModalVisible(false); }}
        afterUpload={handleUploadSuccess}
      />
    </div >
  );
};

export default VersionList;
