import Link from "next/link";
import { getSalonProfile } from "@/lib/site-data";
import SalonImage from "@/components/SalonImage";
import SiteNavigation from "@/components/SiteNavigation";

export default async function SiteHeader() {
  const profile = await getSalonProfile();

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label={`Go to ${profile.salonName} home page`}>
          <SalonImage className="brand-logo" src={profile.logoUrl} alt="" />
          <div>
            <strong>{profile.salonName}</strong>
            <small>{profile.slogan}</small>
          </div>
        </Link>

        <SiteNavigation />

        <div className="header-actions">
          <a className="btn btn-secondary" href={`https://wa.me/${profile.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
            Chat on WhatsApp
          </a>
          <Link className="btn btn-primary" href="/booking">
            Book an Appointment
          </Link>
        </div>
      </div>
    </header>
  );
}
