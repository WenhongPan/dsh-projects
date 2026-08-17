function parentDirectory(value) {
  const path = String(value || "").replace(/[\\/]+$/, "");
  if (!path) return "";
  const match = path.match(/^(.*)[\\/][^\\/]+$/);
  if (!match) return "";
  let parent = match[1];
  if (!parent) return path.startsWith("/") ? "/" : "";
  if (/^[A-Za-z]:$/.test(parent)) parent += "\\";
  return parent;
}

module.exports = { parentDirectory };
