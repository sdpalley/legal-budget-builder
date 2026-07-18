function parseUrl(value) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function isSafeExternalUrl(value) {
  const url = parseUrl(value);
  return Boolean(
    url &&
    url.protocol === "https:" &&
    !url.username &&
    !url.password &&
    url.hostname,
  );
}

function isSameDocumentNavigation(targetValue, currentValue) {
  const target = parseUrl(targetValue);
  const current = parseUrl(currentValue);
  if (!target || !current) return false;

  return (
    target.protocol === "file:" &&
    current.protocol === "file:" &&
    target.pathname === current.pathname &&
    target.search === current.search
  );
}

module.exports = { isSafeExternalUrl, isSameDocumentNavigation };
