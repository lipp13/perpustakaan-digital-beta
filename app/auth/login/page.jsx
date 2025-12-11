'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    nipd: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [errorAnimation, setErrorAnimation] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { email, nipd, password } = formData;

    const response = await signIn("credentials", {
      email: email || null,
      nipd: nipd || null,
      password,
      redirect: false,
    });

    if (response?.error) {
      setError("Email / NIPD atau password salah!");
      setErrorAnimation(true);
      setLoading(false);
      return;
    }

    setSuccess(true);

    setTimeout(async () => {
      const sessionReq = await fetch("/api/auth/session");
      const session = await sessionReq.json();
      const role = session?.user?.role;

      if (role === "petugas") return router.push("/petugas/dashboard");
      if (role === "admin") return router.push("/admin/dashboard");

      router.push("/dashboard");
    }, 800);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <i className="fas fa-book text-2xl text-blue-600"></i>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Masuk ke Akun
          </h2>
          <p className="mt-2 text-gray-600">
            Akses koleksi buku digital kami
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                <i className="fas fa-envelope mr-2"></i>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="nama@email.com"
              />
            </div>

            <div className="text-center text-gray-500 text-sm">
              atau
            </div>

            <div>
              <label htmlFor="nipd" className="block text-sm font-medium text-gray-700 mb-1">
                <i className="fas fa-id-card mr-2"></i>
                NIPD
              </label>
              <input
                id="nipd"
                type="text"
                value={formData.nipd}
                onChange={(e) => setFormData({...formData, nipd: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Masukkan NIPD"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                <i className="fas fa-lock mr-2"></i>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Masukkan password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>

          <div className="text-center text-sm text-gray-600">
            Belum punya akun?{" "}
            <Link href="/auth/register" className="font-semibold text-blue-600">
              Daftar di sini
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
