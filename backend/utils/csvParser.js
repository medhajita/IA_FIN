const fs = require('fs');
const csv = require('csv-parser');

function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('headers', (headers) => {
        const lower = headers.map((h) => h.toLowerCase().trim());

        const dateCol = headers[lower.findIndex((h) => h === 'date')];
        const descCol = headers[lower.findIndex((h) =>
          ['libellé', 'libelle', 'description', 'label'].includes(h)
        )];
        const amountCol = headers[lower.findIndex((h) =>
          ['montant', 'amount'].includes(h)
        )];

        if (!dateCol || !descCol || !amountCol) {
          reject(
            new Error(
              `Missing required columns. Expected: date, libellé/description/label, montant/amount. Found: ${headers.join(', ')}`
            )
          );
        }

        rows._dateCol = dateCol;
        rows._descCol = descCol;
        rows._amountCol = amountCol;
      })
      .on('data', (row) => {
        try {
          const dateRaw = row[rows._dateCol]?.trim();
          const descRaw = row[rows._descCol]?.trim();
          const amountRaw = row[rows._amountCol]?.trim().replace(',', '.');

          if (!dateRaw || !descRaw || !amountRaw) return;

          const amount = parseFloat(amountRaw);
          if (isNaN(amount)) return;

          // Normalise date to YYYY-MM-DD
          let date = dateRaw;
          if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateRaw)) {
            const [d, m, y] = dateRaw.split('/');
            date = `${y}-${m}-${d}`;
          } else if (/^\d{2}-\d{2}-\d{4}$/.test(dateRaw)) {
            const [d, m, y] = dateRaw.split('-');
            date = `${y}-${m}-${d}`;
          }

          rows.push({
            date,
            description: descRaw,
            amount: Math.abs(amount),
            type: amount >= 0 ? 'income' : 'expense',
          });
        } catch {
          // skip malformed rows
        }
      })
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

module.exports = { parseCSV };
