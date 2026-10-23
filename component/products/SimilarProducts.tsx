"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type SimilarProduct = {
  _id: string;
  title: string;
  brand: string;
  price: number;
  discountPrice?: number;
  images: string[];
  slug: string;
};

export default function SimilarProducts({ slug }: { slug: string }) {
  const [products, setProducts] = useState<SimilarProduct[]>([]);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/products/${slug}/similar`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.success) setProducts(data.products);
      })
      .catch(console.error);

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (products.length === 0) return null;

  return (
    <section className="container-stridex py-16">
      <h2 className="display-headline mb-8 text-3xl text-(--color-ink)">
        You may also like
      </h2>

      <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
        {products.map((p) => {
          const hasDiscount = p.discountPrice != null;

          return (
            <Link key={p._id} href={`/products/${p.slug}`} className="group block">
              <div className="aspect-square overflow-hidden bg-(--color-stone-light)">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.images[0]}
                  alt={p.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="mt-3">
                <p className="eyebrow text-(--color-stone)">{p.brand}</p>
                <h3 className="mt-1 text-sm font-medium text-(--color-ink)">
                  {p.title}
                </h3>

                <div className="mt-1 flex items-center gap-2 text-sm">
                  <span className="font-semibold text-(--color-ink)">
                    ₹{(hasDiscount ? p.discountPrice : p.price)?.toLocaleString("en-IN")}
                  </span>
                  {hasDiscount && (
                    <span className="text-(--color-stone) line-through">
                      ₹{p.price.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}