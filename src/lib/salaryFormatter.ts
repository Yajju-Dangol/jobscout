/**
 * Formats clean, human-readable salary ranges from numbers or text heuristics
 */
export function formatSalaryRange(
  min?: number,
  max?: number,
  isPredicted?: string,
  rawDesc?: string,
  title?: string,
  contractTime?: string,
  contractType?: string
): string {
  // 1. If explicit numbers provided
  if (min && max && min > 0 && max > 0) {
    if (min === max) {
      const formatted = min >= 1000 ? `$${Math.round(min / 1000)}k` : `$${min}`;
      const suffix = isPredicted === '1' ? ' / yr (Est.)' : ' / yr';
      return `${formatted}${suffix}`;
    }
    const minFormatted = min >= 1000 ? `$${Math.round(min / 1000)}k` : `$${min}`;
    const maxFormatted = max >= 1000 ? `$${Math.round(max / 1000)}k` : `$${max}`;
    const suffix = isPredicted === '1' ? ' / yr (Est.)' : ' / yr';
    return `${minFormatted} - ${maxFormatted}${suffix}`;
  }
  if (min && min > 0) {
    const minFormatted = min >= 1000 ? `$${Math.round(min / 1000)}k` : `$${min}`;
    const suffix = isPredicted === '1' ? ' / yr (Est.)' : ' / yr';
    return `From ${minFormatted}${suffix}`;
  }
  if (max && max > 0) {
    const maxFormatted = max >= 1000 ? `$${Math.round(max / 1000)}k` : `$${max}`;
    const suffix = isPredicted === '1' ? ' / yr (Est.)' : ' / yr';
    return `Up to ${maxFormatted}${suffix}`;
  }

  // 2. Check if job description contains an explicit salary mention
  if (rawDesc) {
    const rangeMatch = rawDesc.match(/\$(\d{2,3}(?:,\d{3})*|\d{2,3}k)\s*(?:-|to)\s*\$?(\d{2,3}(?:,\d{3})*|\d{2,3}k)(?:\s*(?:\/|per)\s*(?:yr|year|hour|hr|month|mo))?/i);
    if (rangeMatch) {
      return rangeMatch[0].includes('/') || rangeMatch[0].toLowerCase().includes('per')
        ? rangeMatch[0]
        : `${rangeMatch[0]} / yr`;
    }
    const singleMatch = rawDesc.match(/\$(\d{2,3}(?:,\d{3})*|\d{2,3}k)\s*(?:\/|per)\s*(?:yr|year|hour|hr)/i);
    if (singleMatch) {
      return singleMatch[0];
    }
  }

  // 3. Contract role adjustment
  if (contractType === 'contract' || contractTime === 'part_time') {
    return '$65 - $115 / hr (Est.)';
  }

  // 4. Context-aware market estimate based on title seniority
  const tLower = (title || '').toLowerCase();
  if (tLower.includes('staff') || tLower.includes('principal') || tLower.includes('director') || tLower.includes('lead')) {
    return '$190k - $250k / yr (Est.)';
  }
  if (tLower.includes('senior') || tLower.includes('sr.') || tLower.includes('architect')) {
    return '$155k - $210k / yr (Est.)';
  }
  if (tLower.includes('junior') || tLower.includes('entry') || tLower.includes('associate') || tLower.includes('intern') || tLower.includes('grad')) {
    return '$95k - $130k / yr (Est.)';
  }
  return '$135k - $185k / yr (Est.)';
}
