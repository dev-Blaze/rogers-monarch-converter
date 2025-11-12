import { normalize, areMerchantsSimilar } from './categoryMapping';

/**
 * Intelligently learn category mappings from Monarch export
 * and apply them to convert Rogers CSV data
 */

// Learn category mappings directly from Monarch data
function learnFromMonarch(monarchData) {
  const merchantToCategoryMap = {};
  const merchantTransforms = {};

  for (const row of monarchData) {
    const merchant = row.Merchant?.trim();
    const category = row.Category?.trim();

    if (!merchant || !category) continue;

    const normalizedMerchant = normalize(merchant);

    // Store exact merchant name for transformation
    if (!merchantTransforms[normalizedMerchant]) {
      merchantTransforms[normalizedMerchant] = merchant;
    }

    // Count category occurrences for each merchant
    if (!merchantToCategoryMap[normalizedMerchant]) {
      merchantToCategoryMap[normalizedMerchant] = {};
    }
    merchantToCategoryMap[normalizedMerchant][category] =
      (merchantToCategoryMap[normalizedMerchant][category] || 0) + 1;
  }

  // Convert to most common category for each merchant
  const finalMerchantMap = {};
  for (const [merchant, categories] of Object.entries(merchantToCategoryMap)) {
    const mostCommon = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
    if (mostCommon) {
      finalMerchantMap[merchant] = mostCommon[0];
    }
  }

  return {
    merchantToCategoryMap: finalMerchantMap,
    merchantTransforms
  };
}


// Apply merchant name transformation
function transformMerchantName(rogersName, merchantTransforms) {
  if (!rogersName) return '';

  const normalized = normalize(rogersName);

  // Try to find a similar merchant in our learned data
  for (const [learnedNorm, learnedName] of Object.entries(merchantTransforms)) {
    // Exact match
    if (normalized === learnedNorm) {
      return learnedName;
    }
    // Partial match (either contains the other)
    if (normalized.includes(learnedNorm) || learnedNorm.includes(normalized)) {
      return learnedName;
    }
  }

  // Default: clean up the Rogers name with title case
  return rogersName
    .split(' ')
    .map(word => {
      const lowerWords = ['ca', 'inc', 'the', 'and', 'of', 'for', 'w', 'on'];
      if (lowerWords.includes(word.toLowerCase())) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

// Determine category using learned mappings
function determineCategory(rogersRow, merchantMap) {
  const merchantName = normalize(rogersRow['Merchant Name']);

  // Try exact match first
  if (merchantMap[merchantName]) {
    return merchantMap[merchantName];
  }

  // Try partial matches (fuzzy matching)
  for (const [learnedMerchant, category] of Object.entries(merchantMap)) {
    if (merchantName.includes(learnedMerchant) || learnedMerchant.includes(merchantName)) {
      return category;
    }
  }

  return 'Uncategorized';
}

// Learn account name from Monarch data
function learnAccountName(monarchData) {
  const accounts = {};
  for (const row of monarchData) {
    if (row.Account) {
      accounts[row.Account] = (accounts[row.Account] || 0) + 1;
    }
  }

  const mostCommon = Object.entries(accounts).sort((a, b) => b[1] - a[1])[0];
  return mostCommon ? mostCommon[0] : 'Rogers';
}

/**
 * Main function to learn from Monarch CSV and convert Rogers CSV
 */
export function intelligentConvert(rogersData, monarchData) {
  console.log(`Learning from ${monarchData.length} Monarch transactions...`);

  // Step 1: Learn patterns from Monarch data
  const { merchantToCategoryMap, merchantTransforms } = learnFromMonarch(monarchData);
  const accountName = learnAccountName(monarchData);

  console.log('Learned mappings:', {
    uniqueMerchants: Object.keys(merchantToCategoryMap).length,
    accountName
  });

  // Step 2: Apply learned patterns to Rogers data
  const converted = rogersData.map(rogersRow => {
    const amount = (rogersRow.Amount || '').replace(/[$,]/g, '');
    const numAmount = parseFloat(amount);

    // Rogers exports debits as negative, which matches Monarch format
    const finalAmount = !isNaN(numAmount) ? numAmount.toString() : '';

    return {
      Date: rogersRow.Date || '',
      Merchant: transformMerchantName(rogersRow['Merchant Name'], merchantTransforms),
      Category: determineCategory(rogersRow, merchantToCategoryMap),
      Account: accountName,
      'Original Statement': '',
      Notes: '',
      Amount: finalAmount,
      Tags: '',
      Owner: (rogersRow['Name on Card'] || '')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    };
  });

  // Calculate stats
  const categorized = converted.filter(row => row.Category !== 'Uncategorized').length;

  return {
    converted,
    stats: {
      totalRows: rogersData.length,
      categorizedRows: categorized,
      uncategorizedRows: converted.length - categorized,
      learnedMerchants: Object.keys(merchantToCategoryMap).length,
      categorizationRate: ((categorized / rogersData.length) * 100).toFixed(1) + '%'
    }
  };
}

