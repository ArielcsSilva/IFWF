const STORAGE_KEY = "ifwf-db";

const DEFAULT_DB = {
  boards: [],
  cards: [],
  studySessions: [],
  goals: [],
};

const supportsLocalStorage = typeof window !== "undefined" && typeof window.localStorage !== "undefined";

function safeParse(value) {
  try {
    return JSON.parse(value) ?? {};
  } catch {
    return {};
  }
}

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function getStorageItem(key) {
  if (!supportsLocalStorage) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setStorageItem(key, value) {
  if (!supportsLocalStorage) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore storage write failures
  }
}

function removeStorageItem(key) {
  if (!supportsLocalStorage) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore removal failures
  }
}

function getDatabase() {
  const raw = getStorageItem(STORAGE_KEY);
  if (!raw) {
    const db = cloneValue(DEFAULT_DB);
    saveDatabase(db);
    return db;
  }

  const db = safeParse(raw);
  return {
    boards: [],
    cards: [],
    studySessions: [],
    goals: [],
    ...db,
  };
}

function saveDatabase(db) {
  setStorageItem(STORAGE_KEY, JSON.stringify(db));
}

function clearDatabase() {
  const db = cloneValue(DEFAULT_DB);
  saveDatabase(db);
  return db;
}

function exportDatabase() {
  return JSON.stringify(getDatabase(), null, 2);
}

function importDatabase(json) {
  const db = safeParse(json);
  const merged = {
    boards: [],
    cards: [],
    studySessions: [],
    goals: [],
    ...db,
  };
  saveDatabase(merged);
  return merged;
}

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

function normalizeFilter(filter) {
  if (!filter || typeof filter !== "object") {
    return null;
  }
  return filter;
}

function matchesFilter(item, filter) {
  if (!filter) return true;
  return Object.entries(filter).every(([key, value]) => {
    if (value === undefined || value === null) return true;
    const itemValue = item[key];
    if (typeof value === "string" && typeof itemValue === "string") {
      return itemValue.toLowerCase().includes(value.toLowerCase());
    }
    return itemValue === value;
  });
}

function sortRecords(records, sortBy) {
  if (!sortBy) return records;
  const desc = sortBy.startsWith("-");
  const field = desc ? sortBy.slice(1) : sortBy;
  return [...records].sort((a, b) => {
    const av = a[field];
    const bv = b[field];
    if (av === undefined || av === null) return 1;
    if (bv === undefined || bv === null) return -1;
    if (typeof av === "string" && typeof bv === "string") {
      return desc ? bv.localeCompare(av) : av.localeCompare(bv);
    }
    return desc ? bv - av : av - bv;
  });
}

function ensureDb() {
  const db = getDatabase();
  if (!db.boards) db.boards = [];
  if (!db.cards) db.cards = [];
  if (!db.studySessions) db.studySessions = [];
  if (!db.goals) db.goals = [];
  saveDatabase(db);
  return db;
}

function buildEntity(collection) {
  return {
    findMany: async (filter, sortBy, limit) => {
      const db = ensureDb();
      let items = db[collection].filter((item) => matchesFilter(item, normalizeFilter(filter)));
      if (sortBy) {
        items = sortRecords(items, sortBy);
      }
      if (typeof limit === "number") {
        items = items.slice(0, limit);
      }
      return items;
    },
    findOne: async (id) => {
      const db = ensureDb();
      return db[collection].find((item) => item.id === id) || null;
    },
    create: async (data) => {
      const db = ensureDb();
      const record = {
        id: createId(),
        createdAt: new Date().toISOString(),
        ...data,
      };
      db[collection].push(record);
      saveDatabase(db);
      return record;
    },
    update: async (id, updates) => {
      const db = ensureDb();
      const index = db[collection].findIndex((item) => item.id === id);
      if (index === -1) {
        throw new Error(`${collection} not found`);
      }
      db[collection][index] = {
        ...db[collection][index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      saveDatabase(db);
      return db[collection][index];
    },
    delete: async (id) => {
      const db = ensureDb();
      db[collection] = db[collection].filter((item) => item.id !== id);
      saveDatabase(db);
      return true;
    },
  };
}

const base44 = {
  entities: {
    Board: buildEntity("boards"),
    Card: buildEntity("cards"),
    StudySession: buildEntity("studySessions"),
    Goal: buildEntity("goals"),
  },
  ai: {
    ask: async (prompt) => {
      const trimmed = String(prompt || "").trim();
      if (!trimmed) {
        return "Send a prompt to get study support.";
      }
      const key = import.meta.env.VITE_AI_API_KEY;
      const fallback = [
        "Try structuring your study in 25-minute blocks with short breaks to stay focused.",
        "Review content with active questions and summaries to retain what you study.",
        "Set a small goal and start with the most important material.",
        "Break content into steps and focus on one objective at a time.",
      ];
      if (!key) {
        return fallback[Math.floor(Math.random() * fallback.length)];
      }
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a study assistant focused on productivity and healthy study habits.",
            },
            { role: "user", content: trimmed },
          ],
          max_tokens: 400,
          temperature: 0.8,
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error querying the AI API.");
      }
      const data = await response.json();
      return data?.choices?.[0]?.message?.content?.trim() || "I could not generate a response.";
    },
  },
};

const localDb = {
  supportsLocalStorage,
  getDatabase,
  saveDatabase,
  clearDatabase,
  exportDatabase,
  importDatabase,
};

export { base44, localDb };
