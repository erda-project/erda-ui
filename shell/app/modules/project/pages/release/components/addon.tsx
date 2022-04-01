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
import { Radio } from 'antd';
import { Icon as CustomIcon, FileEditor } from 'common';
import { ossImg } from 'common/utils';
import { CATEGORY_NAME, PLAN_NAME } from 'app/modules/addonPlatform/pages/common/configs';

import './addon.scss';

interface IProps {
  addons?: Addon[];
  addonYaml?: string;
}

interface Addon extends IAddon {
  logoURL: string;
  displayName: string;
}

enum ViewType {
  graphic = 'graphic',
  code = 'code',
}

const AddonInfo = ({ addons = [], addonYaml = '' }: IProps) => {
  const [viewType, setViewType] = React.useState<string>(addons.length !== 0 ? ViewType.graphic : ViewType.code);
  const categoryList: string[] = addons
    .filter((addon, index) => index === addons.findIndex((item) => item.category === addon.category))
    .map((item) => item.category);

  const changeViewType = (val: string) => {
    setViewType(val);
  };

  return (
    <div className="mb-2">
      {addons.length !== 0 && addonYaml ? (
        <Radio.Group
          className="flex items-center"
          size="small"
          value={viewType}
          onChange={(e: any) => changeViewType(e.target.value)}
        >
          <Radio.Button value={ViewType.graphic}>
            <CustomIcon type="lc" />
          </Radio.Button>
          <Radio.Button value={ViewType.code}>
            <CustomIcon type="html1" />
          </Radio.Button>
        </Radio.Group>
      ) : null}

      <div className="my-4">
        {addons.length !== 0 && viewType === ViewType.graphic ? (
          <div>
            {categoryList.map((category) => {
              return (
                <div className="mt-4">
                  <div className="mb-2 text-base font-medium">{CATEGORY_NAME[category]}</div>
                  <div className="flex">
                    {addons
                      .filter((addon) => addon.category === category)
                      .map((addon) => {
                        return (
                          <div className="addon-item flex">
                            <div className="px-4 py-6">
                              <img src={ossImg(addon.logoURL, { w: 40 })} style={{ width: '40px' }} alt="addon-logo" />
                            </div>
                            <div className="pt-4 pr-4 pb-4">
                              <div className="text-base leading-5 font-medium">{addon.displayName}</div>
                              <div className="mt-2 text-black-6">
                                {PLAN_NAME[addon.plan]} {addon.version}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {addonYaml && viewType === ViewType.code ? (
          <div>
            <FileEditor fileExtension="json" value={addonYaml} readOnly />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AddonInfo;
