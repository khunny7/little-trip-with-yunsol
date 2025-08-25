import React from 'react';

const cx = (...parts) => parts.filter(Boolean).join(' ');

export const Card = ({ as='div', className='', children, interactive=false, ...rest }) => {
  const Element = as;
  return <Element className={cx('card', interactive && 'card-interactive', className)} {...rest}>{children}</Element>;
};

export default Card;
