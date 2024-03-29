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

import { map, findLast, isEqual, cloneDeep, filter, uniqueId, find } from 'lodash';
import React from 'react';
import { useUpdate } from 'common/use-hooks';
import { ErdaIcon } from 'common';
import { setLS, goTo, firstCharToUpper } from 'common/utils';
import { Row, Col, Form, Input, Popconfirm, Modal, message, FormInstance } from 'antd';
import i18n from 'i18n';
import routeInfoStore from 'core/stores/route';
import runtimeStore from 'runtime/stores/runtime';
import runtimeDomainStore from 'runtime/stores/domain';

import './domain-modal.scss';

const FormItem = Form.Item;

interface IProps {
  serviceName: string;
  form: FormInstance;
  visible: boolean;
  onCancel: () => void;
}

type IDomain = Merge<RUNTIME_DOMAIN.Item, { id: string }>;

const DomainModal = (props: IProps) => {
  const [form] = Form.useForm();
  const { visible, serviceName, onCancel } = props;
  const {
    id: runtimeId,
    releaseId,
    clusterType,
    extra: { workspace },
  } = runtimeStore.useStore((s: any) => s.runtimeDetail);
  const domainMap = runtimeDomainStore.useStore((s) => s.domainMap);
  const { projectId } = routeInfoStore.useStore((s) => s.params);

  const initDomains = cloneDeep(domainMap[serviceName]);
  const [{ domains }, updater] = useUpdate({
    domains: map(initDomains, (x) => ({ ...x, id: uniqueId() })),
  });

  React.useEffect(() => {
    if (visible) {
      updater.domains(cloneDeep(map(domainMap[serviceName], (x) => ({ ...x, id: uniqueId() }))) as IDomain[]);
    }
  }, [domainMap, serviceName, updater, visible]);

  const saveConfig = () => {
    const doneSaveConfig = () => {
      domainMap[serviceName] = domains;
      setLS(`${runtimeId}_domain`, domainMap);
      onCancel();
    };
    form.validateFields().then((values: any) => {
      map(values, (realValue, keyStr) => {
        const [domainType, name, id] = keyStr.split('@');
        const target = id ? find(domains, (x) => x.id === id) : findLast(domains, domainType);
        name && (target[name] = realValue);
      });
      if (!isEqual(domainMap[serviceName], domains)) {
        if (['k8s', 'edas'].includes(clusterType)) {
          runtimeDomainStore
            .updateK8SDomain({
              runtimeId,
              releaseId,
              serviceName,
              domains: map(
                filter(
                  domains,
                  (domain) =>
                    domain.domainType !== 'PACKAGE' &&
                    ((domain.domainType === 'DEFAULT' && domain.customDomain) || domain.domainType !== 'DEFAULT'),
                ),
                (domain) => (domain.domainType === 'DEFAULT' ? domain.customDomain + domain.rootDomain : domain.domain),
              ),
            })
            .then(() => {
              setTimeout(() => {
                // TODO: refactor
                location.reload();
              }, 1000);
            });
        } else {
          doneSaveConfig();
          runtimeStore.setHasChange(true);
        }
      } else {
        message.warning(i18n.t('dop:no change'));
      }
    });
  };

  const addCustom = () => {
    if (domains.length >= 1) {
      updater.domains([
        ...domains,
        {
          domainType: 'CUSTOM',
          packageId: '',
          tenantGroup: '',
          appName: '',
          domain: '',
          customDomain: '',
          rootDomain: '',
          useHttps: true,
          id: uniqueId(),
        },
      ]);
    }
  };

  const deleteCustom = (index: number) => {
    const newList = [...domains];
    newList.splice(index, 1);
    updater.domains(newList);
  };

  const hrefparams = React.useMemo(() => {
    let tenantGroup = '';
    let packageId = '';
    if (Array.isArray(domains)) {
      packageId = domains[0]?.packageId;
      tenantGroup = domains[0]?.tenantGroup;
    }
    return {
      tenantGroup,
      packageId,
    };
  }, [domains]);

  const gotoGetwayDetail = () => {
    const { tenantGroup, packageId } = hrefparams;
    // /microService/{projectId}/{env}/{tenantGroup}/gateway/api-package/{packageId}/detail'
    // const href = `/microService/${projectId}/${workspace}/${tenantGroup}/gateway/api-package/${packageId}/detail`;
    goTo(goTo.pages.getwayDetail, {
      projectId,
      env: workspace,
      packageId,
      tenantGroup,
    });
  };

  const packageDomain = domains.filter((item) => item.domainType === 'PACKAGE');

  return (
    <Modal
      title={
        <span>
          {serviceName} {i18n.t('runtime:Domain settings').toLowerCase()}
        </span>
      }
      visible={visible}
      destroyOnClose
      onOk={saveConfig}
      onCancel={onCancel}
    >
      <Form layout="vertical" form={form}>
        <div className="config-item ml-3">
          <div className="flex justify-between items-center config-item-title font-medium text-base mb-2">
            <span style={{ marginRight: '40px' }}>
              {hrefparams.packageId && hrefparams.tenantGroup ? (
                <span className="text-xs fake-link" onClick={gotoGetwayDetail}>
                  {i18n.t('runtime:route rule configuration')}
                </span>
              ) : null}
            </span>
          </div>
          {map(domains, ({ domainType, customDomain, rootDomain, domain, id }, index) => {
            return domainType === 'DEFAULT' ? (
              <div key={id} className="default-area">
                <Row>
                  <Col span={22}>
                    <FormItem
                      label={firstCharToUpper(i18n.t('domain'))}
                      name={`${domainType}@customDomain@${id}`}
                      initialValue={customDomain}
                      rules={[
                        // { required: true, message: i18n.t('runtime:please fill in the domain name') },
                        {
                          // 公司内项目不允许包含. 不允许有4级域名
                          pattern: rootDomain.includes('terminus')
                            ? /^[a-zA-Z0-9][-a-zA-Z0-9]{0,62}$/
                            : /^[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})*$/,
                          message: i18n.t('runtime:please fill in the correct domain name'),
                        },
                      ]}
                    >
                      <Input
                        placeholder={i18n.t('runtime:please fill in the domain name')}
                        addonAfter={rootDomain}
                        autoComplete="off"
                      />
                    </FormItem>
                  </Col>
                </Row>
                <div className="custom-domain" key="custom">
                  <span className="text-default">{i18n.t('runtime:Custom domain')}</span>
                </div>
              </div>
            ) : domainType === 'CUSTOM' ? (
              <Row key={id} align="middle">
                <Col span={22}>
                  <FormItem className="hidden" name={`${domainType}@@${id}`} initialValue={serviceName}>
                    <Input />
                  </FormItem>
                  <FormItem
                    name={`${domainType}@domain@${id}`}
                    initialValue={domain}
                    rules={[
                      { required: true, message: i18n.t('runtime:please fill in the custom domain name') },
                      {
                        pattern: /^[a-zA-Z0-9*][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9*][-a-zA-Z0-9]{0,62})+\.?$/,
                        message: i18n.t('runtime:please fill in the correct domain name'),
                      },
                    ]}
                  >
                    <InputItem onDelete={() => deleteCustom(index)} />
                  </FormItem>
                </Col>
              </Row>
            ) : null;
          })}

          <div className="add-domain-icon">
            <ErdaIcon
              type="add-one"
              className="hover-active cursor-pointer mt-1 text-black-4"
              onClick={() => addCustom()}
              size="18"
            />
          </div>
          {packageDomain?.length ? (
            <div>
              <div className="mb-2 text-default">{i18n.t('msp:Endpoint')}</div>
              {packageDomain.map((item) => (
                <div key={item.domain} className="mb-1">
                  {item.domain}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </Form>
    </Modal>
  );
};

export default DomainModal as any as (p: Omit<IProps, 'form'>) => JSX.Element;

interface IInputItemProps {
  value?: string;
  onChange?: (v: string) => void;
  onDelete: () => void;
}

const InputItem = (props: IInputItemProps) => {
  const { value, onChange, onDelete } = props;
  return (
    <>
      <Input
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value)}
        placeholder={i18n.t('runtime:Custom domain name needs to be bound at the domain name provider.')}
        autoComplete="off"
      />
      <Popconfirm title={i18n.t('msp:confirm to delete')} onConfirm={onDelete}>
        <span className="delete-domain-icon">
          {' '}
          <ErdaIcon type="reduce-one" size="18" className="hover-active cursor-pointer mt-1.5" />{' '}
        </span>
      </Popconfirm>
    </>
  );
};
