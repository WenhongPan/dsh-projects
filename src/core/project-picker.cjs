function initialProjectIndex(projects, selectedId) {
  if (!Array.isArray(projects) || projects.length === 0) return -1;
  const selected = projects.findIndex((project) => project?.workspaceId === selectedId);
  return selected >= 0 ? selected : 0;
}

function nextProjectIndex(current, direction, length) {
  if (!Number.isInteger(length) || length <= 0) return -1;
  const step = direction < 0 ? -1 : 1;
  const start = Number.isInteger(current) && current >= 0 && current < length
    ? current
    : (step > 0 ? -1 : 0);
  return (start + step + length) % length;
}

module.exports = { initialProjectIndex, nextProjectIndex };
