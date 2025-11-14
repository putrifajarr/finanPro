export const metadata = {
  title: "Dashboard Keuangan | FinanPro",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
