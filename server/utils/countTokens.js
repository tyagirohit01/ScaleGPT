export const countTokens = (text = "") => {
    // rough estimate: 1 token ≈ 4 chars
    return Math.ceil(text.length / 4);
  };
  