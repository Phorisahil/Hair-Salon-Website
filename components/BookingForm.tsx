import { submitBooking } from "@/app/actions";

export default function BookingForm({
  services,
  selectedServiceId,
}: {
  services: Array<{ id: string; name: string }>;
  selectedServiceId?: string;
}) {
  return (
    <form action={submitBooking} className="form-card" aria-label="Appointment booking form">
      <div className="form-row">
        <label>
          Full name
          <input name="customerName" required />
        </label>
        <label>
          Phone number
          <input name="phone" required />
        </label>
      </div>

      <div className="form-row">
        <label>
          Service
          <select name="serviceId" defaultValue={selectedServiceId ?? ""} required>
            <option value="">Select a service</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="form-row">
        <label>
          Preferred date
          <input name="preferredDate" type="date" required />
        </label>
        <label>
          Preferred time
          <input name="preferredTime" type="time" required />
        </label>
      </div>

      <label>
        Hairstyle reference link or details
        <input name="referenceImageUrl" placeholder="Optional image URL or inspiration note" />
      </label>

      <label>
        Additional notes
        <textarea name="notes" rows={5} placeholder="Tell us about your hair goals, length, or preferred finish." />
      </label>

      <button className="btn btn-primary" type="submit">Send booking request</button>
    </form>
  );
}
