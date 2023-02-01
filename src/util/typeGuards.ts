export function isArrayOfStrings(array: unknown): array is Array<string> {
  if (!Array.isArray(array)) {
    return false;
  }

  if (array.some((e) => typeof e !== "string")) {
    return false;
  }

  return true;
}
