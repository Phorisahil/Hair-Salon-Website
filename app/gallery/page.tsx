import { getVisibleGallery } from "@/lib/site-data";
import SalonImage from "@/components/SalonImage";

export const metadata = {
  title: "Gallery",
  description: "Browse recent hair styling work, salon looks, and braided finishes.",
  alternates: {
    canonical: "/gallery",
  },
};

export default async function GalleryPage() {
  const gallery = await getVisibleGallery();

  return (
    <div className="container">
      <div className="page-hero">
        <span className="eyebrow">Portfolio</span>
        <h1>Our hairstyle gallery</h1>
        <p>Explore recent looks and styling inspiration from the salon.</p>
      </div>

      {gallery.length === 0 ? (
        <div className="notice">No gallery images are available yet. Add new images through the admin dashboard.</div>
      ) : (
        <div className="gallery-grid">
          {gallery.map((image) => (
            <article key={image.id} className="gallery-card">
              <SalonImage src={image.imageUrl} alt={image.altText} />
              <div className="gallery-body">
                <h3>{image.title}</h3>
                <p>{image.category}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
