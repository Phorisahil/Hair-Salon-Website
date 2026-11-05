import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CustomerReviewForm from "@/components/CustomerReviewForm";
import { getBookingForReview } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rate your salon visit",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ submitted?: string }>;
}) {
  const [{ token }, query] = await Promise.all([params, searchParams]);
  const booking = await getBookingForReview(token);
  if (!booking || booking.status !== "completed") notFound();

  return (
    <div className="container">
      <div className="page-hero">
        <span className="eyebrow">Your feedback</span>
        <h1>How was your visit?</h1>
        <p>Rate your completed {booking.serviceName} appointment at PrimeSA_Salon.</p>
      </div>
      {booking.rating !== null || query.submitted === "1" ? (
        <div className="notice" role="status">Thank you for sharing your feedback. Your rating has been recorded.</div>
      ) : (
        <CustomerReviewForm token={token} />
      )}
    </div>
  );
}
