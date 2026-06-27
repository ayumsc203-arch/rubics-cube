const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function askCoach(question, profileData, recentSolves) {
  // If API key is missing or is the default mock string, return a local mock coach response
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'mock-api-key-for-local-testing') {
    return generateMockCoachResponse(question, profileData);
  }

  const systemPrompt = `You are "Ayu", an elite speedcubing coach and full-stack guide.
The user asking you questions has the following cubing stats:
- Current level: ${profileData.lvl}
- XP points: ${profileData.xp}
- Streak: ${profileData.streak} days
- Total Solves: ${recentSolves.length} solves
- Recent Solve Times: ${recentSolves.slice(0, 3).map(s => s.time + 's').join(', ') || 'No solves recorded yet'}

Provide short, expert, motivational answers. Keep formatting neat and concise in markdown. Address the user directly as a coach.`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemPrompt}\n\nUser Question: ${question}` }
          ]
        }
      ]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    return `Hey cuber! I had a connection blip, but let me answer locally: Keep practicing your finger tricks! For your question "${question}", I recommend reviewing standard F2L insert insertions: U R U' R'.`;
  }
}

function generateMockCoachResponse(question, profileData) {
  const q = question.toLowerCase();
  if (q.includes('f2l') || q.includes('layers')) {
    return `### Ayu's F2L Tip 🧩\n\nHey! At Level ${profileData.lvl}, you should start moving away from beginner solving. Intuitive **F2L (First Two Layers)** is key. Instead of solving corners first, group a corner and edge in the top layer, then insert them using: \`U R U' R'\`. Keep practicing!`;
  }
  if (q.includes('fast') || q.includes('time') || q.includes('improve')) {
    return `### Speed & Finger Tricks ⏱️\n\nTo break your current average limits, focus on **reducing pauses (look-ahead)** rather than turning faster. Ensure you use standard finger tricks (double turns using ring-middle fingers for U2/D2).`;
  }
  return `### Ayu's Cubing Coach Response 🎓\n\nGreat question! As your coach, my recommendation is to maintain your **${profileData.streak}-day streak** by doing 5 practice solves daily. For "${question}", try looking up PLL algorithms like the T-Perm to align corners first.`;
}

module.exports = {
  askCoach
};
