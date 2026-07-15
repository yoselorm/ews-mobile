import React from 'react';
import LegalScreen from '../../../components/LegalScreen';

// TODO: Replace bracketed placeholders and have this reviewed by legal counsel
// before shipping — this app handles health-related personal data and includes
// a medical disclaimer that should be verified with legal/clinical stakeholders.
const SECTIONS = [
  {
    heading: '1. Acceptance of Terms',
    body: [
      'By accessing or using the SafeMother+ application ("the App"), you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the App.',
    ],
  },
  {
    heading: '2. Description of Service',
    body: [
      'SafeMother+ is part of an Early Warning System (EWS) that sends weather-related health alerts, precautions, and educational content to pregnant women, lactating mothers, health workers, and assembly officials in participating communities.',
      'The App is a supportive tool and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified health worker or visit a health facility for medical concerns.',
    ],
  },
  {
    heading: '3. Account Registration',
    body: [
      'Accounts are created by administrators through partner health facilities or community programs, not through self-service sign-up. You gain access by entering your registered phone number and verifying it with a one-time passcode (OTP) sent via SMS.',
      'You are responsible for keeping your phone number and device secure, as access to the App is tied to your verified phone number.',
    ],
  },
  {
    heading: '4. Medical Disclaimer',
    body: [
      'Alerts and precautions provided by the App are general guidance based on weather conditions and are not a medical diagnosis. In an emergency, or if you experience danger signs such as severe headache, reduced fetal movement, dizziness, or bleeding, seek immediate care at your nearest health facility rather than relying solely on the App.',
    ],
  },
  {
    heading: '5. User Responsibilities',
    body: [
      'You agree to use the App only for its intended purpose, to provide accurate information where requested (e.g., pregnancy or baby registration details), and to notify your administrator if your phone number changes or you no longer wish to receive alerts.',
    ],
  },
  {
    heading: '6. Prohibited Uses',
    body: [
      'You agree not to: misuse the App to harass or harm others; attempt to access accounts or community data that are not assigned to you; interfere with the App\'s notification or alert systems; or reverse-engineer, copy, or resell the App without permission.',
    ],
  },
  {
    heading: '7. Intellectual Property',
    body: [
      'All content, branding, and materials within the App are the property of [Organization Name] or its licensors, and may not be reproduced or distributed without prior written consent.',
    ],
  },
  {
    heading: '8. Limitation of Liability',
    body: [
      'To the fullest extent permitted by law, [Organization Name] is not liable for any indirect, incidental, or consequential damages arising from your use of the App, including delayed, undelivered, or inaccurate alerts, except where such liability cannot be excluded under applicable law.',
      'The App relies on third-party weather data and network/SMS providers; we do not guarantee uninterrupted or error-free delivery of alerts.',
    ],
  },
  {
    heading: '9. Termination',
    body: [
      'We reserve the right to suspend or terminate your access to the App, including at the request of the administering health facility or program, if these Terms are violated or if your participation in the associated program ends.',
    ],
  },
  {
    heading: '10. Governing Law',
    body: [
      'These Terms are governed by the laws of the Republic of Ghana. Any disputes arising from your use of the App shall be subject to the jurisdiction of the courts of Ghana.',
    ],
  },
  {
    heading: '11. Changes to These Terms',
    body: [
      'We may update these Terms from time to time. Continued use of the App after changes take effect constitutes your acceptance of the revised Terms.',
    ],
  },
  {
    heading: '12. Contact Us',
    body: [
      'Questions about these Terms can be directed to [Organization Name] at [support email] or [phone/address].',
    ],
  },
];

export default function TermsConditions() {
  return (
    <LegalScreen
      title="Terms & Conditions"
      lastUpdated="[Month Day, Year]"
      sections={SECTIONS}
    />
  );
}