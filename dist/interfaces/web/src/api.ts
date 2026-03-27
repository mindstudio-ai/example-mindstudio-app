import { createClient, createAgentChatClient } from '@mindstudio-ai/interface';

const api = createClient();
export const chat = createAgentChatClient();

export default api;
