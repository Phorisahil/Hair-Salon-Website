import AdminLoginForm from "@/components/AdminLoginForm";

export const metadata = {
  title: "Admin login",
  description: "Secure administrator login for salon management.",
};

export default function AdminLoginPage() {
  return (
    <div className="container" style={{ paddingTop: "3rem", paddingBottom: "3rem" }}>
      <div className="admin-panel" style={{ maxWidth: "520px", margin: "0 auto" }}>
        <h1>Salon admin login</h1>
        <p style={{ color: "#5d4a41", marginBottom: "1rem" }}>Use your secure administrator account to manage the salon website.</p>

        <AdminLoginForm />
      </div>
    </div>
  );
}
