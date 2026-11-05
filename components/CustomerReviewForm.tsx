import { submitCustomerReview } from "@/app/actions";

export default function CustomerReviewForm({ token }: { token: string }) {
  return (
    <form action={submitCustomerReview} className="form-card review-form">
      <input type="hidden" name="token" value={token} />
      <fieldset>
        <legend>Your rating</legend>
        <div className="rating-options">
          {[5, 4, 3, 2, 1].map((rating) => (
            <label key={rating}>
              <input type="radio" name="rating" value={rating} required />
              <span aria-hidden="true">{"★".repeat(rating)}</span>
              <span className="visually-hidden">{rating} {rating === 1 ? "star" : "stars"}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label>
        Share a few words (optional)
        <textarea name="comment" rows={4} maxLength={500} placeholder="Tell us about your salon experience." />
      </label>
      <p>Your review is linked to your completed appointment. Your name and phone number will not be published.</p>
      <button className="btn btn-primary" type="submit">Submit rating</button>
    </form>
  );
}
