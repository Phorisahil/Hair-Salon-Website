import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { PrismaClient } from "@prisma/client";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

const sourcePath = resolve(
  process.env.SOURCE_SQLITE_PATH || "prisma/prisma/dev.db",
);
const dryRun = process.argv.includes("--dry-run");
const tableNames = ["SalonProfile", "Service", "GalleryImage", "Booking", "AdminUser"];

function readTable(db, tableName) {
  const escapedTable = tableName.replaceAll('"', '""');
  const columns = db.prepare(`PRAGMA table_info("${escapedTable}")`).all();
  if (columns.length === 0) {
    throw new Error(`The source SQLite database is missing the ${tableName} table.`);
  }
  return db.prepare(`SELECT * FROM "${escapedTable}"`).all();
}

function toDate(value, fieldName) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`The source SQLite database has an invalid ${fieldName} value.`);
  }
  return date;
}

function pick(row, fields) {
  return Object.fromEntries(fields.map((field) => [field, row[field] ?? null]));
}

function normalizeRows(tableName, rows) {
  const dateFields = ["createdAt", "updatedAt"];
  const specifications = {
    SalonProfile: {
      fields: [
        "id", "salonName", "slogan", "logoUrl", "phone", "whatsapp", "address",
        "email", "businessHours", "socialLinks", "welcomeMessage", "bookingMessage",
        "currency", "priceNotice", "createdAt", "updatedAt",
      ],
      booleans: [],
    },
    Service: {
      fields: [
        "id", "name", "description", "category", "price", "startingPrice", "duration",
        "imageUrl", "imagePublicId", "galleryImages", "visible", "featured",
        "createdAt", "updatedAt",
      ],
      booleans: ["visible", "featured"],
    },
    GalleryImage: {
      fields: [
        "id", "title", "category", "imageUrl", "imagePublicId", "altText", "visible",
        "createdAt", "updatedAt",
      ],
      booleans: ["visible"],
    },
    Booking: {
      fields: [
        "id", "customerName", "phone", "serviceId", "serviceName", "preferredDate",
        "preferredTime", "referenceImageUrl", "message", "notes", "status", "reviewToken",
        "rating", "reviewComment", "reviewedAt", "createdAt", "updatedAt",
      ],
      booleans: [],
    },
    AdminUser: {
      fields: ["id", "email", "name", "password", "createdAt", "updatedAt"],
      booleans: [],
    },
  };
  const specification = specifications[tableName];

  return rows.map((row) => {
    const normalized = pick(row, specification.fields);
    for (const field of dateFields) {
      normalized[field] = toDate(row[field], `${tableName}.${field}`);
    }
    if ("reviewedAt" in normalized && row.reviewedAt != null) {
      normalized.reviewedAt = toDate(row.reviewedAt, "Booking.reviewedAt");
    }
    for (const field of specification.booleans) {
      normalized[field] = Boolean(row[field]);
    }
    return normalized;
  });
}

function getSafeErrorMessage(error) {
  const message = error instanceof Error ? error.message : "Unknown import error.";
  return message.replace(/(?:postgres(?:ql)?|file):\/\/[^\s"'<>]+/gi, "[redacted database URL]");
}

if (!existsSync(sourcePath)) {
  throw new Error(`SQLite source database not found at ${sourcePath}. Set SOURCE_SQLITE_PATH if it is elsewhere.`);
}

const source = new DatabaseSync(sourcePath, { readOnly: true });
let prisma;

try {
  source.exec("BEGIN");
  const sourceRows = Object.fromEntries(
    tableNames.map((tableName) => [tableName, normalizeRows(tableName, readTable(source, tableName))]),
  );
  source.exec("COMMIT");

  if (dryRun) {
    for (const tableName of tableNames) {
      console.info(`${tableName}: ${sourceRows[tableName].length} source records; dry run, nothing written.`);
    }
  } else {
    const targetUrl = process.env.TARGET_DATABASE_URL;
    if (!targetUrl || !/^postgres(?:ql)?:\/\//i.test(targetUrl)) {
      throw new Error("Set TARGET_DATABASE_URL to the Render PostgreSQL external connection string before importing.");
    }

    prisma = new PrismaClient({
      datasources: { db: { url: targetUrl } },
    });

    const imported = await prisma.$transaction(async (transaction) => {
      const results = {};
      for (const tableName of tableNames) {
        const rows = sourceRows[tableName];
        if (rows.length === 0) {
          results[tableName] = 0;
          continue;
        }
        const model = transaction[tableName[0].toLowerCase() + tableName.slice(1)];
        const result = await model.createMany({ data: rows, skipDuplicates: true });
        results[tableName] = result.count;
      }
      return results;
    });

    for (const tableName of tableNames) {
      console.info(`${tableName}: imported ${imported[tableName]} record(s); existing records were left unchanged.`);
    }
  }
} catch (error) {
  console.error(`SQLite import failed: ${getSafeErrorMessage(error)}`);
  process.exitCode = 1;
} finally {
  source.close();
  await prisma?.$disconnect();
}
