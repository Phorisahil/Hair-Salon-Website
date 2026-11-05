import { getSalonProfile, getVisibleServices } from "@/lib/site-data";
import ServiceCard from "@/components/ServiceCard";

export const metadata = {
  title: "Services",
  description: "Hair services, pricing, and salon treatment options for braids, weaves, wigs, and styling.",
  alternates: {
    canonical: "/services",
  },
};

export default async function ServicesPage() {
  const [services, profile] = await Promise.all([getVisibleServices(), getSalonProfile()]);

  return (
    <div className="container">
      <div className="page-hero">
        <span className="eyebrow">Hair services</span>
        <h1>Our salon menu</h1>
        <p>Browse our curated services and request a quote for your preferred finish.</p>
      </div>

      <div className="card-grid">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} currency={profile.currency} />
        ))}
      </div>
      {services.length === 0 && <div className="notice">The salon is updating its service menu. Please contact us for current availability.</div>}
    </div>
  );
}
