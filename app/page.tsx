import Link from "next/link";
import { formatPrice, getFeaturedServices, getPublicReviews, getSalonProfile, getVisibleGallery, getVisibleServices } from "@/lib/site-data";
import SalonImage from "@/components/SalonImage";
import ServiceCard from "@/components/ServiceCard";
import { getSiteUrl } from "@/lib/site-url";

export const metadata = {
  alternates: {
    canonical: "/",
  },
};

export default async function HomePage() {
  const profile = await getSalonProfile();
  const featuredServices = await getFeaturedServices();
  const services = await getVisibleServices();
  const gallery = (await getVisibleGallery()).slice(0, 3);
  const customerFeedback = await getPublicReviews();
  const addressParts = profile.address.split(",").map((part) => part.trim());
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    "@id": new URL("/#salon", getSiteUrl()).toString(),
    name: profile.salonName,
    description:
      "Professional men's haircuts, women's hairstyles, wig installation, and hair treatments in Pinetown, Durban.",
    url: getSiteUrl().toString(),
    telephone: profile.phone,
    email: profile.email || undefined,
    image: profile.logoUrl ? new URL(profile.logoUrl, getSiteUrl()).toString() : undefined,
    priceRange: services.length
      ? `${formatPrice(
          Math.min(...services.map((service) => service.startingPrice ?? service.price)),
          profile.currency,
        )}-${formatPrice(
          Math.max(...services.map((service) => service.price)),
          profile.currency,
        )}`
      : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: addressParts[0] || profile.address,
      addressLocality: addressParts[1] || "Pinetown",
      addressRegion: "KwaZulu-Natal",
      addressCountry: "ZA",
    },
    areaServed: ["Pinetown", "Durban"],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <section className="hero">
        <div className="container hero-shell">
          <div>
            <span className="eyebrow slogan-text">{profile.slogan}</span>
            <h1>Your Style. Your Confidence.</h1>
            <p>
              Discover professional haircuts, beautiful hairstyles, and personalised hair care at {profile.salonName}.
              Looking for a salon near you in Pinetown, Nazareth, or Durban? Visit us at {profile.address}.
            </p>
            <div className="hero-actions">
              <Link href="/booking" className="btn btn-primary">Book an Appointment</Link>
              <a href={`https://wa.me/${profile.whatsapp.replace(/\D/g, "")}`} className="btn btn-secondary" target="_blank" rel="noreferrer">
                Chat on WhatsApp
              </a>
            </div>
            <p className="hero-hours"><strong>Opening hours:</strong> {profile.businessHours}</p>
          </div>

          <div className="hero-panel">
            <SalonImage src="/assets/images/hero/hero-salon.svg" alt="Illustration of a salon styling chair" />
            <div className="hero-badge">
              <strong>{profile.salonName}</strong>
              <div>{profile.welcomeMessage}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="eyebrow">Find your next look</span>
              <h2>Popular Styles</h2>
            </div>
            <Link href="/services" className="btn btn-secondary">Explore all services</Link>
          </div>

          <div className="card-grid">
            {featuredServices.map((service) => (
              <ServiceCard key={service.id} service={service} currency={profile.currency} />
            ))}
          </div>
          {featuredServices.length === 0 && (
            <div className="notice">New popular styles will appear here as the salon adds them.</div>
          )}
        </div>
      </section>

      <section className="section" style={{ background: "rgba(245, 232, 219, 0.35)" }}>
        <div className="container">
          <div className="section-header">
            <div>
              <span className="eyebrow">Services selected by the salon</span>
              <h2>Our Salon Favourites</h2>
            </div>
          </div>

          <div className="card-grid">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} currency={profile.currency} />
            ))}
          </div>
          {services.length === 0 && <div className="notice">Salon services will appear here soon.</div>}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="eyebrow">Price guide</span>
              <h2>Price Guide</h2>
            </div>
            <Link href="/services" className="btn btn-secondary">View full list</Link>
          </div>

          <div className="prices-grid">
            {services.map((service) => (
              <div key={service.id} className="price-card">
                <h3>{service.name}</h3>
                <p>{service.category}</p>
                <div className="meta-row">
                  <span>{service.duration}</span>
                  <span className="price-tag">
                    {service.startingPrice
                      ? `From ${formatPrice(service.startingPrice, profile.currency)}`
                      : formatPrice(service.price, profile.currency)}
                  </span>
                </div>
                <Link href={`/booking?serviceId=${encodeURIComponent(service.id)}`} className="text-link">Book or enquire</Link>
              </div>
            ))}
          </div>
          <div className="notice">{profile.priceNotice}</div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="eyebrow">From completed appointments</span>
              <h2>Customer Feedback</h2>
            </div>
            {customerFeedback.totalRatings > 0 && (
              <p className="rating-summary">
                <strong aria-label={`${customerFeedback.averageRating?.toFixed(1)} out of 5 stars`}>
                  {"★".repeat(Math.round(customerFeedback.averageRating ?? 0))}
                </strong>{" "}
                {customerFeedback.averageRating?.toFixed(1)} / 5 · {customerFeedback.totalRatings}{" "}
                {customerFeedback.totalRatings === 1 ? "rating" : "ratings"}
              </p>
            )}
          </div>
          {customerFeedback.reviews.length > 0 ? (
            <div className="card-grid">
              {customerFeedback.reviews.map((review, index) => (
                <article className="info-panel review-card" key={`${review.reviewedAt?.toISOString()}-${index}`}>
                  <p className="review-stars" aria-label={`${review.rating} out of 5 stars`}>
                    {"★".repeat(review.rating ?? 0)}
                  </p>
                  <h3>{review.serviceName}</h3>
                  {review.reviewComment && <p>{review.reviewComment}</p>}
                  <p className="review-attribution">Verified completed appointment</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="notice">Customer ratings will appear here after completed appointments are reviewed.</div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="eyebrow">Portfolio</span>
              <h2>Recent Salon Work</h2>
            </div>
            <Link href="/gallery" className="btn btn-secondary">Open gallery</Link>
          </div>

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
          {gallery.length === 0 && <div className="notice">Recent salon photos will appear here when the owner adds them.</div>}
        </div>
      </section>
    </>
  );
}
