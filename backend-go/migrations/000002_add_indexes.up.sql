CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_matches_day ON matches(day);
CREATE INDEX idx_hints_match_id ON hints(match_id);
CREATE INDEX idx_guesses_user_id ON guesses(user_id);
