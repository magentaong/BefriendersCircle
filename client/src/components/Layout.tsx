import React from 'react';
import Navigation from './Navigation';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

type LayoutProps = {
  header?: string;
  children?: React.ReactNode;
};

export default function Layout({ header, children }: LayoutProps) {
  return (
    <div className="bg-white text-gray-800 px-8 py-6 w-full max-w-5xl mx-auto">
      <Navigation header={header} />
      
      <Link to="/forum">
          <button className="w-12 h-12 rounded-full bg-blossom shadow text-lg flex items-center justify-center hover:scale-105"><ArrowLeft></ArrowLeft></button>
      </Link>

      <main className="w-full h-full">{children}</main>
      {/* <Footer /> */}
    </div>
  )
}