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
import Avatar, { AvatarProps } from 'antd/es/avatar';
import { useMount } from 'react-use';

interface Props extends AvatarProps {
  timeout?: number;
}

const WapperAvatar = (props: Props) => {
  const { timeout = 200, children, src, ...rest } = props;
  const ref = React.useRef<HTMLDivElement>(null);
  const [img, setImg] = React.useState(src);

  useMount(() => {
    const imgLoad = (_img: HTMLImageElement, timeoutCallback: () => void) => {
      // set user img empty after timeout
      const timer = setTimeout(() => {
        clearTimeout(timer);
        if (!_img.complete) {
          timeoutCallback();
        }
      }, timeout);
    };

    if (ref.current) {
      // get avatar img element;
      const imgEle = ref.current.querySelector('img');
      imgEle && imgLoad(imgEle, () => setImg(''));
    }
  });

  return (
    <Avatar ref={ref} src={img} {...rest}>
      {children}
    </Avatar>
  );
};
WapperAvatar.Group = Avatar.Group;

export default WapperAvatar;
