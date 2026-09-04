import { createClient } from "@supabase/supabase-js";

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const rawSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const isPlaceholderValue = (value: string | undefined) =>
  !value ||
  value.trim().length === 0 ||
  value.includes("your-project-ref") ||
  value.includes("your-anon-key") ||
  value.includes("placeholder");

const supabaseUrl = isPlaceholderValue(rawSupabaseUrl) ? undefined : rawSupabaseUrl;
const supabaseAnonKey = isPlaceholderValue(rawSupabaseAnonKey) ? undefined : rawSupabaseAnonKey;
const hasRealSupabase = Boolean(supabaseUrl && supabaseAnonKey);

const LOCAL_DB_KEY = "jaboque_local_db";
const LOCAL_SESSION_KEY = "jaboque_local_session";

type LocalUser = {
  id: string;
  email: string;
  password: string;
  role: "admin" | "client" | "company";
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  city: string | null;
  province: string | null;
  created_at: string;
};

type LocalDatabase = {
  users: LocalUser[];
};

const generateId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const loadLocalDb = (): LocalDatabase => {
  const raw = localStorage.getItem(LOCAL_DB_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as LocalDatabase;
    } catch {
      // fall through to reset the local db
    }
  }
  const initial: LocalDatabase = { users: [] };
  localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(initial));
  return initial;
};

const saveLocalDb = (db: LocalDatabase) => {
  localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(db));
};

const getLocalSession = () => {
  const raw = localStorage.getItem(LOCAL_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { session: { user: { id: string; email: string } } };
  } catch {
    return null;
  }
};

const setLocalSession = (session: { session: { user: { id: string; email: string } } } | null) => {
  if (session) {
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(LOCAL_SESSION_KEY);
  }
  localAuthEventEmitter.notify(session);
};

const localAuthEventEmitter = {
  listeners: new Set<(event: string, session: any) => void>(),
  subscribe(callback: (event: string, session: any) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  },
  notify(session: { session: { user: { id: string; email: string } } } | null) {
    const currentSession = session?.session ?? null;
    this.listeners.forEach((callback) => callback("SIGNED_IN", currentSession));
  },
};

const ensureDefaultUsers = (db: LocalDatabase) => {
  const defaultUsers: LocalUser[] = [
    {
      id: "00000000-0000-0000-0000-000000000001",
      email: "demo.admin@jaboque.com",
      password: "demo123456",
      role: "admin",
      full_name: "Administrador JABOQUE",
      phone: null,
      avatar_url: null,
      city: null,
      province: null,
      created_at: new Date().toISOString(),
    },
    {
      id: "00000000-0000-0000-0000-000000000002",
      email: "demo.cliente@jaboque.com",
      password: "demo123456",
      role: "client",
      full_name: "Cliente Demo",
      phone: null,
      avatar_url: null,
      city: null,
      province: null,
      created_at: new Date().toISOString(),
    },
    {
      id: "00000000-0000-0000-0000-000000000003",
      email: "demo.buffet@jaboque.com",
      password: "demo123456",
      role: "company",
      full_name: "Buffet Demo",
      phone: null,
      avatar_url: null,
      city: null,
      province: null,
      created_at: new Date().toISOString(),
    },
  ];

  defaultUsers.forEach((user) => {
    if (!db.users.find((existing) => existing.email === user.email)) {
      db.users.push(user);
    }
  });
  saveLocalDb(db);
};

const createLocalSupabase = () => {
  const db = loadLocalDb();
  ensureDefaultUsers(db);

  const getUserByEmail = (email: string) =>
    db.users.find((user) => user.email.toLowerCase() === email.toLowerCase());

  const getUserById = (id: string) => db.users.find((user) => user.id === id) ?? null;

  const auth = {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      const user = getUserByEmail(email);
      if (!user || user.password !== password) {
        return { data: null, error: { message: "Email ou senha inválidos." } };
      }
      const session = { session: { user: { id: user.id, email: user.email } } };
      setLocalSession(session);
      return { data: { session }, error: null };
    },
    signUp: async ({ email, password, options }: { email: string; password: string; options?: any }) => {
      if (getUserByEmail(email)) {
        return { data: null, error: { message: "Já existe uma conta com esse email." } };
      }
      const role = options?.data?.role ?? "client";
      const full_name = options?.data?.full_name ?? email.split("@")[0];
      const user: LocalUser = {
        id: generateId(),
        email,
        password,
        role,
        full_name,
        phone: null,
        avatar_url: null,
        city: null,
        province: null,
        created_at: new Date().toISOString(),
      };
      db.users.push(user);
      saveLocalDb(db);
      const session = { session: { user: { id: user.id, email: user.email } } };
      setLocalSession(session);
      return { data: { user, session }, error: null };
    },
    signOut: async () => {
      setLocalSession(null);
      return { data: null, error: null };
    },
    getSession: async () => ({ data: { session: getLocalSession()?.session ?? null } }),
    getUser: async () => {
      const session = getLocalSession();
      const user = session?.session?.user ? getUserById(session.session.user.id) : null;
      return {
        data: {
          user: user
            ? {
                ...user,
                user_metadata: {
                  role: user.role,
                  full_name: user.full_name,
                },
              }
            : null,
        },
        error: null,
      };
    },
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      const unsubscribe = localAuthEventEmitter.subscribe(callback);
      return { data: { subscription: { unsubscribe } } };
    },
  };

  const from = (table: string) => {
    const chain: any = {
      _table: table,
      _select: "*",
      _filters: [] as Array<{ column: string; operator: string; value: any }>,
      select(columns = "*") {
        chain._select = columns;
        return chain;
      },
      eq(column: string, value: any) {
        chain._filters.push({ column, operator: "eq", value });
        return chain;
      },
      maybeSingle: async () => {
        if (table === "profiles") {
          const id = chain._filters.find((filter: any) => filter.column === "id")?.value;
          const user = id ? getUserById(id) : null;
          return { data: user, error: null };
        }
        return { data: null, error: null };
      },
      insert: async (values: any) => {
        if (table === "profiles") {
          const profile = Array.isArray(values) ? values[0] : values;
          const existing = db.users.find((user) => user.id === profile.id);
          if (existing) {
            Object.assign(existing, profile);
          } else {
            db.users.push(profile as LocalUser);
          }
          saveLocalDb(db);
          return { data: values, error: null };
        }
        return { data: values, error: null };
      },
      single: async () => chain.maybeSingle(),
      order: () => chain,
      limit: () => chain,
      filter: () => chain,
      match: () => chain,
      in: () => chain,
      update: async (values: any) => {
        if (table === "profiles") {
          const id = chain._filters.find((filter: any) => filter.column === "id")?.value;
          const existing = id ? getUserById(id) : null;
          if (existing) {
            Object.assign(existing, values);
            saveLocalDb(db);
            return { data: [existing], error: null };
          }
          return { data: null, error: { message: "Perfil não encontrado." } };
        }
        return { data: null, error: null };
      },
      delete: async () => ({ data: null, error: null }),
    };
    return chain;
  };

  return {
    auth,
    from,
    storage: {
      from: () => ({ upload: async () => ({ data: null, error: null }), download: async () => ({ data: null, error: null }) }),
    },
    functions: {
      invoke: async () => ({ data: null, error: null }),
    },
  };
};

const mockSupabase = createLocalSupabase();

export const supabase = hasRealSupabase
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : (mockSupabase as any);

export const isSupabaseConfigured = hasRealSupabase;
export const supabaseConfigError = !hasRealSupabase
  ? "Supabase não está configurado. Usando modo de desenvolvimento local com dados mock."
  : null;
