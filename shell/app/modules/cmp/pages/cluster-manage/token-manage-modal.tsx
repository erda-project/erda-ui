import React from 'react';
import { Modal, Popconfirm, Button } from 'core/nusi';
import i18n from 'i18n';
import { Copy as IconCopy } from '@icon-park/react';
import { Copy } from 'common';
import { getToken, createToken, resetToken } from 'cmp/services/token-manage';

interface IProps {
  visible: boolean;
  onCancel: () => void;
  token?: string;
  clusterName: string;
}

const TokenManageModal = (props: IProps) => {
  const { visible, onCancel, token, clusterName } = props;
  return (
    <Modal
      className="relative"
      onCancel={onCancel}
      width={720}
      title={i18n.t('cmp:cluster Token Management')}
      visible={visible}
      footer={[
        token ? (
          <Popconfirm
            title={i18n.t('cmp:are you sure you want to reset?')}
            onConfirm={async () => {
              await resetToken.fetch({
                clusterName,
              });
              await getToken.fetch({
                clusterName,
              });
            }}
          >
            <Button type="primary">{i18n.t('cmp:reset Token')}</Button>
          </Popconfirm>
        ) : (
          <Button
            type="primary"
            onClick={async () => {
              await createToken.fetch({
                clusterName,
              });
              await getToken.fetch({
                clusterName,
              });
            }}
          >
            {i18n.t('cmp:create Token')}
          </Button>
        ),
        <Button onClick={onCancel}>{i18n.t('application:close')}</Button>,
      ]}
    >
      <div className="rounded-sm p-2 text-gray mb-6">
        {token ? (
          <div className="flex items-center mb-1">
            <span>token</span>
            <span className="ml-32">{token}</span>
          </div>
        ) : (
          <span className="text-center">{i18n.t('cmp:no token available')}</span>
        )}
      </div>

      {token ? (
        <div className="flex items-center text-primary">
          <IconCopy size="14" />
          <Copy selector=".container-key" copyText={token}>
            {i18n.t('copy')}
          </Copy>
        </div>
      ) : null}
    </Modal>
  );
};

export default TokenManageModal;
