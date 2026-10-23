"use client";

import Image from "next/image";
import { Heart, Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Navbar from "@/component/layout/Navbar";
import Footer from "@/component/layout/Footer";
import SimilarProducts from "@/component/products/SimilarProducts";

interface Product {
  _id:string;
  title: string;
  description: string;
  brand: string;
  category: string;
  gender: "men" | "women" | "unisex";
  price: number;
  discountPrice?: number;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  slug: string;
}

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { slug } = await params;

        const response = await fetch(`/api/products/${slug}`);

        if (!response.ok) {
          throw new Error("Product not found");
        }

        const data = await response.json();

        setProduct(data.product);
      } catch (error) {
        console.error("Failed to fetch product:", error);
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params]);

  if (loading) {
    return (
      <main className="bg-ivory">
        <section className="section-y">
          <div className="container-stridex">
            <div className="grid gap-10 lg:grid-cols-2">
              <div className="aspect-square animate-pulse rounded-3xl bg-stone-light" />

              <div className="flex flex-col justify-center">
                <div className="h-4 w-24 animate-pulse bg-stone-light" />

                <div className="mt-4 h-12 w-3/4 animate-pulse bg-(--color-stone-light)" />

                <div className="mt-6 h-6 w-32 animate-pulse bg-(--color-stone-light)" />

                <div className="mt-8 h-20 w-full animate-pulse bg-(--color-stone-light)" />
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="bg-(--color-ivory)">
        <section className="section-y">
          <div className="container-stridex">
            <h1 className="display-headline text-display-lg text-(--color-ink)">
              Product not found
            </h1>
          </div>
        </section>
      </main>
    );
  }

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const increaseQuantity = () => {
    setQuantity((prev) => Math.min(product.stock, prev + 1));
  };

  const handleAddToBag = async () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }

    if (!selectedColor) {
      toast.error("Please select a color");
      return;
    }

    if (product.stock <= 0) {
      toast.error("This product is currently out of stock");
      return;
    }

  try {
    const response = await fetch ("/api/cart",{
      method:"POST",
      headers:{
        "Content-type":"application/json",
      },
      credentials:"include",
      body:JSON.stringify({
        productId:product._id,
        size:selectedSize,
        color:selectedColor,
        quantity,
    })
  })

  if(response.status === 401){
    toast.error("Please log in to add items to your bag")
    router.push("/login")
    return;
  }
     
    const data = await response.json();

    if(!response.ok){
      toast.error(data.message || "Failed to add product to cart")
      return;

    }

    toast.success("Product added to cart")
    router.push("/cart")
   
  } catch (error) {
    console.error("Add to cart error",error)
    toast.error("Something went wrong .Please try again.")
  }
  };

  return (
    <>
    <Navbar cartCount={0} />
    <main className="bg-(--color-ivory)">
      <section className="section-y">
        <div className="container-stridex">
          <div className="grid gap-10 lg:grid-cols-2">

            {/*IMAGE SECTION */}
            <div>
              {/* Main Image */}
              <div className="relative aspect-square overflow-hidden rounded-3xl bg-(--color-stone-light)">
                <Image
                  src={product.images[selectedImage]}
                  alt={product.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain p-10"
                />

                {/* Wishlist */}
                <button
                  type="button"
                  aria-label="Add to wishlist"
                  onClick={() =>
                    setIsWishlisted((prev) => !prev)
                  }
                  className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-(--color-ivory) text-(--color-ink) shadow-sm transition-colors hover:text-(--color-champagne)"
                >
                  <Heart
                    size={18}
                    strokeWidth={1.5}
                    fill={isWishlisted ? "currentColor" : "none"}
                    className={
                      isWishlisted
                        ? "text-(--color-champagne)"
                        : ""
                    }
                  />
                </button>
              </div>

              {/* Image Thumbnails */}
              {product.images.length > 1 && (
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {product.images.map((image, index) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setSelectedImage(index)}
                      className={`relative aspect-square overflow-hidden rounded-xl bg-(--color-stone-light) ${
                        selectedImage === index
                          ? "ring-2 ring-(--color-ink)"
                          : ""
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.title} ${index + 1}`}
                        fill
                        sizes="120px"
                        className="object-contain p-3"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/*PRODUCT INFO*/}
            <div className="flex flex-col justify-center">

              {/* Brand */}
              <p className="eyebrow text-(--color-champagne)">
                {product.brand}
              </p>

              {/* Title */}
              <h1 className="display-headline mt-3 text-display-lg text-(--color-ink)">
                {product.title}
              </h1>

              {/* Price */}
              <div className="mt-5 flex items-center gap-3">
                <p className="text-lg font-medium text-(--color-ink)">
                  ₹
                  {(
                    product.discountPrice ?? product.price
                  ).toLocaleString("en-IN")}
                </p>

                {product.discountPrice && (
                  <p className="text-sm text-(--color-stone) line-through">
                    ₹{product.price.toLocaleString("en-IN")}
                  </p>
                )}
              </div>

              {/* Description */}
              <p className="mt-6 max-w-lg text-sm leading-6 text-(--color-stone)">
                {product.description}
              </p>

              {/* SIZE */}
              <div className="mt-8">
                <div className="mb-4 flex items-center justify-between">
                  <p className="eyebrow text-(--color-ink)">
                    Select Size
                  </p>

                  <button
                    type="button"
                    className="text-xs text-(--color-stone) underline underline-offset-4"
                  >
                    Size Guide
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => {
                    const isSelected = selectedSize === size;

                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`flex h-11 min-w-12 items-center justify-center rounded-md border px-4 text-sm transition-all duration-200 ${
                          isSelected
                            ? "border-(--color-ink) bg-(--color-ink) text-(--color-ivory)"
                            : "border-(--color-stone-light) text-(--color-ink) hover:border-(--color-ink)"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/*COLOR */}
              <div className="mt-8">
                <p className="eyebrow mb-4 text-(--color-ink)">
                  Color
                </p>

                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => {
                    const isSelected = selectedColor === color;

                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`rounded-md border px-4 py-2 text-sm transition-all duration-200 ${
                          isSelected
                            ? "border-(--color-ink) bg-(--color-ink) text-(--color-ivory)"
                            : "border-(--color-stone-light) text-(--color-ink) hover:border-(--color-ink)"
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/*QUANTITY*/}
              <div className="mt-8">
                <p className="eyebrow mb-4 text-(--color-ink)">
                  Quantity
                </p>

                <div className="flex h-11 w-fit items-center rounded-md border border-(--color-stone-light)">
                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    className="flex h-full w-11 items-center justify-center text-(--color-ink) disabled:opacity-30"
                  >
                    <Minus size={15} strokeWidth={1.5} />
                  </button>

                  <span className="w-10 text-center text-sm">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={increaseQuantity}
                    disabled={quantity >= product.stock}
                    className="flex h-full w-11 items-center justify-center text-(--color-ink) disabled:opacity-30"
                  >
                    <Plus size={15} strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/*ADD TO BAG*/}
              <button
                type="button"
                onClick={handleAddToBag}
                disabled={product.stock <= 0}
                className="mt-10 w-full rounded-md bg-(--color-ink) px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-(--color-ivory) transition-colors duration-300 hover:bg-(--color-champagne) disabled:cursor-not-allowed disabled:opacity-50"
              >
                {product.stock > 0
                  ? "Add to Bag"
                  : "Out of Stock"}
              </button>

              {/* Stock */}
              <p className="mt-4 text-xs text-(--color-stone)">
                {product.stock > 0
                  ? `${product.stock} items available`
                  : "Currently out of stock"}
              </p>

            </div>
          </div>
        </div>
      </section>
       <SimilarProducts slug={product.slug} />
    </main>
    <Footer/>
    </>
  );
}