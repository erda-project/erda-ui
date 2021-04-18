import React from 'react';
import classnames from 'classnames';
import './image.scss';
import DEFAULT_SRC from 'app/images/default-project-icon.png'

const Image = (props: CP_IMAGE.Props) => {
  const { props: configProps } = props;
  const { src = DEFAULT_SRC, styleNames = {}, visible = true } = configProps || {};
  const cls = classnames({
    relative: true,
    ...styleNames,
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