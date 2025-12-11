import Link from 'next/link';

export default function BookCard({ book, showActions = true }) {
  const getStockStatus = (availableStock, totalStock) => {
    if (availableStock <= 0) {
      return { text: 'Habis', color: 'text-red-600', bg: 'bg-red-100' };
    } else if (availableStock < totalStock * 0.3) {
      return { text: 'Terbatas', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    } else {
      return { text: 'Tersedia', color: 'text-green-600', bg: 'bg-green-100' };
    }
  };

  const stockStatus = getStockStatus(book.available_stock, book.total_stock);

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-200">
      {/* Book Cover */}
      <div className="relative aspect-w-3 aspect-h-4">
        <img
          src={book.image || '/default-book-cover.jpg'}
          alt={book.title}
          className="w-full h-48 object-cover rounded-t-lg"
          onError={(e) => {
            e.target.src = '/default-book-cover.jpg';
          }}
        />
        
        {/* Category Badge */}
        {book.category_name && (
          <div className="absolute top-2 left-2">
            <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
              {book.category_name}
            </span>
          </div>
        )}
        
        {/* Stock Indicator */}
        <div className="absolute top-2 right-2">
          <span className={`${stockStatus.bg} ${stockStatus.color} px-2 py-1 rounded text-xs font-medium`}>
            {stockStatus.text}
          </span>
        </div>
      </div>

      {/* Book Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 h-12 leading-tight">
          {book.title}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-1">
          <i className="fas fa-user-edit mr-1 text-gray-400"></i>
          {book.author}
        </p>

        {/* Stock Information */}
        <div className="flex justify-between items-center mb-4 text-xs text-gray-500">
          <span>
            <i className="fas fa-layer-group mr-1"></i>
            Stok: {book.available_stock}/{book.total_stock}
          </span>
          {book.isbn && (
            <span title={`ISBN: ${book.isbn}`}>
              <i className="fas fa-barcode mr-1"></i>
              ISBN
            </span>
          )}
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="flex space-x-2">
            <Link
              href={`/books/${book.id}`}
              className="flex-1 bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <i className="fas fa-eye mr-1"></i>
              Detail
            </Link>
          </div>
        )}
      </div>

      {/* Additional Info Footer */}
      <div className="px-4 py-3 bg-gray-50 rounded-b-lg border-t border-gray-200">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>
            <i className="fas fa-calendar mr-1"></i>
            {new Date(book.created_at).toLocaleDateString('id-ID')}
          </span>
          {book.total_stock > 0 && (
            <span className={`font-medium ${
              book.available_stock === 0 ? 'text-red-500' : 'text-green-500'
            }`}>
              {Math.round((book.available_stock / book.total_stock) * 100)}% Tersedia
            </span>
          )}
        </div>
      </div>
    </div>
  );
}