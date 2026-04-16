// ================= CONFIG =================
const API = "http://localhost:5000/api";

let selectedRole = null;
let currentUser = null;

// ================= SESSION =================
function saveSession(user) {
  localStorage.setItem("qc_user", JSON.stringify(user));
}

function loadSession() {
  const u = localStorage.getItem("qc_user");
  return u ? JSON.parse(u) : null;
}

function clearSession() {
  localStorage.removeItem("qc_user");
}

// ================= AUTH =================
function selectRole(role, card) {
  selectedRole = role;

  document.querySelectorAll(".role-card").forEach(c => c.classList.remove("selected"));
  card.classList.add("selected");

  const btn = document.getElementById("role-continue-btn");
  btn.style.opacity = "1";
  btn.style.pointerEvents = "auto";
  btn.className = "auth-btn auth-btn-" + role;
}

function goToLogin(forceRole) {
  const role = forceRole || selectedRole;
  if (!role) return;
  selectedRole = role;

  showScreen(role === "patient" ? "screen-patient-login" : "screen-admin-login");
}

function goToRegister(forceRole) {
  selectedRole = forceRole || "patient";
  showScreen("screen-patient-register");
}

function goBack(screenId) {
  showScreen(screenId);
}

function showScreen(id) {
  document.querySelectorAll(".auth-screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function loadUserData()
{
  if(!currentUser)return;
  const name=currentUser.name;

  document.getElementById("topbar-user-name").innerText=name;

  const firstNmae=name.split(" ")[0];
  document.querySelector(".page-title").innerText=`Good Morning ${firstNmae}`;
   const initials = name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase();

  document.getElementById("topbar-avatar").innerText = initials;
}


// ================= ENTER APP =================
function enterApp(role) {
  document.getElementById("auth-root").classList.add("hidden");
  document.getElementById("app-root").classList.add("visible");

  document.getElementById("topbar-avatar").textContent = currentUser.name?.[0] || "?";
  document.getElementById("topbar-user-name").textContent = currentUser.name;

  const roleTag = document.getElementById("topbar-role-tag");

  if (role === "patient") {
    roleTag.innerHTML = '<span style="background:#e8f7ef;color:#1a6b4a;font-size:.72rem;font-weight:600;padding:4px 12px;border-radius:99px;">Patient Portal</span>';
    document.getElementById("view-patient").classList.add("active");
    document.getElementById("view-admin").classList.remove("active");
  } else {
    roleTag.innerHTML = '<span style="background:#dbeafe;color:#1d5fa8;font-size:.72rem;font-weight:600;padding:4px 12px;border-radius:99px;">Hospital Admin</span>';
    document.getElementById("view-admin").classList.add("active");
    document.getElementById("view-patient").classList.remove("active");
  }
}

// ================= APPOINTMENTS =================
async function confirmAppointment() {
  if (!currentUser) return alert("Login first");

  const appointment = {
    userId: currentUser._id,
    doctorName: bkState.doctorName,
    specialization: bkState.spec,
    date: bkState.dateLabel,
    time: bkState.time,
    type: bkState.type
  };

  try {
    const res = await fetch(`${API}/appointments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(appointment)
    });

    const data = await res.json();

    if (data.success) {
      showToast("Appointment booked!");
      loadAppointments();
    }
  } catch (err) {
    console.error(err);
  }
}

async function loadAppointments() {
  if (!currentUser) return;

  const res = await fetch(`${API}/appointments?userId=${currentUser._id}`);
  const data = await res.json();

  const table = document.querySelector(".data-table tbody");
  if (!table) return;

  table.innerHTML = "";

  data.forEach(appt => {
    const row = `
      <tr>
        <td><b>${appt.doctorName}</b></td>
        <td>${appt.specialization}</td>
        <td>${appt.date}<br><small>${appt.time}</small></td>
        <td>${appt.type}</td>
        <td>${appt.status}</td>
        <td>-</td>
      </tr>
    `;
    table.innerHTML += row;
  });
}

// ================= LOGOUT =================
function logout() {
  clearSession();
  location.reload();
}

// ================= AUTO LOGIN =================
window.onload = function () {
  const user = loadSession();

  if (user) {
    currentUser = user;
    enterApp(user.role);
    loadAppointments();
  }
};



// ================= TOAST =================
function showToast(msg) {
  alert(msg);
}
const USERS = {
  patient: { email: 'patient@quickcare.com', password: 'patient123', name: 'Aryan Kumar', initials: 'AK', hospital: 'Apollo Hospital', role: 'patient' },
  admin:   { email: 'admin@apollohospital.com', password: 'admin123', name: 'Dr. Admin · Apollo', initials: 'AD', hospital: 'Apollo Hospital', role: 'admin' }
};


function goToLogin(forceRole) {
  const role = forceRole || selectedRole;
  if (!role) return;
  selectedRole = role;
  showScreen(role === 'patient' ? 'screen-patient-login' : 'screen-admin-login');
}

function goToRegister(forceRole) {
  const role = forceRole || selectedRole || 'patient';
  selectedRole = role;
  showScreen('screen-patient-register');
}

function goBack(screenId) {
  showScreen(screenId);
}

function showScreen(id) {
  document.querySelectorAll('.auth-screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function doLogin(role) {
  const emailEl    = document.getElementById(role + '-email');
  const passEl     = document.getElementById(role + '-password');
  const errEl      = document.getElementById(role + '-login-error');
  const btnEl      = document.getElementById(role + '-login-btn');
  const email      = emailEl.value.trim().toLowerCase();
  const password   = passEl.value;
  const expected   = USERS[role];

  errEl.classList.remove('show');
  btnEl.classList.add('loading');

  setTimeout(() => {
    btnEl.classList.remove('loading');
    if (email === expected.email && password === expected.password) {
      currentUser = expected;
      enterApp(role);
    } else {
      errEl.classList.add('show');
    }
  }, 1000);
}

function doRegister(role) {
  const btn = event.target.closest('.auth-btn');
  btn.classList.add('loading');
  setTimeout(() => {
    btn.classList.remove('loading');
    currentUser = USERS['patient'];
    enterApp('patient');
  }, 1200);
}


function logout() {
  currentUser  = null;
  selectedRole = null;
  document.getElementById('app-root').classList.remove('visible');
  document.getElementById('auth-root').classList.remove('hidden');
  // Reset views
  document.getElementById('view-patient').classList.remove('active');
  document.getElementById('view-admin').classList.remove('active');
  // Reset auth screens
  document.querySelectorAll('.auth-screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-role').classList.add('active');
  document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
  const btn = document.getElementById('role-continue-btn');
  btn.style.opacity = '0.45';
  btn.style.pointerEvents = 'none';
  showToast('Signed out successfully.');
}

// ── View switching (internal only, not accessible via UI) ──
function switchView(view) {
  // This is now only called internally — users can't manually switch
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + view).classList.add('active');
}

// ── Patient panels ──
function showPatientPanel(panel, btn) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-' + panel).classList.add('active');
  if (btn) {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
}

// ── Admin panels ──
function showAdminPanel(panel, btn) {
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-' + panel).classList.add('active');
  document.querySelectorAll('.admin-nav-item').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// ── Toast ──
let toastTimer;
function showToast(msg) {
  clearTimeout(toastTimer);
  document.getElementById('toast-msg').textContent = msg;
  document.getElementById('toast').classList.add('show');
  toastTimer = setTimeout(() => document.getElementById('toast').classList.remove('show'), 2800);
}

// ── Modal ──
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
// confirmAppt is defined in the DYNAMIC BOOKING ENGINE above
document.querySelectorAll('.modal-overlay').forEach(m => m.addEventListener('click', e => { if(e.target === m) m.classList.remove('open'); }));

// ══════════════════════════════════════════════════
//   DYNAMIC BOOKING ENGINE
// ══════════════════════════════════════════════════

const DOCTOR_DB = {
  Cardiology:    [
    { name:'Dr. Deepak Sharma', initials:'DS', rating:'4.9★', exp:'15 yrs', room:'204', color:'#1a6b4a' },
    { name:'Dr. Anita Nair',    initials:'AN', rating:'4.7★', exp:'10 yrs', room:'206', color:'#0f6e56' },
  ],
  Dermatology:   [
    { name:'Dr. Priya Rao',     initials:'PR', rating:'4.8★', exp:'8 yrs',  room:'110', color:'#1d5fa8' },
    { name:'Dr. Karan Bose',    initials:'KB', rating:'4.5★', exp:'6 yrs',  room:'112', color:'#2563eb' },
  ],
  Neurology:     [
    { name:'Dr. Meera Krishnan',initials:'MK', rating:'4.9★', exp:'12 yrs', room:'318', color:'#6d28d9' },
  ],
  Orthopedics:   [
    { name:'Dr. Rajan Mehta',   initials:'RM', rating:'4.8★', exp:'11 yrs', room:'405', color:'#d97706' },
    { name:'Dr. Sunita Das',    initials:'SD', rating:'4.6★', exp:'9 yrs',  room:'407', color:'#b45309' },
  ],
  Pediatrics:    [
    { name:'Dr. Sunil Verma',   initials:'SV', rating:'4.6★', exp:'7 yrs',  room:'201', color:'#e03535' },
  ],
  Gynecology:    [
    { name:'Dr. Naina Joshi',   initials:'NJ', rating:'4.9★', exp:'12 yrs', room:'305', color:'#0f6e56' },
  ],
};

// Availability map: doctor → date key (YYYY-M-D) → unavailable slots
const UNAVAILABLE_SLOTS = {
  'Dr. Deepak Sharma': { '2026-3-28':['10:00 AM','11:00 AM'], '2026-3-30':['09:00 AM','09:30 AM'] },
  'Dr. Priya Rao':     { '2026-4-2': ['09:00 AM','10:00 AM','02:00 PM'] },
  'Dr. Meera Krishnan':{ '2026-4-8': ['09:30 AM','11:00 AM'] },
};

const ALL_SLOTS = ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','02:00 PM','02:30 PM','03:00 PM'];

// Live booking state
let bkState = {
  spec: '', doctor: null, doctorName: '',
  date: null, dateLabel: '', dateKey: '',
  time: '', type: '', reason: ''
};

function onSpecChange(spec) {
  bkState.spec = spec;
  bkState.doctor = null; bkState.doctorName = '';
  bkState.date = null; bkState.dateLabel = ''; bkState.dateKey = '';
  bkState.time = '';

  const docSel = document.getElementById('book-doctor');
  docSel.innerHTML = spec
    ? '<option value="">— Choose doctor —</option>'
    : '<option value="">— Select specialization first —</option>';

  if (spec && DOCTOR_DB[spec]) {
    DOCTOR_DB[spec].forEach((d, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `${d.name} (${d.rating})`;
      docSel.appendChild(opt);
    });
  }

  document.getElementById('doctor-info-card').style.display = 'none';
  renderDynamicSlots();
  updateBookingSummary();
  renderCal();
}

function onDoctorChange(idx) {
  if (idx === '' || !bkState.spec) { bkState.doctor = null; bkState.doctorName = ''; updateBookingSummary(); return; }
  const doc = DOCTOR_DB[bkState.spec][parseInt(idx)];
  bkState.doctor = doc;
  bkState.doctorName = doc.name;
  bkState.time = ''; // reset slot on doctor change

  // Show doctor info mini card
  const card = document.getElementById('doctor-info-card');
  card.style.display = 'block';
  document.getElementById('doc-avatar-mini').textContent = doc.initials;
  document.getElementById('doc-avatar-mini').style.background = doc.color;
  document.getElementById('doc-name-mini').textContent = doc.name;
  document.getElementById('doc-meta-mini').textContent = `${bkState.spec} · Room ${doc.room} · ${doc.rating} · ${doc.exp} exp.`;

  renderDynamicSlots();
  updateBookingSummary();
}

function onTypeChange(val) {
  bkState.type = val;
  updateBookingSummary();
}

// ── Calendar (dynamic, date-aware) ──
let calYear = 2026, calMonth = 2;
function renderCal() {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  document.getElementById('cal-month-label').textContent = months[calMonth] + ' ' + calYear;
  const grid = document.getElementById('cal-grid');
  grid.innerHTML = '';
  const today = new Date(2026, 2, 24); // reference "today"
  const first = new Date(calYear, calMonth, 1).getDay();
  const days  = new Date(calYear, calMonth + 1, 0).getDate();

  for (let i = 0; i < first; i++) {
    const d = document.createElement('div'); d.className = 'cal-day empty'; grid.appendChild(d);
  }
  for (let d = 1; d <= days; d++) {
    const el = document.createElement('div');
    const thisDate = new Date(calYear, calMonth, d);
    const isPast = thisDate < today;
    const isWeekend = thisDate.getDay() === 0 || thisDate.getDay() === 6;
    const isToday = d === 24 && calMonth === 2 && calYear === 2026;
    const dateKey = `${calYear}-${calMonth}-${d}`;

    // Check if selected
    const isSelected = bkState.dateKey === dateKey;

    el.className = 'cal-day' +
      (isToday ? ' today' : '') +
      (isSelected ? ' selected' : '') +
      (isPast || isWeekend ? ' cal-day-disabled' : '');
    el.textContent = d;

    if (!isPast && !isWeekend) {
      el.onclick = function() {
        bkState.date = thisDate;
        bkState.dateKey = dateKey;
        const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        bkState.dateLabel = `${monthNames[calMonth]} ${d}, ${calYear}`;
        bkState.time = ''; // reset slot on date change
        renderCal();
        renderDynamicSlots();
        updateBookingSummary();
        const lbl = document.getElementById('slot-date-label');
        if (lbl) lbl.textContent = bkState.dateLabel;
      };
    } else {
      el.style.opacity = '.3';
      el.style.cursor = 'not-allowed';
    }
    grid.appendChild(el);
  }
}

function prevMonth() { calMonth--; if(calMonth<0){calMonth=11;calYear--;} renderCal(); }
function nextMonth() { calMonth++; if(calMonth>11){calMonth=0;calYear++;} renderCal(); }

// ── Slot rendering ──
function renderDynamicSlots() {
  const wrap = document.getElementById('time-slots-wrap');
  const hint = document.getElementById('slot-hint');
  if (!wrap) return;

  if (!bkState.doctor || !bkState.date) {
    wrap.innerHTML = '';
    hint.style.display = 'block';
    hint.textContent = !bkState.doctor ? 'Select a doctor to see slots' : 'Select a date to see available slots';
    return;
  }

  hint.style.display = 'none';
  const takenKey = bkState.dateKey;
  const taken = (UNAVAILABLE_SLOTS[bkState.doctorName] || {})[takenKey] || [];

  wrap.innerHTML = '';
  ALL_SLOTS.forEach(slot => {
    const el = document.createElement('div');
    const isUnavailable = taken.includes(slot);
    const isSelected = bkState.time === slot;
    el.className = 'time-slot' + (isUnavailable ? ' unavailable' : '') + (isSelected ? ' selected' : '');
    el.textContent = slot;
    if (isUnavailable) {
      el.title = 'Already booked';
    } else {
      el.onclick = function() {
        bkState.time = slot;
        renderDynamicSlots();
        updateBookingSummary();
      };
    }
    wrap.appendChild(el);
  });
}

// ── Slot selection (legacy kept for compatibility) ──
function selectSlot(el) {
  if (el.classList.contains('unavailable')) return;
  document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
  bkState.time = el.textContent.trim();
  updateBookingSummary();
}

// ── Live summary strip ──
function updateBookingSummary() {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || '—'; };
  set('bs-doctor', bkState.doctorName);
  set('bs-spec',   bkState.spec);
  set('bs-date',   bkState.dateLabel);
  set('bs-time',   bkState.time);
  set('bs-type',   bkState.type);

  const ready = bkState.doctorName && bkState.dateLabel && bkState.time && bkState.type;
  const btn   = document.getElementById('book-confirm-btn');
  const ind   = document.getElementById('bs-complete-indicator');
  const msg   = document.getElementById('book-validation-msg');

  if (btn) { btn.style.opacity = ready ? '1' : '.45'; btn.style.pointerEvents = ready ? 'auto' : 'none'; }
  if (ind) ind.style.display = ready ? 'block' : 'none';
  if (msg) {
    const missing = [];
    if (!bkState.spec)        missing.push('specialization');
    if (!bkState.doctorName)  missing.push('doctor');
    if (!bkState.dateLabel)   missing.push('date');
    if (!bkState.time)        missing.push('time slot');
    if (!bkState.type)        missing.push('appointment type');
    msg.textContent = missing.length ? 'Still needed: ' + missing.join(', ') : '';
  }
}

// ── Open modal with live data ──
function openBookingModal() {
  if (!bkState.doctorName || !bkState.dateLabel || !bkState.time || !bkState.type) {
    showToast('⚠ Please complete all required fields first.');
    return;
  }
  const typeIcons = { 'In-person':'🏥', 'Video':'📹', 'Follow-up':'🔁' };
  const doc = bkState.doctor;
  const rows = [
    ['Doctor',         `${bkState.doctorName}`],
    ['Specialization', bkState.spec],
    ['Room',           doc ? `Room ${doc.room}` : '—'],
    ['Hospital',       'Apollo Hospital'],
    ['Date',           bkState.dateLabel],
    ['Time',           bkState.time],
    ['Type',           `${typeIcons[bkState.type]||''} ${bkState.type}`],
    ['Reason',         document.getElementById('book-reason')?.value || 'Not specified'],
  ];
  const body = document.getElementById('modal-confirm-body');
  body.innerHTML = rows.map((r, i) =>
    `<div style="display:flex;justify-content:space-between;padding:7px 0;${i<rows.length-1?'border-bottom:1px solid var(--border2)':''}">
      <span style="color:var(--ink3)">${r[0]}</span>
      <span style="font-weight:600;text-align:right;max-width:60%">${r[1]}</span>
    </div>`
  ).join('');
  openModal('modal-confirm');
}

// ── Confirm & propagate to all features ──
function confirmAppt() {
  closeModal('modal-confirm');
  const doc   = bkState.doctor;
  const spec  = bkState.spec;
  const date  = bkState.dateLabel;
  const time  = bkState.time;
  const type  = bkState.type;
  const name  = bkState.doctorName;
  const typeMap = { 'In-person':'In-person', 'Video':'Video', 'Follow-up':'Follow-up' };
  const badgeMap = { 'In-person':'badge-blue', 'Video':'badge-purple', 'Follow-up':'badge-amber' };

  // 1) Add row to My Appointments table
  const tbody = document.querySelector('#panel-appointments .data-table tbody');
  if (tbody) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><div style="font-weight:600">${name}</div><div style="font-size:.75rem;color:var(--ink3)">Room ${doc?.room||'—'}</div></td>
      <td>${spec}</td>
      <td><div style="font-weight:500">${date}</div><div style="font-size:.75rem;color:var(--ink3)">${time}</div></td>
      <td><span class="badge ${badgeMap[type]||'badge-blue'}" style="${type==='Video'?'background:#ede9fe;color:#6d28d9':''}">${type}</span></td>
      <td><span class="badge badge-amber">Pending</span></td>
      <td>
        <button class="btn-secondary" style="padding:5px 12px;font-size:.775rem" onclick="cancelNewAppt(this, '${name}', '${date}', '${time}')">Cancel</button>
      </td>`;
    tbody.insertBefore(tr, tbody.firstChild);
  }

  // 2) Add to Dashboard upcoming appointments list
  const apptList = document.querySelector('#panel-dashboard .appt-list');
  if (apptList) {
    const colors = { Cardiology:'#1a6b4a', Dermatology:'#1d5fa8', Neurology:'#6d28d9', Orthopedics:'#d97706', Pediatrics:'#e03535', Gynecology:'#0f6e56' };
    const item = document.createElement('div');
    item.className = 'appt-item';
    item.innerHTML = `
      <div class="appt-avatar" style="background:${doc?.color || colors[spec] || '#1a6b4a'}">${doc?.initials||'??'}</div>
      <div>
        <div class="appt-name">${name}</div>
        <div class="appt-sub">${spec} · Room ${doc?.room||'—'}</div>
      </div>
      <div class="appt-time">
        <div class="appt-date">${date.split(',')[0]}</div>
        <div class="appt-hour">${time}</div>
      </div>
      <span class="badge badge-amber">Pending</span>`;
    apptList.appendChild(item);
  }

  // 3) Update dashboard stats — increment upcoming count
  const statVal = document.querySelector('#panel-dashboard .stat-card:first-child .stat-value');
  if (statVal) statVal.textContent = parseInt(statVal.textContent) + 1;

  // 4) Update "Next Visit" stat card if this appointment is earlier
  const nextCard = document.querySelector('#panel-dashboard .stat-card:last-child .stat-value');
  if (nextCard) {
    const shortDate = date.split(',')[0];
    nextCard.textContent = shortDate;
    const nextMeta = document.querySelector('#panel-dashboard .stat-card:last-child .stat-meta');
    if (nextMeta) nextMeta.textContent = `${name} · ${spec}`;
  }

  // 5) Fully sync Waiting Room to the newly booked appointment
  syncWaitingRoomToBooking({ doctor: name, spec, room: doc?.room || '—', initials: doc?.initials || '??', color: doc?.color || '#1a6b4a', time, dateLabel: date, dateObj: bkState.date });

  showToast(`✅ Appointment booked! ${name} · ${date} at ${time}. Confirmation sent to your email.`);

  resetBookingForm();
}

function cancelNewAppt(btn, name, date, time) {
  const row = btn.closest('tr');
  if (row) row.remove();
  // Also remove from dashboard list
  const items = document.querySelectorAll('#panel-dashboard .appt-item');
  items.forEach(item => {
    if (item.querySelector('.appt-name')?.textContent === name) item.remove();
  });
  // Decrement stat
  const statVal = document.querySelector('#panel-dashboard .stat-card:first-child .stat-value');
  if (statVal) statVal.textContent = Math.max(0, parseInt(statVal.textContent) - 1);
  showToast(`Appointment with ${name} on ${date} at ${time} cancelled.`);
}

function resetBookingForm() {
  bkState = { spec:'', doctor:null, doctorName:'', date:null, dateLabel:'', dateKey:'', time:'', type:'', reason:'' };
  const ids = ['book-spec','book-doctor','book-type','book-reason'];
  ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  document.getElementById('doctor-info-card').style.display = 'none';
  document.getElementById('time-slots-wrap').innerHTML = '';
  const hint = document.getElementById('slot-hint');
  if (hint) { hint.style.display = 'block'; hint.textContent = 'Select a date to see available slots'; }
  document.getElementById('book-doctor').innerHTML = '<option value="">— Select specialization first —</option>';
  renderCal();
  updateBookingSummary();
}

// ── updateDoctorList kept as alias ──
function updateDoctorList(spec) { onSpecChange(spec); }



// ── AI Chat ──
const aiResponses = [
  "Based on your medical history, I'd recommend discussing this with Dr. Sharma at your next appointment on Mar 28. In the meantime, try to monitor your blood pressure daily.",
  "That's a great question! Drug interactions between those medications are generally safe at standard doses, but always confirm with your pharmacist or doctor.",
  "For your upcoming cardiology visit, consider asking about: 1) Long-term management plan, 2) Whether lifestyle changes can reduce medication, 3) Follow-up schedule.",
  "I see you have a history of high blood sugar. Foods to avoid include white rice, sugary drinks, processed snacks, and refined flour. Focus on whole grains and leafy vegetables.",
  "I've noted your symptoms. While this could be related to your current condition, please don't delay seeking in-person medical care if symptoms worsen.",
  "Your next appointment with Dr. Sharma is on March 28 at 10:30 AM. Would you like me to help you prepare a list of questions?",
];

function sendChat(containerId) {
  const inputId = containerId === 'dash' ? 'dash-input' : 'ai-full-input';
  const input = document.getElementById(inputId);
  const text = input.value.trim();
  if (!text) return;
  const container = document.getElementById(containerId);

  const userMsg = document.createElement('div');
  userMsg.className = 'ai-msg user';
  userMsg.innerHTML = '<div class="ai-bubble">' + text + '</div>';
  container.appendChild(userMsg);
  input.value = '';
  container.scrollTop = container.scrollHeight;

  const typing = document.createElement('div');
  typing.className = 'ai-msg';
  typing.innerHTML = '<div class="ai-avatar-sm">Q</div><div class="ai-bubble"><div class="typing"><span></span><span></span><span></span></div></div>';
  container.appendChild(typing);
  container.scrollTop = container.scrollHeight;

  setTimeout(() => {
    typing.remove();
    const botMsg = document.createElement('div');
    botMsg.className = 'ai-msg';
    botMsg.innerHTML = '<div class="ai-avatar-sm">Q</div><div class="ai-bubble">' + aiResponses[Math.floor(Math.random()*aiResponses.length)] + '</div>';
    container.appendChild(botMsg);
    container.scrollTop = container.scrollHeight;
  }, 1200 + Math.random()*600);
}

function insertPrompt(containerId, text) {
  const inputId = containerId === 'dash' ? 'dash-input' : 'ai-full-input';
  document.getElementById(inputId).value = text;
}

// updateDoctorList alias defined in booking engine above


// ═══════════════════════════════════════════════════
//   VIRTUAL WAITING ROOM ENGINE
// ═══════════════════════════════════════════════════

// Active appointment powering the waiting room (updated when patient books)
let WR_APPT = new Date(2026, 2, 28, 10, 30, 0); // default: Mar 28 10:30 AM
let WR_APPT_META = { doctor:'Dr. Deepak Sharma', spec:'Cardiology', room:'204', initials:'DS', color:'#1a6b4a', time:'10:30 AM', dateLabel:'Mar 28, 2026' };
let WR_SIMULATED_DIFF = null; // null = use real time, else minutes offset
let WR_CANCELLED = false;
let WR_CONFIRMED = false;
let WR_NOTIF_FIRED = false;
let wrCountdownInterval = null;

// 12 seat slots for Dr. Sharma's day
const WR_SLOTS = [
  { id:'A1', time:'09:00 AM', state:'occupied', name:'Raj M.' },
  { id:'A2', time:'09:30 AM', state:'occupied', name:'Sunita P.' },
  { id:'A3', time:'10:00 AM', state:'occupied', name:'Vikram S.' },
  { id:'A4', time:'10:00 AM', state:'occupied', name:'Neha K.' },
  { id:'A5', time:'10:30 AM', state:'mine',     name:'You' },
  { id:'A6', time:'10:30 AM', state:'occupied', name:'Deepa R.' },
  { id:'A7', time:'11:00 AM', state:'available',name:'' },
  { id:'A8', time:'11:00 AM', state:'occupied', name:'Arun T.' },
  { id:'A9', time:'11:30 AM', state:'available',name:'' },
  { id:'B1', time:'02:00 PM', state:'locked',   name:'' },
  { id:'B2', time:'02:30 PM', state:'locked',   name:'' },
  { id:'B3', time:'03:00 PM', state:'locked',   name:'' },
];

const WR_TIME_SLOTS = [
  { time:'09:00 AM', taken:true  },
  { time:'09:30 AM', taken:true  },
  { time:'10:00 AM', taken:true  },
  { time:'10:30 AM', mine:true   },
  { time:'11:00 AM', taken:false },
  { time:'11:30 AM', taken:false },
  { time:'02:00 PM', future:true },
  { time:'02:30 PM', future:true },
  { time:'03:00 PM', future:true },
];

function renderWRSeats(override) {
  const grid = document.getElementById('wr-seat-grid');
  if (!grid) return;
  grid.innerHTML = '';
  const slots = override || WR_SLOTS;
  slots.forEach(slot => {
    const el = document.createElement('div');
    el.className = 'wr-seat ' + slot.state;
    const icon = slot.state==='mine' ? '🙋' : slot.state==='occupied' ? '👤' : slot.state==='available' ? '💺' : '🔒';
    el.innerHTML = `<div style="font-size:1.3rem">${icon}</div>
      <div class="wr-seat-label">${slot.id}</div>
      <div class="wr-seat-time">${slot.state==='mine'?'<b>You</b>':slot.name||slot.time}</div>`;
    if (slot.state === 'mine') el.title = 'Your seat — ' + slot.time;
    else if (slot.state === 'occupied') el.title = slot.name + ' · ' + slot.time;
    else if (slot.state === 'available') el.title = 'Available · ' + slot.time;
    grid.appendChild(el);
  });
  // update count
  const occ = document.getElementById('wr-occupied-count');
  if (occ) occ.textContent = slots.filter(s=>s.state==='occupied'||s.state==='mine').length;
}

function renderWRTimeSlots() {
  const wrap = document.getElementById('wr-time-slots');
  if (!wrap) return;
  wrap.innerHTML = '';
  WR_TIME_SLOTS.forEach(s => {
    const chip = document.createElement('div');
    chip.className = 'wr-time-slot-chip ' +
      (s.mine ? 'mine-slot' : s.taken ? 'taken-slot' : s.future ? 'future-slot' : 'open-slot');
    chip.innerHTML = s.mine ? `⭐ ${s.time} <b>(You)</b>` : s.taken ? `🔴 ${s.time}` : s.future ? `🔒 ${s.time}` : `🟢 ${s.time}`;
    wrap.appendChild(chip);
  });
}

function getMinutesUntil() {
  if (WR_SIMULATED_DIFF !== null) return WR_SIMULATED_DIFF;
  const now = new Date();
  return Math.floor((WR_APPT - now) / 60000);
}

function formatCountdown(mins) {
  if (mins <= 0) return { display:'00:00:00', sub:'Appointment time reached' };
  const d = Math.floor(mins / (60*24));
  const h = Math.floor((mins % (60*24)) / 60);
  const m = mins % 60;
  if (d > 0) return { display:`${d}d ${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m`, sub: `${d} day${d>1?'s':''} and ${h} hour${h!==1?'s':''} away` };
  if (h > 0) return { display:`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00`, sub:`${h} hour${h!==1?'s':''} and ${m} min${m!==1?'s':''} away` };
  return { display:`00:${String(m).padStart(2,'0')}:00`, sub:`Only ${m} minute${m!==1?'s':''} away!` };
}

function updateWRCountdown() {
  const cd = document.getElementById('wr-countdown');
  const sub = document.getElementById('wr-countdown-sub');
  const badge = document.getElementById('wr-countdown-badge');
  const notif = document.getElementById('wr-notif-card');
  if (!cd || WR_CANCELLED) return;

  const mins = getMinutesUntil();
  const { display, sub: subText } = formatCountdown(mins);

  cd.textContent = display;
  if (sub) sub.textContent = subText;

  // Color badge based on urgency
  if (mins <= 0) {
    badge.style.background = 'linear-gradient(135deg,#e03535,#b91c1c)';
    if (!WR_CONFIRMED && !WR_NOTIF_FIRED) {
      autoCancelAppointment();
    }
  } else if (mins <= 30) {
    badge.style.background = 'linear-gradient(135deg,#d97706,#b45309)';
    if (!WR_NOTIF_FIRED && !WR_CONFIRMED && !WR_CANCELLED) {
      WR_NOTIF_FIRED = true;
      showNotificationBanner();
    }
  } else if (mins <= 60) {
    badge.style.background = 'linear-gradient(135deg,#1d5fa8,#164d8a)';
  } else {
    badge.style.background = 'linear-gradient(135deg,#1a6b4a,#0f4d34)';
  }

  // Simulate real tick only when not simulated
  if (WR_SIMULATED_DIFF !== null && WR_SIMULATED_DIFF > 0) {
    WR_SIMULATED_DIFF--;
  }
}

function showNotificationBanner() {
  const notif = document.getElementById('wr-notif-card');
  if (notif) {
    notif.style.display = 'block';
    showToast('🔔 Reminder: Your appointment with Dr. Sharma is in 30 minutes!');
  }
}

function confirmFromWaitingRoom() {
  WR_CONFIRMED = true;
  const notif = document.getElementById('wr-notif-card');
  if (notif) notif.style.display = 'none';
  showToast('✅ Confirmed! See you at 10:30 AM. Your seat #A5 is held.');
  const badge = document.getElementById('wr-status-badge');
  if (badge) badge.innerHTML = '<span class="badge badge-green" style="font-size:.82rem;padding:6px 14px">✓ Attendance Confirmed</span>';
}

function cancelFromWaitingRoom() {
  WR_CANCELLED = true;
  const notif = document.getElementById('wr-notif-card');
  if (notif) notif.style.display = 'none';
  vacateSeat();
  showToast('❌ Appointment cancelled. Your slot has been released.');
}

function autoCancelAppointment() {
  if (WR_CANCELLED || WR_CONFIRMED) return;
  WR_CANCELLED = true;
  const notif = document.getElementById('wr-notif-card');
  if (notif) notif.style.display = 'none';
  vacateSeat();

  // Show cancellation banner
  const panel = document.getElementById('panel-waiting');
  const banner = document.createElement('div');
  banner.className = 'wr-cancelled-banner';
  banner.innerHTML = `<div style="font-size:1.8rem;margin-bottom:8px">⚠️</div>
    <div style="font-weight:700;font-size:1rem;margin-bottom:4px">Appointment Auto-Cancelled</div>
    <div style="font-size:.85rem;opacity:.85">You did not confirm attendance 30 minutes before your appointment.<br>Your seat #A5 has been released and is now available to other patients.</div>
    <button class="btn-secondary" style="margin-top:14px;font-size:.82rem" onclick="showPatientPanel('book',null)">Book a New Appointment</button>`;
  const myCard = document.getElementById('wr-my-appt-card');
  if (myCard) myCard.after(banner);
  showToast('❌ Auto-cancelled: No confirmation received. Slot released.');
}

function vacateSeat() {
  // Change mine seat to available
  const updatedSlots = WR_SLOTS.map(s => s.id === 'A5' ? {...s, state:'available', name:''} : s);
  WR_SLOTS[4] = {...WR_SLOTS[4], state:'available', name:''};
  renderWRSeats();
  const badge = document.getElementById('wr-status-badge');
  if (badge) badge.innerHTML = '<span class="badge badge-red" style="font-size:.82rem;padding:6px 14px">✗ Cancelled</span>';
}

function simulateTimeChange(minutes) {
  WR_SIMULATED_DIFF = minutes;
  WR_NOTIF_FIRED = false;
  WR_CANCELLED = false;
  WR_CONFIRMED = false;

  // Reset UI
  const notif = document.getElementById('wr-notif-card');
  if (notif) notif.style.display = 'none';
  const myCard = document.getElementById('wr-my-appt-card');
  WR_SLOTS[4] = { id:'A5', time:'10:30 AM', state:'mine', name:'You' };

  // Remove any existing cancellation banners
  document.querySelectorAll('.wr-cancelled-banner').forEach(b => b.remove());

  renderWRSeats();
  const badge = document.getElementById('wr-status-badge');
  if (badge) badge.innerHTML = '<span class="badge badge-green" style="font-size:.82rem;padding:6px 14px">✓ Confirmed</span>';

  updateWRCountdown();

  const labels = { [60*24*2]:'2 days', [60*3]:'3 hours', 29:'29 minutes (alert firing!)', 0:'now (auto-cancel triggering)' };
  showToast('⏱ Simulating: ' + (labels[minutes] || minutes + ' min') + ' until appointment');
}

function resetWaitingRoom() {
  WR_SIMULATED_DIFF = null;
  WR_NOTIF_FIRED = false;
  WR_CANCELLED = false;
  WR_CONFIRMED = false;
  WR_SLOTS[4] = { id:'A5', time:'10:30 AM', state:'mine', name:'You' };
  document.querySelectorAll('.wr-cancelled-banner').forEach(b => b.remove());
  const notif = document.getElementById('wr-notif-card');
  if (notif) notif.style.display = 'none';
  const badge = document.getElementById('wr-status-badge');
  if (badge) badge.innerHTML = '<span class="badge badge-green" style="font-size:.82rem;padding:6px 14px">✓ Confirmed</span>';
  renderWRSeats();
  updateWRCountdown();
  showToast('↺ Reset to real time countdown.');
}

// ── Sync Waiting Room when a new appointment is booked ──
function syncWaitingRoomToBooking({ doctor, spec, room, initials, color, time, dateLabel, dateObj }) {
  // 1. Parse the appointment datetime from the chosen date + time slot
  const timeParts = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
  let hours   = parseInt(timeParts[1]);
  const mins  = parseInt(timeParts[2]);
  const ampm  = timeParts[3].toUpperCase();
  if (ampm === 'PM' && hours !== 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;

  const apptDate = dateObj ? new Date(dateObj) : new Date(WR_APPT);
  apptDate.setHours(hours, mins, 0, 0);

  // 2. Update the global WR target & meta
  WR_APPT = apptDate;
  WR_APPT_META = { doctor, spec, room, initials, color, time, dateLabel };

  // 3. Reset all WR state
  WR_SIMULATED_DIFF = null;
  WR_CANCELLED  = false;
  WR_CONFIRMED  = false;
  WR_NOTIF_FIRED = false;

  // 4. Remove any lingering cancellation banners / notification card
  document.querySelectorAll('.wr-cancelled-banner').forEach(b => b.remove());
  const notif = document.getElementById('wr-notif-card');
  if (notif) notif.style.display = 'none';

  // 5. Update the appointment info strip
  const avatarEl = document.querySelector('#wr-my-appt-card [id="doc-wr-avatar"]') ||
                   document.querySelector('#wr-my-appt-card div[style*="border-radius:13px"]');
  if (avatarEl) { avatarEl.textContent = initials; avatarEl.style.background = color; }

  const nameEl = document.querySelector('#wr-my-appt-card div[style*="font-weight:700"]');
  if (nameEl) nameEl.innerHTML = `${doctor} <span style="font-weight:400;color:var(--ink3);font-size:.82rem">· ${spec}</span>`;

  const roomEl = document.querySelector('#wr-my-appt-card div[style*="font-size:.8rem"]');
  if (roomEl) roomEl.innerHTML = `📍 Room ${room} &nbsp;·&nbsp; Apollo Hospital`;

  const dateEl = document.getElementById('wr-appt-date');
  if (dateEl) dateEl.textContent = dateLabel;

  // Time cell — find the accent-colored time value
  const timeCells = document.querySelectorAll('#wr-my-appt-card div[style*="font-size:1rem"]');
  timeCells.forEach(el => { if (el.style.color === 'var(--accent)' || el.style.color === 'rgb(26, 107, 74)') el.textContent = time; });

  // 6. Restore status badge
  const badge = document.getElementById('wr-status-badge');
  if (badge) badge.innerHTML = '<span class="badge badge-green" style="font-size:.82rem;padding:6px 14px">✓ Confirmed</span>';

  // 7. Rebuild seat grid with new time slot as "mine"
  // Mark occupied seats based on the same time slot, rest as available/locked
  const mySlotHour = hours * 60 + mins;
  WR_SLOTS.forEach((s, i) => {
    const sp = s.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!sp) return;
    let sh = parseInt(sp[1]), sm = parseInt(sp[2]);
    if (sp[3].toUpperCase() === 'PM' && sh !== 12) sh += 12;
    if (sp[3].toUpperCase() === 'AM' && sh === 12) sh = 0;
    const slotMin = sh * 60 + sm;
    const diff = slotMin - mySlotHour;
    if (i === 4 || (s.id === 'A5')) {
      // patient's own slot
      WR_SLOTS[i] = { ...s, state: 'mine', name: 'You', time };
    } else if (diff < 0) {
      WR_SLOTS[i] = { ...s, state: 'occupied' };
    } else if (diff === 0) {
      WR_SLOTS[i] = { ...s, state: 'occupied' };
    } else if (diff <= 60) {
      WR_SLOTS[i] = { ...s, state: 'available' };
    } else {
      WR_SLOTS[i] = { ...s, state: 'locked' };
    }
  });
  // Place patient in seat A5 with correct time
  WR_SLOTS[4] = { id:'A5', time, state:'mine', name:'You' };

  // 8. Rebuild WR time slots to match new schedule
  const slotMins = (t) => {
    const m = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
    let h = parseInt(m[1]), mn = parseInt(m[2]);
    if (m[3].toUpperCase()==='PM' && h!==12) h+=12;
    if (m[3].toUpperCase()==='AM' && h===12) h=0;
    return h*60+mn;
  };
  WR_TIME_SLOTS.forEach((s, i) => {
    const diff = slotMins(s.time) - mySlotHour;
    if (diff === 0) { WR_TIME_SLOTS[i] = { ...s, mine:true, taken:false, future:false }; }
    else if (diff < 0) { WR_TIME_SLOTS[i] = { ...s, mine:false, taken:true, future:false }; }
    else if (diff <= 60) { WR_TIME_SLOTS[i] = { ...s, mine:false, taken:false, future:false }; }
    else { WR_TIME_SLOTS[i] = { ...s, mine:false, taken:false, future:true }; }
  });

  renderWRSeats();
  renderWRTimeSlots();
  updateWRCountdown();
}

// Init waiting room
renderWRSeats();
renderWRTimeSlots();
updateWRCountdown();
setInterval(updateWRCountdown, 1000);

// Init booking form
renderCal();
updateBookingSummary();

