import { getSalonProfile } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Contact",
  description: "Contact the salon by phone, WhatsApp, email, or visiting the studio.",
  alternates: {
    canonical: "/contact",
  },
};

export default async function ContactPage() {
  const profile = await getSalonProfile();

  return (
    <div className="container">
      <div className="page-hero">
        <span className="eyebrow">Contact</span>
        <h1>Get in touch with the salon</h1>
        <p>We are here to answer your questions, plan your next look, and help you book your next appointment.</p>
      </div>

      <div className="contact-grid">
        <div className="info-panel">
          <h2>Salon details</h2>
          <ul className="contact-list">
            <li><strong>Phone:</strong> {profile.phone}</li>
            <li><strong>WhatsApp:</strong> {profile.whatsapp}</li>
            <li><strong>Email:</strong> {profile.email || "Not provided yet"}</li>
            <li><strong>Address:</strong> {profile.address}</li>
            <li><strong>Business hours:</strong> {profile.businessHours}</li>
          </ul>
        </div>

        <div className="form-card">
          <h2>Quick enquiry</h2>
          <form action={`https://wa.me/${profile.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Hello, I would like to ask about salon services.")}`} method="get">
            <label>
              Name
              <input name="name" placeholder="Your full name" />
            </label>
            <label>
              Message
              <textarea name="message" rows={5} placeholder="Tell us what service you are interested in." />
            </label>
            <button className="btn btn-primary" type="submit">Send via WhatsApp</button>
          </form>
        </div>
      </div>
    </div>
  );
}
