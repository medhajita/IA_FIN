/**
 * AI-based transaction category classifier using DeepSeek via Hugging Face Inference.
 * Falls back to safe default categories if AI call fails or returns unrecognised output.
 *
 * Required env vars (already used by chatbotEngine):
 *   HF_TOKEN  – Hugging Face access token (provides DeepSeek model access)
 *   HF_MODEL  – e.g. "deepseek-ai/DeepSeek-V3-0324"
 */

const { chatCompletion } = require('./hfClient');

// Mirrors the seeded Category table
const CATEGORIES = [
  { id: 1, name: 'Alimentation' },
  { id: 2, name: 'Transport' },
  { id: 3, name: 'Abonnements' },
  { id: 4, name: 'Loisirs' },
  { id: 5, name: 'Santé' },
  { id: 6, name: 'Logement' },
  { id: 7, name: 'Autre dépense' },
  { id: 8, name: 'Salaire' },
  { id: 9, name: 'Autre revenu' },
];

const NAME_TO_ID = Object.fromEntries(
  CATEGORIES.map(c => [c.name.toLowerCase(), c.id])
);

const SYSTEM_PROMPT = `You are a financial transaction classifier.
Given a transaction description and amount, respond with ONLY one category name from this list — nothing else:
Alimentation, Transport, Abonnements, Loisirs, Santé, Logement, Autre dépense, Salaire, Autre revenu

Rules:
- Alimentation: food, groceries, restaurants, supermarkets, delivery apps
- Transport: fuel, public transit, taxi, car, parking, trains, flights
- Abonnements: streaming, phone, internet, software subscriptions
- Loisirs: entertainment, sport, games, culture, cinema
- Santé: pharmacy, doctor, dentist, hospital, insurance médicale
- Logement: rent, utilities (electricity, gas, water), home insurance
- Salaire: salary, wages, payroll
- Autre revenu: freelance, reimbursements, allowances, dividends, bonuses
- Autre dépense: anything else that is an expense

Respond with exactly one category name from the list above.`;

/**
 * Classify a transaction using DeepSeek AI.
 * @param {string} description
 * @param {number|string} amount
 * @param {'income'|'expense'} type
 * @returns {Promise<number>} category_id
 */
async function classifyWithAI(description, amount, type = 'expense') {
  const fallback = type === 'income' ? 9 : 7;

  if (!process.env.HF_TOKEN) return fallback;

  try {
    const userMsg = `Description: "${description}", Amount: ${amount}€, Type: ${type}`;

    // Wrap with timeout to avoid blocking CSV import for too long
    const result = await Promise.race([
      chatCompletion(
        [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user',   content: userMsg },
        ],
        { maxTokens: 15, temperature: 0.1 }
      ),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI timeout')), 8000)
      ),
    ]);

    const raw = result.trim().toLowerCase();

    // 1. Exact match
    if (NAME_TO_ID[raw] !== undefined) return NAME_TO_ID[raw];

    // 2. Partial match (model may return extra punctuation or casing variance)
    for (const [name, id] of Object.entries(NAME_TO_ID)) {
      if (raw.includes(name)) return id;
    }

    return fallback;
  } catch {
    return fallback;
  }
}

module.exports = { classifyWithAI };
