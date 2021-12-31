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
import { compact } from 'lodash';
import userStore from 'app/user/stores';
import { usePerm } from 'user/common';
import { erdaEnv } from 'common/constants';
import PersonalHomeV1 from './personal-home-v1';
import i18n from 'i18n';
import routeInfoStore from 'core/stores/route';
import OrgSelector from './org-selector';
import moment from 'moment';
import ActiveRank from './active-rank';
import PersonalContribute from './personal-contribute';
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
  const currentOrg = orgStore.useStore((s) => s.currentOrg);
  const inParams = { orgName: orgName || '-' };
  const [listType, setListType] = React.useState('project');

  React.useEffect(() => {
    document.title = `${i18n.t('Personal workbench')} · Erda`;

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

  const Head = React.useCallback(() => {
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
          <div className="font-medium text-lg text-default">
            <span>{`${getInvitationTime()}, ${loginUser.nick || loginUser.name}`}</span>
            <span className="inline-block ml-3">{i18n.t('Welcome to your personal workbench')}</span>
          </div>
          <div className="text-xs text-default-6">{`${i18n.t('dop:Tody is {time}', {
            time: `${moment().format('YYYY/MM/DD')} ${i18n.t('{week}', { week: Days[new Date().getDay()] })}`,
            interpolation: { escapeValue: false },
          })}`}</div>
        </div>
        <div className="flex items-center justify-between mt-6 mb-4">
          <OrgSelector size="big" />
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
  }, [loginUser, openMap]);

  const UserProfileComp = React.useCallback(() => {
    return (
      <div className="space-y-4">
        <UserProfile
          className="mt-20"
          data={{
            id: loginUser.id,
            name: loginUser.nick || loginUser.name,
            avatar: loginUser.avatar,
            email: loginUser.email,
            phone: loginUser.phone,
            lastLoginTime: loginUser.lastLoginAt,
          }}
        />
        <PersonalContribute currentUser={loginUser} />
        <ActiveRank currentUser={loginUser} />
      </div>
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
            desc={i18n.t('dop:choose frequently used project and set them as stars for easy operation')}
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
            desc={i18n.t('dop:choose frequently used applications and set them as stars for easy operation')}
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
          className: 'personal-workbench-page items-stretch mr-4',
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
      head: Head,
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
  }, [listType, Head, UserProfileComp, EmptyMap]);

  if (inParams.orgName === '-') {
    // no org, use old homepage
    return <PersonalHomeV1 />;
  }

  return (
    <div className="pb-2 h-full">
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
