'use client';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const userMenu = [
    { name: 'Dashboard', href: '/dashboard', icon: 'fas fa-home' },
    { name: 'Koleksi Buku', href: '/books', icon: 'fas fa-book-open' },
    { name: 'Riwayat', href: '/history', icon: 'fas fa-history' },
    { name: 'Profil', href: '/profile', icon: 'fas fa-user' },
  ];

  const adminMenu = [
    { name: 'Dashboard Admin', href: '/admin/dashboard', icon: 'fas fa-tachometer-alt' },
    { name: 'Kelola Buku', href: '/admin/books', icon: 'fas fa-book' },
    { name: 'Kelola User', href: '/admin/users', icon: 'fas fa-users' },
    { name: 'Transaksi', href: '/admin/transactions', icon: 'fas fa-exchange-alt' },
  ];

  const petugasMenu = [
    { name: 'Dashboard Petugas', href: '/petugas/dashboard', icon: 'fas fa-tachometer-alt' },
    { name: 'Persetujuan', href: '/petugas/approvals', icon: 'fas fa-check-circle' },
  ];

  const getMenuItems = () => {
    if (session?.user?.role === 'admin') {
      return [...userMenu, ...adminMenu];
    } else if (session?.user?.role === 'petugas') {
      return [...userMenu, ...petugasMenu];
    }
    return userMenu;
  };

  const menuItems = getMenuItems();

  return (
    <div className="w-64 bg-white shadow-lg min-h-screen">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <i className="fas fa-book text-blue-600 text-2xl"></i>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Digital Library</h1>
            <p className="text-sm text-gray-500 capitalize">{session?.user?.role}</p>
          </div>
        </div>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  pathname === item.href || pathname.startsWith(item.href + '/')
                    ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <i className={`${item.icon} w-5 mr-3`}></i>
                <span className="font-medium">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}