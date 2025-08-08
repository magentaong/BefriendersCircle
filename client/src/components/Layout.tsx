import React from 'react';
import Navigation from './Navigation';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

type LayoutProps = {
  header?: string;
  children?: React.ReactNode;
  topic?: string
};

export default function Layout({ header, children, topic }: LayoutProps) {
  return (
    <div className="bg-white text-base px-8 py-6 w-full max-w-5xl mx-auto">
      <Navigation header={header} />

      <main className="w-full h-full">{children}</main>
      {/* <Footer /> */}
    </div>
  )
}