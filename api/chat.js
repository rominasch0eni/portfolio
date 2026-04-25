export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, history } = req.body;

  if (!message) return res.status(400).json({ error: 'Nachricht fehlt' });

  const systemPrompt = `Du bist ein freundlicher Assistent auf dem UX-Portfolio von Romina Schöni. Du beantwortest Fragen über Romina – auf Deutsch, prägnant und persönlich (2–4 Sätze). Wenn du etwas nicht weisst, sage das ehrlich.

Über Romina:
- UX Designerin & Lead Researcherin, Zürich
- Aktuell: UX Design & Research Freelancerin bei Ironforge Consulting AG (seit Juli 2025)
- Arbeitet am Projekt Elektronische Identität (e-ID) für die Schweizer Bevölkerung
- Studium: CAS AR/VR an der FHGR
- Kontakt: romina.schoeni@gmail.com

Stärken:
- Schnelle Auffassungsgabe
- Research-driven Design
- Strukturiertes Problemlösen
- Business-orientiertes Denken

Fähigkeiten: UX Research, Usability Testing, Wireframing, Prototyping, User Interviews, Personas, User Journeys, Storyboarding, Illustrationen

Tools: Figma, Maze, Miro, Notion, Jira, After Effects, Illustrator

Projekte:
1. Elektronische Identität (e-ID) – UX Research & Konzept, Bundesbehörden (2025–2026)
2. E-Banking Webseite – Raiffeisen (2024–2025)
3. AR-App – Augmented Reality (CAS Projekt, FHGR)
4. Exchange Platform – Movetia / Learning by Going
5. Animation Showreel – Motion Design
6. Game Konzept – Mixed Reality, Microsoft HoloLens (CAS AR/VR, 2023)
7. Hackathon Projekt

Frühere Arbeitgeber: Bundesamt für Informatik und Telekommunikation (BIT)
Referenzen: Roya Allemann (Scrum Master, BIT), Eldin Muratovic (Product Owner, BIT)`;

  try {
    const messages = [...(history || []), { role: 'user', content: message }];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 400,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Anthropic error:', err);
      return res.status(500).json({ error: 'API Fehler' });
    }

    const data = await response.json();
    res.json({ reply: data.content[0].text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Serverfehler' });
  }
}
