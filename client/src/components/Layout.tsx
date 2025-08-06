import React from 'react';
import Navigation from './Navigation';

type LayoutProps = {
  header?: string;
  children?: React.ReactNode;
};

export default function Layout({ header, children }: LayoutProps) {
  return (
    <div className="bg-white text-gray-800 px-8 py-6 w-full max-w-5xl mx-auto">
      <Navigation header={header} />
      <main className="w-full h-full">{children}</main>
      {/* <Footer /> */}
    </div>
  )
}