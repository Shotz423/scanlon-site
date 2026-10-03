(function () {
  'use strict';
  var CFG = window.SCANLON_CONFIG || {};
  var form = document.getElementById('booking-form');
  if (!form) return;

  var state = { job: 'house', after: true, miles: 0, third: false, hearse: false, staff: 2, pay: 'invoice' };

  var $ = function (id) { return document.getElementById(id); };
  var els = {
    job: $('jobType'), miles: $('miles'), third: $('third'), hearse: $('hearseAdd'), staff: $('staff'),
    optThird: $('opt-third'), optHearse: $('opt-hearse'), optStaff: $('opt-staff'),
    lines: $('estLines'), total: $('estTotal'), due: $('estDue'), dueNote: $('estDueNote'),
    cta: $('ctaText'), btn: $('submitBtn'), status: $('formStatus')
  };

  function money(n) {
    var r = Math.round(n * 100) / 100;
    var s = (r % 1) ? r.toFixed(2) : String(r);
    return '$' + s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function estimate() {
    var s = state, a = s.after;
    var r = function (reg, aft) { return a ? aft : reg; };
    var miles = Math.max(0, s.miles || 0);
    var L = [], quote = false, tag = a ? 'after hours' : 'regular hours';
    var beyond = function () { if (miles > 20) L.push({ label: 'Mileage beyond 20 mi · ' + (miles - 20) + ' mi × $3.50', v: (miles - 20) * 3.5 }); };
    switch (s.job) {
      case 'facility': L.push({ label: 'Facility removal · ' + tag, v: r(225, 275) }); beyond(); break;
      case 'house':
        L.push({ label: 'House call, first person · ' + tag, v: r(225, 275) });
        L.push({ label: 'Second person', v: r(125, 150) });
        if (s.third) L.push({ label: 'Third person (stairs / size)', v: r(125, 150) });
        beyond(); break;
      case 'casket': L.push({ label: 'Loaded casket transfer · within 20 mi', v: 300 }); beyond(); break;
      case 'crematory': L.push({ label: 'Crematory / airport transfer · within 20 mi', v: 300 }); beyond(); break;
      case 'long':
        L.push({ label: 'Original charge · facility removal, ' + tag, v: r(225, 275) });
        L.push({ label: 'Loaded miles · ' + miles + ' mi × $3.50', v: miles * 3.5 }); break;
      case 'staffing': L.push({ label: 'Additional staff · ' + s.staff + ' × ' + (a ? '$150' : '$125'), v: s.staff * r(125, 150) }); break;
      case 'hearse':
        L.push({ label: 'Driver · 4-hour block, service assist', v: 275 });
        if (s.hearse) L.push({ label: 'Hearse rental (vehicle only)', v: 400 });
        break;
      case 'livestream': L.push({ label: 'Live streaming', v: 225 }); break;
      default: quote = true;
    }
    var total = 0;
    var lines = L.map(function (l) { total += l.v; return { label: l.label, amount: money(l.v) }; });
    if (s.job === 'long') lines.push({ label: 'Tolls, bridges, parking', amount: 'At cost' });
    if (quote) lines.push({ label: 'Consulting · scoped on the phone', amount: 'Quoted' });
    return { lines: lines, total: total, quote: quote, totalText: quote ? 'Quoted by phone' : money(total) };
  }

  function depositText() { return CFG.depositAmount ? money(CFG.depositAmount) : 'Confirmed by phone'; }

  function render() {
    var e = estimate();
    els.lines.innerHTML = '';
    e.lines.forEach(function (l) {
      var li = document.createElement('li');
      var a = document.createElement('span'); a.textContent = l.label;
      var b = document.createElement('span'); b.textContent = l.amount;
      li.appendChild(a); li.appendChild(b); els.lines.appendChild(li);
    });
    els.total.textContent = e.totalText;

    var due, note, cta;
    if (state.pay === 'deposit') {
      due = depositText();
      note = CFG.depositLink ? 'Deposit paid by card through Stripe right after you send this. Balance billed after the job.'
                             : 'We will send a secure Stripe link for the deposit when we confirm by phone. Balance billed after the job.';
      cta = CFG.depositLink ? 'Send booking & pay deposit' : 'Send booking · hold crew';
    } else {
      due = '$0 today';
      note = 'Invoiced after the job — standard terms, or net-30 on monthly billing.';
      cta = 'Send booking · bill me';
    }
    els.due.textContent = due; els.dueNote.textContent = note; els.cta.textContent = cta;

    els.optThird.hidden = state.job !== 'house';
    els.optHearse.hidden = state.job !== 'hearse';
    els.optStaff.hidden = state.job !== 'staffing';
  }

  // Inputs
  els.job.addEventListener('change', function () { state.job = els.job.value; render(); });
  els.miles.addEventListener('input', function () { state.miles = parseInt(els.miles.value, 10) || 0; render(); });
  els.third.addEventListener('change', function () { state.third = els.third.checked; render(); });
  els.hearse.addEventListener('change', function () { state.hearse = els.hearse.checked; render(); });
  els.staff.addEventListener('change', function () { state.staff = parseInt(els.staff.value, 10) || 1; render(); });
  Array.prototype.forEach.call(form.querySelectorAll('[data-hours]'), function (b) {
    b.addEventListener('click', function () {
      state.after = b.getAttribute('data-hours') === 'after';
      form.querySelectorAll('[data-hours]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      render();
    });
  });
  Array.prototype.forEach.call(form.querySelectorAll('input[name="pay"]'), function (r) {
    r.addEventListener('change', function () { if (r.checked) { state.pay = r.value; render(); } });
  });

  // Submit
  function setStatus(msg, isErr) { els.status.textContent = msg; els.status.className = 'form-status' + (isErr ? ' err' : ''); }

  function stripeUrl(base, reach, ref) {
    if (!base) return '';
    var u = base + (base.indexOf('?') > -1 ? '&' : '?') + 'client_reference_id=' + encodeURIComponent(ref);
    if (/@/.test(reach)) u += '&prefilled_email=' + encodeURIComponent(reach.trim());
    return u;
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var bad = null;
    form.querySelectorAll('[required]').forEach(function (f) {
      var empty = !String(f.value || '').trim();
      f.classList.toggle('invalid', empty);
      if (empty && !bad) bad = f;
    });
    if (bad) { setStatus('Please fill in the required fields.', true); bad.focus(); return; }
    if (form.botcheck.checked) return;

    if (!CFG.web3formsKey) {
      setStatus('Online booking is not switched on yet. Please call or text 445-888-1057.', true);
      return;
    }

    var e = estimate();
    var ref = 'SC-' + Date.now().toString(36).toUpperCase();
    var payLabel = { deposit: 'Pay a deposit', invoice: 'Bill me' }[state.pay];
    var hours = state.after ? 'After hours / weekend / holiday' : 'Regular hours';
    var data = {
      access_key: CFG.web3formsKey,
      subject: 'New booking ' + ref + ' — ' + form.home.value + ' — ' + els.job.options[els.job.selectedIndex].text,
      from_name: 'Scanlon website',
      'Reference': ref,
      'Funeral home': form.home.value,
      'Contact': form.contact.value,
      'Phone / email': form.reach.value,
      'Job type': els.job.options[els.job.selectedIndex].text,
      'Hours': hours,
      'Third person': state.job === 'house' ? (state.third ? 'Yes' : 'No') : '—',
      'Add hearse': state.job === 'hearse' ? (state.hearse ? 'Yes' : 'No') : '—',
      'Staff count': state.job === 'staffing' ? state.staff : '—',
      'Pickup': form.origin.value,
      'Destination': form.destination.value || '—',
      'When': form.when.value,
      'Loaded miles': state.miles || '—',
      'Notes': form.notes.value || '—',
      'Estimate lines': e.lines.map(function (l) { return l.label + ': ' + l.amount; }).join(' | '),
      'Estimated total': e.totalText,
      'Payment choice': payLabel + (state.pay === 'deposit' ? ' (' + depositText() + ')' : '')
    };
    if (/@/.test(form.reach.value)) data.replyto = form.reach.value.trim();

    els.btn.disabled = true; setStatus('Sending…');
    fetch('https://api.web3forms.com/submit', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data)
    }).then(function (r) { return r.json(); }).then(function (res) {
      if (!res.success) throw new Error(res.message || 'Send failed');
      var link = state.pay === 'deposit' ? stripeUrl(CFG.depositLink, form.reach.value, ref) : '';
      showSuccess(ref, e, link);
    }).catch(function () {
      els.btn.disabled = false;
      setStatus('That did not go through. Please call or text 445-888-1057 — we answer 24/7.', true);
    });
  });

  function showSuccess(ref, e, link) {
    var box = document.createElement('div');
    box.className = 'success';
    var payLine = '';
    if (link && state.pay === 'deposit') payLine = '<p>Next, pay your deposit securely with Stripe to hold the crew.</p><a class="btn btn-primary btn-submit" href="' + link + '">Pay deposit with Stripe</a>';
    else if (state.pay === 'deposit') payLine = '<p>We will send a secure Stripe link for the deposit when we confirm by phone.</p>';
    else payLine = '<p>No payment today. We will invoice after the job.</p>';
    box.innerHTML = '<h3>Booking received.</h3><p>Reference <strong>' + ref + '</strong>. We will call to confirm crew, arrival, and price — usually within minutes.</p>' + payLine +
      '<p>Urgent to the hour? Call or text <a href="tel:+14458881057"><strong>445-888-1057</strong></a> now.</p>';
    form.innerHTML = ''; form.appendChild(box);
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  render();
})();
