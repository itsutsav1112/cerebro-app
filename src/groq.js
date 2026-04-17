const GROQ_API_KEY = process.env.REACT_APP_GROQ_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function askGroq(systemPrompt, userMessage, history = []) {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: userMessage }
  ];
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama3-70b-8192',
      messages,
      max_tokens: 1000,
      temperature: 0.7
    })
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

export async function generateQuestion(section, stage, previousTopics = []) {
  const systemPrompt = `You are a CAT exam question generator. Generate ONE question for ${section} at difficulty stage ${stage} (1=easy, 2=medium, 3=hard, 4=exam-level).

For VARC: para jumbles, RC inference, para summary, odd sentence.
For QA: arithmetic, algebra, geometry, number systems. Keep calculation minimal.
For DILR: arrangements, data sets, logical reasoning.

Respond ONLY in valid JSON, no markdown:
{"type":"question type","question":"full question text","sentences":[{"l":"A","t":"sentence text"}],"options":[{"l":"A","t":"option"},{"l":"B","t":"option"},{"l":"C","t":"option"},{"l":"D","t":"option"}],"correct":"A","feedback_correct":"one line — validate or push further","feedback_wrong":"one line — what went wrong and the right approach","shortcut":"CAT-specific tip or pattern to remember"}

sentences array only for para jumbles, empty otherwise.
Previously covered: ${previousTopics.join(', ')}`;

  return await askGroq(systemPrompt, `Generate a ${section} question at stage ${stage}.`);
}