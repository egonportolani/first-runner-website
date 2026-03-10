
const key = 'AIzaSyDLV2NZfpOJkXBb6daEXRUFMX0ETTYhR1w';
const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + key;
const payload = {
    system_instruction: { parts: { text: 'You are a cyberpunk operator.' } },
    contents: [{ parts: [{ text: 'Hello' }] }],
    generationConfig: { responseMimeType: 'application/json' }
};

fetch(url, { method: 'POST', headers:{'Content-Type': 'application/json'}, body: JSON.stringify(payload) })
.then(r => r.json()).then(console.log).catch(console.error);

