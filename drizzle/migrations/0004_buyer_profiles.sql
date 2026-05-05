-- Migration: add buyer_profiles table
CREATE TABLE IF NOT EXISTS buyer_profiles (
  id serial PRIMARY KEY,
  name text NOT NULL,
  email text,
  phone text,
  address text,
  external_id text,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes for quick lookup
CREATE INDEX IF NOT EXISTS buyer_profiles_email_idx ON buyer_profiles (email);
CREATE INDEX IF NOT EXISTS buyer_profiles_external_id_idx ON buyer_profiles (external_id);
