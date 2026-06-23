import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* HERO SECTION */}
      <section
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://smktarunabhakti.sch.id/wp-content/uploads/2023/11/ALM08013-1-scaled-700x300.jpg)",
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 text-center text-white px-6 max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">
            Perpustakaan Digital
          </h1>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 drop-shadow-lg text-blue-400">
            Taruna Bhakti
          </h2>

          <p className="text-lg md:text-xl mb-8 leading-relaxed text-gray-200">
            Akses ribuan koleksi buku digital, kapan saja dan di mana saja.
            Tingkatkan literasi dengan cara yang modern dan praktis.
          </p>

          {/* BUTTON */}
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              href="/auth/register"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg"
            >
              Daftar Sekarang
            </Link>
            <Link
              href="/auth/login"
              className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition"
            >
              Masuk
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">
            Kenapa Pakai Perpustakaan Ini?
          </h2>
          <p className="text-gray-600 mb-12">
            Solusi modern untuk membaca dan meminjam buku di sekolah
          </p>

          <div className="grid md:grid-cols-3 gap-8 cursor-pointer">
            {[
              {
                title: "Koleksi Lengkap",
                desc: "Ribuan buku dari berbagai jurusan & kategori.",
                icon: "📚",
              },
              {
                title: "Akses Cepat",
                desc: "Pinjam & baca langsung tanpa ribet.",
                icon: "⚡",
              },
              {
                title: "Gratis",
                desc: "Tanpa biaya, khusus untuk siswa & guru.",
                icon: "🎓",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-gray-50 p-8 rounded-xl shadow hover:shadow-xl transition"
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <Stat number="10K+" label="Buku Digital" />
          <Stat number="5K+" label="Anggota Aktif" />
          <Stat number="50+" label="Kategori Buku" />
          <Stat number="24/7" label="Akses Online" />
        </div>
      </section>

      {/* POPULAR BOOKS */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-10">
            📖 Buku Populer
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {["Laskar Pelangi", "Bumi", "Negeri 5 Menara"].map((book, idx) => (
              <div
                key={idx}
                className="bg-gray-50 rounded-xl shadow hover:shadow-xl p-4 transition"
              >
                <h3 className="text-lg font-semibold mt-4">{book}</h3>
                <p className="text-gray-500 text-sm mb-3">Penulis Terkenal</p>
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                  Pinjam Buku
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Siap Jadi Pembaca Digital?</h2>
        <p className="text-blue-100 mb-8">
          Gabung sekarang dan akses ribuan buku secara gratis!
        </p>

        <Link
          href="/auth/register"
          className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          Daftar Sekarang
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-10 text-center">
        <p>© 2025 Perpustakaan Digital – Taruna Bhakti</p>
        <p className="text-sm text-gray-400 mt-2">Project Asesmen</p>
      </footer>
    </div>
  );
}

/* Components */
function Stat({ number, label }) {
  return (
    <div>
      <div className="text-4xl font-bold text-blue-600 mb-2">{number}</div>
      <p className="text-gray-600">{label}</p>
    </div>
  );
}
