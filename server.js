const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// === SECURITY MIDDLEWARE ===
// CORS: Only allow requests from our own domain
const allowedOrigins = [
    'https://www.firstrunner.com.br',
    'https://firstrunner.com.br'
];
if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push('http://localhost:3000');
}
app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// JSON body size limit (prevents memory exhaustion attacks)
app.use(express.json({ limit: '1mb' }));

// Rate limiting for API routes (15 requests per minute per IP)
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
});

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(self), microphone=(self), camera=(self)');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://unpkg.com https://www.gstatic.com https://www.googletagmanager.com https://connect.facebook.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://generativelanguage.googleapis.com https://firestore.googleapis.com https://www.google-analytics.com https://www.facebook.com; media-src 'self' blob:; frame-src 'none';");
    next();
});

app.use(express.static(path.join(__dirname, 'public'))); // Serve APENAS arquivos públicos da pasta /public

// Nosso Backend / Rota da API Gemini
app.post('/api/chat', apiLimiter, async (req, res) => {
    try {
        const { message, imageBase64 } = req.body;

        // Input validation
        if (message && typeof message !== 'string') {
            return res.status(400).json({ error: 'Invalid input' });
        }
        if (message && message.length > 2000) {
            return res.status(400).json({ error: 'Message too long (max 2000 chars)' });
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey || apiKey === 'coloque_sua_chave_aqui') {
            return res.status(500).json({ error: 'API key not configured.' });
        }

        // System Prompt Otimizado pra Respostas Rápidas de Voz e Visão
        const systemInstruction = "Você é o Core, a IA de voz do aplicativo fitness First Runner. Responda APENAS com mensagens extremamente curtas, diretas e faladas (1 a 2 frases curtas no máximo), simulando um assistente de voz em tempo real treinando um corredor de rua. Se o usuário enviar uma imagem (Live Vision), analise a paisagem, o trajeto ou o terreno e faça um comentário rápido como se estivesse vendo pelos óculos inteligentes do corredor (exemplo: 'Terreno irregular à frente, ajuste a passada', 'Belo parque, mantenha o foco na trilha'). Não crie listas, pontos nem textos longos. Use tons esportivos ou cyberpunks. Responda no idioma Português do Brasil. Suas respostas DEVEM ser em formato JSON estrito com exatamente dois campos obrigatórios: 'texto' (a resposta) e 'humor' ('calmo', 'animado', 'alerta', ou 'misterioso'). NUNCA use markdown, nem blocos ```json.";

        const parts = [{ text: message || "Analise meu ambiente e trajeto atual." }];
        if (imageBase64) {
            parts.push({
                inline_data: {
                    mime_type: "image/jpeg",
                    data: imageBase64
                }
            });
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: systemInstruction }]
                },
                contents: [
                    { role: "user", parts: parts }
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
            return res.status(500).json({ error: 'AI service temporarily unavailable.' });
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
    console.log(`[FIRST-RUNNER] Server running on http://localhost:${PORT}`);
});
