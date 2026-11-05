import Link from "next/link";
import type { Service } from "@prisma/client";
import SalonImage from "@/components/SalonImage";
import { formatPrice } from "@/lib/site-data";

export default function ServiceCard({
  service,
  currency,
}: {
  service: Service;
  currency: string;
}) {
  return (
    <article className="service-card">
      <SalonImage src={service.imageUrl} alt={service.name} />
      <div className="service-body">
        <h3>{service.name}</h3>
        <p>{service.description}</p>
        <div className="meta-row">
          <span>{service.category}</span>
          <span className="price-tag">{formatPrice(service.price, currency)}</span>
        </div>
        <div className="meta-row">
          <span>{service.duration}</span>
          <span>{service.startingPrice ? `From ${formatPrice(service.startingPrice, currency)}` : "Fixed price"}</span>
        </div>
        <Link href={`/booking?serviceId=${encodeURIComponent(service.id)}`} className="btn btn-primary">
          Book or enquire
        </Link>
      </div>
    </article>
  );
}
