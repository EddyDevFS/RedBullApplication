INSERT INTO contacts (name, company, role, email, channel, notes) VALUES
  ('Red Bull Recruiter', 'Red Bull Canada', 'Recruiting / Talent', NULL, 'email', 'Primary personalized application link');

INSERT INTO links (token, contact_id, campaign, tracking_enabled, status) VALUES
  ('RB-7K2P9', 1, 'redbull-application', 1, 'created');

INSERT INTO links (token, campaign, tracking_enabled, status) VALUES
  ('PUBLIC-RED-BULL', 'redbull-application', 0, 'public');
