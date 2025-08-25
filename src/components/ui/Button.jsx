import React from 'react';

const cx = (...parts) => parts.filter(Boolean).join(' ');

const Button = ({ as='button', variant='default', className='', children, ...rest }) => {
  const base = 'btn';
  const map = {
    default: '',
    primary: 'btn-primary',
    ghost: 'btn-ghost',
    danger: 'btn-danger'
  };
  const Element = as;
  return <Element className={cx(base, map[variant], className)} {...rest}>{children}</Element>;
};

export default Button;
