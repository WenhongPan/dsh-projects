const GROUP_PREFIX = "dshp-group:";
const PROJECT_GROUP_SCHEMA_VERSION = 1;

function uniqueStrings(values) {
  const seen = new Set();
  const result = [];
  for (const value of values || []) {
    if (typeof value !== "string" || !value || seen.has(value)) continue;
    seen.add(value);
    result.push(value);
  }
  return result;
}

function normalizeProjectGroups(groups, workspaces) {
  const available = new Map((workspaces || []).map((workspace) => [workspace.workspaceId, workspace]));
  const claimed = new Set();
  const claimedGroupIds = new Set();
  const normalized = [];
  for (const raw of groups || []) {
    if (!raw || typeof raw !== "object") continue;
    const id = typeof raw.id === "string" ? raw.id.trim() : "";
    const title = typeof raw.title === "string" ? raw.title.trim().slice(0, 80) : "";
    if (!id || !title || claimedGroupIds.has(id)) continue;
    const memberWorkspaceIds = uniqueStrings(raw.memberWorkspaceIds)
      .filter((workspaceId) => available.has(workspaceId) && !claimed.has(workspaceId));
    if (memberWorkspaceIds.length < 2) continue;
    const primaryWorkspaceId = memberWorkspaceIds.includes(raw.primaryWorkspaceId)
      ? raw.primaryWorkspaceId
      : memberWorkspaceIds[0];
    for (const workspaceId of memberWorkspaceIds) claimed.add(workspaceId);
    claimedGroupIds.add(id);
    normalized.push({ id, title, primaryWorkspaceId, memberWorkspaceIds });
  }
  return normalized;
}

function createProjectGroupManifest(groups) {
  return {
    schemaVersion: PROJECT_GROUP_SCHEMA_VERSION,
    groups: Array.isArray(groups) ? groups : [],
    supported: true
  };
}

function readProjectGroupManifest(value) {
  if (Array.isArray(value)) return createProjectGroupManifest(value);
  if (!value || typeof value !== "object") return createProjectGroupManifest([]);
  if (value.schemaVersion === PROJECT_GROUP_SCHEMA_VERSION) {
    return createProjectGroupManifest(value.groups);
  }
  if (Number.isInteger(value.schemaVersion) && value.schemaVersion > PROJECT_GROUP_SCHEMA_VERSION) {
    return { ...value, supported: false };
  }
  return createProjectGroupManifest([]);
}

function composeProjectGroups(workspaces, groups) {
  const list = workspaces || [];
  const byId = new Map(list.map((workspace) => [workspace.workspaceId, workspace]));
  const normalizedGroups = normalizeProjectGroups(groups, list);
  const groupedWorkspaceIds = new Set(normalizedGroups.flatMap((group) => group.memberWorkspaceIds));
  const groupedProjects = normalizedGroups.map((group) => {
    const memberWorkspaces = group.memberWorkspaceIds.map((workspaceId) => byId.get(workspaceId)).filter(Boolean);
    const primary = byId.get(group.primaryWorkspaceId) || memberWorkspaces[0];
    const sessionIds = uniqueStrings(memberWorkspaces.flatMap((workspace) => workspace.sessionIds || []));
    return {
      workspaceId: `${GROUP_PREFIX}${group.id}`,
      title: group.title,
      path: primary?.path || "",
      sessionIds,
      advancedGroup: true,
      groupId: group.id,
      primaryWorkspaceId: primary?.workspaceId || group.primaryWorkspaceId,
      memberWorkspaceIds: group.memberWorkspaceIds,
      memberWorkspaces
    };
  });
  return {
    groups: normalizedGroups,
    projects: [...groupedProjects, ...list.filter((workspace) => !groupedWorkspaceIds.has(workspace.workspaceId))]
  };
}

function resolveProjectWorkspaceId(projectId, projects) {
  const project = (projects || []).find((item) => item.workspaceId === projectId);
  return project?.advancedGroup ? project.primaryWorkspaceId : projectId;
}

function upsertProjectGroup(groups, group, workspaces) {
  const withoutCurrent = (groups || []).filter((item) => item?.id !== group?.id);
  return normalizeProjectGroups([...withoutCurrent, group], workspaces);
}

function removeProjectGroup(groups, groupId) {
  return (groups || []).filter((group) => group?.id !== groupId);
}

module.exports = {
  GROUP_PREFIX,
  PROJECT_GROUP_SCHEMA_VERSION,
  composeProjectGroups,
  createProjectGroupManifest,
  normalizeProjectGroups,
  readProjectGroupManifest,
  removeProjectGroup,
  resolveProjectWorkspaceId,
  upsertProjectGroup
};
