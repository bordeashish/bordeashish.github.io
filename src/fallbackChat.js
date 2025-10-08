// Fallback logic for local preview
export function getMockResponse(messages) {
  // Simple mock: echo last user message
  const last = messages[messages.length - 1];
  if (last && last.role === 'user') {
    return { reply: `Echo: ${last.content}` };
  }
  return { reply: 'Hello! This is a local preview.' };
}
