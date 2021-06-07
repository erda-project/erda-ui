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
import i18n from 'i18n';
import { Copy } from 'common';
import { Modal, Alert, Input, Button } from 'app/nusi';

interface IProps {
  url: string;
  visible: boolean;
  code?: string;
  tip?: string;
  linkPrefixTip?: string;
  modalProps?: { [k: string]: any };
  onCancel: () => void;
}

export const UrlInviteModal = ({
  url,
  visible,
  code,
  tip,
  linkPrefixTip,
  modalProps = {},
  onCancel,
}: IProps) => {
  return (
    <>
      <Modal
        className="url-invite-modal"
        title={code ? i18n.t('The invitation link and verification code have been created') : i18n.t('The invitation link have been created')}
        visible={visible}
        onCancel={onCancel}
        footer={
          <>
            <span
              className="for-copy"
              data-clipboard-tip={code ? i18n.t('invitation link and verification code') : i18n.t('invitation link')}
              data-clipboard-text={
                `${linkPrefixTip || ''}\n${url}\n${code ? `${i18n.t('verification code')}: ${code}` : ''}`
              }
            >
              <Button type="primary">{i18n.t('copy')}</Button>
            </span>
            <Copy selector=".for-copy" />
          </>
        }
        {...modalProps}
      >
        {tip ? <Alert className="mb20" message={tip} type="normal" showIcon /> : null}
        <div className="content">
          <div className="item mb16">
            <p className="label mb8">{i18n.t('url address')}</p>
            <Input readOnly value={url} />
          </div>
          {code && (
            <div className="item mb16">
              <p className="label mb8">{i18n.t('verification code')}</p>
              <Input readOnly value={code} />
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};
