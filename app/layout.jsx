import Providers from "./providers";
import "./global.css";

export const metadata = {
  title: 'Perpustakaan Digital',
  description: 'Sistem Perpustakaan Digital',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" 
          rel="stylesheet" 
        />
      </head>
      <body className="bg-gray-50">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
