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
import DiceConfigPage, { useMock } from 'config-page/index';
import orgStore from 'app/org-home/stores/org';
import { DropdownSelectNew, UserProfile, EmptyHolder, ErdaIcon } from 'common';
import { goTo, insertWhen } from 'common/utils';
import ScaleCard from 'config-page/components/scale-card/scale-card';
import ImgMap from 'config-page/img-map';
import { useMount } from 'react-use';
import userStore from 'app/user/stores';
import { usePerm } from 'user/common';
import { erdaEnv } from 'common/constants';
import PersonalHomeV1 from './personal-home-v1';
import i18n from 'i18n';
import routeInfoStore from 'core/stores/route';
import moment from 'moment';
import './personal-home.scss';

const getInvitationTime = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return i18n.t('Good morning');
  else if (hour >= 12 && hour <= 17) return i18n.t('Good afternoon');
  return i18n.t('Good evening');
};

const PurePersonalHome = ({ orgName }: { orgName: string }) => {
  const loginUser = userStore.useStore((s) => s.loginUser);
  const permMap = usePerm((s) => s.org);
  const [currentOrg, orgs, publicOrgs] = orgStore.useStore((s) => [s.currentOrg, s.orgs, s.publicOrgs]);
  const inParams = { orgName: orgName || '-' };
  const [listType, setListType] = React.useState('project');

  React.useEffect(() => {
    document.title = `${i18n.t('Personal dashboard')} · Erda`;

    return () => {
      document.title = ' · Erda';
    };
  }, []);

  const openMap = React.useMemo(
    () => ({
      orgCenter: permMap.entryOrgCenter.pass,
      cmp: permMap.cmp.showApp.pass,
      dop: permMap.dop.read.pass,
      fdp: permMap.entryFastData.pass && currentOrg.openFdp,
      msp: permMap.entryMsp.pass,
      ecp: erdaEnv.ENABLE_EDGE === 'true' && permMap.ecp.view.pass && currentOrg.type === 'ENTERPRISE',
    }),
    [permMap, currentOrg],
  );

  const changeOrg = (_: string, op: Obj) => {
    goTo(goTo.pages.orgRoot, { orgName: op.desc });
  };

  const Head = React.useCallback(
    (_publicOrgs: ORG.IOrg[]) => () => {
      const options = [
        {
          label: i18n.t('dop:my organization'),
          key: 'my',
          children: orgs.map((o) => ({
            key: o.name,
            label: o.displayName,
            desc: o.name,
            imgURL: o.logo || ImgMap.frontImg_default_org_icon,
          })),
        },
        ...insertWhen(!!_publicOrgs.length, [
          {
            label: i18n.t('dop:public organization'),
            key: 'public',
            children: _publicOrgs.map((o) => ({
              key: o.name,
              label: o.displayName,
              desc: o.name,
              imgURL: o.logo || ImgMap.frontImg_default_org_icon,
            })),
          },
        ]),
      ];
      const Days = [
        i18n.t('Sun'),
        i18n.t('Mon'),
        i18n.t('Tue'),
        i18n.t('Wed'),
        i18n.t('Thu'),
        i18n.t('Fri'),
        i18n.t('Sat'),
      ];
      return (
        <div>
          <div className="mt-4">
            <div className="font-medium text-lg text-default">{`
          ${getInvitationTime()}, ${loginUser.nick || loginUser.name}, ${i18n.t(
              'Welcome to a one-stop cloud native PaaS platform - Erda',
            )}`}</div>
            <div className="text-xs text-default-6">{`${i18n.t('dop:Tody is {time}', {
              time: ` ${moment().format('YYYY/MM/DD')}  ${i18n.t('{week}', { week: Days[new Date().getDay()] })}`,
              interpolation: { escapeValue: false },
            })}`}</div>
          </div>
          <div className="flex items-center justify-between mt-6 mb-4">
            <DropdownSelectNew
              title={i18n.t('dop:switch organization')}
              value={orgName}
              options={options}
              onChange={changeOrg}
              width={400}
              size="big"
            />
            <ScaleCard
              props={{ align: 'right' }}
              onClick={(v) => {
                goTo(v.href);
              }}
              data={{
                list: [
                  {
                    icon: 'DevOps-entry',
                    label: i18n.t('dop'),
                    show: openMap.dop,
                    href: goTo.resolve.dopRoot(),
                  },
                  {
                    icon: 'MSP-entry',
                    label: i18n.t('msp'),
                    show: openMap.msp,
                    href: goTo.resolve.mspRootOverview(),
                  },
                  {
                    icon: 'FDP-entry',
                    label: i18n.t('Fast data'),
                    show: openMap.fdp,
                    href: goTo.resolve.dataAppEntry(),
                  },
                  {
                    icon: 'CMP-entry',
                    label: i18n.t('Cloud management'),
                    show: openMap.cmp,
                    href: goTo.resolve.cmpRoot(),
                  },
                  {
                    icon: 'ECP-entry',
                    label: i18n.t('ecp:Edge computing'),
                    show: openMap.ecp,
                    href: goTo.resolve.ecpApp(),
                  },

                  {
                    icon: 'control-entry',
                    label: i18n.t('orgCenter'),
                    show: openMap.orgCenter,
                    href: goTo.resolve.orgCenterRoot(),
                  },
                ].filter((item) => item.show),
              }}
            />
          </div>
        </div>
      );
    },
    [loginUser, openMap, orgName, orgs],
  );

  const UserProfileComp = React.useCallback(() => {
    return (
      <UserProfile
        className="mt-20"
        data={{
          id: loginUser.id,
          name: loginUser.nick || loginUser.name,
          avatar: loginUser.avatar || ImgMap.default_user_avatar,
          email: loginUser.email,
          phone: loginUser.phone,
          lastLoginTime: loginUser.lastLoginAt,
        }}
      />
    );
  }, [loginUser]);

  const EmptyMap = React.useMemo(
    () => ({
      project: {
        card: (
          <EmptyHolder
            scene="star-project"
            direction="row"
            tip={i18n.t('no available {item}', { item: i18n.t('dop:star project') })}
            desc={i18n.t('dop:choose to set as a star project from the list of my projects below')}
          />
        ),

        defaultCardImg: ImgMap.frontImg_default_project_icon,
        list: (
          <EmptyHolder
            scene="create-project"
            className="w-full"
            direction="row"
            tip={i18n.t('no available {item}', { item: i18n.t('project') })}
            desc={i18n.t('dop:Did not join any project, was invited to join project or create project')}
          />
        ),
        defaultListImg: ImgMap.frontImg_default_project_icon,
      },
      app: {
        card: (
          <EmptyHolder
            direction="row"
            scene="star-app"
            tip={i18n.t('no available {item}', { item: i18n.t('dop:star app') })}
            desc={i18n.t('dop:choose to set as a star app from the list of my apps below')}
          />
        ),
        defaultCardImg: ImgMap.frontImg_default_app_icon,
        list: (
          <EmptyHolder
            direction="row"
            scene="create-app"
            className="w-full"
            tip={i18n.t('no available {item}', { item: i18n.t('application') })}
            desc={i18n.t('dop:Did not join any app, was invited to join or create app')}
          />
        ),
        defaultListImg: ImgMap.frontImg_default_app_icon,
      },
      messageList: {
        emptyHolder: (
          <EmptyHolder
            scene="empty-message"
            className="w-full"
            style={{ height: 360 }}
            tip={i18n.t('no available {item}', { item: i18n.t('message') })}
          />
        ),
      },
    }),
    [],
  );

  const customProps = React.useMemo(() => {
    return {
      workList: {
        props: {
          EmptyHolder: EmptyMap[listType]?.list,
          defaultLogo: EmptyMap[listType]?.defaultListImg,
        },
      },
      workCards: {
        props: {
          className: 'personal-workbench-cards',
          EmptyHolder: EmptyMap[listType]?.card,
          defaultImg: EmptyMap[listType]?.defaultCardImg,
        },
      },
      page: {
        props: {
          spaceSize: 'large',
          className: 'personal-workbench-page items-stretch',
        },
      },
      leftContent: {
        props: {
          className: 'personal-workbench-left-content overflow-hidden',
        },
      },
      workTabs: {
        op: {
          onChange: (val: string) => {
            setListType(val);
          },
        },
      },
      head: Head(publicOrgs),
      userProfile: UserProfileComp,
      workContainer: {
        props: {
          className: 'bg-white pb-0 px-4 mb-4',
        },
      },
      messageContainer: {
        props: {
          className: 'bg-white pb-0 px-4',
        },
      },
      messageList: {
        props: {
          defaultLogo: <ErdaIcon type="tongzhi" disableCurrent size={28} />,
          EmptyHolder: EmptyMap.messageList.emptyHolder,
        },
      },
    };
  }, [listType, publicOrgs, Head, UserProfileComp, EmptyMap]);

  if (inParams.orgName === '-') {
    // no org, use old homepage
    return <PersonalHomeV1 />;
  }

  return (
    <div className="px-6 pt-2 pb-2 h-full">
      <DiceConfigPage
        scenarioType="personal-workbench"
        scenarioKey="personal-workbench"
        // useMock={useMock}
        // forceMock
        forceUpdateKey={['customProps']}
        inParams={inParams}
        customProps={customProps}
      />
    </div>
  );
};

const PersonalHome = () => {
  const { getPublicOrgs } = orgStore.effects;
  const orgName = routeInfoStore.useStore((s) => s.params.orgName);
  useMount(() => {
    getPublicOrgs();
  });
  return <PurePersonalHome key={orgName} orgName={orgName} />;
};

export default PersonalHome;
