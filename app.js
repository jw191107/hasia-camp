'use strict';
const config = window.HASIA_CONFIG || {};
document.querySelectorAll('[data-config]').forEach(node => {
  const value = config[node.dataset.config];
  if (typeof value === 'string' && value.trim()) node.textContent = value.trim();
});
const contact = document.getElementById('contact');
const status = document.getElementById('contact-status');
let validContact = false;
try {
  const url = new URL((config.contactUrl || '').trim());
  validContact = ['https:', 'mailto:', 'tel:'].includes(url.protocol);
  if (validContact) contact.href = url.href;
} catch (_) { /* 미설정 시 안내문으로 이동 */ }
if (validContact) {
  status.textContent = config.contactNote?.trim() || '공식 문의 채널에서 참여 일정과 방문 방법을 확인해 주세요.';
} else {
  contact.addEventListener('click', event => {
    event.preventDefault();
    status.textContent = '아직 문의 채널이 연결되지 않았어요. 공식 문의 안내가 등록된 뒤 다시 확인해 주세요.';
    status.focus({preventScroll: true});
    status.scrollIntoView({block: 'center'});
  });
}

const kakaoId = (config.kakaoId || 'steve868').trim();
document.getElementById('kakao-id').textContent = kakaoId;
document.getElementById('copy-kakao').addEventListener('click', async () => {
  const message = document.getElementById('copy-status');
  try {
    await navigator.clipboard.writeText(kakaoId);
    message.textContent = '카카오톡 ID를 복사했어요. 카카오톡에서 ID로 검색해 주세요.';
  } catch (_) {
    message.textContent = '자동 복사가 지원되지 않아요. 카카오톡 ID ' + kakaoId + '를 길게 누르거나 선택해 복사해 주세요.';
  }
});

if (typeof config.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email)) {
 const email = document.getElementById('email-address');
 email.textContent = config.email;
 email.href = 'mailto:' + config.email;
}

// 외부 콘텐츠는 사용자가 선택하기 전에는 불러오지 않습니다.
function httpsUrl(value) { try { const u = new URL(value); return u.protocol === 'https:' ? u.href : ''; } catch (_) { return ''; } }
const channel = httpsUrl(config.youtubeChannel);
if (channel) document.querySelectorAll('[data-youtube]').forEach(a => a.href = channel);
if (/^[A-Za-z0-9_-]{11}$/.test(config.featuredVideoId || '')) {
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'button outline'; button.textContent = '대표 영상 여기서 재생';
  button.addEventListener('click', () => {
    const frame = document.createElement('iframe');
    frame.src = 'https://www.youtube-nocookie.com/embed/' + config.featuredVideoId;
    frame.title = '하시아 캠프 대표 영상'; frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    document.getElementById('featured-video').replaceChildren(frame);
  });
  document.getElementById('featured-video').append(button);
}
const externalForm = httpsUrl(config.interestFormUrl);
if (externalForm) { const a = document.getElementById('external-form'); a.href = externalForm; a.hidden = false; }
function makeNote() {
 const topic = document.getElementById('interest-type').value;
 const note = document.getElementById('interest-note').value.trim();
 return {topic, body: '[하시아 캠프 홈페이지]\n관심: ' + topic + '\n\n' + (note || '자세한 안내를 부탁드립니다.')};
}
document.getElementById('interest-form').addEventListener('submit', event => {
 event.preventDefault();
 const note = makeNote();
 const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email || '') ? config.email : 'jw191107@gmail.com';
 window.location.href = 'mailto:' + email + '?subject=' + encodeURIComponent('[하시아 캠프] ' + note.topic) + '&body=' + encodeURIComponent(note.body);
 document.getElementById('note-status').textContent = '이메일 작성 창을 요청했어요. 전송 버튼을 직접 눌러 주세요. 창이 열리지 않으면 메모를 복사해 카카오톡 ID ' + kakaoId + '로 보내 주세요. 아직 접수 완료 상태는 아니에요.';
});
document.getElementById('copy-note').addEventListener('click', async () => {
 const text = makeNote().body;
 const message = document.getElementById('note-status');
 try { await navigator.clipboard.writeText(text); message.textContent = '메모를 복사했어요. 카카오톡 ID ' + kakaoId + '를 검색해 붙여넣고 전송해 주세요.'; }
 catch (_) { message.textContent = '자동 복사가 지원되지 않아요. 작성한 메모를 직접 선택해 복사한 뒤 카카오톡 ID ' + kakaoId + '로 보내 주세요.'; }
});

// 후기: 서버 저장 없이 이메일로 전달. 공개 후기는 운영자가 확인 후 설정에 추가합니다.
const reviews = Array.isArray(config.reviews) ? config.reviews : [];
reviews.forEach(review => {
 if (!review || typeof review.text !== 'string' || !review.text.trim()) return;
 const article = document.createElement('article');
 const text = document.createElement('p'); text.textContent = review.text;
 const name = document.createElement('strong'); name.textContent = review.name || '익명 참여자';
 article.append(text, name); document.getElementById('published-reviews').append(article);
});
document.getElementById('reviews-empty').hidden = document.getElementById('published-reviews').children.length > 0;
document.getElementById('review-form').addEventListener('submit', event => {
 event.preventDefault();
 const text = document.getElementById('review-text').value.trim();
 if (!text) { document.getElementById('review-status').textContent = '후기를 입력해 주세요.'; return; }
 const name = document.getElementById('review-name').value.trim() || '익명';
 const consent = document.getElementById('review-consent').checked ? '후기와 별명 공개에 동의' : '비공개 · 담당자에게만 전달';
 const body = '별명: ' + name + '\n공개 여부: ' + consent + '\n\n' + text;
 const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email || '') ? config.email : 'jw191107@gmail.com';
 window.location.href = 'mailto:' + email + '?subject=' + encodeURIComponent('[하시아 캠프] 참여후기') + '&body=' + encodeURIComponent(body);
 document.getElementById('review-status').textContent = '이메일 앱에서 직접 전송해 주세요. 아직 접수되거나 홈페이지에 게시된 상태는 아니에요. 앱이 열리지 않으면 후기를 복사해 ' + email + '로 보내 주세요.';
});
