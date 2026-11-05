export const hairstyleCategories = [
  { value: "Men's Haircuts", directory: "men" },
  { value: "Braids", directory: "braids" },
  { value: "Cornrows", directory: "cornrows" },
  { value: "Wigs", directory: "wigs" },
  { value: "Weaves", directory: "weaves" },
  { value: "Dreadlocks", directory: "dreadlocks" },
  { value: "Natural Hair", directory: "natural-hair" },
  { value: "Treatments", directory: "other" },
  { value: "Other", directory: "other" },
] as const;

export type HairstyleCategory = (typeof hairstyleCategories)[number]["value"];

export function getHairstyleCategory(category: string): HairstyleCategory {
  return hairstyleCategories.find((item) => item.value === category)?.value ?? "Other";
}

export function getHairstyleImageDirectory(category: string): string {
  return hairstyleCategories.find((item) => item.value === category)?.directory ?? "other";
}
