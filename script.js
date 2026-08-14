// =====================================================================
// 🔑 Firebase 설정 및 초기화
// =====================================================================
const firebaseConfig = {
  apiKey: "AIzaSyB8gbEN-nRQGNJPrnVOrqp-uXP5Bs3E0yE",
  authDomain: "data-base-mh2026.firebaseapp.com",
  projectId: "data-base-mh2026",
  storageBucket: "data-base-mh2026.firebasestorage.app",
  messagingSenderId: "897077284587",
  appId: "1:897077284587:web:b1712795e415cefa9738ae",
  measurementId: "G-R8342W7N9W"
};

// Firebase 초기화 (중복 방지 안전장치 추가)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore(); // Firestore DB 객체 불러오기

// =====================================================================
// 📋 질문 데이터 배열 — 필요 시 질문 내용만 추가/수정하시면 됩니다!
// =====================================================================
const questions = [
  {
    section: "common",
    title: "건의 유형을 선택해주세요!",
    type: "radio",
    options: [
      { value: "시설", emoji: "🏫" },
      { value: "급식", emoji: "🍱" },
      { value: "행사", emoji: "🎉" },
      { value: "학습환경", emoji: "📚" },
      { value: "학생복지", emoji: "🌿" },
      { value: "진로·진학", emoji: "🎓" },
      { value: "기타", emoji: "💬" }
    ]
  },
  {
    section: "common",
    title: "구체적으로 건의하고 싶은 내용을 자유롭게 적어주세요.",
    type: "textarea",
    placeholder: "예) 생활기록부 기재 가능 행사가 너무 적어요 / 학교 물품을 어떻게 사용하는지 모르겠어요 / 복사기가 있으면 좋겠어요",
  }
];

// =====================================================================
// ⚙️ 내부 처리용 — 배열 순서대로 id/number 자동 부여
// =====================================================================
questions.forEach((q, i) => {
  q._id     = `q${i + 1}`;   // "q1", "q2" ...
  q._number = i + 1;          // 1, 2 ...
});

const commonQs  = questions.filter(q => q.section === "common");
const detailQs  = questions.filter(q => q.section === "detail");
const totalCount = commonQs.length + detailQs.length;


// =====================================================================
// 🖼️ 렌더링
// =====================================================================
function renderQuestions() {
  const commonSection = document.getElementById('commonSection');
  const detailSection = document.getElementById('detailSection');
  
  if (commonSection) commonSection.innerHTML = '';
  if (detailSection) detailSection.innerHTML = '';

  questions.forEach(q => {
    const target = (q.section === 'detail') ? detailSection : commonSection;
    if (!target) return;

    // ── 주관식 (textarea) ──────────────────────────────────────────────
    if (q.type === 'textarea') {
      const placeholder = q.placeholder || '여기에 입력해 주세요';
      target.innerHTML += `
        <div class="card" id="${q._id}">
          <div class="q-title"><span class="q-number">${q._number}</span>${q.title}</div>
          <textarea id="${q._id}_text" name="${q._id}" placeholder="${placeholder}"
            style="width:100%;margin-top:4px;padding:14px 16px;border-radius:12px;
                   border:1.5px solid #E3E8ED;font-family:inherit;
                   font-size:14px;color:#20262E;resize:vertical;min-height:100px;
                   background:#FAFBFC;outline:none;transition:border 0.2s;"
            oninput="updateProgress()"
            onfocus="this.style.borderColor='#2E5FA8'"
            onblur="this.style.borderColor='#E3E8ED'"></textarea>
        </div>`;
      return;
    }

    // ── 일반 라디오 / 체크박스 ──────────────────────────────────────
    const isCheckbox  = q.type === 'checkbox';
    const customClass = isCheckbox ? 'custom-check' : 'custom-radio';
    const hint        = isCheckbox ? '<div class="q-hint">🌿 복수 선택 가능</div>' : '';

    const optionsList = q.options || [];
    const optionsHTML = optionsList.map(opt => `
      <label class="option-label">
        <input type="${q.type}" name="${q._id}" value="${opt.value}">
        <span class="${customClass}"></span> ${opt.emoji || ''} ${opt.value}
      </label>`).join('');

    const etcHTML = q.hasEtc ? `
      <label class="option-label">
        <input type="${q.type}" name="${q._id}" value="기타"
               onchange="toggleEtc('${q._id}etc', this)">
        <span class="${customClass}"></span> 🔮 기타
        <input type="text" id="${q._id}etc" placeholder="직접 입력" disabled
          style="margin-left:8px;padding:4px 10px;border-radius:8px;
                 border:1.5px solid #E3E8ED;font-size:13px;display:none;">
      </label>` : '';

    target.innerHTML += `
      <div class="card" id="${q._id}">
        <div class="q-title"><span class="q-number">${q._number}</span>${q.title}</div>
        ${hint}
        <div class="options">${optionsHTML}${etcHTML}</div>
      </div>`;
  });

  bindEvents();
}


// =====================================================================
// 📊 진행바
// =====================================================================
function updateProgress() {
  let answered = 0;

  questions.forEach(q => {
    if (q.type === 'textarea') {
      const el = document.getElementById(`${q._id}_text`);
      if (el && el.value.trim().length > 0) answered++;
    } else if (q.type === 'checkbox') {
      if (document.querySelectorAll(`input[name="${q._id}"]:checked`).length > 0) answered++;
    } else {
      if (document.querySelector(`input[name="${q._id}"]:checked`)) answered++;
    }
  });

  const displayTotal = totalCount;
  const pct = totalCount > 0 ? Math.round((answered / totalCount) * 100) : 0;
  
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  
  if (progressBar) progressBar.style.width = pct + '%';
  if (progressText) progressText.textContent = `${answered} / ${displayTotal} 완료`;
}

function bindEvents() {
  document.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(el => {
    el.removeEventListener('change', updateProgress);
    el.addEventListener('change', updateProgress);
  });
}


// =====================================================================
// ✅ 유효성 검사 & Firebase 저장
// =====================================================================
async function submitSurvey() {
  // 1. 유효성 검사
  for (const q of questions) {
    if (q.required === false) continue;

    if (q.type === 'textarea') {
      const el = document.getElementById(`${q._id}_text`);
      if (!el || el.value.trim().length === 0) {
        alert(`🌿 Q${q._number}: "${q.title.slice(0, 15)}…" 내용을 입력해 주세요!`);
        return;
      }
      continue;
    }
    const checked = document.querySelectorAll(`input[name="${q._id}"]:checked`).length;
    if (checked === 0) {
      alert(`🌿 Q${q._number}: "${q.title.slice(0, 15)}…" 항목을 선택해 주세요!`);
      return;
    }
  }

  // 2. 답변 데이터 직접 읽기 (q1: 건의유형, q2: 구체적건의)
  const categoryVal = document.querySelector('input[name="q1"]:checked')?.value || "기타";
  const contentVal = document.getElementById('q2_text')?.value.trim() || "";

  // 3. Firestore 저장용 깔끔한 데이터 객체 (rawAnswers 제거 완료)
  const payload = {
    category: categoryVal,                                         // 건의 유형
    content: contentVal,                                           // 구체적 건의 내용
    status: "확인 안함",                                            // 기본 상태
    adminComment: "",                                              // 관리자 답변용 빈 칸
    createdAt: firebase.firestore.FieldValue.serverTimestamp()     // 서버 제출 시간
  };

  console.log("📤 Firebase로 전송할 데이터:", payload);

  // 4. Firestore DB에 저장하기
  try {
    await db.collection("suggestions").add(payload);
    console.log("✅ 성공적으로 DB에 저장되었습니다!");
    showDone(); // 완료 화면 표시
  } catch (err) {
    console.error("❌ Firebase 저장 오류:", err);
    alert("제출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요!");
  }
}


// =====================================================================
// 🎉 완료 화면
// =====================================================================
function showDone() {
  const progressSection = document.getElementById('progressSection');
  const surveyForm = document.getElementById('surveyForm');
  const done = document.getElementById('doneScreen');

  if (progressSection) progressSection.style.display = 'none';
  if (surveyForm) surveyForm.style.display = 'none';
  if (done) done.style.display = 'block';

  const doneEmoji = document.getElementById('doneEmoji');
  const doneTitle = document.getElementById('doneTitle');
  const doneMsg = document.getElementById('doneMsg');

  if (doneEmoji) doneEmoji.textContent = '🎉';
  if (doneTitle) doneTitle.textContent = '설문이 제출되었습니다!';
  if (doneMsg) {
    doneMsg.innerHTML = '바쁜 시간 내어 참여해 주셔서<br>진심으로 감사드립니다! 🌿<br><br>여러분의 소중한 의견을 바탕으로<br>더 나은 학교를 만들겠습니다! ✨';
  }

  launchConfetti();
}

function launchConfetti() {
  const wrap = document.getElementById('confettiWrap');
  if (!wrap) return;
  
  const colors = ['#7DB83C','#2E5FA8','#C0303B','#EEF6E2','#E8EFF9','#fff'];
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.cssText = `
      left: ${Math.random() * 100}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      width: ${6 + Math.random() * 8}px;
      height: ${6 + Math.random() * 8}px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      animation-duration: ${2 + Math.random() * 2}s;
      animation-delay: ${Math.random()}s;
    `;
    wrap.appendChild(piece);
  }
  setTimeout(() => (wrap.innerHTML = ''), 4000);
}

function toggleEtc(id, el) {
  const textInput = document.getElementById(id);
  if (!textInput) return;
  
  if (el.checked) {
    textInput.style.display = 'inline';
    textInput.disabled = false;
    textInput.focus();
  } else {
    textInput.style.display = 'none';
    textInput.disabled = true;
    textInput.value = '';
  }
}


// =====================================================================
// 🚀 초기 실행
// =====================================================================
renderQuestions();
const submitWrap = document.getElementById('submitWrap');
if (submitWrap) submitWrap.style.display = 'flex';