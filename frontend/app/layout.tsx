import "./globals.css";

export const metadata = {
  title: "ExDate | The honest Indian Dividend Calendar.",
  description: "We calculate the real yield based on live prices, so you know exactly what hits your bank account.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased font-sans bg-black">
        {children}
      </body>
    </html>
  );
}
