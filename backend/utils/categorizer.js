const RULES = [
  {
    id: 1,
    keywords: [
      'carrefour', 'lidl', 'aldi', 'leclerc', 'monoprix', 'franprix',
      'intermarché', 'picard', 'restaurant', 'mcdo', 'mcdonald', 'burger',
      'pizza', 'sushi', 'uber eats', 'ubereats', 'deliveroo', 'just eat',
    ],
  },
  {
    id: 2,
    keywords: [
      'sncf', 'ratp', 'blablacar', 'uber', 'bolt', 'taxi', 'essence',
      'total', 'bp', 'autoroute', 'parking',
    ],
  },
  {
    id: 3,
    keywords: [
      'netflix', 'spotify', 'amazon prime', 'disney', 'canal', 'sfr',
      'orange', 'free', 'bouygues', 'google', 'apple', 'microsoft', 'adobe',
    ],
  },
  {
    id: 4,
    keywords: [
      'cinema', 'theatre', 'concert', 'steam', 'fnac', 'cultura',
      'decathlon', 'sport',
    ],
  },
  {
    id: 5,
    keywords: [
      'pharmacie', 'médecin', 'dentiste', 'hopital', 'clinique', 'mutuelle',
    ],
  },
  {
    id: 6,
    keywords: [
      'loyer', 'edf', 'gaz', 'eau', 'charges', 'assurance habitation',
    ],
  },
];

function categorizeByRules(description) {
  if (!description) return null;
  const lower = description.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return rule.id;
    }
  }
  return null;
}

module.exports = { categorizeByRules };
