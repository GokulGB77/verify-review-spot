import React from "react";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-black-100">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4">Last Updated: June 21, 2025</p>

      <p className="mb-6">
        Welcome to <strong>Review Spot</strong> ("we", "our", or "us"). This
        Privacy Policy explains how we collect, use, and protect your personal
        data when you use our platform.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">1. Information We Collect</h2>
      <ul className="list-disc list-inside space-y-2 mb-6">
        <li>Full name, email, phone number, and date of birth</li>
        <li>PAN card details and uploaded documents for verification</li>
        <li>Profile activity, reviews, comments, upvotes/downvotes</li>
        <li>Device and IP logs for security purposes</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-2">2. Why We Collect Your Data</h2>
      <ul className="list-disc list-inside space-y-2 mb-6">
        <li>Verify authenticity of reviews through PAN validation</li>
        <li>Prevent fake or manipulated reviews</li>
        <li>Assign verification badges (e.g., "Verified by PAN")</li>
        <li>Enable legitimate business-consumer engagement</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-2">3. How Your Data Is Used</h2>
      <ul className="list-disc list-inside space-y-2 mb-6">
        <li>Account setup and verification workflows</li>
        <li>Displaying reviews with verification badges</li>
        <li>Fraud prevention and platform integrity</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-2">4. Data Protection</h2>
      <ul className="list-disc list-inside space-y-2 mb-6">
        <li>Encryption of PAN details and sensitive documents</li>
        <li>Secure cloud storage with restricted access</li>
        <li>Regular audits and security best practices</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-2">5. Data Sharing</h2>
      <p className="mb-4">
        We do <strong>not</strong> sell or rent your personal data. Limited sharing may occur:
      </p>
      <ul className="list-disc list-inside space-y-2 mb-6">
        <li>With our internal verification team</li>
        <li>To comply with legal obligations</li>
        <li>With your consent, for dispute resolution</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-2">6. Your Rights</h2>
      <ul className="list-disc list-inside space-y-2 mb-6">
        <li>Access, update or delete your data</li>
        <li>Withdraw PAN verification consent</li>
        <li>Request data correction or clarification</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-2">7. Data Retention</h2>
      <p className="mb-6">
        We retain your data for as long as your account is active, or as needed to resolve
        legal or review disputes. PAN verification data is securely stored and purged
        after verification use.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">8. Third-Party Services</h2>
      <p className="mb-6">
        We may use third-party services for authentication, storage, and analytics. These
        services do not have access to your PAN or document images.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">9. Updates to This Policy</h2>
      <p className="mb-6">
        We may update this policy periodically. Major updates will be notified via email or
        in-app alerts.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">10. Contact</h2>
      <p className="mb-6">
        For any privacy-related concerns, contact us at: <br />
        <strong>Email:</strong> privacy@reviewspot.in <br />
        <strong>Address:</strong> Review Spot, [Insert Address Here]
      </p>
    </div>
  );
};

export default PrivacyPolicy;
