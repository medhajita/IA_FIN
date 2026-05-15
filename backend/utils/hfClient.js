const { InferenceClient } = require('@huggingface/inference');

let _client = null;
function getClient() {
  if (!_client) _client = new InferenceClient(process.env.HF_TOKEN);
  return _client;
}

async function chatCompletion(messages, { maxTokens = 500, temperature = 0.6 } = {}) {
  const out = await getClient().chatCompletion({
    model: process.env.HF_MODEL,
    messages,
    max_tokens: maxTokens,
    temperature,
    provider: 'auto',
  });
  return out.choices[0].message.content.trim();
}

module.exports = { chatCompletion };
