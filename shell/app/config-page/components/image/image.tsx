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
import classnames from 'classnames';
import './image.scss';
import DEFAULT_ORGANIZATION_SVG from 'app/images/resources/org.png';
import DEFAULT_PROJECT_SVG from 'app/images/default-project-icon.png';
import ERDA_LOGO from 'app/images/Erda.svg';

const Image = (props: CP_IMAGE.Props) => {
  const { props: configProps } = props;
  const { src = '', type = 'project', size = 'normal', visible = true, isCircle = false, display = 'inline-block' } = configProps || {};
  const cls = classnames({
    'cp-dice-image': true,
    [size]: true,
    'circle': isCircle,
    [display]: true,
  });

  const defaultImgMap = {
    organization: DEFAULT_ORGANIZATION_SVG,
    project: DEFAULT_PROJECT_SVG,
  }
  
  if (!visible) {
    return null;
  }

  if (type === 'erda') {
    return <img src={ERDA_LOGO} className={`${cls} erda-logo`} />
  }

  return <img src={src || defaultImgMap[type]} className={`${cls}`} />
}

export default Image;