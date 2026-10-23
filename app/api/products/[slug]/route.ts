import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { updateProductSchema } from "@/validations/product";
import { getAuthUser } from "@/lib/auth";

function handleProductError(error: unknown) {
  console.error(error);

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  ) {
    return NextResponse.json(
      { success: false, message: "Product with this slug already exists" },
      { status: 409 },
    );
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name?: string }).name === "ValidationError" &&
    "errors" in error
  ) {
    const errs = (error as { errors: Record<string, { message: string }> }).errors;
    const fieldErrors: Record<string, string> = {};
    for (const key of Object.keys(errs)) {
      fieldErrors[key] = errs[key].message;
    }
    return NextResponse.json(
      { success: false, message: "Validation failed", errors: fieldErrors },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error",
    },
    { status: 500 },
  );
}

//Get one product
export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) => {
  try {
    const { slug } = await params;
    await connectDB();

    const authUser = getAuthUser(req);
    const isAdmin = authUser?.role === "admin";

    const query: Record<string, unknown> = { slug };
    if (!isAdmin) query.isActive = true;

    const product = await Product.findOne(query);

    if (!product) {
      return NextResponse.json(
        { success: false, message: "product not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, product }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
};

//update product
export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) => {
  try {
    const authUser = getAuthUser(req);
    if (authUser?.role !== "admin") {
      return NextResponse.json(
        { success: false, message: authUser ? "Forbidden" : "Unauthorized" },
        { status: authUser ? 403 : 401 },
      );
    }

    const { slug } = await params;

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, message: "Invalid request body" },
        { status: 400 },
      );
    }

    const result = updateProductSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: result.error.issues,
        },
        { status: 400 },
      );
    }

    await connectDB();

    const product = await Product.findOneAndUpdate(
      { slug },
      result.data,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Product updated successfully",
        product,
      },
      { status: 200 },
    );
  } catch (error) {
    return handleProductError(error);
  }
};

//Soft Delete Product
export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) => {
  try {
    const authUser = getAuthUser(req);
    if (authUser?.role !== "admin") {
      return NextResponse.json(
        { success: false, message: authUser ? "Forbidden" : "Unauthorized" },
        { status: authUser ? 403 : 401 },
      );
    }

    const { slug } = await params;
    await connectDB();

    const product = await Product.findOneAndUpdate(
      {
        slug,
        isActive: true,
      },
      {
        isActive: false,
      },
      {
        new: true,
      },
    );
    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Product deleted sucessfully",
      },
      { status: 200 },
    );
  } catch (error) {
    return handleProductError(error);
  }
};
