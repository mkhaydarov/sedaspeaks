// ==========================
// Утилиты
// ==========================
function escapeHtml(text){
  const map = {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'};
  return text.replace(/[&<>"']/g,m=>map[m]);
}

// ==========================
// Данные и состояние
// ==========================
const lessonsData = [
  {id:'l1', title:'Урок 1 — Приветствия', desc:'Фразы для приветствия и знакомства', content:`<p><strong>Hi</strong> — Привет<br><strong>Hello</strong> — Здравствуйте<br><strong>How are you?</strong> — Как дела?</p>`, textToSpeak:'Hello! Hi! How are you?'},
  {id:'l2', title:'Урок 2 — Семья', desc:'Слова про членов семьи', content:`<ul><li>mother — мама</li><li>father — папа</li><li>sister — сестра</li></ul>`, textToSpeak:'mother, father, sister'},
  {id:'l3', title:'Урок 3 — Цвета', desc:'Основные цвета', content:`<ul><li>red — красный</li><li>blue — синий</li><li>green — зелёный</li></ul>`, textToSpeak:'red, blue, green'}
];

const vocabInitial = [
  {en:'hello',ru:'привет',favorite:false},{en:'thank you',ru:'спасибо',favorite:false},{en:'please',ru:'пожалуйста',favorite:false},
  {en:'yes',ru:'да',favorite:false},{en:'no',ru:'нет',favorite:false},{en:'good',ru:'хорошо',favorite:false},{en:'bad',ru:'плохо',favorite:false},
  {en:'cat',ru:'кот',favorite:false},{en:'dog',ru:'собака',favorite:false},{en:'mother',ru:'мама',favorite:false},{en:'father',ru:'папа',favorite:false},
  {en:'sister',ru:'сестра',favorite:false},{en:'brother',ru:'брат',favorite:false},{en:'red',ru:'красный',favorite:false},{en:'blue',ru:'синий',favorite:false},
  {en:'green',ru:'зелёный',favorite:false},{en:'yellow',ru:'жёлтый',favorite:false},{en:'black',ru:'чёрный',favorite:false},{en:'white',ru:'белый',favorite:false},{en:'house',ru:'дом',favorite:false}
];

const miniQuizData=[
  {q:'Как сказать "привет" по-английски?',opts:['bye','hello','thanks'],a:1},
  {q:'Перевод: "спасибо"',opts:['please','thank you','sorry'],a:1}
];

const state={lessons:lessonsData,vocab:[],completedLessons:new Set(),profile:{name:'Seda',goal:''},lang:'ru',dark:false};

// ==========================
// Селекторы
// ==========================
const views=document.querySelectorAll('.view');
const navBtns=document.querySelectorAll('.nav-btn');
const containerLessons=document.getElementById('lessons-list');
const lessonDetail=document.getElementById('lesson-detail');
const lessonTitle=document.getElementById('lesson-title');
const lessonDesc=document.getElementById('lesson-desc');
const lessonContent=document.getElementById('lesson-content');
const playLessonBtn=document.getElementById('play-lesson');
const markDoneBtn=document.getElementById('mark-done');
const backToLessons=document.getElementById('back-to-lessons');
const progressBar=document.getElementById('progress-bar');

const vocabList=document.getElementById('vocab-list');
const vocabSearch=document.getElementById('vocab-search');
const addWordBtn=document.getElementById('add-word');
const addWordBox=document.getElementById('add-word-box');
const newWordEn=document.getElementById('new-word-en');
const newWordRu=document.getElementById('new-word-ru');
const saveWordBtn=document.getElementById('save-word');
const cancelWordBtn=document.getElementById('cancel-word');

const profileName=document.getElementById('profile-name');
const profileGoal=document.getElementById('profile-goal');
const saveProfile=document.getElementById('save-profile');
const clearDataBtn=document.getElementById('clear-data');

const practicePlay=document.getElementById('practice-play');
const practiceStartRec=document.getElementById('practice-start-rec');
const recResult=document.getElementById('rec-result');
const startMiniQuiz=document.getElementById('start-mini-quiz');
const miniQuizBox=document.getElementById('mini-quiz-box');
const miniQuizArea=document.getElementById('mini-quiz-area');
const submitMiniQuiz=document.getElementById('submit-mini-quiz');
const closeMiniQuiz=document.getElementById('close-mini-quiz');
const themeToggle=document.getElementById('theme-toggle');
const langToggle=document.getElementById('lang-toggle');

// ==========================
// Load / Save
// ==========================
function loadFromStorage(){
  const raw=localStorage.getItem('efh_state');
  if(raw){
    const parsed=JSON.parse(raw);
    state.vocab=parsed.vocab||vocabInitial.slice();
    state.completedLessons=new Set(parsed.completed||[]);
    state.profile=parsed.profile||state.profile;
    state.lang=parsed.lang||'ru';
    state.dark=parsed.dark||false;
  } else state.vocab=vocabInitial.slice();
  document.body.classList.toggle('dark',state.dark);
  langToggle.textContent=state.lang==='ru'?'EN':'RU';
}
function saveToStorage(){
  const payload={vocab:state.vocab,completed:Array.from(state.completedLessons),profile:state.profile,lang:state.lang,dark:state.dark};
  localStorage.setItem('efh_state',JSON.stringify(payload));
  renderProgress();
}

loadFromStorage();

// ==========================
// Navigation
// ==========================
function showView(name){views.forEach(v=>v.classList.toggle('active',v.id===`view-${name}`));}
navBtns.forEach(btn=>btn.addEventListener('click',()=>showView(btn.dataset.view)));
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));

// ==========================
// Lessons
// ==========================
function renderLessons(){
  containerLessons.innerHTML='';
  state.lessons.forEach(lesson=>{
    const el=document.createElement('div');
    el.className='card lesson-card';
    el.innerHTML=`<h3 class="title">${lesson.title}</h3><p class="muted small">${lesson.desc}</p>
    <div style="margin-top:10px;display:flex;gap:8px">
      <button class="outline btn-open" data-id="${lesson.id}">Открыть</button>
      <button class="primary btn-play" data-id="${lesson.id}">🔊</button>
      <button class="outline btn-mark" data-id="${lesson.id}">${state.completedLessons.has(lesson.id)?'✔ Пройден':'Отметить'}</button>
    </div>`;
    containerLessons.appendChild(el);
  });

  containerLessons.querySelectorAll('.btn-open').forEach(b=>b.addEventListener('click',()=>openLesson(b.dataset.id)));
  containerLessons.querySelectorAll('.btn-play').forEach(b=>b.addEventListener('click',()=>{const l=state.lessons.find(x=>x.id===b.dataset.id); speakText(l.textToSpeak);}));
  containerLessons.querySelectorAll('.btn-mark').forEach(b=>b.addEventListener('click',()=>{state.completedLessons.add(b.dataset.id);saveToStorage();renderLessons();}));
}

function openLesson(id){
  const lesson=state.lessons.find(l=>l.id===id);
  if(!lesson) return;
  lessonTitle.textContent=lesson.title;
  lessonDesc.textContent=lesson.desc;
  lessonContent.innerHTML=lesson.content;
  lessonDetail.classList.remove('hidden');
  playLessonBtn.onclick=()=>speakText(lesson.textToSpeak);
  markDoneBtn.onclick=()=>{
    state.completedLessons.add(lesson.id);saveToStorage();renderLessons();renderProgress();alert('Урок отмечен как пройденный ✅');
  };
}
backToLessons.addEventListener('click',()=>lessonDetail.classList.add('hidden'));
function renderProgress(){const total=state.lessons.length;const done=state.completedLessons.size;const pct=Math.round((done/total)*100);progressBar.style.width=pct+'%';progressBar.textContent=pct+'%';progressBar.setAttribute('aria-valuenow',pct);}
renderLessons();renderProgress();

// ==========================
// TTS
// ==========================
function speakText(text){if(!window.speechSynthesis){alert('TTS не поддерживается');return;}const utter=new SpeechSynthesisUtterance(text);utter.lang='en-US';utter.rate=0.95;window.speechSynthesis.cancel();window.speechSynthesis.speak(utter);}
function speakWord(word){speakText(word);}

// ==========================
// Vocabulary
// ==========================
function renderVocab(filter=''){
  vocabList.innerHTML='';
  const items=state.vocab.filter(v=>v.en.toLowerCase().includes(filter.toLowerCase())||v.ru.toLowerCase().includes(filter.toLowerCase()));
  items.forEach((v,idx)=>{
    const li=document.createElement('li');
    li.innerHTML=`<div><strong>${escapeHtml(v.en)}</strong> — <span class="muted small">${escapeHtml(v.ru)}</span></div>
    <div style="display:flex;gap:8px;align-items:center">
      <button class="outline btn-play-word" data-index="${idx}">🔊</button>
      <button class="outline btn-fav" data-index="${idx}">${v.favorite?'★':'☆'}</button>
      <button class="outline btn-del" data-index="${idx}">🗑</button>
    </div>`;
    vocabList.appendChild(li);
  });
  vocabList.querySelectorAll('.btn-play-word').forEach(b=>b.addEventListener('click',()=>speakWord(state.vocab[b.dataset.index].en)));
  vocabList.querySelectorAll('.btn-fav').forEach(b=>b.addEventListener('click',()=>{state.vocab[b.dataset.index].favorite=!state.vocab[b.dataset.index].favorite;saveToStorage();renderVocab(vocabSearch.value);}));
  vocabList.querySelectorAll('.btn-del').forEach(b=>b.addEventListener('click',()=>{if(confirm('Удалить слово?')){state.vocab.splice(b.dataset.index,1);saveToStorage();renderVocab(vocabSearch.value);}}));
}
vocabSearch.addEventListener('input',()=>renderVocab(vocabSearch.value));
addWordBtn.addEventListener('click',()=>addWordBox.classList.remove('hidden'));
cancelWordBtn.addEventListener('click',()=>addWordBox.classList.add('hidden'));
saveWordBtn.addEventListener('click',()=>{
  const en=newWordEn.value.trim(); const ru=newWordRu.value.trim();
  if(!en||!ru){alert('Заполните оба поля');return;}
  state.vocab.push({en,ru,favorite:false});newWordEn.value='';newWordRu.value='';addWordBox.classList.add('hidden');saveToStorage();renderVocab(vocabSearch.value);
});
renderVocab();

// ==========================
// Profile
// ==========================
profileName.value=state.profile.name;
profileGoal.value=state.profile.goal;
saveProfile.addEventListener('click',()=>{
  state.profile.name=profileName.value||'Seda';
  state.profile.goal=profileGoal.value;
  saveToStorage();
  alert('Сохранено ✅');
});
clearDataBtn.addEventListener('click',()=>{
  if(confirm('Сбросить прогресс?')){state.completedLessons.clear();state.vocab=vocabInitial.slice();saveToStorage();renderVocab();renderLessons();renderProgress();}
});

// ==========================
// Mini-quiz
// ==========================
startMiniQuiz.addEventListener('click',()=>{
  miniQuizArea.innerHTML='';
  miniQuizBox.classList.remove('hidden');
  miniQuizData.forEach((q,i)=>{
    const div=document.createElement('div');
    div.innerHTML=`<p>${i+1}. ${q.q}</p>${q.opts.map((o,idx)=>`<label><input type="radio" name="q${i}" value="${idx}"> ${o}</label>`).join('<br>')}`;
    miniQuizArea.appendChild(div);
  });
});
submitMiniQuiz.addEventListener('click',()=>{
  let score=0;
  miniQuizData.forEach((q,i)=>{const sel=document.querySelector(`input[name="q${i}"]:checked`);if(sel&&parseInt(sel.value)===q.a) score++;});
  alert(`Вы набрали ${score} из ${miniQuizData.length}`);
  miniQuizBox.classList.add('hidden');
});
closeMiniQuiz.addEventListener('click',()=>miniQuizBox.classList.add('hidden'));

// ==========================
// Theme toggle
// ==========================
themeToggle.addEventListener('click',()=>{
  state.dark=!state.dark;document.body.classList.toggle('dark',state.dark);saveToStorage();
});

// ==========================
// Language toggle (interface only)
// ==========================
const langMap={
  en:{'Главная':'Home','Уроки':'Lessons','Словарь':'Vocabulary','Практика':'Practice','Профиль':'Profile','Тема':'Theme','Отметить':'Mark as done','Пройден':'Completed','Начать урок':'Start Lesson','Открыть словарь':'Open Vocabulary','Добро пожаловать, Seda!':'Welcome, Seda!','Этот сайт создан специально для тебя: короткие уроки, удобный словарь и задания для тренировки английского.':'This site is made just for you: short lessons, convenient vocabulary, and exercises to practice English.'},
  ru:{}
};
langToggle.addEventListener('click',()=>{
  state.lang=state.lang==='ru'?'en':'ru';
  langToggle.textContent=state.lang==='ru'?'EN':'RU';
  translateInterface();
  saveToStorage();
});
function translateInterface(){
  if(state.lang==='en'){
    document.querySelectorAll('[data-view]').forEach(b=>{
      if(langMap.en[b.textContent]) b.textContent=langMap.en[b.textContent];
    });
    document.querySelector('#home-title').textContent=langMap.en['Добро пожаловать, Seda!'];
    document.querySelector('#view-home p').textContent=langMap.en['Этот сайт создан специально для тебя: короткие уроки, удобный словарь и задания для тренировки английского.'];
  } else {
    document.querySelectorAll('[data-view]').forEach(b=>{
      const map={home:'Главная',lessons:'Уроки',vocab:'Словарь',practice:'Практика',profile:'Профиль'};
      b.textContent=map[b.dataset.view]||b.textContent;
    });
    document.querySelector('#home-title').textContent='Добро пожаловать, Seda!';
    document.querySelector('#view-home p').textContent='Этот сайт создан специально для тебя: короткие уроки, удобный словарь и задания для тренировки английского.';
  }
}
translateInterface();