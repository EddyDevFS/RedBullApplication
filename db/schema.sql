CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  company TEXT,
  role TEXT,
  email TEXT,
  channel TEXT,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token TEXT UNIQUE NOT NULL,
  contact_id INTEGER,
  campaign TEXT,
  parent_token TEXT,
  tracking_enabled INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_opened_at TEXT,
  status TEXT DEFAULT 'created',
  FOREIGN KEY(contact_id) REFERENCES contacts(id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT UNIQUE NOT NULL,
  token TEXT NOT NULL,
  visitor_id TEXT,
  started_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TEXT,
  active_time_seconds INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  country TEXT,
  region TEXT,
  referrer TEXT,
  user_agent_hash TEXT,
  tracking_consent INTEGER DEFAULT 1,
  FOREIGN KEY(token) REFERENCES links(token)
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT,
  token TEXT,
  event_type TEXT NOT NULL,
  section_id TEXT,
  event_data TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(session_id) REFERENCES sessions(session_id)
);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  title TEXT,
  file_url TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token TEXT,
  type TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  title TEXT,
  message TEXT,
  event_data TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_links_token ON links(token);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_events_token ON events(token);
CREATE INDEX IF NOT EXISTS idx_events_session_id ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_messages_token ON messages(token);
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(type);

INSERT OR IGNORE INTO documents (id, title, file_url) VALUES
  ('resume', 'Eddy Sallault Resume', '/assets/docs/eddy-sallault-resume.pdf'),
  ('wingfinder-report', 'Red Bull Wingfinder Report', '/assets/docs/eddy-sallault-wingfinder-report.pdf'),
  ('wingfinder-passport', 'Wingfinder Passport Summary', '/assets/docs/eddy-sallault-wingfinder-passport.pdf');
