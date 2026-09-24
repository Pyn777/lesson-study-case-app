import './globals.css';

export const metadata = {
  title: 'Interdisciplinary Case Study App',
  description: 'A longitudinal interdisciplinary biology case-study prototype.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
