'use client';
import { useEffect, useState } from 'react';
import StatusBadge from '../ui/StatusBadge';

export default function RecentActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - in real app, fetch from API
    const mockActivities = [
      {
        id: 1,
        user_name: 'Ahmad Rizki',
        book_title: 'Pemrograman JavaScript Modern',
        action: 'meminta pinjaman',
        status: 'pending',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
      },
      {
        id: 2,
        user_name: 'Siti Nurhaliza',
        book_title: 'Desain UI/UX untuk Pemula',
        action: 'buku dikembalikan',
        status: 'completed',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString() // 2 hours ago
      },
      {
        id: 3,
        user_name: 'Budi Santoso',
        book_title: 'Machine Learning Fundamentals',
        action: 'mengambil buku',
        status: 'active',
        timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString() // 4 hours ago
      },
      {
        id: 4,
        user_name: 'Maya Sari',
        book_title: 'Database Management System',
        action: 'meminta pinjaman',
        status: 'pending',
        timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString() // 6 hours ago
      }
    ];

    setActivities(mockActivities);
    setLoading(false);
  }, []);

  const getActivityIcon = (status) => {
    switch (status) {
      case 'pending':
        return 'fas fa-clock text-yellow-500';
      case 'active':
        return 'fas fa-play text-green-500';
      case 'completed':
        return 'fas fa-check-circle text-blue-500';
      default:
        return 'fas fa-info-circle text-gray-500';
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} menit lalu`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} jam lalu`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} hari lalu`;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Aktivitas Terkini
      </h3>
      
      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <i className="fas fa-history text-gray-400 text-4xl mb-3"></i>
            <p className="text-gray-500">Belum ada aktivitas</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                activity.status === 'pending' ? 'bg-yellow-100' :
                activity.status === 'active' ? 'bg-green-100' :
                'bg-blue-100'
              }`}>
                <i className={getActivityIcon(activity.status)}></i>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.user_name}</span> {activity.action}
                </p>
                <p className="text-sm text-gray-600 truncate">
                  "{activity.book_title}"
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <StatusBadge status={activity.status} />
                  <span className="text-xs text-gray-400">
                    {getTimeAgo(activity.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {activities.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
            Lihat Semua Aktivitas
          </button>
        </div>
      )}
    </div>
  );
}