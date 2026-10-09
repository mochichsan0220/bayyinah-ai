const messagesEl = document.getElementById('messages');
const inputEl = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

function addMessage(content, type) {
  const msgDiv = document.createElement('div');
  msgDiv.className = `msg ${type}`;
  const bubble = document.createElement('div');
  bubble.className = `bubble ${type}`;
  bubble.innerHTML = content.replace(/\n/g, '<br/>');
  msgDiv.appendChild(bubble);
  messagesEl.appendChild(msgDiv);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

async function sendQuery(query) {
  addMessage(query, 'user');
  inputEl.value = '';
  sendBtn.disabled = true;
  try {
    const res = await fetch('/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const data = await res.json();
    if (data.error) {
      addMessage('⚠️ ' + data.error, 'bot');
    } else {
      const answerHtml = data.answer.replace(/\[(QS|HR)\.?.*?\]/g, match => `<span style="color: var(--accent);">${match}</span>`);
      addMessage(answerHtml, 'bot');
    }
  } catch (e) {
    addMessage('❌ Gagal terhubung ke server.', 'bot');
  }
  sendBtn.disabled = false;
  inputEl.focus();
}

sendBtn.addEventListener('click', () => {
  const q = inputEl.value.trim();
  if (q) sendQuery(q);
});

inputEl.addEventListener('keypress', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const q = inputEl.value.trim();
    if (q) sendQuery(q);
  }
});
