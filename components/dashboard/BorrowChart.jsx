'use client';
import { useEffect, useState } from 'react';

export default function BorrowChart() {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Mock data for chart - in real app, fetch from API
    const mockData = [
      { month: 'Jan', borrows: 12 },
      { month: 'Feb', borrows: 19 },
      { month: 'Mar', borrows: 8 },
      { month: 'Apr', borrows: 15 },
      { month: 'Mei', borrows: 22 },
      { month: 'Jun', borrows: 18 },
    ];
    setChartData(mockData);
  }, []);

  const maxBorrows = Math.max(...chartData.map(item => item.borrows));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Statistik Peminjaman Bulanan
      </h3>
      
      <div className="space-y-3">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className="w-16 text-sm text-gray-600 font-medium">
              {item.month}
            </div>
            <div className="flex-1 ml-4">
              <div className="flex items-center">
                <div 
                  className="bg-blue-500 h-6 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(item.borrows / maxBorrows) * 100}%` }}
                ></div>
                <span className="ml-2 text-sm text-gray-600 font-medium">
                  {item.borrows}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Total Peminjaman: {chartData.reduce((sum, item) => sum + item.borrows, 0)}</span>
          <span>Rata-rata: {Math.round(chartData.reduce((sum, item) => sum + item.borrows, 0) / chartData.length)}/bulan</span>
        </div>
      </div>
    </div>
  );
}