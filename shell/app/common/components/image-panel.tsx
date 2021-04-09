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
import { Icon as CustomIcon } from 'common';
import './image-panel.scss';

interface IProps {
  images: string[];
}
interface IState {
  visible: boolean;
  currentKey: number;
}
export class ImagePanel extends React.Component<IProps, IState> {
  state = {
    visible: false,
    currentKey: 0,
  };

  prevImage = () => {
    const { currentKey } = this.state;
    this.setState({ currentKey: currentKey - 1 });
  };

  nextImage = () => {
    const { currentKey } = this.state;
    this.setState({ currentKey: currentKey + 1 });
  };

  show = (index: number) => {
    if (index) {
      this.setState({ visible: true, currentKey: index });
    } else {
      this.setState({ visible: true });
    }
  };

  hide = () => {
    this.setState({ visible: false });
  };

  render() {
    const { images } = this.props;
    const { visible, currentKey } = this.state;
    const { length } = images;

    return (
      <div className={visible ? 'img-panel showing' : 'img-panel'}>
        {currentKey - 1 >= 0 ? <span className="btn-prev" onClick={() => this.prevImage()}><CustomIcon type="chevronleft" /></span> : null}
        <div className="img-wrapper"><img src={images[currentKey]} alt="addon-img" onClick={() => this.hide()} /></div>
        {currentKey + 1 < length ? <span className="btn-next" onClick={() => this.nextImage()}><CustomIcon type="chevronright" /></span> : null}
      </div>
    );
  }
}
