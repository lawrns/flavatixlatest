const COMMON_SHORT_DESCRIPTORS = new Set([
  'ale',
  'ash',
  'fig',
  'fir',
  'gin',
  'hay',
  'jam',
  'nut',
  'oak',
  'oil',
  'pea',
  'rum',
  'rye',
  'tar',
  'tea',
]);

function isInlineFragment(prefix: string, candidate: string): boolean {
  if (!candidate.startsWith(prefix) || candidate.length <= prefix.length) {
    return false;
  }

  const continuation = candidate.charAt(prefix.length);
  if (!continuation || !/[a-z0-9]/i.test(continuation)) {
    return false;
  }

  if (prefix.length < 4 && COMMON_SHORT_DESCRIPTORS.has(prefix)) {
    return false;
  }

  return true;
}

export function normalizeDescriptorText(text: string | null | undefined): string {
  if (!text) {
    return '';
  }

  let normalized = text.toLowerCase().trim();

  normalized = normalized
    .replace(/[“”"']/g, '')
    .replace(/[()[\]{}]/g, ' ')
    .replace(/[_/]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[,:;.!?]+$/g, '')
    .replace(/\s*[- ](?:like|lik|li)$/i, '')
    .trim();

  return normalized;
}

export function resolveDescriptorCanonicalText(
  text: string,
  candidates: Iterable<string>
): string {
  const normalizedText = normalizeDescriptorText(text);

  if (!normalizedText) {
    return '';
  }

  const normalizedCandidates = Array.from(
    new Set(
      Array.from(candidates)
        .map((candidate) => normalizeDescriptorText(candidate))
        .filter(Boolean)
    )
  ).sort((a, b) => b.length - a.length);

  const mergedTarget = normalizedCandidates.find((candidate) =>
    isInlineFragment(normalizedText, candidate)
  );

  return mergedTarget ?? normalizedText;
}
