"use strict";
/* ============================================================
   Learn English — add-on module (does not modify course core):
   1) "প্রথম ৫ দিন" onboarding path (40 words, checks, mini-test)
   2) Pronunciation audio wiring for FREE chapters 1–3
   Audio clips are data files (aud-ch.js / aud-days.js), loaded
   lazily on first 🔊 tap. Masters live in audio/*.mp3.
   ============================================================ */

/* ---------- Audio player (lazy data-file loader) ---------- */
window.AUD = window.AUD || {};
var AUD_FILES = { ch: "aud-ch.js", d: "aud-days.js" };
var AUD_PENDING = {};
var AUD_EL = null;
function doPlay(b64) {
  try {
    if (AUD_EL) { AUD_EL.pause(); }
    AUD_EL = new Audio("data:audio/mpeg;base64," + b64);
    var p = AUD_EL.play();
    if (p && p.catch) { p.catch(function () {}); }
  } catch (e) {}
}
function playClip(key) {
  if (window.AUD[key]) { doPlay(window.AUD[key]); return; }
  var grp = (key.indexOf("d-") === 0) ? "d" : "ch";
  if (AUD_PENDING[grp]) { AUD_PENDING[grp].push(key); return; }
  AUD_PENDING[grp] = [key];
  var s = document.createElement("script");
  s.src = AUD_FILES[grp];
  s.onload = function () {
    var q = AUD_PENDING[grp] || []; AUD_PENDING[grp] = null;
    q.forEach(function (k) { if (window.AUD[k]) doPlay(window.AUD[k]); });
  };
  s.onerror = function () { AUD_PENDING[grp] = null; };
  document.body.appendChild(s);
}
function pad2(n) { return (n < 10 ? "0" : "") + n; }
function addSpk(parent, key) {
  var b = document.createElement("button");
  b.type = "button"; b.className = "spk"; b.textContent = "🔊"; b.title = "উচ্চারণ শুনুন";
  b.setAttribute("aria-label", "উচ্চারণ শুনুন");
  b.onclick = function (ev) { ev.stopPropagation(); playClip(key); };
  parent.appendChild(b);
}
/* Wire 🔊 into free chapters (DOM order = clip order) */
(function wireChapterAudio() {
  document.querySelectorAll("#ch1 table td.en").forEach(function (td, i) { addSpk(td, "c1-" + pad2(i + 1)); });
  document.querySelectorAll("#words2 .word").forEach(function (el, i) { if (window.WORDS2 && WORDS2[i]) addSpk(el, "c2-" + WORDS2[i][0]); });
  document.querySelectorAll("#ch3 .script p.en").forEach(function (p, i) { addSpk(p, "c3-" + pad2(i + 1)); });
})();

/* ---------- First 5 Days data ---------- */
/* word: [english, bengali meaning, example EN, example BN gloss] */
var DAYS = [
  { t: "দিন ১ — দোকান ও বিক্রির মূল শব্দ", words: [
    ["price", "দাম", "The price is fixed.", "দাম ফিক্সড।"],
    ["order", "অর্ডার", "Your order is ready.", "তোমার অর্ডার তৈরি।"],
    ["customer", "ক্রেতা", "The customer is happy.", "ক্রেতা খুশি।"],
    ["send", "পাঠানো", "Please send your address.", "ঠিকানাটা পাঠাও।"],
    ["ready", "তৈরি", "I am ready.", "আমি তৈরি।"],
    ["payment", "টাকা পরিশোধ", "Please send the payment today.", "আজ টাকাটা পাঠিয়ে দাও।"],
    ["delivery", "ডেলিভারি / পৌঁছে দেওয়া", "Delivery takes two days.", "ডেলিভারিতে দুই দিন লাগে।"],
    ["discount", "ছাড়", "I can give you a small discount.", "আমি সামান্য ছাড় দিতে পারি।"]
  ], check: [0, 2, 4, 5, 7] },
  { t: "দিন ২ — ক্রেতার সঙ্গে কথা", words: [
    ["message", "বার্তা", "Please read my message.", "আমার বার্তাটা পড়ো।"],
    ["reply", "জবাব", "I will reply soon.", "আমি শীঘ্রই জবাব দেব।"],
    ["confirm", "নিশ্চিত করা", "Please confirm the order.", "অর্ডারটা নিশ্চিত করো।"],
    ["question", "প্রশ্ন", "I have a question.", "আমার একটা প্রশ্ন আছে।"],
    ["answer", "উত্তর দেওয়া", "Please answer me.", "আমাকে উত্তর দাও।"],
    ["help", "সাহায্য", "How can I help you?", "কীভাবে সাহায্য করতে পারি?"],
    ["request", "অনুরোধ", "This is my request.", "এটা আমার অনুরোধ।"],
    ["problem", "সমস্যা", "If you have any problem, message me.", "সমস্যা হলে মেসেজ করো।"]
  ], check: [0, 2, 3, 5, 7] },
  { t: "দিন ৩ — সময় ও অবস্থা", words: [
    ["today", "আজ", "I will confirm your order today.", "আজই অর্ডার নিশ্চিত করব।"],
    ["tomorrow", "আগামীকাল", "I will deliver tomorrow.", "আগামীকাল ডেলিভারি দেব।"],
    ["yesterday", "গতকাল", "He called me yesterday.", "সে গতকাল ফোন করেছিল।"],
    ["morning", "সকাল", "Good morning!", "শুভ সকাল!"],
    ["evening", "সন্ধ্যা", "I will call you in the evening.", "সন্ধ্যায় ফোন করব।"],
    ["now", "এখন", "I am starting the work now.", "এখনই কাজ শুরু করছি।"],
    ["later", "পরে", "I will send it later.", "পরে পাঠিয়ে দেব।"],
    ["quickly", "তাড়াতাড়ি / দ্রুত", "Please reply quickly.", "তাড়াতাড়ি উত্তর দাও।"]
  ], check: [0, 1, 4, 6, 7] },
  { t: "দিন ৪ — জিনিসপত্র ও মান", words: [
    ["quality", "মান", "We check the quality first.", "আমরা আগে মান যাচাই করি।"],
    ["original", "আসল", "This is an original product.", "এটা আসল পণ্য।"],
    ["new", "নতুন", "This design is new.", "এই ডিজাইনটা নতুন।"],
    ["different", "আলাদা", "This is a different design.", "এটা আলাদা ডিজাইন।"],
    ["size", "মাপ / আকার", "What size do you need?", "তোমার কোন মাপ লাগবে?"],
    ["colour", "রং", "Which colour do you like?", "কোন রংটা পছন্দ?"],
    ["stock", "মজুত / স্টক", "Sorry, this is out of stock.", "দুঃখিত, এটা স্টকে নেই।"],
    ["sample", "নমুনা", "Please check the sample first.", "আগে নমুনাটা দেখে নাও।"]
  ], check: [0, 1, 4, 6, 7] },
  { t: "দিন ৫ — কাজের বড় শব্দ", words: [
    ["available", "পাওয়া যায়", "Home delivery is available.", "হোম ডেলিভারি পাওয়া যায়।"],
    ["interested", "আগ্রহী", "Are you interested in this laptop?", "এই ল্যাপটপে কি তুমি আগ্রহী?"],
    ["address", "ঠিকানা", "Please send your full address.", "পুরো ঠিকানাটা পাঠাও।"],
    ["important", "গুরুত্বপূর্ণ", "This file is very important.", "এই ফাইলটা খুব গুরুত্বপূর্ণ।"],
    ["because", "কারণ", "I am late because of traffic.", "যানজটের কারণে দেরি হয়েছে।"],
    ["service", "সেবা", "We give good service.", "আমরা ভালো সেবা দিই।"],
    ["guarantee", "গ্যারান্টি", "We give a 7-day replacement guarantee.", "আমরা ৭ দিনের বদলি গ্যারান্টি দিই।"],
    ["learning", "শেখা", "I am learning English every day.", "আমি প্রতিদিন ইংরেজি শিখছি।"]
  ], check: [0, 2, 3, 5, 6] }
];
var TEST_PICK = [[0,0],[0,6],[1,0],[1,2],[2,1],[2,6],[3,0],[3,5],[4,0],[4,3]];
var PRAISE = ["✅ ঠিক হয়েছে!", "✅ দারুণ! একদম ঠিক।", "✅ বাহ! ঠিক উত্তর।", "✅ ঠিক! এভাবেই এগিয়ে যাও।"];
var RETRY = ["আরেকবার ভাবো তো — তুমি ঠিক পারবে! 💪", "প্রায় হয়ে গেছে — আরেকবার চেষ্টা করো। 🙂"];

function bnN(n) { return String(n).replace(/[0-9]/g, function (d) { return "০১২৩৪৫৬৭৮৯"[+d]; }); }
function fiveState() {
  try { return JSON.parse(localStorage.getItem("learn_five_v1") || "{}"); } catch (e) { return {}; }
}
function saveFive(st) { localStorage.setItem("learn_five_v1", JSON.stringify(st)); }
function firstOpenDay(st) {
  for (var i = 0; i < 5; i++) { if (!st["d" + (i + 1)]) return i; }
  return -1;
}

/* Build a meaning-quiz; questions: [{w, opts[3], ans}] — retries allowed, tracks first-try score */
function renderQuiz(box, questions, doneCb) {
  var state = questions.map(function () { return { tries: 0, solved: false }; });
  var solvedCount = 0, firstTry = 0;
  var prog = document.createElement("div"); prog.className = "progress";
  var msg = document.createElement("div"); msg.className = "feedback";
  function updProg() { prog.textContent = "শেষ হয়েছে: " + bnN(solvedCount) + " / " + bnN(questions.length) + "টি"; }
  questions.forEach(function (q, qi) {
    var d = document.createElement("div"); d.className = "word";
    var h = '<div class="w" style="font-size:16.5px">' + bnN(qi + 1) + '. “' + q.w + '” মানে কী?</div>';
    q.opts.forEach(function (o, oi) { h += '<button type="button" class="pill ghost qopt" data-o="' + oi + '">' + o + '</button>'; });
    d.innerHTML = h; box.appendChild(d);
    d.querySelectorAll(".qopt").forEach(function (btn) {
      btn.onclick = function () {
        if (state[qi].solved) return;
        var oi = parseInt(btn.getAttribute("data-o"), 10);
        if (oi === q.ans) {
          if (state[qi].tries === 0) firstTry++;
          state[qi].solved = true; solvedCount++;
          btn.classList.add("right");
          d.querySelectorAll(".qopt").forEach(function (x) { x.disabled = true; });
          msg.textContent = PRAISE[(qi + solvedCount) % PRAISE.length]; msg.className = "feedback ok";
          updProg();
          if (solvedCount === questions.length) { doneCb(firstTry); }
        } else {
          state[qi].tries++;
          btn.classList.add("wrong"); btn.disabled = true;
          msg.textContent = RETRY[qi % RETRY.length]; msg.className = "feedback";
          msg.style.color = "#b45309";
        }
      };
    });
  });
  updProg();
  box.appendChild(prog); box.appendChild(msg);
  return msg;
}
function buildOpts(dayWords, wi, seed) {
  var correct = dayWords[wi][1];
  var others = dayWords.filter(function (_, i) { return i !== wi; }).map(function (w) { return w[1]; });
  var d1 = others[seed % others.length], d2 = others[(seed + 3) % others.length];
  var opts = [correct, d1, d2];
  var rot = seed % 3;
  var out = opts.slice(rot).concat(opts.slice(0, rot));
  return { opts: out, ans: out.indexOf(correct) };
}

/* ---------- Section rendering ---------- */
var curDay = 0;
function renderDots() {
  var st = fiveState(), box = document.getElementById("dayDots");
  if (!box) return;
  var h = "";
  for (var i = 0; i < 5; i++) {
    var done = !!st["d" + (i + 1)];
    h += '<span class="dot' + (done ? " done" : "") + '">' + (done ? "✓" : "") + " দিন " + bnN(i + 1) + "</span>";
  }
  if (st.test) h += '<span class="dot done">✓ 🏆 শেষ!</span>';
  box.innerHTML = h;
}
function renderTabs() {
  var st = fiveState(), box = document.getElementById("dayTabs");
  if (!box) return;
  box.innerHTML = "";
  DAYS.forEach(function (d, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "pill dtab" + (i === curDay ? "" : " ghost");
    b.textContent = "দিন " + bnN(i + 1) + (st["d" + (i + 1)] ? " ✓" : "");
    b.onclick = function () { curDay = i; renderTabs(); renderDay(); };
    box.appendChild(b);
  });
}
function renderDay() {
  var st = fiveState(), body = document.getElementById("dayBody");
  if (!body) return;
  var day = DAYS[curDay];
  body.innerHTML = "";
  var h3 = document.createElement("h3"); h3.textContent = day.t; body.appendChild(h3);
  var tip = document.createElement("p"); tip.className = "sub";
  tip.textContent = "প্রতিটি শব্দ শুনুন 🔊, অর্থটা পড়ুন, উদাহরণটা মুখে বলুন। তারপর নিচের ছোট্ট যাচাইটা করুন।";
  body.appendChild(tip);
  day.words.forEach(function (w) {
    var d = document.createElement("div"); d.className = "word";
    d.innerHTML = '<span class="w">' + w[0] + '</span><br>অর্থ: <b>' + w[1] + '</b><br><span class="en">' + w[2] + '</span><br><span class="use">' + w[3] + '</span>';
    addSpk(d, "d-" + w[0]);
    body.appendChild(d);
  });
  var qh = document.createElement("h3"); qh.textContent = "🎯 আজকের ছোট্ট যাচাই"; body.appendChild(qh);
  if (st["d" + (curDay + 1)]) {
    var doneNote = document.createElement("div"); doneNote.className = "tip";
    doneNote.innerHTML = "🎉 <b>এই দিনটি তুমি শেষ করেছ!</b> চাইলে আবার অনুশীলন করতে পারো — প্রথম চেষ্টায় পেয়েছিলে " + bnN(st["f" + (curDay + 1)] || 0) + "/৫।";
    body.appendChild(doneNote);
  }
  var qbox = document.createElement("div");
  body.appendChild(qbox);
  var questions = day.check.map(function (wi, k) {
    var o = buildOpts(day.words, wi, curDay * 7 + k + 1);
    return { w: day.words[wi][0], opts: o.opts, ans: o.ans };
  });
  renderQuiz(qbox, questions, function (firstTry) {
    var s2 = fiveState();
    if (!s2["d" + (curDay + 1)]) { s2["d" + (curDay + 1)] = true; s2["f" + (curDay + 1)] = firstTry; saveFive(s2); }
    var fin = document.createElement("div"); fin.className = "tip";
    fin.innerHTML = (firstTry >= 5)
      ? "🏆 <b>প্রথম চেষ্টাতেই ৫/৫!</b> দিন " + bnN(curDay + 1) + " শেষ — অসাধারণ!"
      : "🎉 <b>দিন " + bnN(curDay + 1) + " শেষ!</b> প্রথম চেষ্টায় " + bnN(firstTry) + "/৫ ঠিক হয়েছে। প্রতিদিন একটু একটু করলেই ইংরেজি সহজ হয়ে যাবে।";
    qbox.appendChild(fin);
    renderDots(); renderTabs(); renderReminder(); renderFinale();
    var nx = firstOpenDay(fiveState());
    if (nx >= 0 && nx !== curDay) {
      var nb = document.createElement("button");
      nb.type = "button"; nb.className = "pill green"; nb.textContent = "➡ দিন " + bnN(nx + 1) + "-এ যাও";
      nb.onclick = function () { curDay = nx; renderTabs(); renderDay(); document.getElementById("fiveDays").scrollIntoView({ behavior: "smooth" }); };
      qbox.appendChild(nb);
    }
  });
  if (curDay === 4) { renderTest(body); }
  renderFinale();
}
function renderTest(body) {
  var st = fiveState();
  var wrap = document.createElement("div"); wrap.className = "testbox";
  var h = document.createElement("h3"); h.textContent = "🏁 শেষ পরীক্ষা — ৪০টি শব্দ থেকে ১০টি প্রশ্ন"; wrap.appendChild(h);
  body.appendChild(wrap);
  if (st.test) {
    var dn = document.createElement("div"); dn.className = "tip";
    dn.innerHTML = "🏆 <b>তুমি শেষ পরীক্ষায় পাস করেছ!</b> প্রথম চেষ্টায় পেয়েছিলে " + bnN(st.testFirst || 0) + "/১০। আবার অনুশীলন করতে চাইলে নিচে আবার দিতে পারো।";
    wrap.appendChild(dn);
  } else if (!st.d5) {
    var hint = document.createElement("p"); hint.className = "sub";
    hint.textContent = "আগে দিন ৫-এর যাচাইটা শেষ করো — তারপর এই পরীক্ষাটা খুলবে। প্রায় এসে গেছ! 💪";
    wrap.appendChild(hint);
    return;
  }
  var tbox = document.createElement("div"); wrap.appendChild(tbox);
  var questions = TEST_PICK.map(function (pr, k) {
    var dw = DAYS[pr[0]].words;
    var o = buildOpts(dw, pr[1], k * 3 + 2);
    return { w: dw[pr[1]][0], opts: o.opts, ans: o.ans };
  });
  renderQuiz(tbox, questions, function (firstTry) {
    var s2 = fiveState();
    var passed = firstTry >= 5;
    var fin = document.createElement("div"); fin.className = "tip";
    if (passed && !s2.test) {
      s2.test = true; s2.testFirst = firstTry; saveFive(s2);
      fin.innerHTML = "🏆🎉 <b>অভিনন্দন!</b> প্রথম চেষ্টায় " + bnN(firstTry) + "/১০ — তুমি প্রথম ৫ দিনের পথ শেষ করলে! এবার অধ্যায় ১ থেকে আসল কোর্সটা শুরু করো।";
    } else if (passed) {
      fin.innerHTML = "🏆 প্রথম চেষ্টায় " + bnN(firstTry) + "/১০ — চমৎকার! তুমি আগেই এই পরীক্ষায় পাস করেছ।";
    } else {
      fin.innerHTML = "🌱 প্রথম চেষ্টায় " + bnN(firstTry) + "/১০ হয়েছে। কোনো ব্যাপার না — শব্দগুলো আরেকবার দেখে আবার চেষ্টা করো, ঠিক পারবে!";
    }
    tbox.appendChild(fin);
    renderDots(); renderReminder(); renderFinale();
  });
}
function renderFinale() {
  var st = fiveState(), box = document.getElementById("dayFinale");
  if (!box) return;
  if (st.test) {
    box.classList.remove("hidden");
    box.innerHTML = "🏆 <b>তুমি প্রথম ৫ দিন শেষ করেছ!</b> ৪০টি কাজের শব্দ এখন তোমার হাতে। এবার অধ্যায় ১ থেকে পুরো কোর্সটা ধাপে ধাপে শেষ করো। <button type='button' class='pill' onclick=\"document.getElementById('ch1').scrollIntoView({behavior:'smooth'})\">অধ্যায় ১ শুরু করো ➡</button>";
  } else {
    box.classList.add("hidden"); box.innerHTML = "";
  }
}
function renderReminder() {
  var st = fiveState(), b = document.getElementById("dayReminder");
  if (!b) return;
  var doneCount = 0;
  for (var i = 0; i < 5; i++) { if (st["d" + (i + 1)]) doneCount++; }
  if (st.test || doneCount === 0) { b.classList.add("hidden"); b.innerHTML = ""; return; }
  var nx = firstOpenDay(st);
  b.classList.remove("hidden");
  if (nx >= 0) {
    b.innerHTML = "🌟 তুমি " + bnN(doneCount) + "টি দিন শেষ করেছ! <b>দিন " + bnN(nx + 1) + " বাকি আছে — মাত্র ৫ মিনিট!</b> <button type='button' class='pill green' id='remGo'>চলো শেষ করি ➡</button>";
    document.getElementById("remGo").onclick = function () {
      curDay = nx; renderTabs(); renderDay();
      document.getElementById("fiveDays").scrollIntoView({ behavior: "smooth" });
    };
  } else {
    b.innerHTML = "🌟 ৫ দিনের শব্দ শেখা শেষ! এখন <b>শেষ পরীক্ষাটা</b> বাকি — দিন ৫-এ গেলেই পাবে। <button type='button' class='pill green' id='remGo'>পরীক্ষায় যাও ➡</button>";
    document.getElementById("remGo").onclick = function () {
      curDay = 4; renderTabs(); renderDay();
      document.getElementById("fiveDays").scrollIntoView({ behavior: "smooth" });
    };
  }
}
/* Init onboarding */
(function initFive() {
  var st = fiveState();
  var nx = firstOpenDay(st);
  curDay = (nx >= 0) ? nx : 0;
  renderDots(); renderTabs(); renderDay(); renderReminder(); renderFinale();
})();
