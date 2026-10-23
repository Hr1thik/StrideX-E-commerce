import type { Metadata } from "next";
import { manrope, cormorant } from "@/lib/fonts";
import "./globals.css";
import { Toaster } from "sonner";
import Script from "next/script";
import ChatWidget from "@/component/chat/ChatWidget";

export const metadata: Metadata = {
  title: "StrideX | Move Different",
  description:
    "Discover premium footwear engineered for performance and designed for everyday movement.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cormorant.variable} ${manrope.variable} antialiased`}
      >
        {children}
        <ChatWidget />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "var(--color-ink)",
              color: "var(--color-ivory)",
              border: "1px solid var(--color-champagne)",
              fontFamily: "var(--font-manrope)",
              fontSize: "13px",
            },
          }}
        />
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}