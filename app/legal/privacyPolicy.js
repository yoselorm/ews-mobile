import React from 'react';
import LegalScreen from '../../components/LegalScreen';

// TODO: Replace bracketed placeholders and have this reviewed by legal counsel
// before shipping — this app handles health-related personal data.
const SECTIONS = [
  {
    heading: '1. Introduction',
    body: [
      'This Privacy Policy explains how [Organization Name] ("we", "us", "our") collects, uses, and protects your information when you use the SafeMother+ mobile application ("the App"), part of the Early Warning System (EWS) for maternal and community health.',
      'Access to the App is provided by administrators through a health facility or community program. By using the App, you agree to the collection and use of information in accordance with this policy.',
    ],
  },
  {
    heading: '2. Information We Collect',
    body: [
      'Account & Identity: Your phone number, name, role (pregnant woman, lactating mother, health worker, or assembly official), and community or facility association, as provided by the administrator who registered your account.',
      'Health-Related Information: Pregnancy-related details such as gestational age, and where applicable, information about registered babies for lactating mothers, used solely to personalize health alerts and precautions relevant to you.',
      'Location & Community Data: Your assigned community, used to match you with local weather conditions and alerts relevant to your area. The App does not track your precise real-time GPS location.',
      'Device & Notification Data: A push notification token so we can deliver alerts to your device, and basic device information needed for the App to function correctly.',
      'Usage Information: Which alerts and health resources you have viewed or listened to, used to mark notifications as read and to improve content relevance.',
    ],
  },
  {
    heading: '3. How We Use Your Information',
    body: [
      'We use your information to: (a) send you timely health alerts and precautions based on weather conditions and your role; (b) deliver these alerts via push notification and SMS; (c) allow health workers and assembly officials to support pregnant women and mothers in their community; and (d) improve the accuracy and usefulness of the EWS.',
      'We do not use your health-related information for advertising, and we do not sell your personal information to third parties.',
    ],
  },
  {
    heading: '4. How Information Is Shared',
    body: [
      'Certain information may be visible to health workers or assembly officials assigned to your community, solely to enable them to follow up on alerts and provide support.',
      'We may share information with SMS and push notification service providers strictly to deliver alerts to you, and with hosting/infrastructure providers who process data on our behalf under confidentiality obligations.',
      'We do not share your personal or health information with third parties for marketing purposes.',
    ],
  },
  {
    heading: '5. SMS and Push Notifications',
    body: [
      'By using the App, you consent to receive push notifications and, where applicable, SMS messages containing health alerts and precautions tied to weather conditions in your community. Standard SMS charges from your mobile network provider may apply.',
    ],
  },
  {
    heading: '6. Data Security',
    body: [
      'We apply reasonable technical and organizational measures to protect your information, including access controls restricting who can view health-related data. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.',
    ],
  },
  {
    heading: '7. Data Retention',
    body: [
      'We retain your information for as long as your account remains active, or as needed to comply with legal obligations, resolve disputes, and enforce our agreements. You may request deletion of your account by contacting your program administrator or [support email].',
    ],
  },
  {
    heading: '8. Your Rights',
    body: [
      'Under the Ghana Data Protection Act, 2012 (Act 843), you have the right to access, correct, or request deletion of your personal information, and to object to certain processing. To exercise these rights, please contact [support email] or your registering health facility/administrator.',
    ],
  },
  {
    heading: "9. Children's Privacy",
    body: [
      'The App is intended for use by adult pregnant women, lactating mothers, health workers, and assembly officials. Any information about a registered baby is provided and managed by the parent/guardian for the purpose of health tracking, not by the child.',
    ],
  },
  {
    heading: '10. Changes to This Policy',
    body: [
      'We may update this Privacy Policy from time to time. We will notify you of significant changes within the App. Continued use of the App after changes take effect constitutes acceptance of the updated policy.',
    ],
  },
  {
    heading: '11. Contact Us',
    body: [
      'If you have questions about this Privacy Policy or how your information is handled, please contact [Organization Name] at [support email] or [phone/address].',
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <LegalScreen
      title="Privacy Policy"
      lastUpdated="[Month Day, Year]"
      sections={SECTIONS}
    />
  );
}