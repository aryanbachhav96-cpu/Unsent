import crypto from 'crypto';

// Crisis / Self-Harm detection keywords
const CRISIS_PATTERNS = [
  /\bkill(?:ing)?\s+myself\b/i,
  /\bend\s+(?:it\s+all|my\s+life)\b/i,
  /\bcommit(?:ting)?\s+suicide\b/i,
  /\bwant\s+to\s+die\b/i,
  /\btake\s+my\s+own\s+life\b/i,
  /\bhanging\s+myself\b/i,
  /\bslit(?:ting)?\s+my\s+wrists\b/i,
  /\bno\s+reason\s+to\s+live\b/i,
  /\bdon't\s+want\s+to\s+wake\s+up\b/i,
  /\bsuicide\s+note\b/i
];

// PII detection patterns (Phone, email, street address keywords)
const PHONE_PATTERN = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{10}\b/;
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const ADDRESS_PATTERN = /\b\d+\s+[a-zA-Z0-9\s,.'-]{4,30}\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Sector|Phase|Apartment|Apt|Nagar|Colony)\b/i;

// Occult disallowed ritual instructions & recruitment patterns
const OCCULT_STRICT_PATTERNS = [
  /\bjoin\s+our\s+(?:coven|cult|order|brotherhood|temple)\b/i,
  /\brecruit(?:ing|ment)?\b/i,
  /\bhow\s+to\s+summon\b/i,
  /\bcast\s+a\s+curse\s+on\b/i,
  /\bhex\s+(?:someone|them|him|her)\b/i,
  /\bblood\s+ritual\s+steps\b/i,
  /\bsacrifice\s+(?:animal|blood|human)\b/i,
  /\binitiation\s+(?:ceremony|steps|link)\b/i
];

export function checkCrisis(text = '') {
  for (const pattern of CRISIS_PATTERNS) {
    if (pattern.test(text)) {
      return {
        isCrisis: true,
        message: "You're not alone. If you're in India, Tele-MANAS: 14416 (free, 24/7). Elsewhere, please contact your local emergency number or findahelpline.com."
      };
    }
  }
  return { isCrisis: false };
}

export function checkPII(text = '') {
  if (PHONE_PATTERN.test(text)) {
    return { hasPII: true, reason: 'Contains suspected phone number' };
  }
  if (EMAIL_PATTERN.test(text)) {
    return { hasPII: true, reason: 'Contains suspected email address' };
  }
  if (ADDRESS_PATTERN.test(text)) {
    return { hasPII: true, reason: 'Contains suspected physical address' };
  }
  return { hasPII: false };
}

export function checkOccultStrict(text = '') {
  for (const pattern of OCCULT_STRICT_PATTERNS) {
    if (pattern.test(text)) {
      return {
        isDisallowed: true,
        reason: 'Contains ritual instructions or recruitment language'
      };
    }
  }
  return { isDisallowed: false };
}

// Salted IP hash helper (never stores or reveals raw IP)
export function hashClientIp(ip = '') {
  const salt = process.env.IP_SALT_SECRET;
  if (!salt) {
    throw new Error('IP_SALT_SECRET must be configured before hashing client addresses.');
  }
  return crypto.createHmac('sha256', salt).update(ip || 'unknown_ip').digest('hex');
}
