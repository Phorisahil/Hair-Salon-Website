import "server-only";

import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import { v2 as cloudinary } from "cloudinary";
import { getHairstyleImageDirectory } from "@/lib/image-catalog";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const CLOUDINARY_ROOT = "primesa-salon";

const supportedFormats = [
  {
    mimeType: "image/jpeg",
    extension: "jpg",
    matches: (bytes: Buffer) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  },
  {
    mimeType: "image/png",
    extension: "png",
    matches: (bytes: Buffer) =>
      bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  },
  {
    mimeType: "image/webp",
    extension: "webp",
    matches: (bytes: Buffer) =>
      bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP",
  },
] as const;

function getCloudinaryClient() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Image uploads require CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  return cloudinary;
}

function slugify(value: string) {
  return (
    value
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "salon-style"
  );
}

export async function saveUploadedImage(
  file: File,
  filenameHint: string,
  category?: string,
): Promise<{ url: string; publicId: string }> {
  if (file.size === 0) {
    throw new Error("Choose an image file to upload.");
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Images must be 5 MB or smaller.");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const format = supportedFormats.find(
    (candidate) => candidate.mimeType === file.type && candidate.matches(bytes),
  );
  if (!format) {
    throw new Error("Upload a valid JPEG, PNG, or WebP image.");
  }

  const folder = category
    ? `services/${getHairstyleImageDirectory(category)}`
    : "gallery";
  const publicId = `${CLOUDINARY_ROOT}/${folder}/${slugify(filenameHint)}-${randomUUID()}`;
  const client = getCloudinaryClient();

  return new Promise((resolve, reject) => {
    const uploadStream = client.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: "image",
        overwrite: false,
        unique_filename: false,
        use_filename: false,
        tags: ["PrimeSA_Salon", `category-${slugify(category ?? "gallery")}`],
      },
      (error, result) => {
        if (error || !result) {
          reject(new Error("Cloudinary could not store the uploaded image."));
          return;
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );

    uploadStream.on("error", () => {
      reject(new Error("Cloudinary could not store the uploaded image."));
    });
    Readable.from([bytes]).pipe(uploadStream);
  });
}

export async function deleteUploadedImage(publicId: string | null | undefined) {
  if (!publicId) return;
  if (!publicId.startsWith(`${CLOUDINARY_ROOT}/`)) {
    throw new Error("Refusing to delete an image outside the PrimeSA_Salon Cloudinary folder.");
  }

  const result = await getCloudinaryClient().uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });
  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error("Cloudinary did not confirm image deletion.");
  }
}
