import React from 'react';
import classnames from 'classnames';
import './image.scss';

const Image = (props: CP_IMAGE.Props) => {

  const { props: configProps } = props;
  const { src = './images/default-project-icon.png', relative = true, styleNames = {}, visible = true } = configProps || {};
  const cls = classnames({
    large: styleNames['large'] || false,
    normal: styleNames['normal'] || false,
    small: styleNames['small'] || false,
    relative,
    circle: styleNames['circle'] || false,
  });

  if (!visible) {
    return null
  }

  return (
    <div className='form-item-image'>
      <img src={src} className={`${cls}`} />
    </div>
  )
}

export default Image;