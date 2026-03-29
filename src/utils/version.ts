/**
 * Compare two semver-style strings (major.minor.patch).
 * Returns: -1 if a < b, 0 if a === b, 1 if a > b
 */
export function compareSemver(a: string, b: string): -1 | 0 | 1 {
  const toTuple = (v: string) => v.split('.').map(Number);
  const [aMaj, aMin, aPatch] = toTuple(a);
  const [bMaj, bMin, bPatch] = toTuple(b);

  if (aMaj !== bMaj) return aMaj < bMaj ? -1 : 1;
  if (aMin !== bMin) return aMin < bMin ? -1 : 1;
  if (aPatch !== bPatch) return aPatch < bPatch ? -1 : 1;
  return 0;
}

/** Returns true when the installed version is strictly below the minimum. */
export function isUpdateRequired(installedVersion: string, minimumVersion: string): boolean {
  return compareSemver(installedVersion, minimumVersion) === -1;
}
