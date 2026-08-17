window.__ModuleLoader__.load({ id: 'dsh-projects', factory: (require) => { var module = { exports: {} }; var exports = module.exports;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// src/core/default-workspace.cjs
var require_default_workspace = __commonJS({
  "src/core/default-workspace.cjs"(exports2, module2) {
    var DEFAULT_ROOT_KEY = "dsh-projects:default-root:v2";
    var LEGACY_WORKSPACE_KEY = "dsh-projects:default-workspace-id:v1";
    function normalizePath(value) {
      return String(value || "").replace(/[\\/]+$/, "").toLowerCase();
    }
    function localDateSegment(date) {
      return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
      ].join("-");
    }
    function nextSessionFolderName(entries) {
      const names = new Set((entries || []).map((entry) => String(entry.name || "").toLowerCase()));
      let suffix = 1;
      while (names.has((suffix === 1 ? "new-chat" : `new-chat-${suffix}`).toLowerCase())) suffix += 1;
      return suffix === 1 ? "new-chat" : `new-chat-${suffix}`;
    }
    function isPathInside(path, root) {
      const normalized = normalizePath(path);
      const normalizedRoot = normalizePath(root);
      if (!normalized || !normalizedRoot) return false;
      return normalized === normalizedRoot || normalized.startsWith(`${normalizedRoot}\\`) || normalized.startsWith(`${normalizedRoot}/`);
    }
    function isPortableDefaultPath(path) {
      return /[\\/]documents[\\/]dsh-default[\\/]\d{4}-\d{2}-\d{2}[\\/]new-chat(?:-\d+)?$/i.test(String(path || ""));
    }
    function safeGet(storage, key) {
      try {
        return storage?.getItem(key) || "";
      } catch {
        return "";
      }
    }
    function safeSet(storage, key, value) {
      try {
        storage?.setItem(key, value);
      } catch {
      }
    }
    function isAllocatedDefaultWorkspace(value) {
      return value !== null && typeof value === "object" && typeof value.path === "string" && typeof value.root === "string";
    }
    function unwrapDefaultWorkspaceResult2(result) {
      if (isAllocatedDefaultWorkspace(result)) return result;
      if (result !== null && typeof result === "object" && result.ok === true) {
        if (isAllocatedDefaultWorkspace(result.value)) return result.value;
        throw new Error("default workspace bridge returned an invalid success result");
      }
      if (result !== null && typeof result === "object" && result.ok === false) {
        throw new Error(typeof result.error?.message === "string" ? result.error.message : "default workspace bridge failed");
      }
      throw new Error("default workspace bridge returned an invalid result");
    }
    function createDefaultWorkspaceManager2({
      workspaces,
      storage,
      now = () => /* @__PURE__ */ new Date(),
      documentsDirectoryName = "Documents",
      rootDirectoryName = "DSH-Default",
      maxAttempts = 1e3
    }) {
      if (!workspaces) throw new TypeError("workspaces service is required");
      const ensureDirectory = async (parent, name2) => {
        const listing = await workspaces.listDirectory(parent);
        const existing = (listing.entries || []).find(
          (entry) => String(entry.name || "").toLowerCase() === name2.toLowerCase()
        );
        if (existing) return existing.path;
        return workspaces.createDirectory(listing.path, name2);
      };
      const resolveRoot = async () => {
        const home = await workspaces.listDirectory();
        const documents = await ensureDirectory(home.path, documentsDirectoryName);
        const root = await ensureDirectory(documents, rootDirectoryName);
        safeSet(storage, DEFAULT_ROOT_KEY, root);
        return root;
      };
      const allocateSessionRoot = async () => {
        const root = await resolveRoot();
        const dateRoot = await ensureDirectory(root, localDateSegment(now()));
        for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
          const listing = await workspaces.listDirectory(dateRoot);
          const name2 = nextSessionFolderName(listing.entries);
          try {
            return await workspaces.createDirectory(listing.path, name2);
          } catch (reason) {
            if (attempt === maxAttempts - 1) throw reason;
          }
        }
        throw new Error("could not allocate a default task folder");
      };
      const isDefaultWorkspace = (workspace) => {
        if (!workspace) return false;
        const legacyId = safeGet(storage, LEGACY_WORKSPACE_KEY);
        const storedRoot = safeGet(storage, DEFAULT_ROOT_KEY);
        return Boolean(legacyId && workspace.workspaceId === legacyId) || isPathInside(workspace.path, storedRoot) || isPortableDefaultPath(workspace.path);
      };
      const rememberRoot = (root) => {
        if (typeof root === "string" && root) safeSet(storage, DEFAULT_ROOT_KEY, root);
      };
      return { allocateSessionRoot, isDefaultWorkspace, rememberRoot, resolveRoot };
    }
    module2.exports = {
      DEFAULT_ROOT_KEY,
      LEGACY_WORKSPACE_KEY,
      createDefaultWorkspaceManager: createDefaultWorkspaceManager2,
      isPathInside,
      isPortableDefaultPath,
      localDateSegment,
      nextSessionFolderName,
      normalizePath,
      unwrapDefaultWorkspaceResult: unwrapDefaultWorkspaceResult2
    };
  }
});

// src/core/native-picker-result.cjs
var require_native_picker_result = __commonJS({
  "src/core/native-picker-result.cjs"(exports2, module2) {
    function isDirectoryPathResult(value) {
      return value !== null && typeof value === "object" && (typeof value.path === "string" || value.path === null);
    }
    function unwrapNativeDirectoryResult2(result) {
      if (isDirectoryPathResult(result)) return result.path;
      if (result !== null && typeof result === "object" && result.ok === true) {
        if (isDirectoryPathResult(result.value)) return result.value.path;
        throw new Error("native directory bridge returned an invalid success result");
      }
      if (result !== null && typeof result === "object" && result.ok === false) {
        const message = typeof result.error?.message === "string" ? result.error.message : "native directory bridge failed";
        throw new Error(message);
      }
      throw new Error("native directory bridge returned an invalid result");
    }
    module2.exports = { unwrapNativeDirectoryResult: unwrapNativeDirectoryResult2 };
  }
});

// src/client.cjs
var React = require("react");
var ReactDOM = require("react-dom");
var { createDefaultWorkspaceManager, unwrapDefaultWorkspaceResult } = require_default_workspace();
var { unwrapNativeDirectoryResult } = require_native_picker_result();
var h = React.createElement;
var NS = "dsh-projects";
var dictionaries = {
  zh: {
    selectProject: "\u9009\u62E9\u9879\u76EE",
    searchProjects: "\u641C\u7D22\u9879\u76EE",
    newProject: "\u65B0\u5EFA\u9879\u76EE",
    createProject: "\u521B\u5EFA\u9879\u76EE",
    projectName: "\u9879\u76EE\u540D\u79F0",
    sourceFolder: "\u6E90\u6587\u4EF6\u5939",
    addSourceFolder: "\u6DFB\u52A0 DSH \u53EF\u8BFB\u53D6\u548C\u7F16\u8F91\u7684\u6587\u4EF6\u5939",
    changeFolder: "\u66F4\u6362\u6587\u4EF6\u5939",
    cancel: "\u53D6\u6D88",
    creating: "\u6B63\u5728\u521B\u5EFA\u2026",
    choosing: "\u6B63\u5728\u6253\u5F00\u2026",
    projects: "\u9879\u76EE",
    recent: "\u6700\u8FD1",
    newSession: "\u65B0\u4F1A\u8BDD",
    noProjects: "\u8FD8\u6CA1\u6709\u9879\u76EE",
    noMatches: "\u6CA1\u6709\u5339\u914D\u7684\u9879\u76EE",
    needName: "\u8BF7\u8F93\u5165\u9879\u76EE\u540D\u79F0\u3002",
    needFolder: "\u8BF7\u9009\u62E9\u6E90\u6587\u4EF6\u5939\u3002",
    duplicateName: "\u5DF2\u6709\u540C\u540D\u9879\u76EE\uFF0C\u8BF7\u6362\u4E00\u4E2A\u540D\u79F0\u3002",
    duplicateFolder: "\u8FD9\u4E2A\u6587\u4EF6\u5939\u5DF2\u7ECF\u5C5E\u4E8E\u9879\u76EE\u201C{name}\u201D\u3002",
    createFailed: "\u521B\u5EFA\u9879\u76EE\u5931\u8D25\uFF1A{message}",
    pickFailed: "\u9009\u62E9\u6587\u4EF6\u5939\u5931\u8D25\uFF1A{message}",
    showMore: "\u663E\u793A\u66F4\u591A",
    showLess: "\u6536\u8D77",
    organizeSidebar: "\u6574\u7406\u4FA7\u8FB9\u680F",
    byProject: "\u6309\u9879\u76EE",
    inOneList: "\u5728\u4E00\u4E2A\u5217\u8868\u4E2D",
    chatOrder: "\u804A\u5929\u6392\u5E8F\u65B9\u5F0F",
    priority: "\u4F18\u5148\u7EA7",
    recentlyUpdated: "\u6700\u8FD1\u66F4\u65B0",
    manualOrder: "\u624B\u52A8\u6392\u5E8F",
    chats: "\u804A\u5929",
    pinProject: "\u7F6E\u9876\u9879\u76EE",
    unpinProject: "\u53D6\u6D88\u7F6E\u9876\u9879\u76EE",
    favoriteProject: "\u6536\u85CF\u9879\u76EE",
    unfavoriteProject: "\u53D6\u6D88\u6536\u85CF",
    pinChat: "\u7F6E\u9876\u804A\u5929",
    unpinChat: "\u53D6\u6D88\u7F6E\u9876\u804A\u5929",
    openExplorer: "\u5728\u6587\u4EF6\u7BA1\u7406\u5668\u4E2D\u6253\u5F00",
    editProject: "\u7F16\u8F91\u9879\u76EE",
    archiveChats: "\u5F52\u6863\u804A\u5929",
    archiveChat: "\u5F52\u6863\u804A\u5929",
    removeProject: "\u79FB\u9664\u672C\u5730\u9879\u76EE",
    editProjectTitle: "\u7F16\u8F91\u9879\u76EE",
    save: "\u4FDD\u5B58",
    removeProjectTitle: "\u79FB\u9664\u8FD9\u4E2A\u9879\u76EE\uFF1F",
    removeProjectHint: "\u53EA\u4F1A\u4ECE DSH \u7684\u9879\u76EE\u5217\u8868\u4E2D\u79FB\u9664\uFF0C\u4E0D\u4F1A\u5220\u9664\u6587\u4EF6\u5939\u6216\u804A\u5929\u8BB0\u5F55\u3002",
    archiveProjectTitle: "\u5F52\u6863\u8FD9\u4E2A\u9879\u76EE\u4E2D\u7684\u804A\u5929\uFF1F",
    archiveProjectHint: "\u9879\u76EE\u4F1A\u4FDD\u7559\uFF0C\u804A\u5929\u5C06\u4ECE\u4FA7\u8FB9\u680F\u9690\u85CF\u3002",
    confirmArchive: "\u5F52\u6863",
    taskCount: "{count} \u4E2A\u4EFB\u52A1",
    activeCount: "{count} \u4E2A\u5DF2\u5F00\u542F",
    noChats: "\u8FD9\u4E2A\u9879\u76EE\u8FD8\u6CA1\u6709\u804A\u5929",
    actionFailed: "\u64CD\u4F5C\u5931\u8D25\uFF1A{message}",
    newProjectShort: "\u6DFB\u52A0\u9879\u76EE",
    favorite: "\u5DF2\u6536\u85CF",
    chooseProjectFolder: "\u9009\u62E9\u9879\u76EE\u6587\u4EF6\u5939",
    currentFolder: "\u5F53\u524D\u6587\u4EF6\u5939",
    selectThisFolder: "\u9009\u62E9\u6B64\u6587\u4EF6\u5939",
    folderEmpty: "\u8FD9\u4E2A\u6587\u4EF6\u5939\u4E2D\u6CA1\u6709\u5B50\u6587\u4EF6\u5939",
    folderLoading: "\u6B63\u5728\u8BFB\u53D6\u6587\u4EF6\u5939\u2026",
    hiddenFolders: "\u663E\u793A\u9690\u85CF\u6587\u4EF6\u5939",
    globalSearch: "\u5168\u5C40\u641C\u7D22",
    searchEverything: "\u641C\u7D22\u9879\u76EE\u3001\u804A\u5929\u548C\u804A\u5929\u5185\u5BB9",
    searching: "\u6B63\u5728\u641C\u7D22\u2026",
    searchUnavailable: "\u804A\u5929\u5185\u5BB9\u641C\u7D22\u6682\u65F6\u4E0D\u53EF\u7528",
    searchMore: "\u7ED3\u679C\u8F83\u591A\uFF0C\u8BF7\u8F93\u5165\u66F4\u7CBE\u786E\u7684\u5173\u952E\u8BCD",
    projectResult: "\u9879\u76EE",
    chatResult: "\u804A\u5929",
    archiveCenter: "\u5F52\u6863\u4E2D\u5FC3",
    archivedChats: "\u5DF2\u5F52\u6863\u804A\u5929",
    noArchivedChats: "\u8FD8\u6CA1\u6709\u5DF2\u5F52\u6863\u7684\u804A\u5929",
    restore: "\u6062\u590D",
    restoring: "\u6B63\u5728\u6062\u590D\u2026",
    restoreFailed: "\u6062\u590D\u5931\u8D25\uFF1A{message}",
    restoreUnavailable: "\u5F53\u524D DSH \u7248\u672C\u6CA1\u6709\u516C\u5F00\u53D6\u6D88\u5F52\u6863\u63A5\u53E3\uFF1B\u4F60\u4ECD\u53EF\u4EE5\u67E5\u770B\u5F52\u6863\u5185\u5BB9\uFF0C\u4F46\u6682\u65F6\u4E0D\u80FD\u4ECE\u8FD9\u91CC\u6062\u590D\u3002",
    normalChat: "\u666E\u901A\u5BF9\u8BDD",
    normalChatHint: "\u4E0D\u52A0\u5165\u9879\u76EE\uFF0C\u4F7F\u7528\u9ED8\u8BA4\u4EFB\u52A1\u6587\u4EF6\u5939",
    startingChat: "\u6B63\u5728\u521B\u5EFA\u666E\u901A\u5BF9\u8BDD\u2026",
    defaultChatFailed: "\u666E\u901A\u5BF9\u8BDD\u521B\u5EFA\u5931\u8D25\uFF1A{message}"
  },
  en: {
    selectProject: "Select project",
    searchProjects: "Search projects",
    newProject: "New project",
    createProject: "Create project",
    projectName: "Project name",
    sourceFolder: "Source folder",
    addSourceFolder: "Add a folder DSH can read and edit",
    changeFolder: "Change folder",
    cancel: "Cancel",
    creating: "Creating\u2026",
    choosing: "Opening\u2026",
    projects: "Projects",
    recent: "Recent",
    newSession: "New session",
    noProjects: "No projects yet",
    noMatches: "No matching projects",
    needName: "Enter a project name.",
    needFolder: "Choose a source folder.",
    duplicateName: "A project with this name already exists.",
    duplicateFolder: "This folder already belongs to \u201C{name}\u201D.",
    createFailed: "Could not create project: {message}",
    pickFailed: "Could not choose folder: {message}",
    showMore: "Show more",
    showLess: "Show less",
    organizeSidebar: "Organize sidebar",
    byProject: "By project",
    inOneList: "In one list",
    chatOrder: "Chat ordering",
    priority: "Priority",
    recentlyUpdated: "Recently updated",
    manualOrder: "Manual order",
    chats: "Chats",
    pinProject: "Pin project",
    unpinProject: "Unpin project",
    favoriteProject: "Favorite project",
    unfavoriteProject: "Remove favorite",
    pinChat: "Pin chat",
    unpinChat: "Unpin chat",
    openExplorer: "Open in file manager",
    editProject: "Edit project",
    archiveChats: "Archive chats",
    archiveChat: "Archive chat",
    removeProject: "Remove local project",
    editProjectTitle: "Edit project",
    save: "Save",
    removeProjectTitle: "Remove this project?",
    removeProjectHint: "This only removes the project from DSH. Its folder and chat history stay on disk.",
    archiveProjectTitle: "Archive this project's chats?",
    archiveProjectHint: "The project stays available; its chats are hidden from the sidebar.",
    confirmArchive: "Archive",
    taskCount: "{count} tasks",
    activeCount: "{count} active",
    noChats: "No chats in this project",
    actionFailed: "Action failed: {message}",
    newProjectShort: "Add project",
    favorite: "Favorited",
    chooseProjectFolder: "Choose project folder",
    currentFolder: "Current folder",
    selectThisFolder: "Select this folder",
    folderEmpty: "No subfolders here",
    folderLoading: "Loading folders\u2026",
    hiddenFolders: "Show hidden folders",
    globalSearch: "Global search",
    searchEverything: "Search projects, chats, and chat content",
    searching: "Searching\u2026",
    searchUnavailable: "Chat content search is temporarily unavailable",
    searchMore: "More results exist. Refine your search.",
    projectResult: "Project",
    chatResult: "Chat",
    archiveCenter: "Archive center",
    archivedChats: "Archived chats",
    noArchivedChats: "No archived chats yet",
    restore: "Restore",
    restoring: "Restoring\u2026",
    restoreFailed: "Could not restore: {message}",
    restoreUnavailable: "This DSH version does not expose an unarchive API. Archived chats remain visible here, but cannot be restored from this panel.",
    normalChat: "Regular chat",
    normalChatHint: "No project; use the default task folder",
    startingChat: "Starting regular chat\u2026",
    defaultChatFailed: "Could not start regular chat: {message}"
  }
};
var css = `
      .dshp-menu,.dshp-modal,.dshp-sidebar,.dshp-context,.dshp-hover-preview{--dshp-text:var(--dsw-alias-label-primary,#1f2023);--dshp-text-2:var(--dsw-alias-label-secondary,#555b66);--dshp-text-3:var(--dsw-alias-label-tertiary,#777e89);--dshp-hover:var(--dsw-alias-interactive-bg-hover,rgba(38,49,72,.06));--dshp-selected:var(--dsw-specific-sidebar-nav-item-active,var(--dsw-alias-interactive-bg-active,rgba(38,49,72,.1)));--dshp-elevated:var(--dsw-specific-menu,var(--dsw-alias-bg-layer-3,#fff));--dshp-surface:var(--dsw-alias-bg-layer-2,#f7f8fa);--dshp-input:var(--dsw-specific-input-major,var(--dsw-alias-bg-layer-2,#fff));--dshp-border:var(--dsw-alias-border-l2,rgba(38,49,72,.12));--dshp-border-strong:var(--dsw-alias-border-l3,rgba(38,49,72,.18));font-family:inherit;color:var(--dshp-text)}
      .dshp-menu,.dshp-context,.dshp-hover-preview{box-sizing:border-box}
      .dshp-menu{position:fixed;z-index:10010;width:276px;max-height:min(388px,calc(100vh - 20px));overflow:hidden;border:1px solid var(--dshp-border);border-radius:13px;background:var(--dshp-elevated);box-shadow:var(--dsw-shadow-lv3,0 12px 32px rgba(0,0,0,.12));padding:7px;display:flex;flex-direction:column;gap:4px}
      .dshp-search{display:flex;align-items:center;height:36px;gap:9px;padding:0 9px;color:var(--dshp-text-3);border-radius:9px}
      .dshp-search input{min-width:0;flex:1;border:0;outline:0;background:transparent;color:var(--dshp-text);font:inherit;font-size:13px;line-height:19px}
      .dshp-search input::placeholder{color:var(--dshp-text-3)}
      .dshp-list{min-height:0;overflow:auto;display:flex;flex-direction:column;gap:2px}
      .dshp-project-item,.dshp-new-item{box-sizing:border-box;width:100%;height:36px;border:0;border-radius:9px;background:transparent;color:inherit;display:flex;align-items:center;gap:10px;padding:0 9px;text-align:left;font:inherit;font-size:14px;cursor:pointer}
      .dshp-project-item:hover,.dshp-project-item[data-selected=true],.dshp-new-item:hover{background:var(--dshp-selected)}
      .dshp-project-item span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .dshp-default-item{height:auto;min-height:48px;align-items:flex-start;padding-top:7px;padding-bottom:7px}
      .dshp-default-copy{min-width:0;display:flex;flex-direction:column;gap:1px}
      .dshp-default-title{font-size:13.5px;line-height:18px;color:var(--dshp-text)}
      .dshp-default-hint{font-size:11.5px;line-height:16px;color:var(--dshp-text-3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .dshp-menu-empty{padding:14px 10px;color:var(--dshp-text-3);font-size:12.5px;text-align:center}
      .dshp-menu-footer{border-top:1px solid var(--dshp-border);padding-top:5px;margin-top:2px}
      .dshp-backdrop{position:fixed;inset:0;z-index:10020;background:var(--dsw-alias-bg-mask-1,rgba(0,0,0,.5));display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(1px)}
      .dshp-modal{box-sizing:border-box;width:min(520px,calc(100vw - 28px));border:1px solid var(--dshp-border);border-radius:18px;background:var(--dshp-elevated);box-shadow:var(--dsw-shadow-lv3,0 18px 56px rgba(0,0,0,.2));padding:22px}
      .dshp-modal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
      .dshp-modal-title{margin:0;font-size:21px;line-height:28px;font-weight:650;letter-spacing:-.015em}
      .dshp-icon-button{width:30px;height:30px;border:0;border-radius:8px;background:transparent;color:var(--dshp-text-2);display:flex;align-items:center;justify-content:center;cursor:pointer}
      .dshp-icon-button:hover{background:var(--dshp-hover);color:var(--dshp-text)}
      .dshp-name-field{height:42px;border:1px solid var(--dshp-border);border-radius:11px;display:flex;align-items:center;overflow:hidden;margin-bottom:16px;background:var(--dshp-input)}
      .dshp-name-field:focus-within{border-color:var(--dsw-alias-state-business-primary,#4d86da);box-shadow:0 0 0 1px color-mix(in srgb,var(--dsw-alias-state-business-primary,#4d86da) 18%,transparent)}
      .dshp-name-icon{height:100%;width:44px;display:flex;align-items:center;justify-content:center;border-right:1px solid var(--dshp-border);color:var(--dshp-text-2)}
      .dshp-name-field input{min-width:0;flex:1;height:100%;box-sizing:border-box;border:0;outline:0;background:transparent;color:inherit;padding:0 12px;font:inherit;font-size:14px}
      .dshp-label{font-size:14px;font-weight:600;margin:0 0 9px}
      .dshp-folder-card{box-sizing:border-box;width:100%;min-height:102px;border:1px solid var(--dshp-border);border-radius:12px;background:var(--dshp-surface);color:inherit;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:15px;cursor:pointer;font:inherit}
      .dshp-folder-card:hover{background:var(--dshp-hover);border-color:var(--dshp-border-strong)}
      .dshp-folder-card[data-picked=true]{align-items:flex-start;text-align:left;min-height:82px}
      .dshp-folder-path{max-width:100%;font-size:13.5px;line-height:19px;overflow-wrap:anywhere;color:var(--dshp-text)}
      .dshp-folder-hint{font-size:12.5px;color:var(--dshp-text-3)}
      .dshp-error{min-height:17px;margin-top:7px;color:var(--dsw-alias-state-error-primary,#d83b3b);font-size:11.5px;line-height:17px}
      .dshp-modal-actions{display:flex;justify-content:flex-end;gap:9px;margin-top:11px}
      .dshp-button{height:36px;border-radius:10px;padding:0 17px;border:1px solid var(--dshp-border);background:transparent;color:inherit;font:inherit;font-size:13.5px;cursor:pointer}
      .dshp-button:hover:not(:disabled){background:var(--dshp-hover)}
      .dshp-button-primary{border-color:transparent;background:var(--dsw-alias-button-primary-fill,#202124);color:var(--dsw-alias-label-primary-foreground,#fff)}
      .dshp-button-primary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover,#34363a)}
      .dshp-button:disabled{opacity:.42;cursor:not-allowed}
      .dshp-sidebar{box-sizing:border-box;width:100%;min-height:0;flex:1;display:flex;flex-direction:column;overflow:hidden;padding:4px 9px 14px 9px}
      .dshp-sidebar-scroll{box-sizing:border-box;width:100%;min-height:0;overflow-y:auto;padding-right:2px;scrollbar-width:thin;scrollbar-color:var(--dsw-alias-scrollbar-bg-l1,#a7abb2) transparent}
      .dshp-section-title{height:30px;display:flex;align-items:center;padding:0 8px;color:var(--dshp-text-3);font-size:12px;font-weight:650;letter-spacing:.015em}
      .dshp-section-title.dshp-recent{margin-top:15px}
      .dshp-project-block{margin-bottom:7px}
      .dshp-sidebar-project,.dshp-sidebar-session{box-sizing:border-box;width:100%;border:0;background:transparent;color:inherit;text-align:left;font:inherit;cursor:pointer;display:flex;align-items:center;border-radius:9px;transition:background-color 100ms ease,color 100ms ease}
      .dshp-sidebar-project{height:34px;gap:10px;padding:0 9px;font-size:14px;font-weight:520;color:var(--dshp-text)}
      .dshp-sidebar-session{min-height:32px;padding:5px 9px 5px 42px;font-size:13.5px;color:var(--dshp-text-2);line-height:20px;position:relative}
      .dshp-sidebar-project:hover,.dshp-sidebar-session:hover{background:var(--dshp-hover)}
      .dshp-sidebar-session[data-current=true]{background:var(--dshp-selected);color:var(--dshp-text)}
      .dshp-sidebar-project span,.dshp-sidebar-session span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .dshp-sidebar-session .dshp-running{position:absolute;left:25px;width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-state-business-primary,#4d86da);box-shadow:0 0 0 2px color-mix(in srgb,var(--dsw-alias-state-business-primary,#4d86da) 14%,transparent)}
      .dshp-more{height:28px;border:0;background:transparent;color:var(--dshp-text-3);font:inherit;font-size:12px;padding:0 9px 0 42px;cursor:pointer}
      .dshp-more:hover{color:var(--dshp-text-2)}
      .dshp-sidebar-empty{padding:10px 9px;color:var(--dshp-text-3);font-size:12.5px}
      .dshp-section-head{box-sizing:border-box;width:100%;height:34px;display:flex;align-items:center;padding:0 4px 0 8px;margin-bottom:4px;color:var(--dshp-text-3)}
      .dshp-section-head .dshp-section-title{padding:0;flex:1;height:auto}
      .dshp-section-actions{display:flex;align-items:center;gap:1px}
      .dshp-mini-button{width:28px;height:28px;border:0;border-radius:8px;background:transparent;color:var(--dshp-text-3);display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;transition:background-color 100ms ease,color 100ms ease}
      .dshp-mini-button:hover,.dshp-mini-button[data-active=true]{background:var(--dshp-hover);color:var(--dshp-text)}
      .dshp-project-row,.dshp-session-wrap{box-sizing:border-box;width:100%;position:relative}
      .dshp-project-row[data-drag-over=before],.dshp-session-wrap[data-drag-over=before]{box-shadow:inset 0 2px var(--dsw-alias-state-business-primary,#78a7f5)}
      .dshp-project-row[data-drag-over=after],.dshp-session-wrap[data-drag-over=after]{box-shadow:inset 0 -2px var(--dsw-alias-state-business-primary,#78a7f5)}
      .dshp-project-actions,.dshp-session-actions{position:absolute;right:4px;top:50%;transform:translateY(-50%);display:none;align-items:center;gap:1px}
      .dshp-project-row:hover .dshp-project-actions,.dshp-project-row[data-menu-open=true] .dshp-project-actions,.dshp-session-wrap:hover .dshp-session-actions,.dshp-session-wrap[data-pinned=true] .dshp-session-actions{display:flex}
      .dshp-sidebar-project,.dshp-sidebar-session{padding-right:10px}
      .dshp-project-row:hover .dshp-sidebar-project,.dshp-project-row[data-menu-open=true] .dshp-sidebar-project,.dshp-session-wrap:hover .dshp-sidebar-session{padding-right:68px}
      .dshp-session-wrap[data-pinned=true]:not(:hover) .dshp-sidebar-session{padding-right:38px}
      .dshp-session-wrap[data-pinned=true]:not(:hover) .dshp-session-actions .dshp-mini-button:last-child{display:none}
      .dshp-context{position:fixed;z-index:10030;width:250px;border:1px solid var(--dshp-border);border-radius:13px;background:var(--dshp-elevated);box-shadow:var(--dsw-shadow-lv3,0 12px 32px rgba(0,0,0,.16));padding:7px}
      .dshp-context-label{padding:6px 10px 5px;color:var(--dshp-text-3);font-size:12px;font-weight:600}
      .dshp-context-separator{height:1px;background:var(--dshp-border);margin:5px 4px}
      .dshp-context-item{box-sizing:border-box;width:100%;min-height:36px;border:0;border-radius:9px;background:transparent;color:inherit;display:flex;align-items:center;gap:10px;padding:7px 10px;text-align:left;font:inherit;font-size:14px;line-height:20px;cursor:pointer}
      .dshp-context-item:hover{background:var(--dshp-selected)}
      .dshp-context-item[data-danger=true]{color:var(--dsw-alias-state-error-primary,#d83b3b)}
      .dshp-context-item .dshp-check{width:17px;display:flex;justify-content:center;flex:none;color:var(--dshp-text-2)}
      .dshp-hover-preview{position:fixed;z-index:10008;box-sizing:border-box;width:316px;max-width:calc(100vw - 24px);border:1px solid var(--dshp-border);border-radius:13px;background:var(--dshp-elevated);box-shadow:var(--dsw-shadow-lv3,0 12px 32px rgba(0,0,0,.16));padding:14px;pointer-events:none}
      .dshp-preview-title{font-size:14.5px;font-weight:600;line-height:21px;letter-spacing:-.006em;display:-webkit-box;-webkit-line-clamp:5;-webkit-box-orient:vertical;overflow:hidden}
      .dshp-preview-time{float:right;margin-left:10px;color:var(--dshp-text-3);font-size:11.5px;font-weight:400}
      .dshp-preview-meta{margin-top:12px;padding-top:10px;border-top:1px solid var(--dshp-border);display:flex;align-items:center;gap:8px;color:var(--dshp-text-2);font-size:12.5px;min-width:0}
      .dshp-preview-meta span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .dshp-preview-stats{display:flex;gap:7px;color:var(--dshp-text-2);font-size:12.5px;margin-top:9px}
      .dshp-small-modal{width:min(430px,calc(100vw - 28px))}
      .dshp-confirm-copy{color:var(--dshp-text-2);font-size:13.5px;line-height:20px;margin:-3px 0 4px}
      .dshp-dir-modal{width:min(560px,calc(100vw - 28px));padding:18px}
      .dshp-dir-crumbs{display:flex;align-items:center;gap:2px;min-height:34px;margin:-3px 0 10px;overflow-x:auto;scrollbar-width:none}
      .dshp-dir-crumbs::-webkit-scrollbar{display:none}
      .dshp-dir-crumb{height:30px;border:0;border-radius:8px;background:transparent;color:var(--dshp-text-2);font:inherit;font-size:12.5px;white-space:nowrap;padding:0 8px;cursor:pointer}
      .dshp-dir-crumb:hover,.dshp-dir-crumb[data-current=true]{background:var(--dshp-hover);color:var(--dshp-text)}
      .dshp-dir-separator{color:var(--dshp-text-3);font-size:12px}
      .dshp-dir-list{box-sizing:border-box;height:280px;border:1px solid var(--dshp-border);border-radius:12px;background:var(--dshp-surface);padding:6px;overflow-y:auto}
      .dshp-dir-row{box-sizing:border-box;width:100%;height:36px;border:0;border-radius:9px;background:transparent;color:var(--dshp-text);display:flex;align-items:center;gap:10px;padding:0 10px;text-align:left;font:inherit;font-size:13.5px;cursor:pointer}
      .dshp-dir-row:hover{background:var(--dshp-hover)}
      .dshp-dir-status{height:100%;display:flex;align-items:center;justify-content:center;color:var(--dshp-text-3);font-size:12.5px;text-align:center;padding:18px}
      .dshp-dir-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:12px}
      .dshp-dir-hidden{display:flex;align-items:center;gap:7px;color:var(--dshp-text-3);font-size:12px;cursor:pointer;user-select:none}
      .dshp-dir-path{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dshp-text-3);font-size:11.5px;margin-top:8px}
      .dshp-action-error{padding:7px 8px;color:var(--dsw-alias-state-error-primary,#ff8a80);font-size:11px;line-height:16px}
      .dshp-flat-project{margin-left:8px;color:var(--dshp-text-3);font-size:11.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .dshp-sidebar[data-dragging=true] *{cursor:grabbing!important}
      .dshp-sidebar-search{margin:0 4px 7px;height:34px;border:1px solid var(--dshp-border);border-radius:9px;background:var(--dshp-input);display:flex;align-items:center;gap:7px;padding:0 8px;color:var(--dshp-text-3)}
      .dshp-sidebar-search:focus-within{border-color:var(--dsw-alias-state-business-primary,#4d86da);box-shadow:0 0 0 1px color-mix(in srgb,var(--dsw-alias-state-business-primary,#4d86da) 14%,transparent)}
      .dshp-sidebar-search input{min-width:0;flex:1;border:0;outline:0;background:transparent;color:var(--dshp-text);font:inherit;font-size:12px;line-height:18px}
      .dshp-sidebar-search input::placeholder{color:var(--dshp-text-3)}
      .dshp-search-results{display:flex;flex-direction:column;gap:2px;padding:0 2px 12px}
      .dshp-result-group{padding:8px 8px 3px;color:var(--dshp-text-3);font-size:11.5px;font-weight:650}
      .dshp-search-result{box-sizing:border-box;width:100%;min-height:48px;border:0;border-radius:9px;background:transparent;color:inherit;display:flex;align-items:flex-start;gap:9px;padding:8px;text-align:left;font:inherit;cursor:pointer}
      .dshp-search-result:hover{background:var(--dshp-hover)}
      .dshp-search-result-icon{color:var(--dshp-text-2);padding-top:1px;flex:none}
      .dshp-search-result-copy{min-width:0;flex:1}
      .dshp-search-result-title{font-size:13.5px;line-height:18px;color:var(--dshp-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .dshp-search-result-meta,.dshp-search-result-snippet{font-size:11.5px;line-height:16px;color:var(--dshp-text-3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .dshp-search-status{padding:12px 9px;color:var(--dshp-text-3);font-size:12px;line-height:18px}
      .dshp-archive-modal{width:min(560px,calc(100vw - 28px));padding:20px}
      .dshp-archive-list{max-height:min(420px,calc(100vh - 220px));overflow-y:auto;display:flex;flex-direction:column;gap:3px;margin:0 -5px;padding:0 5px}
      .dshp-archive-row{display:flex;align-items:center;gap:10px;min-height:52px;border-radius:10px;padding:7px 8px}
      .dshp-archive-row:hover{background:var(--dshp-hover)}
      .dshp-archive-copy{min-width:0;flex:1}
      .dshp-archive-title{font-size:13.5px;line-height:19px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .dshp-archive-meta{font-size:11.5px;line-height:17px;color:var(--dshp-text-3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .dshp-restore-button{height:30px;border:1px solid var(--dshp-border);border-radius:8px;background:transparent;color:var(--dshp-text-2);font:inherit;font-size:12.5px;padding:0 11px;cursor:pointer;flex:none}
      .dshp-restore-button:hover:not(:disabled){background:var(--dsw-alias-button-primary-fill,#202124);color:var(--dsw-alias-label-primary-foreground,#fff);border-color:transparent}
      .dshp-restore-button:disabled{opacity:.45;cursor:wait}
      .dshp-rail{padding:8px 0;align-items:center}
      .dshp-rail-button{width:38px;height:38px;border:0;border-radius:10px;background:transparent;color:var(--dshp-text);display:flex;align-items:center;justify-content:center;cursor:pointer;margin-bottom:6px}
      .dshp-rail-button:hover{background:var(--dshp-hover)}
      @media(max-width:620px){.dshp-modal{width:calc(100vw - 24px);padding:18px;border-radius:15px}.dshp-modal-title{font-size:19px}.dshp-menu{width:min(276px,calc(100vw - 20px))}}
    `;
function installStyles() {
  let tag = document.querySelector('style[data-plugin-css="dsh-projects"]');
  if (!tag) {
    tag = document.createElement("style");
    tag.dataset.pluginCss = "dsh-projects";
    document.head.appendChild(tag);
  }
  tag.textContent = css;
}
function installProjectCopyBridge() {
  const rewrite = () => {
    for (const button of document.querySelectorAll('button[aria-label="\u9009\u62E9\u5DE5\u4F5C\u533A"],button[aria-label="Choose workspace"]')) {
      const chinese = button.getAttribute("aria-label") === "\u9009\u62E9\u5DE5\u4F5C\u533A";
      button.setAttribute("aria-label", chinese ? "\u9009\u62E9\u9879\u76EE" : "Select project");
      for (const span of button.querySelectorAll("span")) {
        if (span.textContent === "\u9009\u62E9\u5DE5\u4F5C\u533A") span.textContent = "\u9009\u62E9\u9879\u76EE";
        if (span.textContent === "Choose workspace") span.textContent = "Select project";
      }
    }
    for (const input of document.querySelectorAll('textarea[placeholder="\u9009\u62E9\u4E00\u4E2A\u5DE5\u4F5C\u533A\u5F00\u59CB"],input[placeholder="\u9009\u62E9\u4E00\u4E2A\u5DE5\u4F5C\u533A\u5F00\u59CB"],textarea[placeholder="Choose a workspace to start"],input[placeholder="Choose a workspace to start"]')) {
      input.setAttribute("placeholder", input.getAttribute("placeholder")?.startsWith("\u9009\u62E9") ? "\u9009\u62E9\u4E00\u4E2A\u9879\u76EE\u5F00\u59CB" : "Choose a project to start");
    }
  };
  rewrite();
  const observer = new MutationObserver(rewrite);
  observer.observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["aria-label", "placeholder"] });
  return () => observer.disconnect();
}
function Icon({ name: name2, size = 18 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true
  };
  const paths = {
    folder: [h("path", { key: 1, d: "M3.5 6.5h6l2 2h9v9.5a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2V8.5a2 2 0 0 1 2-2Z" })],
    search: [h("circle", { key: 1, cx: 10.5, cy: 10.5, r: 6.5 }), h("path", { key: 2, d: "m15.5 15.5 5 5" })],
    plus: [h("path", { key: 1, d: "M12 5v14M5 12h14" })],
    close: [h("path", { key: 1, d: "m6 6 12 12M18 6 6 18" })],
    folderPlus: [h("path", { key: 1, d: "M3.5 6.5h6l2 2h9v9.5a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2V8.5a2 2 0 0 1 2-2Z" }), h("path", { key: 2, d: "M15.5 12v5M13 14.5h5" })],
    ellipsis: [h("circle", { key: 1, cx: 5, cy: 12, r: 1 }), h("circle", { key: 2, cx: 12, cy: 12, r: 1 }), h("circle", { key: 3, cx: 19, cy: 12, r: 1 })],
    pin: [h("path", { key: 1, d: "m9 3 6 6-2 2 3 4-1 1-4-3-2 2-6-6 2-2 4 2 2-2-2-4Z" }), h("path", { key: 2, d: "m8 16-5 5" })],
    archive: [h("path", { key: 1, d: "M4 7h16v12H4zM3 4h18v3H3z" }), h("path", { key: 2, d: "M9 11h6" })],
    star: [h("path", { key: 1, d: "m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z" })],
    edit: [h("path", { key: 1, d: "M4 20h4l11-11-4-4L4 16z" }), h("path", { key: 2, d: "m13.5 6.5 4 4" })],
    compose: [h("rect", { key: 1, x: 4, y: 4, width: 15, height: 16, rx: 3 }), h("path", { key: 2, d: "M14.5 4.5 19.5 9.5 11 18H6v-5z" }), h("path", { key: 3, d: "m13 6 5 5" })],
    external: [h("path", { key: 1, d: "M14 4h6v6M20 4 11 13" }), h("path", { key: 2, d: "M19 14v5H5V5h5" })],
    check: [h("path", { key: 1, d: "m5 12 4 4L19 6" })],
    list: [h("path", { key: 1, d: "M8 6h12M8 12h12M8 18h12" }), h("circle", { key: 2, cx: 4, cy: 6, r: 1 }), h("circle", { key: 3, cx: 4, cy: 12, r: 1 }), h("circle", { key: 4, cx: 4, cy: 18, r: 1 })],
    chat: [h("path", { key: 1, d: "M4 4h16v12H8l-4 4z" })],
    restore: [h("path", { key: 1, d: "M4 8v5h5" }), h("path", { key: 2, d: "M5.5 12A7 7 0 1 0 7 6.5L4 9" })]
  };
  return h("svg", common, ...paths[name2] || paths.folder);
}
function format(t, key, vars = {}) {
  let text = t(key);
  for (const [name2, value] of Object.entries(vars)) text = text.replace(`{${name2}}`, String(value));
  return text;
}
function normalizedPath(value) {
  return String(value || "").replace(/[\\/]+$/, "").toLowerCase();
}
function sessionTitle(session, t) {
  return session.blank ? t("newSession") : session.displayTitle || session.title || t("newSession");
}
function projectUpdatedAt(project, sessions) {
  let latest = 0;
  for (const id of project.sessionIds || []) latest = Math.max(latest, sessions.byId[id]?.updatedAt || 0);
  return latest;
}
function DirectoryBrowserModal({ open, initialPath, listDirectory, onPick, onClose, t }) {
  const [listing, setListing] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [showHidden, setShowHidden] = React.useState(false);
  const requestRef = React.useRef(null);
  const load = React.useCallback(async (path) => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true);
    setError("");
    try {
      const next = await listDirectory(path || void 0, controller.signal);
      if (!controller.signal.aborted) setListing(next);
    } catch (reason) {
      if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [listDirectory]);
  React.useEffect(() => {
    if (!open) return;
    setListing(null);
    setError("");
    load(initialPath || void 0);
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      requestRef.current?.abort();
    };
  }, [open, initialPath, load, onClose]);
  if (!open) return null;
  const entries = (listing?.entries || []).filter((entry) => showHidden || !entry.hidden);
  return ReactDOM.createPortal(
    h(
      "div",
      { className: "dshp-backdrop", onMouseDown: (event) => {
        if (event.target === event.currentTarget) onClose();
      } },
      h(
        "section",
        { className: "dshp-modal dshp-dir-modal", role: "dialog", "aria-modal": true, "aria-label": t("chooseProjectFolder") },
        h(
          "div",
          { className: "dshp-modal-head" },
          h("h2", { className: "dshp-modal-title" }, t("chooseProjectFolder")),
          h("button", { type: "button", className: "dshp-icon-button", onClick: onClose, "aria-label": t("cancel") }, h(Icon, { name: "close", size: 19 }))
        ),
        h(
          "div",
          { className: "dshp-dir-crumbs" },
          ...(listing?.crumbs || []).flatMap((crumb, index, crumbs) => [
            index ? h("span", { key: `sep-${crumb.path}`, className: "dshp-dir-separator" }, "\u203A") : null,
            h("button", { key: crumb.path, type: "button", className: "dshp-dir-crumb", "data-current": index === crumbs.length - 1 ? "true" : "false", title: crumb.path, onClick: () => load(crumb.path) }, crumb.name)
          ]).filter(Boolean)
        ),
        h(
          "div",
          { className: "dshp-dir-list" },
          loading ? h("div", { className: "dshp-dir-status" }, t("folderLoading")) : error ? h("div", { className: "dshp-dir-status dshp-error", role: "alert" }, error) : entries.length ? entries.map((entry) => h("button", { key: entry.path, type: "button", className: "dshp-dir-row", title: entry.path, onClick: () => load(entry.path) }, h(Icon, { name: "folder", size: 18 }), h("span", null, entry.name))) : h("div", { className: "dshp-dir-status" }, t("folderEmpty"))
        ),
        listing ? h("div", { className: "dshp-dir-path", title: listing.path }, listing.path) : null,
        h(
          "div",
          { className: "dshp-dir-footer" },
          h("label", { className: "dshp-dir-hidden" }, h("input", { type: "checkbox", checked: showHidden, onChange: (event) => setShowHidden(event.target.checked) }), h("span", null, t("hiddenFolders"))),
          h(
            "div",
            { className: "dshp-modal-actions", style: { marginTop: 0 } },
            h("button", { type: "button", className: "dshp-button", onClick: onClose }, t("cancel")),
            h("button", { type: "button", className: "dshp-button dshp-button-primary", disabled: loading || !listing, onClick: () => listing && onPick(listing.path) }, t("selectThisFolder"))
          )
        )
      )
    ),
    document.body
  );
}
function CreateProjectModal({ open, projects, createWorkspace, renameWorkspace, pickDirectory, listDirectory, onCreated, onClose, t }) {
  const [name2, setName] = React.useState("");
  const [path, setPath] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [picking, setPicking] = React.useState(false);
  const [browserOpen, setBrowserOpen] = React.useState(false);
  const [error, setError] = React.useState("");
  const inputRef = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    setError("");
    const timer = setTimeout(() => inputRef.current?.focus(), 30);
    const onKey = (event) => {
      if (event.key === "Escape" && !busy && !picking) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, busy, picking, onClose]);
  const close = () => {
    if (busy || picking) return;
    setName("");
    setPath("");
    setBrowserOpen(false);
    setError("");
    onClose();
  };
  const adoptFolder = (selected) => {
    if (selected) {
      setPath(selected);
      if (!name2.trim()) {
        const parts = selected.replace(/[\\/]+$/, "").split(/[\\/]/);
        setName(parts[parts.length - 1] || "");
      }
    }
    setBrowserOpen(false);
    setPicking(false);
  };
  const chooseFolder = async () => {
    if (busy || picking) return;
    setPicking(true);
    setError("");
    try {
      const selected = await pickDirectory();
      adoptFolder(selected);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : String(reason);
      if (typeof listDirectory === "function" && /directory-picker-unavailable|needs the native capability|serves ["']browse["']/i.test(message)) {
        setBrowserOpen(true);
        return;
      }
      setError(format(t, "pickFailed", { message }));
      setPicking(false);
    }
  };
  const create = async () => {
    const title = name2.trim();
    if (!title) return setError(t("needName"));
    if (!path) return setError(t("needFolder"));
    const sameName = projects.find((project) => project.title.trim().toLowerCase() === title.toLowerCase());
    if (sameName) return setError(t("duplicateName"));
    const samePath = projects.find((project) => normalizedPath(project.path) === normalizedPath(path));
    if (samePath) return setError(format(t, "duplicateFolder", { name: samePath.title }));
    setBusy(true);
    setError("");
    try {
      let project = await createWorkspace({ path });
      if (project.title !== title) project = await renameWorkspace(project.workspaceId, title);
      setName("");
      setPath("");
      onCreated(project.workspaceId);
    } catch (reason) {
      setError(format(t, "createFailed", { message: reason instanceof Error ? reason.message : String(reason) }));
    } finally {
      setBusy(false);
    }
  };
  if (!open) return null;
  return h(
    React.Fragment,
    null,
    ReactDOM.createPortal(
      h(
        "div",
        { className: "dshp-backdrop", onMouseDown: (event) => {
          if (event.target === event.currentTarget) close();
        } },
        h(
          "section",
          { className: "dshp-modal", role: "dialog", "aria-modal": true, "aria-label": t("createProject") },
          h(
            "div",
            { className: "dshp-modal-head" },
            h("h2", { className: "dshp-modal-title" }, t("createProject")),
            h("button", { type: "button", className: "dshp-icon-button", onClick: close, "aria-label": t("cancel") }, h(Icon, { name: "close", size: 20 }))
          ),
          h(
            "div",
            { className: "dshp-name-field" },
            h("div", { className: "dshp-name-icon" }, h(Icon, { name: "folder", size: 19 })),
            h("input", {
              ref: inputRef,
              value: name2,
              maxLength: 80,
              placeholder: t("projectName"),
              onChange: (event) => {
                setName(event.target.value);
                setError("");
              },
              onKeyDown: (event) => {
                if (event.key === "Enter" && path && !busy) create();
              }
            })
          ),
          h("div", { className: "dshp-label" }, t("sourceFolder")),
          h(
            "button",
            {
              type: "button",
              className: "dshp-folder-card",
              "data-picked": path ? "true" : "false",
              disabled: busy || picking,
              onClick: chooseFolder
            },
            h(Icon, { name: path ? "folder" : "folderPlus", size: 27 }),
            path ? h(
              React.Fragment,
              null,
              h("div", { className: "dshp-folder-path" }, path),
              h("div", { className: "dshp-folder-hint" }, picking ? t("choosing") : t("changeFolder"))
            ) : h("div", { className: "dshp-folder-hint" }, picking ? t("choosing") : t("addSourceFolder"))
          ),
          h("div", { className: "dshp-error", role: error ? "alert" : void 0 }, error),
          h(
            "div",
            { className: "dshp-modal-actions" },
            h("button", { type: "button", className: "dshp-button", disabled: busy || picking, onClick: close }, t("cancel")),
            h("button", { type: "button", className: "dshp-button dshp-button-primary", disabled: busy || picking || !name2.trim() || !path, onClick: create }, busy ? t("creating") : t("createProject"))
          )
        )
      ),
      document.body
    ),
    h(DirectoryBrowserModal, {
      open: browserOpen,
      initialPath: path,
      listDirectory,
      onPick: adoptFolder,
      onClose: () => {
        setBrowserOpen(false);
        setPicking(false);
      },
      t
    })
  );
}
function ProjectPicker({ open, anchorRef, selectedId, onPick, onClose, useWorkspaces, useSessions, createWorkspace, renameWorkspace, pickDirectory, listDirectory, startDefaultSession, isDefaultWorkspace, t }) {
  const workspaceState = useWorkspaces((state) => state);
  const sessionState = useSessions((state) => state);
  const allProjects = workspaceState.items || [];
  const projects = allProjects.filter((project) => !isDefaultWorkspace(project));
  const [query, setQuery] = React.useState("");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [defaultBusy, setDefaultBusy] = React.useState(false);
  const [defaultError, setDefaultError] = React.useState("");
  const [position, setPosition] = React.useState({ left: 12, top: 12 });
  const searchRef = React.useRef(null);
  const updatePosition = React.useCallback(() => {
    const rect = anchorRef?.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.min(276, window.innerWidth - 20);
    setPosition({
      left: Math.max(10, Math.min(rect.left, window.innerWidth - width - 10)),
      top: Math.min(rect.bottom + 8, window.innerHeight - 120)
    });
  }, [anchorRef]);
  React.useEffect(() => {
    if (!open || modalOpen) return;
    updatePosition();
    const timer = setTimeout(() => searchRef.current?.focus(), 20);
    const onPointer = (event) => {
      if (event.target.closest?.(".dshp-menu")) return;
      if (anchorRef?.current?.contains(event.target)) return;
      onClose();
    };
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("resize", updatePosition);
    document.addEventListener("pointerdown", onPointer, true);
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updatePosition);
      document.removeEventListener("pointerdown", onPointer, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, modalOpen, anchorRef, onClose, updatePosition]);
  React.useEffect(() => {
    if (!open) setQuery("");
  }, [open]);
  const chooseDefault = async () => {
    if (defaultBusy) return;
    setDefaultBusy(true);
    setDefaultError("");
    try {
      await startDefaultSession();
      onClose();
    } catch (reason) {
      setDefaultError(format(t, "defaultChatFailed", { message: reason instanceof Error ? reason.message : String(reason) }));
    } finally {
      setDefaultBusy(false);
    }
  };
  const ordered = React.useMemo(() => [...projects].sort((a, b) => projectUpdatedAt(b, sessionState) - projectUpdatedAt(a, sessionState) || a.title.localeCompare(b.title)), [projects, sessionState]);
  const needle = query.trim().toLowerCase();
  const filtered = needle ? ordered.filter((project) => project.title.toLowerCase().includes(needle) || project.path.toLowerCase().includes(needle)) : ordered;
  const menu = open && !modalOpen ? ReactDOM.createPortal(
    h(
      "div",
      { className: "dshp-menu", style: position, role: "menu" },
      h(
        "div",
        { className: "dshp-search" },
        h(Icon, { name: "search", size: 17 }),
        h("input", { ref: searchRef, value: query, placeholder: t("searchProjects"), onChange: (event) => setQuery(event.target.value), "aria-label": t("searchProjects") })
      ),
      h(
        "div",
        { className: "dshp-list" },
        filtered.length ? filtered.map((project) => h("button", {
          key: project.workspaceId,
          type: "button",
          className: "dshp-project-item",
          "data-selected": project.workspaceId === selectedId ? "true" : "false",
          title: project.path,
          onClick: () => onPick(project.workspaceId)
        }, h(Icon, { name: "folder", size: 18 }), h("span", null, project.title))) : h("div", { className: "dshp-menu-empty" }, projects.length ? t("noMatches") : t("noProjects"))
      ),
      h(
        "div",
        { className: "dshp-menu-footer" },
        h(
          "button",
          { type: "button", className: "dshp-new-item dshp-default-item", disabled: defaultBusy, onClick: chooseDefault },
          h(Icon, { name: "chat", size: 18 }),
          h(
            "span",
            { className: "dshp-default-copy" },
            h("span", { className: "dshp-default-title" }, defaultBusy ? t("startingChat") : t("normalChat")),
            h("span", { className: "dshp-default-hint" }, t("normalChatHint"))
          )
        ),
        defaultError ? h("div", { className: "dshp-action-error" }, defaultError) : null,
        h("button", { type: "button", className: "dshp-new-item", onClick: () => {
          setModalOpen(true);
          onClose();
        } }, h(Icon, { name: "plus", size: 18 }), h("span", null, t("newProject")))
      )
    ),
    document.body
  ) : null;
  return h(
    React.Fragment,
    null,
    menu,
    h(CreateProjectModal, {
      open: modalOpen,
      projects: allProjects,
      createWorkspace,
      renameWorkspace,
      pickDirectory,
      listDirectory,
      onClose: () => setModalOpen(false),
      onCreated: (workspaceId) => {
        setModalOpen(false);
        onPick(workspaceId);
      },
      t
    })
  );
}
var SIDEBAR_PREFS_KEY = "dsh-projects:sidebar:v2";
var defaultSidebarPrefs = {
  groupBy: "project",
  orderBy: "priority",
  pinnedProjects: [],
  favoriteProjects: [],
  pinnedSessions: [],
  manualFlatOrder: []
};
function readSidebarPrefs() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SIDEBAR_PREFS_KEY) || "{}");
    return {
      ...defaultSidebarPrefs,
      ...parsed,
      pinnedProjects: Array.isArray(parsed.pinnedProjects) ? parsed.pinnedProjects : [],
      favoriteProjects: Array.isArray(parsed.favoriteProjects) ? parsed.favoriteProjects : [],
      pinnedSessions: Array.isArray(parsed.pinnedSessions) ? parsed.pinnedSessions : [],
      manualFlatOrder: Array.isArray(parsed.manualFlatOrder) ? parsed.manualFlatOrder : []
    };
  } catch {
    return { ...defaultSidebarPrefs };
  }
}
function useSidebarPrefs() {
  const [prefs, setPrefs] = React.useState(readSidebarPrefs);
  React.useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_PREFS_KEY, JSON.stringify(prefs));
    } catch {
    }
  }, [prefs]);
  React.useEffect(() => {
    const sync = (event) => {
      if (event.key === SIDEBAR_PREFS_KEY) setPrefs(readSidebarPrefs());
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  return [prefs, setPrefs];
}
function toggleId(list, id) {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}
function reconcileOrder(ids, stored) {
  const valid = new Set(ids);
  const seen = /* @__PURE__ */ new Set();
  const ordered = [];
  for (const id of stored || []) if (valid.has(id) && !seen.has(id)) {
    ordered.push(id);
    seen.add(id);
  }
  for (const id of ids) if (!seen.has(id)) ordered.push(id);
  return ordered;
}
function movedAt(ids, movingId, targetId, after) {
  const next = ids.filter((id) => id !== movingId);
  const index = next.indexOf(targetId);
  if (index < 0) next.push(movingId);
  else next.splice(index + (after ? 1 : 0), 0, movingId);
  return next;
}
function relativeTime(timestamp) {
  if (!timestamp) return "";
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1e3));
  if (seconds < 60) return "<1m";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  return `${Math.floor(days / 30)}mo`;
}
function useHoverPreview() {
  const anchorRef = React.useRef(null);
  const timerRef = React.useRef(null);
  const [position, setPosition] = React.useState(null);
  const leave = React.useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = null;
    setPosition(null);
  }, []);
  const enter = React.useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.min(316, window.innerWidth - 24);
      const left = Math.max(12, Math.min(rect.right + 8, window.innerWidth - width - 12));
      const top = Math.max(12, Math.min(rect.top - 4, window.innerHeight - 190));
      setPosition({ left, top });
    }, 450);
  }, []);
  React.useEffect(() => () => clearTimeout(timerRef.current), []);
  return { anchorRef, position, enter, leave };
}
function PreviewPortal({ position, children }) {
  return position ? ReactDOM.createPortal(h("div", { className: "dshp-hover-preview", style: position }, children), document.body) : null;
}
function ContextMenu({ menu, items, onClose }) {
  React.useEffect(() => {
    if (!menu) return;
    const outside = (event) => {
      if (!event.target.closest?.(".dshp-context")) onClose();
    };
    const key = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", outside, true);
    window.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", outside, true);
      window.removeEventListener("keydown", key);
    };
  }, [menu, onClose]);
  if (!menu) return null;
  return ReactDOM.createPortal(
    h(
      "div",
      { className: "dshp-context", style: { left: menu.left, top: menu.top }, role: "menu" },
      ...items.map((item) => {
        if (item.type === "label") return h("div", { key: item.id, className: "dshp-context-label" }, item.label);
        if (item.type === "separator") return h("div", { key: item.id, className: "dshp-context-separator" });
        return h(
          "button",
          {
            key: item.id,
            type: "button",
            className: "dshp-context-item",
            "data-danger": item.danger ? "true" : "false",
            onClick: () => {
              onClose();
              item.onClick();
            }
          },
          h("span", { className: "dshp-check" }, item.checked ? h(Icon, { name: "check", size: 16 }) : item.icon ? h(Icon, { name: item.icon, size: 16 }) : null),
          h("span", null, item.label)
        );
      })
    ),
    document.body
  );
}
function EditProjectModal({ project, projects, renameWorkspace, onClose, t }) {
  const [value, setValue] = React.useState(project?.title || "");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const inputRef = React.useRef(null);
  React.useEffect(() => {
    setValue(project?.title || "");
    setError("");
    if (project) setTimeout(() => inputRef.current?.focus(), 20);
  }, [project]);
  if (!project) return null;
  const trimmed = value.trim();
  const duplicate = projects.some((item) => item.workspaceId !== project.workspaceId && item.title.trim().toLowerCase() === trimmed.toLowerCase());
  const save = async () => {
    if (!trimmed || duplicate || busy) return;
    setBusy(true);
    setError("");
    try {
      await renameWorkspace(project.workspaceId, trimmed);
      onClose();
    } catch (reason) {
      setError(format(t, "actionFailed", { message: reason instanceof Error ? reason.message : String(reason) }));
    } finally {
      setBusy(false);
    }
  };
  return ReactDOM.createPortal(
    h(
      "div",
      { className: "dshp-backdrop", onMouseDown: (event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      } },
      h(
        "section",
        { className: "dshp-modal dshp-small-modal", role: "dialog", "aria-modal": true },
        h(
          "div",
          { className: "dshp-modal-head" },
          h("h2", { className: "dshp-modal-title" }, t("editProjectTitle")),
          h("button", { type: "button", className: "dshp-icon-button", onClick: onClose }, h(Icon, { name: "close", size: 19 }))
        ),
        h(
          "div",
          { className: "dshp-name-field" },
          h("div", { className: "dshp-name-icon" }, h(Icon, { name: "folder", size: 18 })),
          h("input", { ref: inputRef, value, maxLength: 80, onChange: (event) => {
            setValue(event.target.value);
            setError("");
          }, onKeyDown: (event) => {
            if (event.key === "Enter") save();
          } })
        ),
        duplicate ? h("div", { className: "dshp-error" }, t("duplicateName")) : h("div", { className: "dshp-error" }, error),
        h(
          "div",
          { className: "dshp-modal-actions" },
          h("button", { type: "button", className: "dshp-button", disabled: busy, onClick: onClose }, t("cancel")),
          h("button", { type: "button", className: "dshp-button dshp-button-primary", disabled: busy || !trimmed || duplicate || trimmed === project.title, onClick: save }, t("save"))
        )
      )
    ),
    document.body
  );
}
function ConfirmModal({ request, busy, error, onConfirm, onClose, t }) {
  if (!request) return null;
  const archive = request.kind === "archive";
  return ReactDOM.createPortal(
    h(
      "div",
      { className: "dshp-backdrop", onMouseDown: (event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      } },
      h(
        "section",
        { className: "dshp-modal dshp-small-modal", role: "alertdialog", "aria-modal": true },
        h(
          "div",
          { className: "dshp-modal-head" },
          h("h2", { className: "dshp-modal-title" }, archive ? t("archiveProjectTitle") : t("removeProjectTitle")),
          h("button", { type: "button", className: "dshp-icon-button", disabled: busy, onClick: onClose }, h(Icon, { name: "close", size: 19 }))
        ),
        h("p", { className: "dshp-confirm-copy" }, archive ? t("archiveProjectHint") : t("removeProjectHint")),
        error ? h("div", { className: "dshp-error" }, error) : null,
        h(
          "div",
          { className: "dshp-modal-actions" },
          h("button", { type: "button", className: "dshp-button", disabled: busy, onClick: onClose }, t("cancel")),
          h("button", { type: "button", className: "dshp-button dshp-button-primary", disabled: busy, onClick: onConfirm }, archive ? t("confirmArchive") : t("removeProject"))
        )
      )
    ),
    document.body
  );
}
function SessionRow({ session, project, current, pinned, draggable, dragOver, onOpen, onTogglePin, onArchive, onDragStart, onDragOver, onDrop, onDragEnd, t }) {
  const hover = useHoverPreview();
  const title = sessionTitle(session, t);
  return h(
    "div",
    {
      ref: hover.anchorRef,
      className: "dshp-session-wrap",
      "data-drag-over": dragOver || void 0,
      "data-pinned": pinned ? "true" : "false",
      onPointerEnter: hover.enter,
      onPointerLeave: hover.leave,
      draggable,
      onDragStart,
      onDragOver,
      onDrop,
      onDragEnd
    },
    h(
      "button",
      { type: "button", className: "dshp-sidebar-session", "data-current": current ? "true" : "false", "data-pinned": pinned ? "true" : "false", onClick: () => onOpen(session.id) },
      session.running ? h("i", { className: "dshp-running" }) : null,
      h("span", { style: { flex: 1, minWidth: 0 } }, title),
      project?.flatLabel ? h("span", { className: "dshp-flat-project" }, project.title) : null
    ),
    h(
      "div",
      { className: "dshp-session-actions" },
      h("button", { type: "button", className: "dshp-mini-button", "data-active": pinned ? "true" : "false", title: pinned ? t("unpinChat") : t("pinChat"), onClick: (event) => {
        event.stopPropagation();
        hover.leave();
        onTogglePin(session.id);
      } }, h(Icon, { name: "pin", size: 15 })),
      h("button", { type: "button", className: "dshp-mini-button", title: t("archiveChat"), onClick: (event) => {
        event.stopPropagation();
        hover.leave();
        onArchive(session.id);
      } }, h(Icon, { name: "archive", size: 15 }))
    ),
    h(
      PreviewPortal,
      { position: hover.position },
      h("div", { className: "dshp-preview-title" }, h("span", { className: "dshp-preview-time" }, relativeTime(session.updatedAt)), title),
      project ? h("div", { className: "dshp-preview-meta" }, h(Icon, { name: "folder", size: 17 }), h("span", null, project.title)) : null
    )
  );
}
function ProjectRow({ project, sessions, pinned, favorite, menuOpen, draggable, dragOver, onStart, onMenu, onDragStart, onDragOver, onDrop, onDragEnd, t }) {
  const hover = useHoverPreview();
  const running = sessions.filter((session) => session.running).length;
  return h(
    "div",
    {
      ref: hover.anchorRef,
      className: "dshp-project-row",
      "data-menu-open": menuOpen ? "true" : "false",
      "data-drag-over": dragOver || void 0,
      onPointerEnter: hover.enter,
      onPointerLeave: hover.leave,
      draggable,
      onDragStart,
      onDragOver,
      onDrop,
      onDragEnd
    },
    h(
      "button",
      { type: "button", className: "dshp-sidebar-project", "data-pinned": pinned ? "true" : "false", onClick: () => onStart(project.workspaceId) },
      h(Icon, { name: "folder", size: 18 }),
      h("span", { style: { flex: 1, minWidth: 0 } }, project.title)
    ),
    h(
      "div",
      { className: "dshp-project-actions" },
      h("button", { type: "button", className: "dshp-mini-button", title: t("editProject"), onClick: (event) => {
        event.stopPropagation();
        hover.leave();
        onMenu(event, project);
      } }, h(Icon, { name: "ellipsis", size: 17 })),
      h("button", { type: "button", className: "dshp-mini-button", title: t("newSession"), onClick: (event) => {
        event.stopPropagation();
        hover.leave();
        onStart(project.workspaceId);
      } }, h(Icon, { name: "compose", size: 16 }))
    ),
    h(
      PreviewPortal,
      { position: menuOpen ? null : hover.position },
      h("div", { className: "dshp-preview-title" }, project.title),
      h("div", { className: "dshp-preview-stats" }, h("span", null, format(t, "taskCount", { count: sessions.length })), h("span", null, "\xB7"), h("span", null, format(t, "activeCount", { count: running }))),
      h("div", { className: "dshp-preview-meta" }, h(Icon, { name: "folder", size: 17 }), h("span", null, project.path))
    )
  );
}
function GlobalSearchResults({ query, projects, sessionState, archived, remote, limit, onOpenProject, onOpenSession, t }) {
  const needle = query.trim().toLowerCase();
  if (!needle) return h("div", { className: "dshp-search-status" }, t("searchEverything"));
  const projectBySession = /* @__PURE__ */ new Map();
  for (const project of projects) for (const id of project.sessionIds || []) if (!projectBySession.has(id)) projectBySession.set(id, project);
  const projectMatches = projects.filter((project) => project.title.toLowerCase().includes(needle) || project.path.toLowerCase().includes(needle));
  const contentBySession = new Map((remote.items || []).map((item) => [item.sessionId, item.snippet]));
  const sessionMatches = [];
  const included = /* @__PURE__ */ new Set();
  const include = (session) => {
    if (!session || included.has(session.id) || archived.has(session.id) || session.origin === "subagent" || session.blank) return;
    included.add(session.id);
    sessionMatches.push(session);
  };
  for (const id of sessionState.ids || []) {
    const session = sessionState.byId[id];
    if (!session) continue;
    const project = projectBySession.get(id);
    if (sessionTitle(session, t).toLowerCase().includes(needle) || project?.title.toLowerCase().includes(needle)) include(session);
  }
  sessionMatches.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  for (const item of remote.items || []) include(sessionState.byId[item.sessionId]);
  const boundedSessions = sessionMatches.slice(0, limit);
  return h(
    "div",
    { className: "dshp-search-results" },
    projectMatches.length ? h(
      React.Fragment,
      null,
      h("div", { className: "dshp-result-group" }, t("projectResult")),
      ...projectMatches.slice(0, 8).map((project) => h(
        "button",
        { key: `project-${project.workspaceId}`, type: "button", className: "dshp-search-result", onClick: () => onOpenProject(project.workspaceId) },
        h("span", { className: "dshp-search-result-icon" }, h(Icon, { name: "folder", size: 17 })),
        h(
          "span",
          { className: "dshp-search-result-copy" },
          h("div", { className: "dshp-search-result-title" }, project.title),
          h("div", { className: "dshp-search-result-meta", title: project.path }, project.path)
        )
      ))
    ) : null,
    boundedSessions.length ? h(
      React.Fragment,
      null,
      h("div", { className: "dshp-result-group" }, t("chatResult")),
      ...boundedSessions.map((session) => {
        const project = projectBySession.get(session.id);
        const snippet = contentBySession.get(session.id);
        return h(
          "button",
          { key: `session-${session.id}`, type: "button", className: "dshp-search-result", onClick: () => onOpenSession(session.id) },
          h("span", { className: "dshp-search-result-icon" }, h(Icon, { name: "chat", size: 17 })),
          h(
            "span",
            { className: "dshp-search-result-copy" },
            h("div", { className: "dshp-search-result-title" }, sessionTitle(session, t)),
            snippet ? h("div", { className: "dshp-search-result-snippet", title: snippet }, snippet) : null,
            project ? h("div", { className: "dshp-search-result-meta" }, project.title) : null
          )
        );
      })
    ) : null,
    remote.status === "loading" ? h("div", { className: "dshp-search-status", role: "status" }, t("searching")) : null,
    remote.status === "error" ? h("div", { className: "dshp-search-status", role: "status" }, t("searchUnavailable")) : null,
    remote.status !== "loading" && !projectMatches.length && !boundedSessions.length ? h("div", { className: "dshp-search-status" }, t("noMatches")) : null,
    remote.hasMore || projectMatches.length > 8 || sessionMatches.length > limit ? h("div", { className: "dshp-search-status" }, t("searchMore")) : null
  );
}
function ArchiveCenterModal({ open, archivedIds, projects, sessionState, restoreSession, onClose, t }) {
  const [busyId, setBusyId] = React.useState("");
  const [error, setError] = React.useState("");
  React.useEffect(() => {
    if (!open) return;
    setError("");
    const onKey = (event) => {
      if (event.key === "Escape" && !busyId) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busyId, onClose]);
  if (!open) return null;
  const projectBySession = /* @__PURE__ */ new Map();
  for (const project of projects) for (const id of project.sessionIds || []) if (!projectBySession.has(id)) projectBySession.set(id, project);
  const rows = archivedIds.map((id) => ({ id, session: sessionState.byId[id], project: projectBySession.get(id) }));
  const restore = async (id) => {
    if (busyId || !restoreSession) return;
    setBusyId(id);
    setError("");
    try {
      await restoreSession(id);
    } catch (reason) {
      setError(format(t, "restoreFailed", { message: reason instanceof Error ? reason.message : String(reason) }));
    } finally {
      setBusyId("");
    }
  };
  return ReactDOM.createPortal(
    h(
      "div",
      { className: "dshp-backdrop", onMouseDown: (event) => {
        if (event.target === event.currentTarget && !busyId) onClose();
      } },
      h(
        "section",
        { className: "dshp-modal dshp-archive-modal", role: "dialog", "aria-modal": true, "aria-label": t("archiveCenter") },
        h(
          "div",
          { className: "dshp-modal-head" },
          h("h2", { className: "dshp-modal-title" }, t("archiveCenter")),
          h("button", { type: "button", className: "dshp-icon-button", disabled: Boolean(busyId), onClick: onClose, "aria-label": t("cancel") }, h(Icon, { name: "close", size: 19 }))
        ),
        h(
          "div",
          { className: "dshp-archive-list" },
          rows.length ? rows.map(({ id, session, project }) => h(
            "div",
            { key: id, className: "dshp-archive-row" },
            h("span", { className: "dshp-search-result-icon" }, h(Icon, { name: "archive", size: 18 })),
            h(
              "div",
              { className: "dshp-archive-copy" },
              h("div", { className: "dshp-archive-title" }, session ? sessionTitle(session, t) : id),
              h("div", { className: "dshp-archive-meta" }, project?.title || session?.cwd || "")
            ),
            h("button", { type: "button", className: "dshp-restore-button", disabled: Boolean(busyId) || !restoreSession, onClick: () => restore(id) }, busyId === id ? t("restoring") : t("restore"))
          )) : h("div", { className: "dshp-sidebar-empty" }, t("noArchivedChats"))
        ),
        !restoreSession && rows.length ? h("div", { className: "dshp-search-status", role: "status" }, t("restoreUnavailable")) : null,
        error ? h("div", { className: "dshp-error", role: "alert" }, error) : null,
        h("div", { className: "dshp-modal-actions" }, h("button", { type: "button", className: "dshp-button", disabled: Boolean(busyId), onClick: onClose }, t("cancel")))
      )
    ),
    document.body
  );
}
function SidebarProjects({ wide, expandSidebar, useWorkspaces, useSessions, openSession, startSession, startDefaultSession, isDefaultWorkspace, createWorkspace, renameWorkspace, pickDirectory, listDirectory, deleteWorkspace, insertWorkspaceBefore, archiveSession, restoreSession, insertSessionBefore, openPath, searchSessions, searchResultLimit, t }) {
  const workspaceState = useWorkspaces((state) => state);
  const sessionState = useSessions((state) => state);
  const [prefs, setPrefs] = useSidebarPrefs();
  const [expanded, setExpanded] = React.useState(() => /* @__PURE__ */ new Set());
  const [menu, setMenu] = React.useState(null);
  const [editTarget, setEditTarget] = React.useState(null);
  const [confirm, setConfirm] = React.useState(null);
  const [confirmBusy, setConfirmBusy] = React.useState(false);
  const [confirmError, setConfirmError] = React.useState("");
  const [actionError, setActionError] = React.useState("");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchRemote, setSearchRemote] = React.useState({ query: "", status: "idle", items: [], hasMore: false });
  const [archiveOpen, setArchiveOpen] = React.useState(false);
  const [drag, setDrag] = React.useState(null);
  const [dragOver, setDragOver] = React.useState(null);
  const searchInputRef = React.useRef(null);
  const defaultBootRef = React.useRef(false);
  const allProjects = workspaceState.items || [];
  const projects = allProjects.filter((project) => !isDefaultWorkspace(project));
  const archived = new Set(workspaceState.archivedSessionIds || []);
  const accounted = new Set(projects.flatMap((project) => project.sessionIds || []));
  const pinnedProjects = new Set(prefs.pinnedProjects);
  const favoriteProjects = new Set(prefs.favoriteProjects);
  const pinnedSessions = new Set(prefs.pinnedSessions);
  const visibleSession = (session) => session && session.origin !== "subagent" && !archived.has(session.id) && (!session.blank || session.id === sessionState.current);
  React.useEffect(() => {
    if (!searchOpen) return;
    const timer = setTimeout(() => searchInputRef.current?.focus(), 20);
    return () => clearTimeout(timer);
  }, [searchOpen]);
  React.useEffect(() => {
    const query = searchQuery.trim();
    if (!searchOpen || !query) {
      setSearchRemote({ query, status: "idle", items: [], hasMore: false });
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setSearchRemote({ query, status: "loading", items: [], hasMore: false });
      Promise.resolve(searchSessions(query, controller.signal)).then((result) => {
        if (!controller.signal.aborted) setSearchRemote({ query, status: "ready", items: result.items || [], hasMore: Boolean(result.hasMore) });
      }).catch(() => {
        if (!controller.signal.aborted) setSearchRemote({ query, status: "error", items: [], hasMore: false });
      });
    }, 220);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchOpen, searchQuery, searchSessions]);
  const handleFailure = (reason) => {
    setActionError(format(t, "actionFailed", { message: reason instanceof Error ? reason.message : String(reason) }));
    setTimeout(() => setActionError(""), 5e3);
  };
  const run = (task) => Promise.resolve().then(task).catch(handleFailure);
  React.useEffect(() => {
    if (workspaceState.phase !== "ready" || sessionState.current != null || defaultBootRef.current) return;
    defaultBootRef.current = true;
    Promise.resolve(startDefaultSession()).catch((reason) => {
      setActionError(format(t, "defaultChatFailed", { message: reason instanceof Error ? reason.message : String(reason) }));
      setTimeout(() => setActionError(""), 5e3);
    });
  }, [workspaceState.phase, sessionState.current, startDefaultSession, t]);
  const sessionsFor = (project) => {
    const list = (project.sessionIds || []).map((id) => sessionState.byId[id]).filter(visibleSession);
    if (prefs.orderBy === "manual") return list;
    return [...list].sort((a, b) => {
      if (prefs.orderBy === "priority") {
        const pin = Number(pinnedSessions.has(b.id)) - Number(pinnedSessions.has(a.id));
        if (pin) return pin;
      }
      return (b.updatedAt || 0) - (a.updatedAt || 0) || a.id.localeCompare(b.id);
    });
  };
  const orderedProjects = React.useMemo(() => {
    if (prefs.orderBy === "manual") return projects;
    return [...projects].sort((a, b) => {
      if (prefs.orderBy === "priority") {
        const pin = Number(pinnedProjects.has(b.workspaceId)) - Number(pinnedProjects.has(a.workspaceId));
        if (pin) return pin;
        const favorite = Number(favoriteProjects.has(b.workspaceId)) - Number(favoriteProjects.has(a.workspaceId));
        if (favorite) return favorite;
      }
      return projectUpdatedAt(b, sessionState) - projectUpdatedAt(a, sessionState) || a.title.localeCompare(b.title);
    });
  }, [projects, prefs.orderBy, prefs.pinnedProjects, prefs.favoriteProjects, sessionState]);
  const stray = (sessionState.ids || []).map((id) => sessionState.byId[id]).filter((session) => visibleSession(session) && !accounted.has(session.id));
  const allFlat = [...projects.flatMap((project) => (project.sessionIds || []).map((id) => sessionState.byId[id]).filter(visibleSession)), ...stray];
  const uniqueFlat = [...new Map(allFlat.map((session) => [session.id, session])).values()];
  const flatSessions = (() => {
    if (prefs.orderBy === "manual") {
      const order = reconcileOrder(uniqueFlat.map((session) => session.id), prefs.manualFlatOrder);
      const byId = new Map(uniqueFlat.map((session) => [session.id, session]));
      return order.map((id) => byId.get(id)).filter(Boolean);
    }
    return [...uniqueFlat].sort((a, b) => {
      if (prefs.orderBy === "priority") {
        const pin = Number(pinnedSessions.has(b.id)) - Number(pinnedSessions.has(a.id));
        if (pin) return pin;
      }
      return (b.updatedAt || 0) - (a.updatedAt || 0) || a.id.localeCompare(b.id);
    });
  })();
  const projectForSession = (sessionId) => projects.find((project) => (project.sessionIds || []).includes(sessionId));
  if (!wide) {
    return h(
      "div",
      { className: "dshp-sidebar dshp-rail" },
      orderedProjects.slice(0, 7).map((project) => h("button", { key: project.workspaceId, type: "button", className: "dshp-rail-button", title: project.title, onClick: () => {
        expandSidebar();
        startSession(project.workspaceId);
      } }, h(Icon, { name: "folder", size: 20 })))
    );
  }
  const openMenuAt = (event, kind, target) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = 250;
    const left = Math.max(8, Math.min(rect.right + 6, window.innerWidth - width - 8));
    const top = Math.max(8, Math.min(rect.bottom + 4, window.innerHeight - 360));
    setMenu({ kind, target, left, top });
  };
  const togglePref = (key, id) => setPrefs((current) => ({ ...current, [key]: toggleId(current[key], id) }));
  const archiveOne = (sessionId) => run(() => archiveSession(sessionId));
  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };
  const openSearchProject = (workspaceId) => {
    closeSearch();
    startSession(workspaceId);
  };
  const openSearchSession = (sessionId) => {
    closeSearch();
    openSession(sessionId);
  };
  const viewMenuItems = [
    { type: "label", id: "group-label", label: t("organizeSidebar") },
    { id: "group-project", label: t("byProject"), checked: prefs.groupBy === "project", onClick: () => setPrefs((current) => ({ ...current, groupBy: "project" })) },
    { id: "group-flat", label: t("inOneList"), checked: prefs.groupBy === "flat", onClick: () => setPrefs((current) => ({ ...current, groupBy: "flat" })) },
    { type: "separator", id: "view-sep" },
    { type: "label", id: "order-label", label: t("chatOrder") },
    { id: "order-priority", label: t("priority"), checked: prefs.orderBy === "priority", onClick: () => setPrefs((current) => ({ ...current, orderBy: "priority" })) },
    { id: "order-updated", label: t("recentlyUpdated"), checked: prefs.orderBy === "updated", onClick: () => setPrefs((current) => ({ ...current, orderBy: "updated" })) },
    { id: "order-manual", label: t("manualOrder"), checked: prefs.orderBy === "manual", onClick: () => setPrefs((current) => ({ ...current, orderBy: "manual" })) }
  ];
  const selectedProject = menu?.kind === "project" ? menu.target : null;
  const projectMenuItems = selectedProject ? [
    { id: "pin-project", label: pinnedProjects.has(selectedProject.workspaceId) ? t("unpinProject") : t("pinProject"), icon: "pin", onClick: () => togglePref("pinnedProjects", selectedProject.workspaceId) },
    { id: "favorite-project", label: favoriteProjects.has(selectedProject.workspaceId) ? t("unfavoriteProject") : t("favoriteProject"), icon: "star", onClick: () => togglePref("favoriteProjects", selectedProject.workspaceId) },
    { id: "open-project", label: t("openExplorer"), icon: "external", onClick: () => run(() => openPath(selectedProject.path)) },
    { id: "edit-project", label: t("editProject"), icon: "edit", onClick: () => setEditTarget(selectedProject) },
    { type: "separator", id: "project-sep" },
    { id: "archive-project", label: t("archiveChats"), icon: "archive", onClick: () => {
      setConfirmError("");
      setConfirm({ kind: "archive", project: selectedProject });
    } },
    { id: "remove-project", label: t("removeProject"), icon: "close", danger: true, onClick: () => {
      setConfirmError("");
      setConfirm({ kind: "remove", project: selectedProject });
    } }
  ] : [];
  const dragPropsForProject = (project) => ({
    draggable: prefs.orderBy === "manual",
    dragOver: dragOver?.key === `project:${project.workspaceId}` ? dragOver.after ? "after" : "before" : null,
    onDragStart: (event) => {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", project.workspaceId);
      setDrag({ kind: "project", id: project.workspaceId });
    },
    onDragOver: (event) => {
      if (drag?.kind === "project" && drag.id !== project.workspaceId) {
        event.preventDefault();
        const rect = event.currentTarget.getBoundingClientRect();
        setDragOver({ key: `project:${project.workspaceId}`, after: event.clientY >= rect.top + rect.height / 2 });
      }
    },
    onDrop: (event) => {
      if (drag?.kind === "project" && drag.id !== project.workspaceId) {
        event.preventDefault();
        const withoutMoving = projects.map((item) => item.workspaceId).filter((id) => id !== drag.id);
        const targetIndex = withoutMoving.indexOf(project.workspaceId);
        const after = dragOver?.key === `project:${project.workspaceId}` && dragOver.after;
        const anchor = withoutMoving[targetIndex + (after ? 1 : 0)];
        run(() => insertWorkspaceBefore(drag.id, anchor));
      }
      setDrag(null);
      setDragOver(null);
    },
    onDragEnd: () => {
      setDrag(null);
      setDragOver(null);
    }
  });
  const dragPropsForSession = (session, workspaceId, flat) => ({
    draggable: prefs.orderBy === "manual",
    dragOver: dragOver?.key === `session:${session.id}` ? dragOver.after ? "after" : "before" : null,
    onDragStart: (event) => {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", session.id);
      setDrag({ kind: "session", id: session.id, workspaceId, flat });
    },
    onDragOver: (event) => {
      if (drag?.kind === "session" && drag.id !== session.id && (flat || drag.workspaceId === workspaceId)) {
        event.preventDefault();
        const rect = event.currentTarget.getBoundingClientRect();
        setDragOver({ key: `session:${session.id}`, after: event.clientY >= rect.top + rect.height / 2 });
      }
    },
    onDrop: (event) => {
      if (drag?.kind === "session" && drag.id !== session.id && (flat || drag.workspaceId === workspaceId)) {
        event.preventDefault();
        const after = dragOver?.key === `session:${session.id}` && dragOver.after;
        if (flat) setPrefs((current) => ({ ...current, manualFlatOrder: movedAt(reconcileOrder(uniqueFlat.map((item) => item.id), current.manualFlatOrder), drag.id, session.id, after) }));
        else {
          const account = (projects.find((item) => item.workspaceId === workspaceId)?.sessionIds || []).filter((id) => id !== drag.id);
          const targetIndex = account.indexOf(session.id);
          const anchor = account[targetIndex + (after ? 1 : 0)];
          run(() => insertSessionBefore(workspaceId, drag.id, anchor));
        }
      }
      setDrag(null);
      setDragOver(null);
    },
    onDragEnd: () => {
      setDrag(null);
      setDragOver(null);
    }
  });
  const renderSessionRow = (session, project, flat = false) => h(SessionRow, {
    key: session.id,
    session,
    project: project ? { ...project, flatLabel: flat } : null,
    current: session.id === sessionState.current,
    pinned: pinnedSessions.has(session.id),
    onOpen: openSession,
    onTogglePin: (id) => togglePref("pinnedSessions", id),
    onArchive: archiveOne,
    t,
    ...dragPropsForSession(session, project?.workspaceId || "", flat)
  });
  const confirmAction = async () => {
    if (!confirm || confirmBusy) return;
    setConfirmBusy(true);
    setConfirmError("");
    try {
      if (confirm.kind === "archive") {
        const ids = (confirm.project.sessionIds || []).filter((id) => !archived.has(id));
        for (const id of ids) await archiveSession(id);
      } else {
        await deleteWorkspace(confirm.project.workspaceId);
        const id = confirm.project.workspaceId;
        setPrefs((current) => ({ ...current, pinnedProjects: current.pinnedProjects.filter((item) => item !== id), favoriteProjects: current.favoriteProjects.filter((item) => item !== id) }));
      }
      setConfirm(null);
    } catch (reason) {
      setConfirmError(format(t, "actionFailed", { message: reason instanceof Error ? reason.message : String(reason) }));
    } finally {
      setConfirmBusy(false);
    }
  };
  return h(
    React.Fragment,
    null,
    h(
      "div",
      { className: "dshp-sidebar", "data-dragging": drag ? "true" : "false" },
      h(
        "div",
        { className: "dshp-sidebar-scroll" },
        h(
          "div",
          { className: "dshp-section-head" },
          h("div", { className: "dshp-section-title" }, prefs.groupBy === "project" ? t("projects") : t("chats")),
          h(
            "div",
            { className: "dshp-section-actions" },
            h("button", { type: "button", className: "dshp-mini-button", "data-active": searchOpen ? "true" : "false", title: t("globalSearch"), onClick: () => {
              setSearchOpen((value) => !value);
              setMenu(null);
            } }, h(Icon, { name: "search", size: 16 })),
            h("button", { type: "button", className: "dshp-mini-button", "data-active": archiveOpen ? "true" : "false", title: t("archiveCenter"), onClick: () => {
              setArchiveOpen(true);
              setMenu(null);
            } }, h(Icon, { name: "archive", size: 16 })),
            h("button", { type: "button", className: "dshp-mini-button", title: t("organizeSidebar"), onClick: (event) => openMenuAt(event, "view", null) }, h(Icon, { name: "ellipsis", size: 17 })),
            h("button", { type: "button", className: "dshp-mini-button", title: t("newProjectShort"), onClick: () => setCreateOpen(true) }, h(Icon, { name: "plus", size: 17 }))
          )
        ),
        actionError ? h("div", { className: "dshp-action-error" }, actionError) : null,
        searchOpen ? h(
          React.Fragment,
          null,
          h(
            "div",
            { className: "dshp-sidebar-search" },
            h(Icon, { name: "search", size: 16 }),
            h("input", { ref: searchInputRef, value: searchQuery, placeholder: t("searchEverything"), "aria-label": t("globalSearch"), onChange: (event) => setSearchQuery(event.target.value), onKeyDown: (event) => {
              if (event.key === "Escape") closeSearch();
            } }),
            searchQuery ? h("button", { type: "button", className: "dshp-mini-button", title: t("cancel"), onClick: () => setSearchQuery("") }, h(Icon, { name: "close", size: 15 })) : null
          ),
          h(GlobalSearchResults, { query: searchQuery, projects, sessionState, archived, remote: searchRemote.query === searchQuery.trim() ? searchRemote : { query: searchQuery.trim(), status: "loading", items: [], hasMore: false }, limit: searchResultLimit || 20, onOpenProject: openSearchProject, onOpenSession: openSearchSession, t })
        ) : prefs.groupBy === "flat" ? flatSessions.length ? flatSessions.map((session) => renderSessionRow(session, projectForSession(session.id), true)) : h("div", { className: "dshp-sidebar-empty" }, t("noChats")) : projects.length ? orderedProjects.map((project) => {
          const sessions = sessionsFor(project);
          const showAll = expanded.has(project.workspaceId);
          const shown = showAll ? sessions : sessions.slice(0, 4);
          return h(
            "div",
            { key: project.workspaceId, className: "dshp-project-block" },
            h(ProjectRow, {
              project,
              sessions,
              pinned: pinnedProjects.has(project.workspaceId),
              favorite: favoriteProjects.has(project.workspaceId),
              menuOpen: menu?.kind === "project" && menu.target?.workspaceId === project.workspaceId,
              onStart: startSession,
              onMenu: (event, target) => openMenuAt(event, "project", target),
              t,
              ...dragPropsForProject(project)
            }),
            ...shown.map((session) => renderSessionRow(session, project)),
            sessions.length > 4 ? h("button", { type: "button", className: "dshp-more", onClick: () => setExpanded((current) => {
              const next = new Set(current);
              if (next.has(project.workspaceId)) next.delete(project.workspaceId);
              else next.add(project.workspaceId);
              return next;
            }) }, showAll ? t("showLess") : t("showMore")) : null
          );
        }) : h("div", { className: "dshp-sidebar-empty" }, t("noProjects")),
        prefs.groupBy === "project" && stray.length ? h(
          React.Fragment,
          null,
          h("div", { className: "dshp-section-title dshp-recent" }, t("recent")),
          ...[...stray].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)).slice(0, 10).map((session) => renderSessionRow(session, null))
        ) : null
      )
    ),
    h(ContextMenu, { menu, items: menu?.kind === "view" ? viewMenuItems : projectMenuItems, onClose: () => setMenu(null) }),
    h(CreateProjectModal, {
      open: createOpen,
      projects: allProjects,
      createWorkspace,
      renameWorkspace,
      pickDirectory,
      listDirectory,
      onClose: () => setCreateOpen(false),
      onCreated: (workspaceId) => {
        setCreateOpen(false);
        startSession(workspaceId);
      },
      t
    }),
    h(EditProjectModal, { project: editTarget, projects, renameWorkspace, onClose: () => setEditTarget(null), t }),
    h(ConfirmModal, { request: confirm, busy: confirmBusy, error: confirmError, onConfirm: confirmAction, onClose: () => {
      if (!confirmBusy) setConfirm(null);
    }, t }),
    h(ArchiveCenterModal, { open: archiveOpen, archivedIds: workspaceState.archivedSessionIds || [], projects, sessionState, restoreSession, onClose: () => setArchiveOpen(false), t })
  );
}
var inject = ["slots", "locale", "sessions", "workspaces", "connection"];
var name = "dsh-projects";
function apply(ctx) {
  installStyles();
  ctx.effect(installProjectCopyBridge, "dsh-projects: project copy bridge");
  ctx.effect(() => ctx.locale.register(NS, dictionaries), "dsh-projects: dictionaries");
  const defaultWorkspace = createDefaultWorkspaceManager({
    workspaces: ctx.workspaces,
    storage: localStorage
  });
  const startDefaultSession = async () => {
    let cwd;
    if (ctx.connection?.isLoopback && ctx.connection?.rpc?.call) {
      const result = await ctx.connection.rpc.call(
        "/dsh-projects",
        "allocateDefaultWorkspace",
        {}
      );
      const allocation = unwrapDefaultWorkspaceResult(result);
      defaultWorkspace.rememberRoot(allocation.root);
      cwd = allocation.path;
    } else {
      cwd = await defaultWorkspace.allocateSessionRoot();
    }
    const workspace = await ctx.workspaces.create({ path: cwd });
    ctx.workspaces.startSession(workspace.workspaceId);
    return workspace.workspaceId;
  };
  const isDefaultWorkspace = (workspace) => defaultWorkspace.isDefaultWorkspace(workspace);
  const pickDirectory = async () => {
    if (ctx.connection?.isLoopback && ctx.connection?.rpc?.call) {
      try {
        const result = await ctx.connection.rpc.call("/dsh-projects", "pickDirectory", {});
        return unwrapNativeDirectoryResult(result);
      } catch (reason) {
        console.warn("[dsh-projects] native directory bridge unavailable; falling back", reason);
      }
    }
    return ctx.workspaces.pickDirectory();
  };
  const injected = () => ({
    createWorkspace: (input) => ctx.workspaces.create(input),
    renameWorkspace: (workspaceId, title) => ctx.workspaces.rename(workspaceId, title),
    pickDirectory,
    listDirectory: (path, signal) => ctx.workspaces.listDirectory(path, signal),
    openSession: (sessionId) => ctx.sessions.open(sessionId),
    startSession: (workspaceId) => ctx.workspaces.startSession(workspaceId),
    startDefaultSession,
    isDefaultWorkspace,
    deleteWorkspace: (workspaceId) => ctx.workspaces.delete(workspaceId),
    insertWorkspaceBefore: (workspaceId, beforeWorkspaceId) => ctx.workspaces.insertBefore(workspaceId, beforeWorkspaceId),
    archiveSession: (sessionId) => ctx.workspaces.archiveSession(sessionId),
    restoreSession: typeof ctx.workspaces.unarchiveSession === "function" ? (sessionId) => ctx.workspaces.unarchiveSession(sessionId) : null,
    insertSessionBefore: (workspaceId, sessionId, beforeSessionId) => ctx.workspaces.insertSessionBefore(workspaceId, sessionId, beforeSessionId),
    openPath: (path) => ctx.workspaces.openPath(path),
    searchSessions: async (query, signal) => {
      const result = await ctx.sessions.search(query, signal);
      if (!result.ok) throw new Error(result.error.message);
      return result.value;
    },
    searchResultLimit: ctx.sessions.searchResultLimit
  });
  ctx.slots.inject("conversation.hero.workspace", () => ctx.slots.register({
    name: "conversation.hero.workspace",
    priority: -100,
    locale: NS,
    inject: injected
  }, ProjectPicker));
  ctx.slots.inject("sidebar.workspaces", () => ctx.slots.register({
    name: "sidebar.workspaces",
    priority: -100,
    locale: NS,
    inject: injected
  }, SidebarProjects));
}
module.exports = { apply, inject, name };
return module.exports; } });
