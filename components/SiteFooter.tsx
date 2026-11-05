import Link from "next/link";
import { getSalonProfile } from "@/lib/site-data";

export default async function SiteFooter() {
  const profile = await getSalonProfile();

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <h3>{profile.salonName}</h3>
          <p>{profile.slogan}</p>
          <p>{profile.welcomeMessage}</p>
        </div>
        <div>
          <h4>Visit</h4>
          <p>{profile.address}</p>
          <p>{profile.businessHours}</p>
        </div>
        <div>
          <h4>Contact</h4>
          <p><a href={`tel:${profile.phone.replace(/[^\d+]/g, "")}`}>{profile.phone}</a></p>
          {profile.email && <p><a href={`mailto:${profile.email}`}>{profile.email}</a></p>}
          <p><a href={`https://wa.me/${profile.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">Chat on WhatsApp</a></p>
        </div>
        <div>
          <h4>Explore</h4>
          <ul>
            <li><Link href="/services">Services</Link></li>
            <li><Link href="/gallery">Gallery</Link></li>
            <li><Link href="/booking">Booking</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>
        <p className="footer-credit">Website developed by Sahil Phakathwayo.</p>
      </div>
    </footer>
  );
}
