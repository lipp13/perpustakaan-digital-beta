'use client';
import { useState, useEffect } from 'react';

export default function UserForm({ onSubmit, loading, user, mode = 'create' }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nipd: '',
    password: '',
    role: 'umum'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        nipd: user.nipd || '',
        password: '', // Always empty for existing users
        role: user.role_name || 'umum'
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama harus diisi';
    }

    if (!formData.role) {
      newErrors.role = 'Role harus dipilih';
    }

    // For new users, password is required
    if (mode === 'create' && !formData.password) {
      newErrors.password = 'Password harus diisi';
    }

    if (mode === 'create' && formData.password && formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    // For existing users, if password is provided, it must be at least 6 characters
    if (mode === 'edit' && formData.password && formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    // Validate email format if provided
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const submitData = { ...formData };
      
      // If editing and password is empty, remove it from submission
      if (mode === 'edit' && !submitData.password) {
        delete submitData.password;
      }

      onSubmit(submitData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const getRoleDescription = (role) => {
    const descriptions = {
      admin: 'Akses penuh ke semua fitur sistem',
      petugas: 'Dapat menyetujui permintaan peminjaman',
      umum: 'User biasa, dapat meminjam buku'
    };
    return descriptions[role] || '';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Lengkap *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Masukkan nama lengkap"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role *
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.role ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="umum">User Umum</option>
            <option value="petugas">Petugas</option>
            <option value="admin">Admin</option>
          </select>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {getRoleDescription(formData.role)}
          </p>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email {formData.role === 'umum' && '(Opsional)'}
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="nama@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* NIPD */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            NIPD {formData.role === 'umum' && '(Opsional)'}
          </label>
          <input
            type="text"
            name="nipd"
            value={formData.nipd}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Masukkan NIPD"
          />
        </div>

        {/* Password */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password {mode === 'edit' ? '(Kosongkan jika tidak ingin mengubah)' : '*'}
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required={mode === 'create'}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.password ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder={mode === 'create' ? "Masukkan password" : "Masukkan password baru"}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
          {mode === 'edit' && (
            <p className="mt-1 text-xs text-gray-500">
              Biarkan kosong jika tidak ingin mengubah password
            </p>
          )}
        </div>
      </div>

      {/* Role Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Informasi Role:</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• <strong>Admin:</strong> Akses penuh ke semua fitur dan data</li>
          <li>• <strong>Petugas:</strong> Dapat menyetujui/menolak permintaan peminjaman</li>
          <li>• <strong>User Umum:</strong> Hanya dapat meminjam buku dan melihat riwayat</li>
        </ul>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4 pt-6">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={loading}
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Menyimpan...
            </>
          ) : (
            <>
              <i className="fas fa-save mr-2"></i>
              {mode === 'edit' ? 'Update User' : 'Tambah User'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}