
const InvoiceCounter = require("../models/invoiceCounterModel");

function getFinancialYear(date = new Date()) {
  // Determine the date using Indian Standard Time.
  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);

  const year = Number(parts.find(p => p.type === "year").value);
  const month = Number(parts.find(p => p.type === "month").value);

  const startYear = month >= 4 ? year : year - 1;
  const endYear = startYear + 1;

  return `${String(startYear).slice(-2)}-${String(endYear).slice(-2)}`;
}

async function generateInvoiceNumber(date = new Date()) {
  const financialYear = getFinancialYear(date);

  // Atomic increment: each request gets a different sequence.
  // Retry once if simultaneous first-time creation causes a duplicate key.
  let counter;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      counter = await InvoiceCounter.findOneAndUpdate(
        { financialYear },
        { $inc: { sequence: 1 } },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
          runValidators: true,
        }
      );

      break;
    } catch (error) {
      if (error.code !== 11000 || attempt === 1) {
        throw error;
      }
    }
  }

  return `GP/${financialYear}/${String(counter.sequence).padStart(5, "0")}`;
}

module.exports = generateInvoiceNumber;
