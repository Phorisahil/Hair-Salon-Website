import { redirect } from "next/navigation";
import { getCurrentAdminId } from "@/lib/auth";
import {
  saveProfile,
  createService,
  updateService,
  deleteService,
  createGalleryEntry,
  updateGalleryEntry,
  deleteGalleryEntry,
  logoutAdmin,
  updateBookingStatus,
} from "@/app/actions";
import { formatPrice, getAllBookings, getAllGallery, getAllServices, getSalonProfile } from "@/lib/site-data";
import SalonImage from "@/components/SalonImage";
import { hairstyleCategories } from "@/lib/image-catalog";
import { getSiteUrl } from "@/lib/site-url";

export default async function AdminPage() {
  const adminId = await getCurrentAdminId();
  if (!adminId) {
    redirect("/admin/login");
  }

  const profile = await getSalonProfile();
  const services = await getAllServices();
  const gallery = await getAllGallery();
  const bookings = await getAllBookings();

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <div className="section-header">
        <div>
          <span className="eyebrow">Dashboard</span>
          <h1>Salon owner admin</h1>
        </div>
        <form action={logoutAdmin}>
          <button type="submit" className="btn btn-secondary">Sign out</button>
        </form>
      </div>

      <datalist id="service-categories">
        {hairstyleCategories.map((category) => (
          <option key={category.value} value={category.value} />
        ))}
      </datalist>

      <div className="admin-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="admin-panel">
          <h2>Salon details</h2>
          <form action={saveProfile}>
            <label>
              Salon name
              <input name="salonName" defaultValue={profile.salonName} required />
            </label>
            <label>
              Slogan
              <input name="slogan" defaultValue={profile.slogan} maxLength={120} required />
            </label>
            <label>
              Phone number
              <input name="phone" defaultValue={profile.phone} required />
            </label>
            <label>
              WhatsApp number
              <input name="whatsapp" defaultValue={profile.whatsapp} required />
            </label>
            <label>
              Address
              <textarea name="address" rows={3} defaultValue={profile.address} required />
            </label>
            <label>
              Email
              <input name="email" type="email" defaultValue={profile.email ?? ""} />
            </label>
            <label>
              Business hours
              <input name="businessHours" defaultValue={profile.businessHours} required />
            </label>
            <label>
              Welcome message
              <textarea name="welcomeMessage" rows={3} defaultValue={profile.welcomeMessage} required />
            </label>
            <label>
              Booking message
              <textarea name="bookingMessage" rows={3} defaultValue={profile.bookingMessage} required />
            </label>
            <label>
              Currency
              <input name="currency" defaultValue={profile.currency} required />
            </label>
            <label>
              Price notice
              <textarea name="priceNotice" rows={3} defaultValue={profile.priceNotice} required />
            </label>
            <button type="submit" className="btn btn-primary">Save salon details</button>
          </form>
        </div>

        <div className="admin-panel">
          <h2>Add service</h2>
          <form action={createService} encType="multipart/form-data">
            <label>
              Service name
              <input name="name" required />
            </label>
            <label>
              Category
              <input name="category" list="service-categories" defaultValue="Men's Haircuts" required />
            </label>
            <label>
              Description
              <textarea name="description" rows={3} required />
            </label>
            <div className="form-row">
              <label>
                Price (R)
                <input name="price" type="number" min="0" required />
              </label>
              <label>
                Starting price
                <input name="startingPrice" type="number" min="0" />
              </label>
            </div>
            <div className="form-row">
              <label>
                Duration
                <input name="duration" required />
              </label>
              <label>
                Image URL (optional)
                <input name="imageUrl" />
              </label>
            </div>
            <label>
              Upload hairstyle photo (JPEG, PNG or WebP; max 5 MB)
              <input name="image" type="file" accept="image/jpeg,image/png,image/webp" />
            </label>
            <div className="form-row">
              <label>
                Visible
                <input type="checkbox" name="visible" defaultChecked />
              </label>
              <label>
                Featured
                <input type="checkbox" name="featured" />
              </label>
            </div>
            <button type="submit" className="btn btn-primary">Create service</button>
          </form>
        </div>
      </div>

      <div className="section" style={{ paddingTop: "2rem" }}>
        <div className="section-header">
          <div>
            <span className="eyebrow">Services</span>
            <h2>Current salon menu</h2>
          </div>
        </div>
        <div className="card-grid">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <SalonImage src={service.imageUrl} alt={service.name} />
              <div className="service-body">
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <div className="meta-row">
                  <span>{service.category}</span>
                  <span className="price-tag">{formatPrice(service.price, profile.currency)}</span>
                </div>
                <details>
                  <summary>Edit service</summary>
                  <form action={updateService} encType="multipart/form-data">
                    <input type="hidden" name="serviceId" value={service.id} />
                    <label>
                      Service name
                      <input name="name" defaultValue={service.name} required />
                    </label>
                    <label>
                      Category
                      <input name="category" list="service-categories" defaultValue={service.category} required />
                    </label>
                    <label>
                      Description
                      <textarea name="description" rows={3} defaultValue={service.description} required />
                    </label>
                    <div className="form-row">
                      <label>
                        Price (R)
                        <input name="price" type="number" min="0" step="0.01" defaultValue={service.price} required />
                      </label>
                      <label>
                        Starting price
                        <input name="startingPrice" type="number" min="0" step="0.01" defaultValue={service.startingPrice ?? ""} />
                      </label>
                    </div>
                    <label>
                      Duration
                      <input name="duration" defaultValue={service.duration} required />
                    </label>
                    <label>
                      Image URL (optional)
                      <input name="imageUrl" defaultValue={service.imageUrl ?? ""} />
                    </label>
                    <label>
                      Upload a replacement photo (JPEG, PNG or WebP; max 5 MB)
                      <input name="image" type="file" accept="image/jpeg,image/png,image/webp" />
                    </label>
                    <div className="form-row">
                      <label>
                        Visible
                        <input type="checkbox" name="visible" defaultChecked={service.visible} />
                      </label>
                      <label>
                        Featured
                        <input type="checkbox" name="featured" defaultChecked={service.featured} />
                      </label>
                    </div>
                    <button className="btn btn-primary" type="submit">Save service</button>
                  </form>
                </details>
                <form action={deleteService}>
                  <input type="hidden" name="serviceId" value={service.id} />
                  <button className="btn btn-secondary" type="submit">Delete</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-panel" style={{ marginTop: "2rem" }}>
        <h2>Add gallery photo</h2>
        <form action={createGalleryEntry} encType="multipart/form-data">
          <div className="form-row">
            <label>
              Photo title
              <input name="title" maxLength={100} required />
            </label>
            <label>
              Category
              <input name="category" list="service-categories" defaultValue="Men's Haircuts" required />
            </label>
          </div>
          <label>
            Image description
            <input name="altText" maxLength={200} placeholder="Describe the hairstyle in the photo" />
          </label>
          <label>
            Photo (JPEG, PNG or WebP; max 5 MB)
            <input name="image" type="file" accept="image/jpeg,image/png,image/webp" required />
          </label>
          <button type="submit" className="btn btn-primary">Upload gallery photo</button>
        </form>
      </div>

      <div className="section" style={{ paddingTop: "2rem" }}>
        <div className="section-header">
          <div>
            <span className="eyebrow">Gallery</span>
            <h2>Uploaded gallery photos</h2>
          </div>
        </div>
        {gallery.length === 0 ? (
          <div className="notice">No gallery photos have been uploaded yet.</div>
        ) : (
          <div className="gallery-grid">
            {gallery.map((image) => (
              <article key={image.id} className="gallery-card">
                <SalonImage src={image.imageUrl} alt={image.altText} />
                <div className="gallery-body">
                  <h3>{image.title}</h3>
                  <p>{image.category}</p>
                  <details>
                    <summary>Edit gallery photo</summary>
                    <form action={updateGalleryEntry} encType="multipart/form-data">
                      <input type="hidden" name="imageId" value={image.id} />
                      <label>
                        Title
                        <input name="title" defaultValue={image.title} maxLength={100} required />
                      </label>
                      <label>
                        Category
                        <input name="category" list="service-categories" defaultValue={image.category} required />
                      </label>
                      <label>
                        Image description
                        <input name="altText" defaultValue={image.altText} maxLength={200} required />
                      </label>
                      <label>
                        Image URL
                        <input name="imageUrl" defaultValue={image.imageUrl} />
                      </label>
                      <label>
                        Replace image (JPEG, PNG or WebP; max 5 MB)
                        <input name="image" type="file" accept="image/jpeg,image/png,image/webp" />
                      </label>
                      <label>
                        Visible on website
                        <input type="checkbox" name="visible" defaultChecked={image.visible} />
                      </label>
                      <button type="submit" className="btn btn-primary">Save gallery photo</button>
                    </form>
                  </details>
                  <form action={deleteGalleryEntry}>
                    <input type="hidden" name="imageId" value={image.id} />
                    <button type="submit" className="btn btn-secondary">Remove from gallery</button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="section" style={{ paddingTop: "0.5rem" }}>
        <div className="section-header">
          <div>
            <span className="eyebrow">Bookings</span>
            <h2>Appointment requests</h2>
          </div>
        </div>
        {bookings.length === 0 ? (
          <div className="notice">No appointment requests yet.</div>
        ) : (
          <div className="card-grid">
            {bookings.map((booking) => (
              <div key={booking.id} className="info-panel">
                <h3>{booking.customerName}</h3>
                <p>{booking.serviceName}</p>
                <p>{booking.preferredDate} at {booking.preferredTime}</p>
                <p>{booking.phone}</p>
                <p>{booking.notes || "No notes"}</p>
                <form action={updateBookingStatus}>
                  <input type="hidden" name="bookingId" value={booking.id} />
                  <label>
                    Appointment status
                    <select name="status" defaultValue={booking.status}>
                      <option value="new">New</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </label>
                  <button type="submit" className="btn btn-secondary">Save status</button>
                </form>
                {booking.status === "completed" && booking.reviewToken && (
                  <p>
                    <a
                      className="text-link"
                      href={`https://wa.me/${booking.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                        `Thank you for visiting PrimeSA_Salon. Please rate your completed ${booking.serviceName} appointment: ${new URL(`/review/${booking.reviewToken}`, getSiteUrl())}`,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Send review request on WhatsApp
                    </a>
                  </p>
                )}
                {booking.rating !== null && booking.rating !== undefined && (
                  <p>Customer rating: {"★".repeat(booking.rating)} ({booking.rating}/5)</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
