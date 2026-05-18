const { InferenceClient } = require('@huggingface/inference');
const axios = require('axios');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function isQuotaError(err) {
  const status = err?.response?.status;
  if (status === 429 || status === 402) return true;
  const msg = (err?.response?.data?.error?.message || err?.message || '').toLowerCase();
  return msg.includes('quota') || msg.includes('rate limit') || msg.includes('insufficient');
}

async function groqCall(messages, maxTokens, temperature) {
  const body = { model: 'llama-3.3-70b-versatile', messages, max_tokens: maxTokens, temperature };
  const headers = {
    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    'Content-Type': 'application/json',
  };
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', body, { headers, timeout: 45000 });
      const raw = res.data.choices[0].message.content.trim();
      return raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    } catch (err) {
      const status = err?.response?.status;
      if (status === 429 && attempt < 1) {
        const retryAfter = parseInt(err?.response?.headers?.['retry-after'] || '5', 10);
        await sleep(Math.min(retryAfter, 8) * 1000);
        continue;
      }
      throw err;
    }
  }
}

async function deepseekCall(messages, maxTokens, temperature) {
  const res = await axios.post(
    'https://api.deepseek.com/v1/chat/completions',
    { model: 'deepseek-chat', messages, max_tokens: maxTokens, temperature },
    {
      headers: {
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 45000,
    }
  );
  return res.data.choices[0].message.content.trim();
}

async function hfCall(messages, maxTokens, temperature) {
  const client = new InferenceClient(process.env.HF_TOKEN);
  const result = await client.chatCompletion({
    model: 'deepseek-ai/DeepSeek-V3-0324',
    messages,
    max_tokens: maxTokens,
    temperature,
  });
  return result.choices[0].message.content.trim();
}

async function chatCompletion(messages, { maxTokens = 600, temperature = 0.5 } = {}) {
  const providers = [];
  if (process.env.GROQ_API_KEY) providers.push({ name: 'groq', fn: () => groqCall(messages, maxTokens, temperature) });
  if (process.env.DEEPSEEK_API_KEY) providers.push({ name: 'deepseek', fn: () => deepseekCall(messages, maxTokens, temperature) });
  if (process.env.HF_TOKEN) providers.push({ name: 'hf', fn: () => hfCall(messages, maxTokens, temperature) });

  if (providers.length === 0) {
    throw new Error('NO_KEY: set GROQ_API_KEY, DEEPSEEK_API_KEY, or HF_TOKEN in .env');
  }

  let lastErr;
  for (const { name, fn } of providers) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      console.warn(`[ai:${name}] failed (${err?.response?.status || err?.message}). ${isQuotaError(err) ? 'Trying next provider…' : 'Aborting.'}`);
      if (!isQuotaError(err)) throw err;
    }
  }
  throw lastErr;
}

module.exports = { chatCompletion };
