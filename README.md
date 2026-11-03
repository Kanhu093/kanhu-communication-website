# Kanhu Communication Website

A responsive English + Odia React website starter for Kanhu Communication, including Firebase customer authentication, booking requests, PhonePe payment proof submission, customer booking history, booking lookup, and an owner admin view.

## Included
- English / Odia language switch
- Service catalogue and supplied prices
- Original PhonePe QR image at `public/phonepe-qr.png`
- PhonePe UPI ID: `6371728063@ybl`
- Customer login: mobile OTP and Google
- Booking form with one-day minimum advance date
- Customer document and payment screenshot upload
- Customer dashboard and booking status lookup
- Owner dashboard with payment verification and status updates
- Firestore and Storage security rules

## Important before launch
This is a deployable starter, not a live hosted site. Firebase project credentials, authentication providers, database rules, SMS configuration, admin custom claim and a production test are required before accepting real customers.

### 1. Create Firebase project
1. Create a project in Firebase Console.
2. Add a Web App and copy its Firebase config.
3. Enable **Authentication > Sign-in method > Phone** and **Google**.
4. Enable Firestore Database and Storage.
5. Add your deployed domain to Authentication authorized domains.
6. For phone auth, configure reCAPTCHA and test SMS numbers in Firebase Authentication.

### 2. Configure environment
Copy `.env.example` to `.env` and replace all `replace_me` values with your Firebase Web App config. Set `VITE_ADMIN_EMAIL` to the Google email you will use as the owner account.

### 3. Grant admin access securely
The admin dashboard and database rules require the Firebase custom claim `admin: true`. Do not rely on an email-only frontend check for production access. Use Firebase Admin SDK from a trusted server or Cloud Shell to set the claim for the owner's Firebase Auth UID:

```js
await getAuth().setCustomUserClaims("OWNER_FIREBASE_AUTH_UID", { admin: true });
```

Then sign out and sign back in. Never put Firebase Admin SDK credentials in this frontend project.

### 4. Deploy security rules
In Firebase Console, open Firestore Rules and paste `firebase/firestore.rules`.
Open Storage Rules and paste `firebase/storage.rules`.
Review and test rules in the Firebase Emulator before production.

### 5. Run locally
```bash
npm install
npm run dev
```

### 6. Build and deploy
```bash
npm run build
```
Deploy the `dist` folder to Firebase Hosting or another static host. Configure SPA rewrites so all routes serve `index.html`.

## Business details
- Kanhu Communication
- Baghabaspur, Gopalprasad, Talcher, Angul, Odisha - 759103
- 6371728063 / 7077899154
- kanhucharanbhoi211@gmail.com
- UPI: 6371728063@ybl

## Operational notes
- The shop owner must manually verify transaction IDs and payment screenshots against the actual PhonePe receipt/statement before confirming a booking.
- A payment screenshot alone is not proof of settlement.
- The current sample only supports automatic estimates for fixed-price services. Services with "Contact" pricing need a quote before payment.
- Government certificate applications are subject to government approval. Displayed amounts are shop service charges; official fees, if any, should be itemized separately.
- Add privacy policy, terms, refund/cancellation policy, data retention policy and a clear consent checkbox before public launch.
- For customer data protection, do not request unnecessary sensitive information. Restrict document access and delete files when no longer needed.
- WhatsApp notification links open WhatsApp with a prefilled message; automated outbound WhatsApp notifications require WhatsApp Business Platform/API integration.
- Google login and phone OTP should be tested with real supported devices and domains before launch.
