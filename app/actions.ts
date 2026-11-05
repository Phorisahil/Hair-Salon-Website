"use server";

import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import prisma from "@/lib/db";
import { createSessionToken, requireAdmin } from "@/lib/auth";
import { deleteUploadedImage, saveUploadedImage } from "@/lib/image-storage";

const loginSchema = z.object({
  email: z.string().trim().email().transform((email) => email.toLowerCase()),
  password: z.string().min(8),
});

const serviceSchema = z.object({
  serviceId: z.string().optional(),
  name: z.string().min(2),
  description: z.string().min(10),
  category: z.string().min(2),
  price: z.coerce.number().min(0),
  startingPrice: z.coerce.number().optional().or(z.literal("")),
  duration: z.string().min(2),
  imageUrl: z.string().trim().max(2048).optional().or(z.literal("")),
  visible: z.string().optional(),
  featured: z.string().optional(),
});

const gallerySchema = z.object({
  title: z.string().trim().min(2).max(100),
  category: z.string().trim().min(2).max(40),
  imageUrl: z.string().trim().max(2048).optional().or(z.literal("")),
  altText: z.string().trim().max(200).optional().or(z.literal("")),
  visible: z.string().optional(),
});

const profileSchema = z.object({
  salonName: z.string().min(2),
  slogan: z.string().trim().min(2).max(120),
  phone: z.string().min(5),
  whatsapp: z.string().min(5),
  address: z.string().min(5),
  email: z.string().email().optional().or(z.literal("")),
  businessHours: z.string().min(3),
  welcomeMessage: z.string().min(10),
  bookingMessage: z.string().min(10),
  currency: z.string().min(3),
  priceNotice: z.string().min(10),
});

const reviewSchema = z.object({
  token: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(500).optional(),
});

const bookingStatusSchema = z.enum(["new", "confirmed", "completed", "cancelled"]);

export type AdminLoginState = { error: string | null };

export async function loginAdmin(
  _previousState: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Enter a valid email address and password." };
  }

  if (parsed.data.password === "ChangeThisPassword123!") {
    return {
      error: "The example admin password is disabled. Set a private ADMIN_PASSWORD in .env, then run npm run admin:reset-password.",
    };
  }

  const user = await prisma.adminUser.findUnique({
    where: { email: parsed.data.email },
  });

  if (!user || !(await bcrypt.compare(parsed.data.password, user.password))) {
    return { error: "The email or password was not recognised." };
  }

  const token = await createSessionToken(user.id);
  const cookieStore = await cookies();
  cookieStore.set("salon_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect("/admin");
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("salon_session");
  redirect("/admin/login");
}

export async function saveProfile(formData: FormData) {
  await requireAdmin();
  const parsed = profileSchema.safeParse({
    salonName: formData.get("salonName"),
    slogan: formData.get("slogan"),
    phone: formData.get("phone"),
    whatsapp: formData.get("whatsapp"),
    address: formData.get("address"),
    email: formData.get("email"),
    businessHours: formData.get("businessHours"),
    welcomeMessage: formData.get("welcomeMessage"),
    bookingMessage: formData.get("bookingMessage"),
    currency: formData.get("currency") || "ZAR",
    priceNotice: formData.get("priceNotice"),
  });

  if (!parsed.success) {
    throw new Error("Please complete all required salon details.");
  }

  const existing = await prisma.salonProfile.findFirst();
  const payload = {
    salonName: parsed.data.salonName,
    slogan: parsed.data.slogan,
    phone: parsed.data.phone,
    whatsapp: parsed.data.whatsapp,
    address: parsed.data.address,
    email: parsed.data.email || null,
    businessHours: parsed.data.businessHours,
    welcomeMessage: parsed.data.welcomeMessage,
    bookingMessage: parsed.data.bookingMessage,
    currency: parsed.data.currency,
    priceNotice: parsed.data.priceNotice,
  };

  const createPayload = {
    ...payload,
    logoUrl: "/assets/images/logo/logo-mark.jpg",
    socialLinks: "{}",
  };

  if (existing) {
    await prisma.salonProfile.update({ where: { id: existing.id }, data: payload });
  } else {
    await prisma.salonProfile.create({ data: createPayload });
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/contact");
  revalidatePath("/booking");
}

export async function createService(formData: FormData) {
  await requireAdmin();
  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    category: formData.get("category"),
    price: formData.get("price"),
    startingPrice: formData.get("startingPrice"),
    duration: formData.get("duration"),
    imageUrl: formData.get("imageUrl") || "",
    visible: formData.get("visible") || "",
    featured: formData.get("featured") || "",
  });

  if (!parsed.success) {
    throw new Error("Please complete the service form correctly.");
  }

  const imageFile = getOptionalImageFile(formData);
  const uploadedImage = imageFile
    ? await saveUploadedImage(imageFile, parsed.data.name, parsed.data.category)
    : null;
  const data = {
    name: parsed.data.name,
    description: parsed.data.description,
    category: parsed.data.category,
    price: Number(parsed.data.price),
    startingPrice: parsed.data.startingPrice ? Number(parsed.data.startingPrice) : null,
    duration: parsed.data.duration,
    imageUrl: uploadedImage?.url || parsed.data.imageUrl || "/assets/images/image-placeholder.svg",
    imagePublicId: uploadedImage?.publicId ?? null,
    visible: parsed.data.visible === "on",
    featured: parsed.data.featured === "on",
  };

  await prisma.service.create({ data });
  revalidatePath("/");
  revalidatePath("/services");
  revalidatePath("/admin");
}

export async function updateService(formData: FormData) {
  await requireAdmin();
  const serviceId = String(formData.get("serviceId") || "");
  if (!serviceId) throw new Error("Invalid service.");

  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    category: formData.get("category"),
    price: formData.get("price"),
    startingPrice: formData.get("startingPrice"),
    duration: formData.get("duration"),
    imageUrl: formData.get("imageUrl") || "",
    visible: formData.get("visible") || "",
    featured: formData.get("featured") || "",
  });

  if (!parsed.success) {
    throw new Error("Please fix the service details before saving.");
  }

  const imageFile = getOptionalImageFile(formData);
  const uploadedImage = imageFile
    ? await saveUploadedImage(imageFile, parsed.data.name, parsed.data.category)
    : null;
  const existing = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!existing) throw new Error("Service not found.");
  const imageUrl = uploadedImage?.url || parsed.data.imageUrl || null;
  await prisma.service.update({
    where: { id: serviceId },
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      category: parsed.data.category,
      price: Number(parsed.data.price),
      startingPrice: parsed.data.startingPrice ? Number(parsed.data.startingPrice) : null,
      duration: parsed.data.duration,
      imageUrl,
      imagePublicId: uploadedImage?.publicId ??
        (imageUrl === existing.imageUrl ? existing.imagePublicId : null),
      visible: parsed.data.visible === "on",
      featured: parsed.data.featured === "on",
    },
  });
  if (uploadedImage && existing.imagePublicId) {
    await deleteUploadedImage(existing.imagePublicId);
  }

  revalidatePath("/");
  revalidatePath("/services");
  revalidatePath("/admin");
}

export async function deleteService(formData: FormData) {
  await requireAdmin();
  const serviceId = String(formData.get("serviceId") || "");
  if (!serviceId) return;

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) throw new Error("Service not found.");
  await prisma.service.delete({ where: { id: serviceId } });
  await deleteUploadedImage(service.imagePublicId);
  revalidatePath("/");
  revalidatePath("/services");
  revalidatePath("/admin");
}

export async function createGalleryEntry(formData: FormData) {
  await requireAdmin();
  const parsed = gallerySchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    imageUrl: formData.get("imageUrl") || "",
    altText: formData.get("altText") || "",
  });
  if (!parsed.success) throw new Error("Please complete the gallery form correctly.");

  const imageFile = getOptionalImageFile(formData);
  const uploadedImage = imageFile
    ? await saveUploadedImage(imageFile, parsed.data.title)
    : null;
  const imageUrl = uploadedImage?.url || parsed.data.imageUrl;
  if (!imageUrl) throw new Error("Choose an image to add to the gallery.");

  await prisma.galleryImage.create({
    data: {
      title: parsed.data.title,
      category: parsed.data.category,
      imageUrl,
      imagePublicId: uploadedImage?.publicId ?? null,
      altText: parsed.data.altText || parsed.data.title,
      visible: true,
    },
  });

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/admin");
}

export async function updateGalleryEntry(formData: FormData) {
  await requireAdmin();
  const imageId = String(formData.get("imageId") || "");
  if (!imageId) throw new Error("Invalid gallery entry.");

  const parsed = gallerySchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    imageUrl: formData.get("imageUrl") || "",
    altText: formData.get("altText") || "",
    visible: formData.get("visible") || "",
  });
  if (!parsed.success) throw new Error("Please fix the gallery details before saving.");

  const imageFile = getOptionalImageFile(formData);
  const uploadedImage = imageFile
    ? await saveUploadedImage(imageFile, parsed.data.title)
    : null;
  const existing = await prisma.galleryImage.findUnique({ where: { id: imageId } });
  if (!existing) throw new Error("Gallery image not found.");
  const imageUrl =
    uploadedImage?.url || parsed.data.imageUrl || "/assets/images/image-placeholder.svg";
  await prisma.galleryImage.update({
    where: { id: imageId },
    data: {
      title: parsed.data.title,
      category: parsed.data.category,
      imageUrl,
      imagePublicId: uploadedImage?.publicId ??
        (imageUrl === existing.imageUrl ? existing.imagePublicId : null),
      altText: parsed.data.altText || parsed.data.title,
      visible: parsed.data.visible === "on",
    },
  });
  if (uploadedImage && existing.imagePublicId) {
    await deleteUploadedImage(existing.imagePublicId);
  }

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/admin");
}

export async function deleteGalleryEntry(formData: FormData) {
  await requireAdmin();
  const imageId = String(formData.get("imageId") || "");
  if (!imageId) throw new Error("Invalid gallery entry.");

  const image = await prisma.galleryImage.findUnique({ where: { id: imageId } });
  if (!image) throw new Error("Gallery image not found.");
  await prisma.galleryImage.delete({ where: { id: imageId } });
  await deleteUploadedImage(image.imagePublicId);
  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/admin");
}

function getOptionalImageFile(formData: FormData): File | null {
  const value = formData.get("image");
  if (value === null || (value instanceof File && value.size === 0 && value.name === "")) {
    return null;
  }
  if (!(value instanceof File)) {
    throw new Error("Please choose a valid image file.");
  }
  return value;
}

export async function submitBooking(formData: FormData) {
  const customerName = String(formData.get("customerName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const serviceId = String(formData.get("serviceId") || "");
  const preferredDate = String(formData.get("preferredDate") || "");
  const preferredTime = String(formData.get("preferredTime") || "");
  const notes = String(formData.get("notes") || "");
  const referenceImageUrl = String(formData.get("referenceImageUrl") || "");

  if (!customerName || !phone || !preferredDate || !preferredTime) {
    throw new Error("Please complete the required booking details.");
  }

  const service = serviceId ? await prisma.service.findUnique({ where: { id: serviceId } }) : null;

  await prisma.booking.create({
    data: {
      customerName,
      phone,
      serviceId: service?.id || null,
      serviceName: service?.name || "Custom request",
      preferredDate,
      preferredTime,
      referenceImageUrl: referenceImageUrl || null,
      notes: notes || null,
      message: notes || null,
    },
  });

  revalidatePath("/booking");
  revalidatePath("/admin");
  redirect("/booking?success=1");
}

export async function updateBookingStatus(formData: FormData) {
  await requireAdmin();
  const bookingId = String(formData.get("bookingId") || "");
  const parsedStatus = bookingStatusSchema.safeParse(formData.get("status"));
  if (!bookingId || !parsedStatus.success) {
    throw new Error("Choose a valid appointment status.");
  }

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new Error("Appointment not found.");

  const status = parsedStatus.data;
  const reviewToken =
    status === "completed"
      ? booking.status === "completed" && booking.reviewToken
        ? booking.reviewToken
        : randomBytes(32).toString("base64url")
      : null;

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status, reviewToken },
  });

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function submitCustomerReview(formData: FormData) {
  const parsed = reviewSchema.safeParse({
    token: formData.get("token"),
    rating: formData.get("rating"),
    comment: formData.get("comment") || "",
  });
  if (!parsed.success) {
    throw new Error("Choose a rating from 1 to 5 stars and check your comment.");
  }

  const booking = await prisma.booking.findFirst({
    where: { reviewToken: parsed.data.token },
    select: { id: true, status: true, rating: true },
  });
  if (!booking || booking.status !== "completed" || booking.rating !== null) {
    throw new Error("This review link is invalid, expired, or has already been used.");
  }

  const result = await prisma.booking.updateMany({
    where: {
      id: booking.id,
      reviewToken: parsed.data.token,
      status: "completed",
      rating: null,
    },
    data: {
      rating: parsed.data.rating,
      reviewComment: parsed.data.comment || null,
      reviewedAt: new Date(),
    },
  });
  if (result.count !== 1) {
    throw new Error("This review link has already been used.");
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/review/${parsed.data.token}`);
  redirect(`/review/${parsed.data.token}?submitted=1`);
}
