"use strict";
/* ============================================================
   EnglishBari — Step 2 add-on (exam system + progress + certificate)
   - Chapter quizzes for chapters 1–7 (5 questions each, first-try
     score = the score; best kept in localStorage learn_chq_v1)
   - Chapter 8's existing quiz is the FINAL EXAM (learn_quiz_best, /15,
     pass = 60% = 9)
   - Progress view in #myProgress, certificate in #certArea
   All client-side. Loads after days.js; does not modify course core.
   ============================================================ */

function ebn(n) { return String(n).replace(/[0-9]/g, function (d) { return "০১২৩৪৫৬৭৮৯"[+d]; }); }

/* ---------- Quiz data: drawn from each chapter's own content ---------- */
/* [question, [options], correctIndex] */
var CH_QUIZZES = {
1: [
 ["ক্রেতা দাম কমাতে চাইলে কোন বাক্যটি বলবেন?", ["The price is fixed.", "Thank you for your order.", "Sorry, this is out of stock."], 0],
 ["“Check the product first, then pay.” — বাক্যটি কখন ব্যবহার হয়?", ["পণ্য পৌঁছানোর পরে", "ক্যাশ অন ডেলিভারিতে ক্রেতার বিশ্বাস তৈরি করতে", "দাম জানতে চাইলে"], 1],
 ["“What is your budget?” মানে কী?", ["দাম কত?", "কয়টি নিতে চান?", "আপনার বাজেট কত?"], 2],
 ["পণ্য স্টকে না থাকলে কোন বাক্যটি বলবেন?", ["I will confirm your order today.", "Sorry, this is out of stock.", "Home delivery available."], 1],
 ["ঢাকার ভেতরে ডেলিভারি চার্জ জানাতে সঠিক বাক্য কোনটি?", ["Delivery charge is 60 taka inside Dhaka.", "The product is 100% original.", "Please wait, I am checking."], 0]
],
2: [
 ["সঠিক বানান কোনটি?", ["avaible", "available", "availible"], 1],
 ["সঠিক বানান কোনটি?", ["intersted", "intrested", "interested"], 2],
 ["“guarantee” শব্দের অর্থ কী?", ["ছাড়", "ডেলিভারি", "গ্যারান্টি"], 2],
 ["সঠিক বানান কোনটি?", ["delivery", "delivary", "delevery"], 0],
 ["“fluent” মানে কী?", ["আগ্রহী", "সাবলীল / অনর্গল", "পাওয়া যায়"], 1]
],
3: [
 ["ক্রেতা প্রথম মেসেজ দিলে শুভেচ্ছায় কোন লাইনটি ব্যবহার হয়?", ["Hello! Thank you for your message.", "This is my last price, sir.", "You will get it in 2–3 days."], 0],
 ["দরদামের একদম শেষে কোন লাইনটি বলা হয়?", ["How can I help you?", "I can give you a small discount.", "This is my last price, sir."], 2],
 ["“You will get it in 2–3 days.” — এটি কোন তথ্যের উত্তর?", ["দাম", "ডেলিভারির সময়", "পণ্যের মান"], 1],
 ["অর্ডারের জন্য ক্রেতার তথ্য চাইতে সঠিক লাইন কোনটি?", ["Please check the product carefully.", "Please send your name, address and phone number.", "Thank you for buying from us."], 1],
 ["ক্রেতার কোনো সমস্যা হলে পরে জানাতে কোন লাইনটি বলা হয়?", ["The price is 28,500 taka.", "I understand your budget.", "If you have any problem, message me anytime."], 2]
],
4: [
 ["সঠিক বানান কোনটি?", ["tomorow", "tomorrow", "tommorow"], 1],
 ["সঠিক বানান কোনটি?", ["adress", "addres", "address"], 2],
 ["“because” শব্দের অর্থ কী?", ["কারণ", "কিন্তু", "তারপর"], 0],
 ["সঠিক বানান কোনটি?", ["mesage", "message", "messsage"], 1],
 ["“payment” মানে কী?", ["ঠিকানা", "নমুনা", "টাকা পরিশোধ"], 2]
],
5: [
 ["অর্ডার শুরু হলে ক্লায়েন্টকে কোন মেসেজটি পাঠানো হয়?", ["Thank you for your order! I have received your file.", "Hello, I hope you are well. Last week I sent you a proposal…", "Please send your name and address."], 0],
 ["ক্লায়েন্ট সংশোধন (revision) চাইলে সঠিক জবাব কোনটি?", ["This is my last price, sir.", "No problem! I will fix it and send the updated file within a few hours.", "I will confirm your order today."], 1],
 ["কাজ জমা (delivery) দেওয়ার সময় টেমপ্লেটে কোন লাইনটি থাকে?", ["Please check them. If you need any change, please tell me — revision is free.", "I will reply with the price and delivery time.", "If you still need help, I am ready to start with a small test order."], 0],
 ["পুরনো লিডকে follow-up মেসেজ কখন পাঠাতে হয়?", ["প্রতিদিন একবার করে", "প্রস্তাব পাঠানোর ৫–৭ দিন পর, একবার মাত্র", "অর্ডার পাওয়ার সঙ্গে সঙ্গে"], 1],
 ["Gig inquiry এলে প্রথমে ক্লায়েন্টের কাছে কী জানতে চাওয়া হয়?", ["তাঁর বাড়ির ঠিকানা", "পুরো পেমেন্ট অগ্রিম", "তাঁর ফাইল আর প্রয়োজনীয় size"], 2]
],
6: [
 ["শুদ্ধ বানান কোনটি?", ["হয় নি", "হয়নি", "হয়নী"], 1],
 ["শুদ্ধ বানান কোনটি?", ["ব্যবহার", "ব্যাবহার", "বেভহার"], 0],
 ["“কোন জিনিস জানতে চাইলে” — প্রশ্নে কোনটি লিখতে হয়?", ["কি", "কী", "কিই"], 1],
 ["অনির্দিষ্ট কিছু বোঝালে (“যেকোনো একটা”) শুদ্ধ রূপ কোনটি?", ["কোন", "কুনো", "কোনো"], 2],
 ["শুদ্ধ বানান কোনটি?", ["দুর", "দূর", "দূর্‌"], 1]
],
7: [
 ["“I have …” প্যাটার্নে সঠিক বাক্য কোনটি?", ["I have two designs.", "I have is stock.", "I have deliver tomorrow."], 0],
 ["ভদ্রভাবে ঠিকানা চাইতে কোন প্যাটার্নটি ব্যবহার হয়? (যেমন: Can you send your address?)", ["How much …?", "Can you …?", "I will …"], 1],
 ["দাম জানতে কোন প্যাটার্ন ব্যবহার হয়?", ["Please …", "I am …", "How much …?"], 2],
 ["“I will …” দিয়ে সঠিক বাক্য কোনটি?", ["I will deliver tomorrow.", "I will delivered tomorrow.", "I will tomorrow deliver is."], 0],
 ["অনুরোধের বাক্য কোনটি?", ["You confirm the order.", "Please confirm the order.", "Confirm the order now."], 1]
]
};
var CH_SHORT = {
 1: "অধ্যায় ১ — প্রতিদিনের দরকারি বাক্য",
 2: "অধ্যায় ২ — বানান মাস্টারি ১",
 3: "অধ্যায় ৩ — ক্রেতার সঙ্গে কথা",
 4: "অধ্যায় ৪ — বানান মাস্টারি ২",
 5: "অধ্যায় ৫ — Fiverr/Upwork English",
 6: "অধ্যায় ৬ — শুদ্ধ বাংলা বানান",
 7: "অধ্যায় ৭ — বাক্য গঠন"
};
var PASS_CH = 3;   /* 3/5 = 60% */
var PASS_FINAL = 9; /* 9/15 = 60% */

/* ---------- State helpers ---------- */
function chqState() { try { return JSON.parse(localStorage.getItem("learn_chq_v1") || "{}"); } catch (e) { return {}; } }
function saveChq(st) { try { localStorage.setItem("learn_chq_v1", JSON.stringify(st)); } catch (e) {} }
function fiveStateX() { try { return JSON.parse(localStorage.getItem("learn_five_v1") || "{}"); } catch (e) { return {}; } }
function finalBest() { var v = null; try { v = localStorage.getItem("learn_quiz_best"); } catch (e) {} return (v === null || v === "") ? null : parseInt(v, 10); }
function enrolledX() { try { return localStorage.getItem("learn_enrolled") === "1"; } catch (e) { return false; } }

var QPRAISE = ["✅ ঠিক হয়েছে!", "✅ দারুণ! একদম ঠিক।", "✅ বাহ! ঠিক উত্তর।", "✅ ঠিক! এভাবেই এগিয়ে যাও।"];
var QRETRY = ["আরেকবার ভাবো তো — তুমি ঠিক পারবে! 💪", "প্রায় হয়ে গেছে — আরেকবার চেষ্টা করো। 🙂"];

/* ---------- Chapter quiz rendering ---------- */
function renderChapterQuiz(n) {
  var host = document.getElementById("qz" + n);
  if (!host) return;
  var qs = CH_QUIZZES[n];
  host.innerHTML = "";
  var st = chqState();
  var best = (st[n] === undefined) ? null : st[n];

  var head = document.createElement("div");
  head.innerHTML = "<h3>📝 অধ্যায়ের কুইজ — ৫টি প্রশ্ন</h3>" +
    (best !== null
      ? '<p class="progress">তোমার সেরা স্কোর: <b>' + ebn(best) + " / ৫</b>" + (best >= PASS_CH ? ' · <span class="ok">✔ পাস</span>' : ' · পাস করতে লাগবে কমপক্ষে ৩/৫ — আবার চেষ্টা করলেই হবে!') + "</p>"
      : '<p class="sub">প্রতিটি প্রশ্নে সঠিক উত্তরে ট্যাপ করো। ভুল হলে আবার চেষ্টার সুযোগ আছে — প্রথম চেষ্টায় ঠিক হলেই স্কোর পাবে। পাস: ৫-এ কমপক্ষে ৩।</p>');
  host.appendChild(head);

  var state = qs.map(function () { return { tries: 0, solved: false }; });
  var solved = 0, firstTry = 0;
  var prog = document.createElement("div"); prog.className = "progress";
  var msg = document.createElement("div"); msg.className = "feedback";
  var fin = document.createElement("div");
  function upd() { prog.textContent = "শেষ হয়েছে: " + ebn(solved) + " / ৫টি"; }
  qs.forEach(function (q, qi) {
    var d = document.createElement("div"); d.className = "word";
    var h = '<div class="w" style="font-size:16.5px">' + ebn(qi + 1) + ". " + q[0] + "</div>";
    q[1].forEach(function (o, oi) { h += '<button type="button" class="pill ghost qopt" data-o="' + oi + '">' + o + "</button>"; });
    d.innerHTML = h;
    host.appendChild(d);
    d.querySelectorAll(".qopt").forEach(function (btn) {
      btn.onclick = function () {
        if (state[qi].solved) return;
        var oi = parseInt(btn.getAttribute("data-o"), 10);
        if (oi === q[2]) {
          if (state[qi].tries === 0) firstTry++;
          state[qi].solved = true; solved++;
          btn.classList.add("right");
          d.querySelectorAll(".qopt").forEach(function (x) { x.disabled = true; });
          msg.textContent = QPRAISE[(qi + solved) % QPRAISE.length]; msg.className = "feedback ok"; msg.style.color = "";
          upd();
          if (solved === qs.length) finishQuiz(n, firstTry, fin);
        } else {
          state[qi].tries++;
          btn.classList.add("wrong"); btn.disabled = true;
          msg.textContent = QRETRY[qi % QRETRY.length]; msg.className = "feedback"; msg.style.color = "#b45309";
        }
      };
    });
  });
  host.appendChild(prog); host.appendChild(msg); host.appendChild(fin);
  upd();
}
function finishQuiz(n, score, fin) {
  var st = chqState();
  var prev = st[n];
  if (prev === undefined || score > prev) { st[n] = score; saveChq(st); }
  var passed = score >= PASS_CH;
  fin.innerHTML = "";
  var box = document.createElement("div"); box.className = "tip";
  box.innerHTML = passed
    ? "🎉 <b>কুইজ শেষ — তুমি পাস করেছ!</b> প্রথম চেষ্টায় পেয়েছ " + ebn(score) + "/৫। দারুণ — এভাবেই এগিয়ে যাও!"
    : "🌱 <b>কুইজ শেষ!</b> প্রথম চেষ্টায় পেয়েছ " + ebn(score) + "/৫। পাস করতে লাগবে ৩/৫ — অধ্যায়টা আরেকবার ঝালিয়ে আবার চেষ্টা করো, ঠিক পারবে!";
  fin.appendChild(box);
  var rb = document.createElement("button");
  rb.type = "button"; rb.className = "pill ghost"; rb.textContent = "🔁 আবার কুইজ দাও";
  rb.onclick = function () { renderChapterQuiz(n); };
  fin.appendChild(rb);
  renderProgress();
}

/* ---------- Progress computation ---------- */
function progressData() {
  var fs = fiveStateX();
  var daysDone = 0;
  for (var i = 1; i <= 5; i++) { if (fs["d" + i]) daysDone++; }
  var st = chqState();
  var ch = {}; /* n -> {attempted, best, passed, locked} */
  var passedCh = 0, attemptedCh = 0;
  for (var n = 1; n <= 7; n++) {
    var attempted = st[n] !== undefined;
    var passed = attempted && st[n] >= PASS_CH;
    ch[n] = { attempted: attempted, best: attempted ? st[n] : null, passed: passed, locked: (n >= 4 && !enrolledX()) };
    if (attempted) attemptedCh++;
    if (passed) passedCh++;
  }
  var fb = finalBest();
  var finalAtt = fb !== null;
  var finalPass = finalAtt && fb >= PASS_FINAL;
  if (finalAtt) attemptedCh++;
  var passedTotal = passedCh + (finalPass ? 1 : 0);
  var pct = Math.round(100 * (daysDone + passedTotal) / 13);
  var remaining = [];
  for (var m = 1; m <= 7; m++) {
    if (!ch[m].passed) remaining.push("অধ্যায় " + ebn(m) + "-এর কুইজ" + (ch[m].attempted ? " (পাস বাকি)" : ""));
  }
  if (!finalPass) remaining.push("চূড়ান্ত পরীক্ষা" + (finalAtt ? " (পাস বাকি)" : ""));
  return {
    daysDone: daysDone, fiveDone: !!fs.test,
    ch: ch, passedCh: passedCh, attemptedCh: attemptedCh,
    finalBest: fb, finalAtt: finalAtt, finalPass: finalPass,
    passedTotal: passedTotal, pct: pct,
    eligible: (passedCh === 7 && finalPass),
    remaining: remaining
  };
}

/* ---------- Progress view ---------- */
function renderProgress() {
  var body = document.getElementById("progBody");
  if (!body) return;
  var d = progressData();
  var h = "";
  h += '<div style="display:flex;align-items:center;gap:14px"><div class="bigpct">' + ebn(d.pct) + '%</div>' +
       '<div class="progress" style="margin:0">সার্টিফিকেটের পথে তোমার অগ্রগতি — মোট ১৩টি ধাপ<br>(প্রথম ৫ দিনের ৫টি + অধ্যায়ের কুইজে পাস ৮টি)</div></div>';
  h += '<div class="pbar"><div style="width:' + d.pct + '%"></div></div>';

  /* 5-day row */
  h += '<div class="prow"><div>🌅 <b>প্রথম ৫ দিন</b> — ৪০টি শব্দের পথ</div><div class="st">' +
    (d.fiveDone ? '<span class="ok">✔ শেষ (শেষ পরীক্ষায় পাস)</span>'
      : (d.daysDone > 0 ? ebn(d.daysDone) + " / ৫ দিন শেষ" : "বাকি")) + "</div></div>";

  /* chapter rows */
  for (var n = 1; n <= 7; n++) {
    var c = d.ch[n];
    var status;
    if (c.locked && !c.attempted) status = "🔒 Enroll করলে খুলবে";
    else if (c.passed) status = '<span class="ok">✔ পাস · ' + ebn(c.best) + "/৫</span>";
    else if (c.attempted) status = "সেরা " + ebn(c.best) + "/৫ · পাস বাকি";
    else status = "বাকি";
    h += '<div class="prow"><div>📝 <b>' + CH_SHORT[n] + '</b> — কুইজ</div><div class="st">' + status + "</div></div>";
  }

  /* final exam row */
  var fstatus;
  if (d.finalPass) fstatus = '<span class="ok">✔ পাস · ' + ebn(d.finalBest) + "/১৫</span>";
  else if (d.finalAtt) fstatus = "সেরা " + ebn(d.finalBest) + "/১৫ · পাস বাকি (লাগবে ৯)";
  else fstatus = enrolledX() ? "বাকি" : "🔒 Enroll করলে খুলবে";
  h += '<div class="prow"><div>🏆 <b>চূড়ান্ত পরীক্ষা</b> — অধ্যায় ৮ · ১৫টি প্রশ্ন</div><div class="st">' + fstatus + "</div></div>";

  h += '<p class="progress" style="margin-top:10px">অধ্যায় কুইজ দেওয়া হয়েছে: ' + ebn(d.attemptedCh) + " / ৮টি · পাস হয়েছে: " + ebn(d.passedTotal) + " / ৮টি</p>";
  body.innerHTML = h;
  renderCert(d);
}

/* ---------- Certificate ---------- */
var CERT_IMG = null; /* data URL of a generated certificate, kept in
   session memory so progress re-renders never wipe the student's cert */
function renderCert(d) {
  var box = document.getElementById("certArea");
  if (!box) return;
  var oldCv = document.getElementById("certCanvas");
  if (oldCv && !CERT_IMG) { try { CERT_IMG = oldCv.toDataURL("image/png"); } catch (e) {} }
  d = d || progressData();
  if (!d.eligible) {
    box.innerHTML = '<div class="certlock">🏆 <b>সার্টিফিকেট</b><br>' +
      "সব অধ্যায়ের কুইজ আর চূড়ান্ত পরীক্ষায় পাস করলেই তোমার নামে সুন্দর সার্টিফিকেট তৈরি হবে।<br>" +
      "<b>আর বাকি:</b> " + (d.remaining.length ? d.remaining.join(" · ") : "—") + "<br>" +
      '<span style="color:#166534">তুমি ঠিক পথেই আছো — একটু একটু করে এগিয়ে যাও! 💪</span></div>';
    return;
  }
  var savedName = "";
  try { savedName = localStorage.getItem("learn_cert_name") || ""; } catch (e) {}
  box.innerHTML = '<div class="certok">🎉 <b>অভিনন্দন! তুমি পুরো কোর্সটি সম্পূর্ণ করেছ!</b><br>' +
    "নিচে তোমার নাম লিখলেই তোমার সার্টিফিকেট তৈরি হয়ে যাবে — ছবি হিসেবে ডাউনলোড করে রাখতে পারবে।" +
    '<input type="text" id="certName" placeholder="তোমার পুরো নাম লেখো (ইংরেজি বা বাংলা)" autocomplete="name" value="">' +
    '<button type="button" class="pill green" id="certBtn">🎓 সার্টিফিকেট তৈরি করুন</button>' +
    '<div id="certOut"></div></div>';
  var inp = document.getElementById("certName");
  inp.value = savedName;
  inp.oninput = function () { try { localStorage.setItem("learn_cert_name", inp.value); } catch (e) {} };
  document.getElementById("certBtn").onclick = function () { makeCert(inp.value); };
  if (CERT_IMG) {
    var out0 = document.getElementById("certOut");
    var im = document.createElement("img");
    im.id = "certCanvas"; im.alt = "EnglishBari Certificate"; im.src = CERT_IMG;
    out0.appendChild(im);
    out0.appendChild(document.createElement("br"));
    var a0 = document.createElement("a");
    a0.className = "pill green"; a0.style.marginTop = "12px"; a0.style.display = "inline-block";
    a0.textContent = "⬇ সার্টিফিকেট ডাউনলোড করুন (ছবি)";
    a0.download = "EnglishBari-Certificate.png"; a0.href = CERT_IMG;
    out0.appendChild(a0);
  }
}

var MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
function fitFont(ctx, text, maxW, base, weight, family) {
  var s = base;
  while (s > 18) {
    ctx.font = weight + " " + s + "px " + family;
    if (ctx.measureText(text).width <= maxW) break;
    s -= 2;
  }
  return s;
}
function makeCert(rawName) {
  var name = (rawName || "").trim() || "Student";
  try { localStorage.setItem("learn_cert_name", name); } catch (e) {}
  var out = document.getElementById("certOut");
  var cv = document.createElement("canvas");
  cv.width = 1200; cv.height = 850;
  cv.id = "certCanvas";
  var ctx = cv.getContext("2d");
  if (!ctx) { out.innerHTML = '<p class="feedback bad">এই ব্রাউজারে সার্টিফিকেট তৈরি করা যাচ্ছে না — Chrome ব্যবহার করুন।</p>'; return; }
  /* background + borders */
  ctx.fillStyle = "#fffdf4"; ctx.fillRect(0, 0, 1200, 850);
  ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 10; ctx.strokeRect(26, 26, 1148, 798);
  ctx.strokeStyle = "#ffb020"; ctx.lineWidth = 3; ctx.strokeRect(48, 48, 1104, 754);
  ctx.textAlign = "center";
  /* header */
  ctx.fillStyle = "#2563eb"; ctx.font = "800 30px 'Noto Sans Bengali',sans-serif";
  ctx.fillText("ToolBari", 600, 118);
  ctx.fillStyle = "#17233b"; ctx.font = "700 54px Georgia,serif";
  ctx.fillText("Certificate of Completion", 600, 196);
  ctx.fillStyle = "#ffb020"; ctx.fillRect(450, 224, 300, 5);
  /* body */
  ctx.fillStyle = "#5b6b8c"; ctx.font = "28px Georgia,serif";
  ctx.fillText("This is to certify that", 600, 292);
  ctx.fillStyle = "#2563eb";
  fitFont(ctx, name, 980, 66, "800", "'Noto Sans Bengali','Hind Siliguri',sans-serif");
  ctx.fillText(name, 600, 388);
  ctx.fillStyle = "#17233b"; ctx.font = "30px Georgia,serif";
  ctx.fillText("has successfully completed the course", 600, 462);
  ctx.font = "800 40px 'Noto Sans Bengali','Hind Siliguri',sans-serif"; ctx.fillStyle = "#17233b";
  ctx.fillText("EnglishBari — Work English Foundation", 600, 528);
  ctx.font = "36px 'Noto Sans Bengali','Hind Siliguri',sans-serif"; ctx.fillStyle = "#166534";
  ctx.fillText("কোর্সটি সফলভাবে সম্পূর্ণ করেছেন", 600, 592);
  /* footer */
  var now = new Date();
  var dateStr = now.getDate() + " " + MONTHS[now.getMonth()] + " " + now.getFullYear();
  ctx.fillStyle = "#17233b"; ctx.font = "26px Georgia,serif"; ctx.textAlign = "left";
  ctx.fillText("Date: " + dateStr, 96, 742);
  ctx.textAlign = "right";
  ctx.fillText("EnglishBari · ToolBari", 1104, 742);
  ctx.textAlign = "center"; ctx.fillStyle = "#5b6b8c"; ctx.font = "22px Georgia,serif";
  ctx.fillText("Level 1 · Work English Foundation Course", 600, 788);
  /* show + download */
  out.innerHTML = "";
  out.appendChild(cv);
  var a = document.createElement("a");
  a.className = "pill green"; a.style.marginTop = "12px"; a.style.display = "inline-block";
  a.textContent = "⬇ সার্টিফিকেট ডাউনলোড করুন (ছবি)";
  a.download = "EnglishBari-Certificate.png";
  try { a.href = cv.toDataURL("image/png"); CERT_IMG = a.href; } catch (e) {}
  out.appendChild(document.createElement("br"));
  out.appendChild(a);
}

/* ---------- Init + live refresh ---------- */
(function initExam() {
  for (var n = 1; n <= 7; n++) {
    var host = null;
    if (n <= 3) {
      var sec = document.getElementById("ch" + n);
      if (sec) { host = document.createElement("div"); host.className = "quizbox"; host.id = "qz" + n; sec.appendChild(host); }
    } else {
      var bodyEl = document.querySelector("#ch" + n + " .chbody");
      if (bodyEl) { host = document.createElement("div"); host.className = "quizbox"; host.id = "qz" + n; bodyEl.appendChild(host); }
    }
    if (host) renderChapterQuiz(n);
  }
  renderProgress();
  /* Re-render progress when underlying state changes (5-day path,
     final exam grading, enrollment) without interrupting quizzes. */
  function stateSig() {
    try {
      return (localStorage.getItem("learn_five_v1") || "") + "|" +
             (localStorage.getItem("learn_chq_v1") || "") + "|" +
             (localStorage.getItem("learn_quiz_best") || "") + "|" +
             (localStorage.getItem("learn_enrolled") || "");
    } catch (e) { return null; }
  }
  var lastSig = stateSig();
  setInterval(function () {
    var sig = stateSig();
    if (sig === null) return;
    if (sig !== lastSig) {
      lastSig = sig;
      var cn = document.getElementById("certName");
      renderProgress();
      if (cn && cn.value) { var n2 = document.getElementById("certName"); if (n2) n2.value = cn.value; }
    }
  }, 1500);
})();
