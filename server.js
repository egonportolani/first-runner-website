const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '/'))); // Serve os HTMLs e assets da pasta raiz

// Nosso Backend / Rota da API Gemini
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey || apiKey === 'coloque_sua_chave_aqui') {
            return res.status(500).json({ error: 'GEMINI_API_KEY não configurada no .env' });
        }

        // Import clássico para Node
        const fetch = require('node-fetch');

        // System Prompt Otimizado pra Respostas Rápidas de Voz
        const systemInstruction = "Você é o Core, a IA de voz do aplicativo fitness First Runner. Responda APENAS com mensagens extremamente curtas, diretas e faladas (1 a 2 frases curtas no máximo), simulando um assistente de voz em tempo real treinando um corredor de rua. Não crie listas, pontos nem textos longos. Use tons esportivos ou cyberpunks. Responda no idioma Português do Brasil. Suas respostas DEVEM ser em formato JSON estrito com exatamente dois campos obrigatórios: 'texto' (a resposta que será falada pelo robô) e 'humor' ('calmo', 'animado', 'alerta', ou 'misterioso'). NUNCA use markdown, nem blocos ```json.";

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: systemInstruction }]
                },
                contents: [
                    { role: "user", parts: [{ text: message }] }
                ],
                generationConfig: {
                    temperature: 0.7,
                    responseMimeType: "application/json"
                }
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error("Gemini API Error:", data);
            return res.status(500).json({ error: 'Falha no Gemini', details: data });
        }
        
        const jsonTextOutput = data.candidates?.[0]?.content?.parts?.[0]?.text || '{"texto": "Erro nos sensores neurais.", "humor": "alerta"}';
        
        // Passa exatamente o Texto Raw pro Frontend HTML ler
        res.status(200).json({ text: jsonTextOutput });
    } catch (error) {
        console.error("Erro interno no Servidor App:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Iniciando o servidor
app.listen(PORT, () => {
    console.log(`[FIRST-RUNNER] Link Neural ativo. Servidor rodando em http://localhost:${PORT}`);
});
