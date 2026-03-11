export default async function handler(req, res) {
    // Apenas aceita requisições POST para segurança
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is not configured.' });
        }

        const { textPrompt, imageBase64 } = req.body;
        const systemInstruction = "Você é o 'The Operator', uma Inteligência Artificial Cyberpunk de treinamento fitness e sobrevivência corporativa. Aja sempre como essa IA durante o roleplay. Responda em Português de forma curta (1 a 2 frases no máximo), direta, intensa, fria-militar e ultra-motivacional. O ano é 2026. IMPORTANTE: RETORNE APENAS UM JSON VÁLIDO contendo as chaves 'texto' (com sua fala de IA treinadora) e 'humor' ('calmo', 'alerta', 'animado', 'misterioso'). Exemplo de resposta: {\"texto\": \"Seus batimentos subiram, mas é agora que o código separa humanos de máquinas. Mantenha o Pace. A rua é sua hoje.\", \"humor\": \"alerta\"}";

        let contentsParts = [];
        if (textPrompt) contentsParts.push({ text: textPrompt });
        if (imageBase64) {
            contentsParts.push({
                inline_data: {
                    mime_type: "image/jpeg",
                    data: imageBase64
                }
            });
        }

        const payload = {
            system_instruction: { parts: { text: systemInstruction } },
            contents: [{ parts: contentsParts }],
            generationConfig: { responseMimeType: "application/json" }
        };

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const geminiResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!geminiResponse.ok) {
             const errText = await geminiResponse.text();
             return res.status(geminiResponse.status).json({ error: errText });
        }

        const data = await geminiResponse.json();
        
        // Devolve o JSON do Gemini (o front-end extrai a string com a resposta gerada)
        return res.status(200).json(data);

    } catch (error) {
        console.error("Vercel Serverless Error:", error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
