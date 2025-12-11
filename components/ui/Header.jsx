'use client';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Don't show header on auth pages
  if (pathname.startsWith('/auth')) {
    return null;
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <i className="fas fa-book text-blue-600 text-2xl"></i>
            <span className="font-bold text-xl text-gray-900">Digital Library</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/dashboard" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === '/dashboard' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              <i className="fas fa-home mr-2"></i>
              Dashboard
            </Link>
            <Link 
              href="/books" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname.startsWith('/books') 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              <i className="fas fa-book-open mr-2"></i>
              Buku
            </Link>
            <Link 
              href="/history" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === '/history' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              <i className="fas fa-history mr-2"></i>
              Riwayat
            </Link>
            
            {/* Admin/Petugas Links */}
            {session?.user?.role === 'admin' && (
              <Link 
                href="/admin/dashboard" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname.startsWith('/admin') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                <i className="fas fa-cog mr-2"></i>
                Admin
              </Link>
            )}
            {session?.user?.role === 'petugas' && (
              <Link 
                href="/petugas/approvals" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname.startsWith('/petugas') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                <i className="fas fa-check-circle mr-2"></i>
                Approvals
              </Link>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <Link 
              href="/profile" 
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                {session?.user?.profile_photo ? (
                  <img 
                    src={session.user.profile_photo} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <i className="fas fa-user text-gray-600 text-sm"></i>
                )}
              </div>
              <span className="hidden md:block text-sm font-medium">
                {session?.user?.name}
              </span>
            </Link>
            
            <button
              onClick={() => signOut()}
              className="text-gray-500 hover:text-red-600 transition-colors"
              title="Keluar"
            >
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}