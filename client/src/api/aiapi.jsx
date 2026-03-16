// MOCK MODE – NO BACKEND, NO OPENAI
export const sendPromptToAI = async (prompt) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          `🤖 Mock AI reply:\nYou said → "${prompt}"`
        );
      }, 800);
    });
  };