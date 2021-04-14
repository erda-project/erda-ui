import React from 'react';
import classnames from 'classnames';
import './image.scss';

const Image = (props: CP_IMAGE.Props) => {
  const { props: configProps } = props;
  const { src = './images/default-project-icon.png' } = configProps || {};
  return (
    <div className='info-img'>
      <img src={src} width={40} />
    </div>
  )
}

export default Image;