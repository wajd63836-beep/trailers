import "./globals.css";

export const metadata = {
  title: "تريلرز — كل العروض التشويقية في مكان واحد",
  description: "تريلرات الأفلام والمسلسلات والألعاب في منصة واحدة",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
