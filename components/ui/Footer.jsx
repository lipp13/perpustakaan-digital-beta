export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <i className="fas fa-book text-blue-400 text-2xl"></i>
              <span className="text-xl font-bold">Digital Library</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Platform perpustakaan digital modern yang memudahkan akses ke pengetahuan 
              dan koleksi buku terbaik untuk semua kalangan.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-facebook text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-twitter text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-instagram text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-linkedin text-xl"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Tautan Cepat</h3>
            <ul className="space-y-2">
              <li>
                <a href="/books" className="text-gray-400 hover:text-white transition-colors">
                  Koleksi Buku
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-400 hover:text-white transition-colors">
                  Tentang Kami
                </a>
              </li>
              <li>
                <a href="/help" className="text-gray-400 hover:text-white transition-colors">
                  Bantuan
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Kontak
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Kontak</h3>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center">
                <i className="fas fa-map-marker-alt mr-3 text-blue-400"></i>
                <span>Jl. Perpustakaan No. 123, Jakarta</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-phone mr-3 text-blue-400"></i>
                <span>(021) 1234-5678</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-envelope mr-3 text-blue-400"></i>
                <span>info@digitallibrary.id</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-clock mr-3 text-blue-400"></i>
                <span>Buka 24/7 Online</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} Digital Library. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
              Kebijakan Privasi
            </a>
            <a href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
              Syarat & Ketentuan
            </a>
            <a href="/sitemap" className="text-gray-400 hover:text-white text-sm transition-colors">
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}