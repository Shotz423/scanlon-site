/* ============================================================
   SCANLON SITE SETTINGS — the only file you need to edit
   ============================================================ */
window.SCANLON_CONFIG = {

  // 1) Booking emails. Get a free key at https://web3forms.com
  //    (enter scanlonfuneralservices366@gmail.com, they email you the key).
  //    Paste it between the quotes.
  web3formsKey: "6e12cd36-d4cb-4194-ac84-abd207b718ac",

  // 2) Stripe deposit link (Stripe Dashboard → Payment Links → New,
  //    one fixed price = the deposit amount below). Paste the link here.
  //    Leave blank and the site still works — bookings come in by email
  //    and Brian sends the deposit link himself after the phone call.
  depositLink: "https://buy.stripe.com/cNieVe4Ft1F1eOG7Az9ws00",

  // 3) Deposit amount in dollars, e.g. 100 (must match the deposit link).
  //    Leave as null until Brian picks a number; the site will say
  //    "confirmed by phone" instead of showing an amount.
  depositAmount: null
};
