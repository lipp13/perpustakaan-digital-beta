'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nipd: '',
    password: '',
    confirmPassword: '',
    registerType: 'email' // 'email' or 'nipd'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi password tidak sama');
      setIsLoading(false);
      return;
    }

    try {
      const registerData = {
        name: formData.name,
        password: formData.password,
        role: 'umum'
      };

      if (formData.registerType === 'email') {
        registerData.email = formData.email;
      } else {
        registerData.nipd = formData.nipd;
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const data = await res.json();

      if (res.ok) {
        // Auto login after successful registration
        const result = await signIn('credentials', {
          [formData.registerType === 'email' ? 'email' : 'nipd']: 
            formData.registerType === 'email' ? formData.email : formData.nipd,
          password: formData.password,
          redirect: false
        });

        if (result?.error) {
          router.push('/auth/login');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(data.error || 'Terjadi kesalahan saat registrasi');
      }
    } catch (error) {
      setError('Terjadi kesalahan saat registrasi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <i className="fas fa-user-plus text-2xl text-blue-600"></i>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Buat Akun Baru
          </h2>
          <p className="mt-2 text-gray-600">
            Daftar untuk mulai meminjam buku
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              {error}
            </div>
          )}

          {/* Register Type Toggle */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setFormData({...formData, registerType: 'email'})}
              className={`flex-1 py-2 px-4 rounded-lg border ${
                formData.registerType === 'email' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
            >
              <i className="fas fa-envelope mr-2"></i>
              Email
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, registerType: 'nipd'})}
              className={`flex-1 py-2 px-4 rounded-lg border ${
                formData.registerType === 'nipd' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
            >
              <i className="fas fa-id-card mr-2"></i>
              NIPD
            </button>
          </div>

          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                <i className="fas fa-user mr-2"></i>
                Nama Lengkap
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Masukkan nama lengkap"
              />
            </div>

            {/* Email or NIPD Field */}
            {formData.registerType === 'email' ? (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="fas fa-envelope mr-2"></i>
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="nama@email.com"
                />
              </div>
            ) : (
              <div>
                <label htmlFor="nipd" className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="fas fa-id-card mr-2"></i>
                  NIPD
                </label>
                <input
                  id="nipd"
                  name="nipd"
                  type="text"
                  required
                  value={formData.nipd}
                  onChange={(e) => setFormData({...formData, nipd: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Masukkan NIPD"
                />
              </div>
            )}

            {/* Password Fields */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                <i className="fas fa-lock mr-2"></i>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Masukkan password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                <i className="fas fa-lock mr-2"></i>
                Konfirmasi Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Konfirmasi password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Mendaftarkan...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus mr-2"></i>
                  Daftar Sekarang
                </>
              )}
            </button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Sudah punya akun?{' '}
              <Link href="/auth/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                Masuk di sini
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}