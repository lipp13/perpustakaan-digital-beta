export default function StatusBadge({ status }) {
  const statusConfig = {
    pending: {
      color: 'bg-yellow-100 text-yellow-800',
      icon: 'fas fa-clock',
      label: 'Menunggu'
    },
    approved: {
      color: 'bg-blue-100 text-blue-800',
      icon: 'fas fa-check',
      label: 'Disetujui'
    },
    rejected: {
      color: 'bg-red-100 text-red-800',
      icon: 'fas fa-times',
      label: 'Ditolak'
    },
    active: {
      color: 'bg-green-100 text-green-800',
      icon: 'fas fa-play',
      label: 'Aktif'
    },
    completed: {
      color: 'bg-gray-100 text-gray-800',
      icon: 'fas fa-check-circle',
      label: 'Selesai'
    },
    overdue: {
      color: 'bg-red-100 text-red-800',
      icon: 'fas fa-exclamation-triangle',
      label: 'Terlambat'
    },
    cancelled: {
      color: 'bg-gray-100 text-gray-800',
      icon: 'fas fa-ban',
      label: 'Dibatalkan'
    }
  };

  const config = statusConfig[status] || {
    color: 'bg-gray-100 text-gray-800',
    icon: 'fas fa-question',
    label: status
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <i className={`${config.icon} mr-1`}></i>
      {config.label}
    </span>
  );
}