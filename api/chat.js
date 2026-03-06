export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { message } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'GEMINI_API_KEY not configured on Vercel.' });
        }

        const systemInstruction = "Você é o Core, a IA do First Runner. Assim que o usuário entrar, você deve saudá-lo de forma curta e impactante, como se estivesse escaneando os sinais dele. Exemplo: 'Sistemas online. Atleta detectado. Pronto para o treino urbano?'. Suas respostas DEVEM ser em formato JSON estrito. Inclua um campo 'texto' para sua fala curta usando jargões esportivos/cyberpunks, e um campo 'humor' que DEVE ser um destes: 'calmo', 'animado', 'alerta' ou 'misterioso' para alterar sua forma física na tela. NUNCA use markdown na resposta, apenas o objeto JSON puro.";

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
