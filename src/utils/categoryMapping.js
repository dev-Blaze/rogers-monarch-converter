/**
 * This file is kept minimal - all category mapping is now learned dynamically
 * from the target CSV file provided by the user.
 *
 * No hardcoded mappings to ensure flexibility for all users.
 */

// Normalize string for comparison (lowercase, trim, remove special chars)
export function normalize(str) {
  if (!str) return '';
  return str.toString().toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
}

// Check if two merchant names are similar
export function areMerchantsSimilar(merchant1, merchant2) {
  const norm1 = normalize(merchant1);
  const norm2 = normalize(merchant2);

  if (!norm1 || !norm2) return false;

  // Exact match
  if (norm1 === norm2) return true;

  // Substring match
  if (norm1.includes(norm2) || norm2.includes(norm1)) return true;

  // Check for common significant words (3+ characters)
  const words1 = norm1.split(/\s+/).filter(w => w.length > 2);
  const words2 = norm2.split(/\s+/).filter(w => w.length > 2);

  if (words1.length === 0 || words2.length === 0) return false;

  const commonWords = words1.filter(word => words2.includes(word));

  // At least 50% of words should match
  return commonWords.length >= Math.min(words1.length, words2.length) * 0.5;
}

