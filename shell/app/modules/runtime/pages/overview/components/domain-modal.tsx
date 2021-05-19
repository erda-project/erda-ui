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

import { map, findLast, isEqual, cloneDeep, filter } from 'lodash';
import * as React from 'react';
import { WrappedFormUtils } from 'core/common/interface';
import { useUpdate } from 'common';

import { setLS, goTo } from 'common/utils';
import { Row, Col, Form, Input, Popconfirm, Modal, message } from 'app/nusi';
import i18n from 'i18n';
import routeInfoStore from 'app/common/stores/route';
import runtimeStore from 'runtime/stores/runtime';
import runtimeDomainStore from 'runtime/stores/domain';
import { ReduceOne as IconReduceOne, AddOne as IconAddOne } from '@icon-park/react';

import './domain-modal.scss';

const FormItem = Form.Item;


interface IProps {
  serviceName: string;
  form: WrappedFormUtils;
  visible: boolean;
  onCancel(): void;
}


const DomainModal = (props: IProps) => {
  const { form, visible, serviceName, onCancel } = props;
  const { id: runtimeId, releaseId, clusterType, extra: { workspace } } = runtimeStore.useStore((s: any) => s.runtimeDetail);
  const domainMap = runtimeDomainStore.useStore(s => s.domainMap);
  const { projectId } = routeInfoStore.useStore(s => s.params);


  const initDomains = cloneDeep(domainMap[serviceName]);
  const [{
    domains,
  }, updater] = useUpdate({
    domains: initDomains,
  });

  React.useEffect(() => {
    if (visible) {
      updater.domains(cloneDeep(domainMap[serviceName]));
    }
  }, [domainMap, serviceName, updater, visible]);


  const saveConfig = () => {
    const doneSaveConfig = () => {
      domainMap[serviceName] = domains;
      setLS(`${runtimeId}_domain`, domainMap);
      onCancel();
    };
    form.validateFields((err, values) => {
      if (!err) {
        map(values, (realValue, keyStr) => {
          const [domainType, name, index] = keyStr.split('@');
          const target = index ? domains[index] : findLast(domains, domainType);
          name && (target[name] = realValue);
        });
        if (!isEqual(domainMap[serviceName], domains)) {
          if (['k8s', 'edas'].includes(clusterType)) {
            runtimeDomainStore.updateK8SDomain({
              runtimeId,
              releaseId,
              serviceName,
              domains: map(
                filter(domains, domain => (domain.domainType === 'DEFAULT' && domain.customDomain) || domain.domainType !== 'DEFAULT'),
                domain => (domain.domainType === 'DEFAULT' ? (domain.customDomain + domain.rootDomain) : domain.domain)
              ),
            }).then(() => {
              setTimeout(() => { // TODO: refactor
                location.reload();
              }, 1000);
            });
          } else {
            doneSaveConfig();
            runtimeStore.setHasChange(true);
          }
        } else {
          message.warning(i18n.t('application:no change'));
        }
      }
    });
  };

  const addCustom = () => {
    if (domains.length >= 1) {
      updater.domains([...domains, {
        domainType: 'CUSTOM',
        packageId: '',
        tenantGroup: '',
        appName: '',
        domain: '',
        customDomain: '',
        rootDomain: '',
        useHttps: true,
      }]);
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
      packageId = domains[0].packageId;
      tenantGroup = domains[0].tenantGroup;
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

  return (
    <Modal
      title={i18n.t('runtime:domain settings')}
      visible={visible}
      destroyOnClose
      onOk={saveConfig}
      onCancel={onCancel}
    >
      <Form layout="vertical">
        <div className="config-item ml12">
          <div className="flex-box config-item-title bold-500 fz16 mb8">
            <span>{serviceName}</span>
            <span style={{ marginRight: '40px' }}>
              {
                hrefparams.packageId && hrefparams.tenantGroup
                  ? (
                    <span className="fz12 fake-link" onClick={gotoGetwayDetail}>
                      {i18n.t('runtime:route rule configuration')}
                    </span>
                  )
                  : null
              }
            </span>
          </div>
          {map(
            domains,
            ({ domainType, customDomain, rootDomain, domain }, index) => {
              return domainType === 'DEFAULT' ? (
                <div key={domainType} className="default-area">
                  <Row>
                    <Col span={22}>
                      <FormItem label={i18n.t('runtime:domain name')}>
                        {form.getFieldDecorator(
                          `${domainType}@customDomain@${index}`,
                          {
                            initialValue: customDomain,
                            rules: [
                              // { required: true, message: i18n.t('runtime:please fill in the domain name') },
                              {
                                // 公司内项目不允许包含. 不允许有4级域名
                                pattern: rootDomain.includes('terminus')
                                  ? /^[a-zA-Z0-9][-a-zA-Z0-9]{0,62}$/
                                  : /^[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})*$/,
                                message: i18n.t('runtime:please fill in the correct domain name'),
                              },
                            ],
                          }
                        )(
                          <Input
                            placeholder={i18n.t('runtime:please fill in the domain name')}
                            addonAfter={rootDomain}
                            autoComplete="off"
                          />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                  <div className="custom-domain" key="custom">
                    <span>{i18n.t('runtime:custom domain name')}:</span>
                    <span className="add-domain-icon">
                      <IconAddOne
                        className="hover-active fz18 ml12 pointer"
                        onClick={() => addCustom()}
                      />
                    </span>
                  </div>
                </div>
              ) : (
                <Row
                  key={domainType + index}
                  type="flex"
                  justify="space-around"
                  align="middle"
                >
                  <Col span={22}>
                    <FormItem className="hide">
                      {form.getFieldDecorator(`${domainType}@@${index}`, {
                        initialValue: serviceName,
                      })(<Input />)}
                    </FormItem>
                    <FormItem>
                      {form.getFieldDecorator(`${domainType}@domain@${index}`, {
                        initialValue: domain,
                        rules: [
                          { required: true, message: i18n.t('runtime:please fill in the custom domain name') },
                          {
                            pattern: /^[a-zA-Z0-9*][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9*][-a-zA-Z0-9]{0,62})+\.?$/,
                            message: i18n.t('runtime:please fill in the correct domain name'),
                          },
                        ],
                      })(
                        <Input
                          placeholder={i18n.t('runtime:custom-domain-tip')}
                          autoComplete="off"
                        />
                      )}
                      {
                        <Popconfirm
                          title={i18n.t('runtime:confirm delete?')}
                          onConfirm={() => deleteCustom(index)}
                        >
                          <span className="delete-domain-icon">
                            {' '}
                            <IconReduceOne className="hover-active fz18 pointer" />{' '}
                          </span>
                        </Popconfirm>
                        }
                    </FormItem>
                  </Col>
                </Row>
              );
            }
          )}
        </div>
      </Form>
    </Modal>
  );
};

export default Form.create()(DomainModal) as any as (p: Omit<IProps, 'form'>) => JSX.Element;
