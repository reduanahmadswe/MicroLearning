'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();
  
  // Don't show on auth pages only
  if (pathname?.startsWith('/auth')) {
    return null;
  }

  // Show navbar on all other pages including public routes
  return <Navbar />;
}
