/** Apply Ironpath's punctuation preference to externally supplied display text. */
export function displayText(value: string) {
  return value.replace(/\s*\u2014\s*/g, ' - ');
}
