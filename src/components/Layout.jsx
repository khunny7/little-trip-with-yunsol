import React from 'react';
import Header from './Header';

const Layout = ({ children, className = '' }) => {
  return (
    <div className={`layout ${className}`}>
      <Header />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
