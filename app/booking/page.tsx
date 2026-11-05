import BookingForm from "@/components/BookingForm";
import { getVisibleServices, getSalonProfile } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Book an appointment",
  description: "Book a salon consultation or appointment request for hair styling or treatments.",
  alternates: {
    canonical: "/booking",
  },
};

export default async function BookingPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; serviceId?: string }>;
}) {
  const profile = await getSalonProfile();
  const services = await getVisibleServices();
  const params = await searchParams;

  return (
    <div className="container">
      <div className="page-hero">
        <span className="eyebrow">Bookings</span>
        <h1>Request an appointment</h1>
        <p>{profile.bookingMessage}</p>
      </div>

      {params?.success === "1" && (
        <div className="notice">Your booking request has been received. We will contact you shortly.</div>
      )}

      <div className="booking-grid">
        <div className="info-panel">
          <h2>Book by WhatsApp</h2>
          <p>Prefer a faster chat? Send your preferred service and booking date directly to the salon.</p>
          <p style={{ marginTop: "1rem" }}>
            <a className="btn btn-primary" href={`https://wa.me/${profile.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
              WhatsApp booking
            </a>
          </p>
          <ul className="contact-list" style={{ marginTop: "1.5rem" }}>
            <li><strong>WhatsApp:</strong> {profile.whatsapp}</li>
            <li><strong>Phone:</strong> {profile.phone}</li>
            <li><strong>Hours:</strong> {profile.businessHours}</li>
          </ul>
        </div>

        <BookingForm services={services} selectedServiceId={params?.serviceId} />
      </div>
    </div>
  );
}
