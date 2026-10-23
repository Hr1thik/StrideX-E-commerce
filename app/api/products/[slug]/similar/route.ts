import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    const { slug } = await params;

    const current = await Product.findOne({ slug, isActive: true }).lean();
    if (!current) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    const genderFilter =
      current.gender === "unisex"
        ? {}
        : { gender: { $in: [current.gender, "unisex"] } };

    const candidates = await Product.find({
      _id: { $ne: current._id },
      isActive: true,
      stock: { $gt: 0 },
      ...genderFilter,
    })
      .limit(50)
      .lean();

    const currentPrice = current.discountPrice ?? current.price;
    const currentBrand = current.brand.toLowerCase();

    const similar = candidates
      .map((p) => {
        const pPrice = p.discountPrice ?? p.price;
        let score = 0;
        if (p.category === current.category) score += 3;
        if (p.brand.toLowerCase() === currentBrand) score += 2;
        if (p.gender === current.gender) score += 2;
        if (Math.abs(pPrice - currentPrice) <= currentPrice * 0.3) score += 1;
        return { p, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((x) => x.p);

    return NextResponse.json({ success: true, products: similar });
  } catch (error) {
    console.error("Similar products error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}