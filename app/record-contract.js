/* SPDX-License-Identifier: Apache-2.0 */
import { t } from './i18n.js';
// Only absence means legacy. Explicit null/string/unknown versions are never coerced.
export function recordError(kind, reason) {
  return Object.assign(new Error(t('contract.' + kind) + ': ' + t('contract.' + reason) + ' ' + t('contract.recovery')), { recordIssue: reason });
}
export function checkRecordVersion(value, kind, legacy = true) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw recordError(kind, 'corrupt');
  if (value.version === 1 || (legacy && !Object.hasOwn(value, 'version'))) return;
  throw recordError(kind, 'unsupported');
}
export function parseRecord(raw, kind, legacy = true) {
  let value;
  try { value = JSON.parse(raw); } catch { throw recordError(kind, 'corrupt'); }
  checkRecordVersion(value, kind, legacy);
  return value;
}
