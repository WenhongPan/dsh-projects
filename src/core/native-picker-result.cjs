function isDirectoryPathResult(value) {
  return value !== null
    && typeof value === "object"
    && (typeof value.path === "string" || value.path === null);
}

function unwrapNativeDirectoryResult(result) {
  // Connection RPC returns a Result envelope. Keep accepting the direct shape
  // as well so older in-process hosts and test fixtures remain compatible.
  if (isDirectoryPathResult(result)) return result.path;

  if (result !== null && typeof result === "object" && result.ok === true) {
    if (isDirectoryPathResult(result.value)) return result.value.path;
    throw new Error("native directory bridge returned an invalid success result");
  }

  if (result !== null && typeof result === "object" && result.ok === false) {
    const message = typeof result.error?.message === "string"
      ? result.error.message
      : "native directory bridge failed";
    throw new Error(message);
  }

  throw new Error("native directory bridge returned an invalid result");
}

module.exports = { unwrapNativeDirectoryResult };
