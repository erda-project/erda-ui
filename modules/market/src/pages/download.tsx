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
import { Spin, message, Button, Rate, Tabs, Carousel, Col, Row } from 'antd';
import { StickyContainer as _StickyContainer, Sticky as _Sticky } from 'react-sticky';
import { withRouter } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import classNames from 'classnames';
import { goTo, handleError, judgeClient, byteToM } from './utils';
import './download.scss';
import DownloadPC from './download-pc';

const { TabPane } = Tabs;
const Sticky = _Sticky as any;
const StickyContainer = _StickyContainer as any;

interface IObj {
  [key: string]: any;
}

interface IPublishItemCard {
  id: number;
  name: string;
  displayName: string;
  logo: string;
  publisherId: number;
  publishItemKey: string;
  type: string;
  public: boolean;
  orgId: number;
  desc: string;
  creator: string;
  createdAt: string;
  updatedAt: string;
}

const useRecommend = (curId: string): [IPublishItemCard[], boolean] => {
  const [loading, setLoading] = React.useState(false);
  const [data, setDate] = React.useState([] as IPublishItemCard[]);

  React.useEffect(() => {
    setLoading(true);
    axios
      .get('/api/publish-items', {
        params: {
          public: true,
          type: 'MOBILE',
          pageSize: 9,
          pageNo: 1,
        },
      })
      .then((response: any) => {
        const body = response.data;
        if (body.success) {
          const { list } = body.data;
          if (list && list.length) {
            // 推荐列表移除当前app
            setDate(list.filter((item: IPublishItemCard) => String(item.id) !== curId).slice(0, 6));
          }
        } else {
          handleError(body.err || {});
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [curId]);
  return [data, loading];
};

const replaceHost = (logo: string) =>
  logo ? window.location.origin.replace('http:', 'https:') + '/api' + logo.split('/api')[1] : logo;

const getOrgFromPath = () => {
  return window.location.pathname.split('/')[1] || '-';
};

const isEmptyObj = (obj: IObj) => {
  return obj === null || obj === undefined || Object.keys(obj).length === 0;
};

interface IProps {
  type: string;
  className?: string;
  color?: boolean;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler;
}
const Icon = ({ type, className, style, onClick, color, ...rest }: IProps) => {
  const classes = classNames(!color && 'iconfont', !color && `icon${type}`, color && 'icon', className);
  if (color) {
    return (
      <svg className={classes} aria-hidden="true" style={style} onClick={onClick}>
        <use xlinkHref={`#icon${type}`} />
      </svg>
    );
  }
  return <i className={classes} style={style} onClick={onClick} {...rest} />;
};

const DownloadPage = ({ match }: any) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasDefault, setHasDefault] = React.useState(false);
  const [versionList, setVersionList] = React.useState([] as any[]);
  const [current, setCurrent] = React.useState({ activeKey: '', pkg: {} } as IObj);
  const [logo, setLogo] = React.useState('');
  const [name, setName] = React.useState('');
  const [desc, setDesc] = React.useState('');
  const [previewImgs, setPreviewImgs] = React.useState([]);
  const [showDownload, setShowDownload] = React.useState(false);
  const [descExpand, setDescExpand] = React.useState(false);
  const [showGallery, setShowGallery] = React.useState(false);
  const [fullBgUrl, setFullBgUrl] = React.useState('');
  const client = judgeClient().toLowerCase();
  const [recommend] = useRecommend(match.params.publishItemId);
  const slideRef: any = React.useRef(null);

  const curOrg = getOrgFromPath();
  React.useEffect(() => {
    setIsLoading(true);
    axios
      .get(`/api/${curOrg}/publish-items/${match.params.publishItemId}/distribution`, {
        params: {
          mobileType: client === 'pc' ? undefined : client,
        },
      }) // pc 端就不传参数，返回空列表
      .then((response: any) => {
        const { success, data, err } = response.data;
        if (success) {
          const { default: defaultVersion, versions } = data as {
            default: any;
            versions: { list: any[]; total: number };
          };
          const vList = versions.list || [];
          let has_default = false;
          if (defaultVersion) {
            const { id, updatedAt } = defaultVersion;
            const resources = defaultVersion.resources || [];
            let pkg = resources[0] || {};
            if (client !== 'pc') {
              pkg = resources.filter((item: IObj) => item.type === client)[0] || {};
            }
            const { meta = {}, type } = pkg;
            const activeKey = `${id}-${type}-${meta.fileId}`;
            setCurrent({ activeKey, pkg, updatedAt, version: meta.version });
            has_default = resources.some((t: any) => t.type === client || (t.type === 'data' && client === 'pc'));
            setHasDefault(has_default);
          }
          setLogo(replaceHost(data.logo));
          setName(data.displayName || data.name);
          setDesc(data.desc || '');
          setPreviewImgs(data.previewImages ? data.previewImages.map(replaceHost) : []);
          setVersionList(vList);
          if (client === 'pc') {
            const { resources = [] } = defaultVersion || {};
            const type = resources?.[0]?.type;
            setShowDownload(has_default && type === 'data');
          } else {
            setShowDownload(has_default);
          }
        } else {
          handleError(err);
        }
        setIsLoading(false);
      })
      .catch((e) => {
        console.log(e);
        setIsLoading(false);
      });
  }, [client, curOrg, match.params.publishItemId]);
  const handleChangePkg = (activeKey: string, pkg: IObj, updatedAt: string) => {
    const { type } = pkg;
    let download = false;
    if (type === 'data') {
      download = client === 'pc' && hasDefault;
    } else {
      download = client !== 'pc' && hasDefault;
    }
    setShowDownload(download);
    setCurrent({ activeKey, pkg, updatedAt });
  };
  const handleDownload = () => {
    if (isEmptyObj(current)) {
      message.error('请选择要下载的版本');
      return;
    }
    const { meta = {}, url, type }: IObj = current.pkg || {};
    if (client === 'pc' && type !== 'data') {
      message.info('请在移动端下载');
      return;
    }
    const isInWeChat: boolean = /micromessenger/i.test(navigator.userAgent);
    if (isInWeChat) {
      message.info(`请在${client === 'ios' ? 'Safari' : ''}浏览器中打开当前页面`);
      return;
    }
    let downloadUrl = url;
    if (client === 'ios') {
      const { installPlist = '' } = meta;
      if (!installPlist) {
        message.info('下载链接不存在，请稍后刷新重试');
        return;
      }
      if (installPlist.indexOf('https://') === -1) {
        message.info('请使用HTTPS协议链接');
        return;
      }
      downloadUrl = `itms-services://?action=download-manifest&url=${installPlist}`;
    }
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.click();
    link.remove();
  };
  const versions = [...versionList].map((item) => {
    const { resources = [], id, updatedAt, isDefault } = item;
    let packages = resources || [];
    if (client !== 'pc') {
      packages = packages.filter((pkg: IObj) => pkg.type === client);
    }
    if (!isDefault) {
      return null;
    }
    return packages.map((pkg: IObj) => {
      const { meta, name: vName, type } = pkg;
      const { version, fileId } = meta;
      const displayname = version ? `${version}-${vName}` : vName;
      const key = `${id}-${type}-${fileId}`;
      const isActive = key === current.activeKey;
      return (
        <li
          className={`version-item ${isActive ? 'active' : ''}`}
          data-a={type}
          key={key}
          onClick={() => {
            handleChangePkg(key, pkg, updatedAt);
          }}
        >
          {displayname}
        </li>
      );
    });
  });

  const handleShowGallery = (index: number) => {
    slideRef.current && slideRef.current.goTo(index);
    setTimeout(() => {
      setShowGallery(true);
    }, 0);
  };

  const renderTabBar = (props: any, DefaultTabBar: any) => (
    <Sticky bottomOffset={80}>
      {({ style }: { style: any }) => <DefaultTabBar {...props} className="site-custom-tab-bar" style={{ ...style }} />}
    </Sticky>
  );

  const appStoreURL = current?.pkg?.meta?.appStoreURL;
  const pcProps = {
    name,
    versionList,
    versions,
    current,
    showDownload,
    handleDownload,
  };

  return (
    <>
      <Spin spinning={isLoading}>
        {client === 'pc' ? (
          <DownloadPC {...pcProps} />
        ) : (
          <div className={`download ${fullBgUrl ? 'full-bg' : ''}`} style={{ backgroundImage: `url(${fullBgUrl})` }}>
            <div className="content">
              {client === 'ios' && appStoreURL ? (
                <div className="jump-app-store">
                  <a href={appStoreURL} target="_blank" rel="noreferrer">
                    跳转至App Store
                  </a>
                </div>
              ) : null}
              <div className="card-container">
                <div className="app-logo text-center">
                  {logo ? <img className="logo" src={logo} alt="" /> : <Icon type="app" />}
                </div>

                <div className="app-name">{name}</div>
                <div className="center-flex-box rate">
                  <Rate disabled defaultValue={5} />
                  <span className="v-line"></span>
                  办公应用
                </div>
                <div className="tag-list">
                  <span className="tag">安全</span>
                  <span className="tag">系统已审核</span>
                </div>

                <StickyContainer>
                  <>
                    <div className="preview-img-list">
                      {previewImgs.map((url, index) => {
                        return (
                          <img
                            key={index}
                            className="preview-img"
                            src={url}
                            alt="preview-image"
                            onClick={() => handleShowGallery(index)}
                          />
                        );
                      })}
                      <div style={{ paddingRight: '1rem' }}></div>
                    </div>
                    <div className="flex-box mt12 app-provider">
                      <span>
                        <span className="mr8">
                          {current.version ? moment(current.updatedAt).format('YYYY/MM/DD') : '-'} 更新
                        </span>
                        <span>{current.version || '-'} 版本</span>
                      </span>
                    </div>
                    {desc && (
                      <div className="app-desc" onClick={() => setDescExpand((p) => !p)}>
                        {descExpand ? desc : desc.length > 90 ? `${desc.slice(0, 90)}...` : desc}
                        {desc.length > 90 ? (
                          <span className="expand">
                            <Icon type={descExpand ? 'fold' : 'unfold'}></Icon>
                          </span>
                        ) : null}
                      </div>
                    )}
                  </>
                </StickyContainer>
                <div className="button-wrap">
                  {React.Children.count(versions) ? (
                    showDownload ? (
                      <Button
                        type="primary"
                        style={{ borderColor: 'transparent' }}
                        size="large"
                        onClick={handleDownload}
                      >
                        安装 ({byteToM(current.pkg)})
                      </Button>
                    ) : null
                  ) : (
                    <Button type="ghost" style={{ backgroundColor: '#fff' }} size="large">
                      暂无当前机型的安装包
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <Carousel ref={slideRef} className={`full-gallery ${showGallery ? '' : 'invisible'}`}>
              {previewImgs.map((url) => {
                return (
                  <div key={url} className="img-wrap">
                    <img
                      onClick={() => {
                        setShowGallery(false);
                      }}
                      className="gallery-img"
                      src={url}
                      alt=""
                    />
                  </div>
                );
              })}
            </Carousel>
          </div>
        )}
      </Spin>
    </>
  );
};

export default withRouter(DownloadPage);
