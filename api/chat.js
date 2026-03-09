module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { message } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'GEMINI_API_KEY not configured on Vercel.' });
        }

        const systemInstruction = "Você é o Core, a IA de voz do First Runner. Responda APENAS com mensagens extremamente curtas, diretas e faladas (1 a 2 frases curtas no máximo), simulando um assistente de voz em tempo real. Não crie listas nem textos longos. Use jargões esportivos/cyberpunks. Suas respostas DEVEM ser em formato JSON estrito com os campos 'texto' (a resposta falada) e 'humor' ('calmo', 'animado', 'alerta', ou 'misterioso'). NUNCA use markdown.";

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
            return res.status(500).json({ error: 'Failed to generate response from Google API', details: data });
        }
        
        // Output text from Google returns
        const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        
        res.status(200).json({ text: textOutput });
    } catch (error) {
        console.error("Server API Error", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
