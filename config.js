/* ============================================================
   SCANLON SITE SETTINGS — the only file you need to edit
   ============================================================ */
window.SCANLON_CONFIG = {

  // 1) Booking emails. Get a free key at https://web3forms.com
  //    (enter scanlonfuneralservices366@gmail.com, they email you the key).
  //    Paste it between the quotes.
  web3formsKey: "961bf058-16d3-4d0a-a2f1-4c24c676342e",

  // 2) Stripe deposit link (Stripe Dashboard → Payment Links → New,
  //    one fixed price = the deposit amount below). Paste the link here.
  //    Leave blank and the site still works — bookings come in by email
  //    and Brian sends the deposit link himself after the phone call.
  depositLink: "",

  // 3) Deposit amount in dollars, e.g. 100 (must match the deposit link).
  //    Leave as null until Brian picks a number; the site will say
  //    "confirmed by phone" instead of showing an amount.
  depositAmount: null
};
