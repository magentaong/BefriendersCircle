import React from 'react';
import Navigation from './Navigation';

type LayoutProps = {
  header?: string;
  children?: React.ReactNode;
};

export default function Layout({ header, children }: LayoutProps) {
  return (
    <div className="flex flex-col">
      <Navigation header={header} />
      <main className="w-full h-full">{children}</main>
      {/* <Footer /> */}
    </div>
  )
}