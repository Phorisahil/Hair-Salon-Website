import { PrismaClient } from "@prisma/client";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());
const prisma = new PrismaClient();
const logoUrl = "/assets/images/logo/logo-mark.jpg";

const profileDefaults = {
  salonName: "PrimeSA_Salon",
  slogan: "Look Good • Feel Beautiful • Be You",
  logoUrl,
  phone: "+27 83 551 5085",
  whatsapp: "+27835515085",
  address: "264 Mkhize Road, Pinetown, Durban",
  email: "sahil.lume@gmail.com",
  businessHours: "Mon-Fri 7:00-18:00 | Sat 8:00-17:00 | Sun By appointment",
  welcomeMessage:
    "Discover professional men's haircuts, women's hairstyles, hair treatments, and other services chosen by the salon owner.",
  bookingMessage:
    "Tell us your preferred service, date, and time, and share hairstyle reference images to help us prepare for your appointment.",
  currency: "ZAR",
  priceNotice: "Ask us about your preferred service and any details that may affect its price.",
};

const previousServiceImages: Record<string, string> = {
  "Brush Cut": "/assets/images/hairstyles/men/brush-cut.jpg",
  "Tapered Fade": "/assets/images/hairstyles/men/tapered-fade.jpg",
  Chiskop: "/assets/images/hairstyles/men/chiskop.jpg",
  "Fade Cut": "/assets/images/hairstyles/men/fade-cut.jpg",
  "Wash and Wig Installation": "/assets/images/hairstyles/wigs/wash-wig-installation.jpg",
  "Hair Wash & Treatment": "/assets/images/hairstyles/other/hair-wash-treatment.jpg",
};

const services = [
  {
    name: "Brush Cut",
    description: "A classic haircut with a neat finish and with/without dye.",
    category: "Men's Haircuts",
    price: 50,
    duration: "1-3 hours",
    imageUrl: "/assets/images/gallery/short-hair-style-05.webp",
    featured: true,
  },
  {
    name: "Tapered Fade",
    description: "A modern haircut with a clean, tapered look.",
    category: "Men's Haircuts",
    price: 70,
    duration: "1-2 hours",
    imageUrl: "/assets/images/gallery/short-hair-style-07.webp",
    featured: true,
  },
  {
    name: "Chiskop",
    description: "A clean-shaven head for a fresh look.",
    category: "Men's Haircuts",
    price: 30,
    duration: "30 minutes-1 hour",
    imageUrl: "/assets/images/gallery/short-hair-style-09.webp",
    featured: true,
  },
  {
    name: "Fade Cut",
    description: "A stylish haircut with a gradual fade effect.",
    category: "Men's Haircuts",
    price: 70,
    duration: "1-2.5 hours",
    imageUrl: "/assets/images/gallery/short-hair-style-06.webp",
    featured: true,
  },
  {
    name: "Wash and Wig Installation",
    description: "A hair wash and precise wig installation for a polished finish.",
    category: "Wigs",
    price: 550,
    startingPrice: 300,
    duration: "2-2.5 hours",
    imageUrl: "/assets/images/gallery/short-hair-style-28.webp",
    featured: false,
  },
  {
    name: "Hair Wash & Treatment",
    description: "A cleansing hair wash and restorative treatment.",
    category: "Treatments",
    price: 80,
    startingPrice: 50,
    duration: "45-60 minutes",
    imageUrl: "/assets/images/gallery/short-hair-style-26.webp",
    featured: false,
  },
];

const gallery = [
  {
    title: "Tapered short style",
    category: "Men's Haircuts",
    imageUrl: "/assets/images/gallery/short-hair-style-01.webp",
    altText: "A short tapered haircut with a shaped beard",
  },
  {
    title: "Curly high-top style",
    category: "Men's Haircuts",
    imageUrl: "/assets/images/gallery/short-hair-style-02.webp",
    altText: "A short curly high-top hairstyle",
  },
  {
    title: "Textured crop style",
    category: "Men's Haircuts",
    imageUrl: "/assets/images/gallery/short-hair-style-03.webp",
    altText: "A short textured crop haircut",
  },
  {
    title: "Curly taper style",
    category: "Men's Haircuts",
    imageUrl: "/assets/images/gallery/short-hair-style-04.webp",
    altText: "A short curly hairstyle with a tapered side",
  },
  {
    title: "Wave cut style",
    category: "Men's Haircuts",
    imageUrl: "/assets/images/gallery/short-hair-style-05.webp",
    altText: "A short wave haircut viewed from above",
  },
  ...Array.from({ length: 20 }, (_, index) => {
    const number = String(index + 6).padStart(2, "0");
    return {
      title: `Short hairstyle ${number}`,
      category: "Hairstyles",
      imageUrl: `/assets/images/gallery/short-hair-style-${number}.webp`,
      altText: "A short hairstyle portrait from the salon gallery",
    };
  }),
];

async function main() {
  const existingProfile = await prisma.salonProfile.findFirst();
  if (existingProfile) {
    if (existingProfile.salonName === "Luna & Lace Salon" || existingProfile.salonName === "PrimeSASalon") {
      await prisma.salonProfile.update({
        where: { id: existingProfile.id },
        data: profileDefaults,
      });
    }
  } else {
    await prisma.salonProfile.create({
      data: {
        id: "default-profile",
        ...profileDefaults,
        socialLinks: "{}",
      },
    });
  }

  const previousDemoServices = [
    { name: "Knotless Braids", price: 1850, imageUrl: "/assets/images/hairstyles/knotless-braids.jpg" },
    { name: "Box Braids", price: 1700, imageUrl: "/assets/images/hairstyles/box-braids.jpg" },
    { name: "Boho Braids", price: 1950, imageUrl: "/assets/images/hairstyles/boho-braids.jpg" },
    { name: "Cornrows", price: 1200, imageUrl: "/assets/images/hairstyles/cornrows.jpg" },
    { name: "Wig Installation", price: 950, imageUrl: "/assets/images/hairstyles/wig-installation.jpg" },
  ];
  for (const item of previousDemoServices) {
    await prisma.service.updateMany({
      where: {
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
      },
      data: { visible: false },
    });
  }

  for (const [index, service] of services.entries()) {
    const { featured, ...serviceData } = service;
    const existing = await prisma.service.findFirst({ where: { name: service.name } });
    if (existing) {
      if (existing.imageUrl === previousServiceImages[service.name]) {
        await prisma.service.update({
          where: { id: existing.id },
          data: { imageUrl: serviceData.imageUrl },
        });
      }

      if (
        service.name === "Hair Wash & Treatment" &&
        existing.price === 420 &&
        existing.imageUrl === "/assets/images/hairstyles/hair-treatment.jpg"
      ) {
        await prisma.service.update({
          where: { id: existing.id },
          data: {
            ...serviceData,
            startingPrice: "startingPrice" in serviceData ? serviceData.startingPrice : null,
          },
        });
      }
    } else {
      await prisma.service.create({
        data: {
          id: `primesa-service-${index + 1}`,
          ...serviceData,
          visible: true,
          featured,
        },
      });
    }
  }

  const previousDemoGallery = [
    { title: "Knotless braid look", imageUrl: "/assets/images/gallery/braids-1.jpg" },
    { title: "Elegant cornrows", imageUrl: "/assets/images/gallery/cornrows-1.jpg" },
    { title: "Wig styling", imageUrl: "/assets/images/gallery/wig-1.jpg" },
  ];
  for (const item of previousDemoGallery) {
    await prisma.galleryImage.updateMany({
      where: { title: item.title, imageUrl: item.imageUrl },
      data: { visible: false },
    });
  }

  for (const [index, item] of gallery.entries()) {
    await prisma.galleryImage.updateMany({
      where: {
        id: `primesa-gallery-${index + 1}`,
        imageUrl: item.imageUrl.replace(/\.webp$/, ".jpg"),
      },
      data: { imageUrl: item.imageUrl },
    });

    const stableId = `primesa-gallery-${index + 1}`;
    const existing = await prisma.galleryImage.findUnique({ where: { id: stableId } });
    const existingImage = existing
      ? null
      : await prisma.galleryImage.findFirst({ where: { imageUrl: item.imageUrl } });
    if (!existing && !existingImage) {
      await prisma.galleryImage.create({
        data: {
          id: stableId,
          ...item,
          visible: true,
        },
      });
    }
  }

  if ((await prisma.adminUser.count()) === 0) {
    console.info("No administrator exists. Configure one with `npm run admin:setup`.");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
