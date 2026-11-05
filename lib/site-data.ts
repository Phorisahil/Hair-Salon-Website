import prisma from "@/lib/db";

export async function getSalonProfile() {
  const profile = await prisma.salonProfile.findFirst();

  if (!profile) {
    return {
      salonName: "PrimeSA_Salon",
      slogan: "Look Good • Feel Beautiful • Be You",
      logoUrl: "/assets/images/logo/logo-mark.jpg",
      phone: "+27 83 551 5085",
      whatsapp: "+27835515085",
      address: "264 Mkhize Road, Pinetown, Durban",
      email: "sahil.lume@gmail.com",
      businessHours: "Mon-Fri 7:00-18:00 | Sat 8:00-17:00 | Sun By appointment",
      socialLinks: {},
      welcomeMessage:
        "Discover professional men's haircuts, women's hairstyles, hair treatments, and other services chosen by the salon owner.",
      bookingMessage:
        "Tell us your preferred service, date, and time, and share hairstyle reference images to help us prepare for your appointment.",
      currency: "ZAR",
      priceNotice:
        "Ask us about your preferred service and any details that may affect its price.",
    };
  }

  return {
    salonName: profile.salonName,
    slogan: profile.slogan,
    logoUrl: profile.logoUrl ?? "/assets/images/logo/logo-mark.jpg",
    phone: profile.phone,
    whatsapp: profile.whatsapp,
    address: profile.address,
    email: profile.email,
    businessHours: profile.businessHours,
    socialLinks: safeParseJson(profile.socialLinks),
    welcomeMessage: profile.welcomeMessage,
    bookingMessage: profile.bookingMessage,
    currency: profile.currency,
    priceNotice: profile.priceNotice,
  };
}

export function formatPrice(value: number, currency = "ZAR") {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
    .format(value)
    .replace(/[\s\u00a0]/g, "");
}

function safeParseJson(raw: string | null) {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

export async function getVisibleServices() {
  return prisma.service.findMany({
    where: { visible: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getVisibleGallery() {
  return prisma.galleryImage.findMany({
    where: { visible: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getFeaturedServices() {
  return prisma.service.findMany({
    where: { visible: true, featured: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllServices() {
  return prisma.service.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllGallery() {
  return prisma.galleryImage.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllBookings() {
  return prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getBookingForReview(token: string) {
  return prisma.booking.findFirst({
    where: { reviewToken: token },
    select: {
      serviceName: true,
      status: true,
      rating: true,
    },
  });
}

export async function getPublicReviews() {
  const [summary, reviews] = await Promise.all([
    prisma.booking.aggregate({
      where: { rating: { not: null } },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    prisma.booking.findMany({
      where: { rating: { not: null } },
      orderBy: { reviewedAt: "desc" },
      take: 6,
      select: {
        serviceName: true,
        rating: true,
        reviewComment: true,
        reviewedAt: true,
      },
    }),
  ]);

  return {
    averageRating: summary._avg.rating,
    totalRatings: summary._count.rating,
    reviews,
  };
}
