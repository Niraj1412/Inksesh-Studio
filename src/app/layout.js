import "./globals.css";

export const metadata = {
  title: "Inksesh Studio Admin",
  description: "Studio admin MVP for managing artists and assets.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
