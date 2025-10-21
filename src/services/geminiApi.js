
const GEMINI_API_KEY = "AIzaSyACy4GggMOa9330dZrWSyzxs3bFyP8OyKg";

const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;


export const askGemini = async (promptText, imageBase64 = null) => {
  const headers = { 'Content-Type': 'application/json' };
  let payload;

  if (imageBase64) {
    payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: promptText },
            {
              inlineData: {
                mimeType: "image/png", // Assuming PNG, adjust if needed
                data: imageBase64
              }
            }
          ]
        }
      ],
    };
  } else {
    payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: promptText }
          ]
        }
      ],
    };
  }

  try {
    const response = await fetch(`${geminiEndpoint}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {
      return result.candidates[0].content.parts[0].text;
    } else {
      console.error('Unexpected API response structure:', result);
      return "No response from Gemini AI.";
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I couldn't process your request.";
  }
};
