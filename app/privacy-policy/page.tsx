import Navbar from "@/Components/navbar";
import Footer from "@/Components/footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | SZ Developers",
  description: "Read the privacy policy of S Zone Developers LLP (SZ Developers) regarding Project Ritu.",
  alternates: {
    canonical: "https://www.szdevelopers.com/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="w-full max-w-full overflow-x-hidden min-h-screen bg-[#e2e2e2] text-black">
      <Navbar />

      {/* Hero Section */}
      <section className="relative w-full h-[25vh] bg-black overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="relative z-10 w-full px-6 md:px-12 text-center">
          <h1 className="tracking-[0.25em] text-[24px] md:text-[36px] font-light uppercase text-white">
            <span className="text-[#00CC61]">PRIVACY</span> POLICY
          </h1>
          <p className="text-[10px] md:text-[11px] text-gray-400 tracking-[0.2em] uppercase mt-2">
            Last Updated: January 2026
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-[900px] mx-auto px-6 md:px-12 py-16">
        <div className="bg-white p-8 md:p-12 rounded-xl shadow-md border border-gray-100 leading-relaxed font-light text-gray-800 space-y-8">
          
          <div className="space-y-4">
            <p>
              <strong>S Zone Developers LLP</strong> (also known as SZ Developers) respects your privacy and is committed to protecting the personal information you share with us through our website.
            </p>
            <p>
              This Privacy Policy explains how we collect, use, store, and safeguard your information when you visit our website or submit your details to learn more about the Project Ritu investment opportunity.
            </p>
          </div>

          <hr className="border-gray-100" />

          {/* Section 1 */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider">
              1. Ownership & Trademark
            </h2>
            <p>
              “Ritu” and all related trademarks, branding, and intellectual property are owned by and licensed to S Zone Developers LLP.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider">
              2. Information We Collect
            </h2>
            <p>We may collect:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Full Name</li>
              <li>Phone Number</li>
              <li>Email Address</li>
              <li>Information voluntarily shared via inquiries</li>
            </ul>
            <p>
              We do not collect sensitive data such as passwords, identity numbers, or financial details.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider">
              3. Use of Information
            </h2>
            <p>We use the collected information to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Respond to your inquiries and provide details about Project Ritu.</li>
              <li>Provide, operate, and maintain our services.</li>
              <li>Communicate directly with you regarding updates, offers, and company news.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider">
              4. Data Storage & Security
            </h2>
            <p>
              Reasonable technical and administrative safeguards are used to protect your data from unauthorized access.
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider">
              5. Sharing of Information
            </h2>
            <p>Your data may be shared only with:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Internal project team members</li>
              <li>Authorized representatives</li>
              <li>Service providers supporting our website</li>
            </ul>
          </div>

          {/* Section 6 */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider">
              6. Cookies & Analytics
            </h2>
            <p>
              We may use cookies or analytics tools to improve user experience. These do not personally identify users.
            </p>
          </div>

          {/* Section 7 */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider">
              7. Your Consent
            </h2>
            <p>
              By submitting your information, you consent to this Privacy Policy.
            </p>
          </div>

          {/* Section 8 */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider">
              8. Changes to This Policy
            </h2>
            <p>
              We may update this policy from time to time. Changes will be reflected on this page.
            </p>
          </div>

          {/* Section 9 */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider">
              9. Contact Information
            </h2>
            <p className="font-semibold text-gray-900">Project Ritu – S Zone Developers LLP</p>
            <p className="flex items-center gap-2">
              <span>✉</span>
              <a href="mailto:info@szdevelopers.com" className="text-[#00CC61] hover:underline font-medium">
                info@szdevelopers.com
              </a>
            </p>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
