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
import { Button } from 'antd';
import _QRCode from 'qrcode.react';
import dayjs from 'dayjs';

import './download-pc.scss';
import { byteToM } from './utils';
import downloadBg_2x from '../images/download/download-bg@2x.png';
import downloadR1_2x from '../images/download/download-r1@2x.png';
import downloadC_2x from '../images/download/download-c@2x.png';
import downloadS1_2x from '../images/download/download-s1@2x.png';
import downloadY1_2x from '../images/download/download-y1@2x.png';
import downloadY2_2x from '../images/download/download-y2@2x.png';

interface IObj {
  [key: string]: any;
}

interface IProps {
  name: string;
  versionList: any[];
  versions: any[];
  current: IObj;
  showDownload: boolean;
  handleDownload: () => void;
}

const QRCode = _QRCode as any;

const DownloadPagePC = ({ name, versionList, versions, current, showDownload, handleDownload }: IProps) => {
  return (
    <div className="download-page bg-gray">
      <div className="content">
        <div className="card-container">
          <div className="qrcode-wrap">
            <QRCode className="qrcode" value={window.location.href} level="H" bgColor="rgba(0,0,0,0)" />
          </div>
          <p className="app-name">{name}</p>
          <p className="tips download-notice">扫描二维码下载</p>
          <p className="tips download-notice">或用手机浏览器输入网址: {window.location.href}</p>
          <div className="line" />

          {versionList.length ? (
            <>
              <ul className="version-list">{versions}</ul>
              <p className="tips version-notice">{byteToM(current.pkg)}</p>
              <p className="tips version-notice">
                更新于: {current.updatedAt ? dayjs(current.updatedAt).format('YYYY/MM/DD HH:mm') : '--'}
              </p>
              <div className="button-wrap">
                {showDownload ? (
                  <Button type="primary" onClick={handleDownload}>
                    下载
                  </Button>
                ) : null}
              </div>
            </>
          ) : (
            <p className="tips">暂时没有符合该机型的安装包</p>
          )}
        </div>
      </div>
      <img className="bg-img" src={downloadBg_2x} alt="" />
      <div className="bg-wrap">
        <img className="bg-img" src={downloadBg_2x} alt="" />
        <img className="people" src={downloadR1_2x} alt="" />
        <img className="water-mark" src={downloadC_2x} alt="" />
        <img className="s1" src={downloadS1_2x} alt="" />
        <img className="y1" src={downloadY1_2x} alt="" />
        <img className="y2" src={downloadY2_2x} alt="" />
      </div>
    </div>
  );
};

export default DownloadPagePC;
