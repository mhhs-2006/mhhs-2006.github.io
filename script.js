// =====================================================================
// 📋 질문 데이터 배열 — 여기만 수정하면 끝!
// =====================================================================
const questions = [
  {
    section: "common",
    sheetKey: "Q_구체적건의",
    title: "구체적으로 건의하고 싶은 내용을 자유롭게 적어주세요.",
    type: "textarea",
    placeholder: "예) 생활기록부 기재 가능 행사가 너무 적어요 / 학교 물품을 어떻게 사용하는지 모르겠어요 / 복사기가 있으면 좋겠어요",
  },
  // 💡 만약 아래와 같이 라디오나 체크박스를 추가하실 거라면 반드시 'options' 배열을 넣어주셔야 에러가 안 납니다!
  // {
  //   section: "common",
  //   sheetKey: "Q_만족도",
  //   title: "학교 생활에 만족하시나요?",
  //   type: "radio",
  //   options: [
  //     { value: "만족", emoji: "😊" },
  //     { value: "보통", emoji: "😐" },
  //     { value: "불만족", emoji: "😭" }
  //   ]
  // }
];

// =====================================================================
// ⚙️ 내부 처리용 — 배열 순서대로 id/number 자동 부여
// =====================================================================
questions.forEach((q, i) => {
  q._id     = `q${i + 1}`;   // "q1", "q2", "q3" …
  q._number = i + 1;          // 1, 2, 3 …
});

const commonQs  = questions.filter(q => q.section === "common");
const detailQs  = questions.filter(q => q.section === "detail");
const totalCount = commonQs.length + detailQs.length;


// =====================================================================
// 🖼️ 렌더링 (에러 수정 및 분기 처리 보완)
// =====================================================================
function renderQuestions() {
  const commonSection = document.getElementById('commonSection');
  const detailSection = document.getElementById('detailSection');
  
  if (commonSection) commonSection.innerHTML = '';
  if (detailSection) detailSection.innerHTML = '';

  questions.forEach(q => {
    // 💡 section 값에 따라 대상을 분기합니다. (HTML에 해당 id를 가진 요소가 있어야 합니다)
    const target = (q.section === 'detail') ? detailSection : commonSection;
    if (!target) return; // 해당 섹션 element가 대지에 없으면 스킵

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
      return; // forEach 콜백의 다음 아이템으로 넘어감
    }

    // ── 일반 라디오 / 체크박스 ──────────────────────────────────────
    const isCheckbox  = q.type === 'checkbox';
    const customClass = isCheckbox ? 'custom-check' : 'custom-radio';
    const hint        = isCheckbox ? '<div class="q-hint">🌿 복수 선택 가능</div>' : '';

    // 🔥 [안전장치] options가 없을 경우를 대비해 빈 배열([])로 대체하여 map 에러 방지
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
// ✅ 유효성 검사 & 제출
// =====================================================================
async function submitSurvey() {
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

  const data = { 제출시각: new Date().toLocaleString('ko-KR') };

  questions.forEach(q => {
    if (q.type === 'textarea') {
      data[q.sheetKey] = document.getElementById(`${q._id}_text`)?.value.trim() || '';
    } else if (q.type === 'checkbox') {
      data[q.sheetKey] = [...document.querySelectorAll(`input[name="${q._id}"]:checked`)]
        .map(el => {
          if (el.value === '기타') {
            const txt = document.getElementById(`${q._id}etc`)?.value.trim();
            return txt ? `기타(${txt})` : '기타';
          }
          return el.value;
        }).join(', ');
    } else {
      data[q.sheetKey] = document.querySelector(`input[name="${q._id}"]:checked`)?.value || '';
    }
  });

  console.log("📤 전송 데이터:", JSON.stringify(data, null, 2));

  const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbzgTQzdA3vc8hkr1UriGbUyaxK3Gpl6o4VYiRB_0zQiAHQfmpJWKsvdyMpnDY3qiGqu/exec";

  showDone();

  try {
    if (WEBHOOK_URL && !WEBHOOK_URL.startsWith("여기에")) {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        mode:   "no-cors",
        headers: { "Content-Type": "text/plain" },
        body:   JSON.stringify(data),
      });
    }
  } catch (err) {
    console.error("전송 오류:", err);
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
  if (doneTitle) doneTitle.textContent = '설문이 완료되었어요!';
  if (doneMsg) {
    doneMsg.innerHTML = '바쁜 시간 내어 참여해 주셔서<br>진심으로 감사드립니다! 🌿<br><br>여러분의 소중한 의견이<br>더 나은 학교를 만드는 밑거름이 될 거예요 ✨';
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