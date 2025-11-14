-- CloneWander Supabase Schema
-- Run this SQL in your Supabase SQL Editor to create the required tables

-- Clones table
CREATE TABLE IF NOT EXISTS clones (
  id TEXT PRIMARY KEY,
  "travelerName" TEXT NOT NULL,
  "travelerType" TEXT NOT NULL CHECK ("travelerType" IN ('budget', 'normal', 'luxury')),
  destination TEXT NOT NULL,
  duration INTEGER NOT NULL CHECK (duration > 0),
  categories JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed')),
  "totalSpend" DECIMAL(10, 2) DEFAULT 0,
  "startTime" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Journals table
CREATE TABLE IF NOT EXISTS journals (
  id TEXT PRIMARY KEY,
  "cloneId" TEXT NOT NULL REFERENCES clones(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL,
  message TEXT NOT NULL,
  cost DECIMAL(10, 2) DEFAULT 0,
  route TEXT,
  transportation TEXT,
  "dailySpend" DECIMAL(10, 2) DEFAULT 0,
  "totalSpend" DECIMAL(10, 2) DEFAULT 0,
  "dayNumber" INTEGER NOT NULL,
  "timeOfDay" TEXT NOT NULL CHECK ("timeOfDay" IN ('morning', 'afternoon', 'evening'))
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_clones_status ON clones(status);
CREATE INDEX IF NOT EXISTS idx_clones_created_at ON clones("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_journals_clone_id ON journals("cloneId");
CREATE INDEX IF NOT EXISTS idx_journals_timestamp ON journals(timestamp DESC);

-- Enable Row Level Security (RLS) - Optional but recommended for production
-- For development/testing, you can disable RLS or set permissive policies

-- Uncomment these lines if you want to enable RLS:
-- ALTER TABLE clones ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE journals ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for testing (allows all operations)
-- In production, you should replace these with proper auth-based policies
-- CREATE POLICY "Allow all operations on clones" ON clones FOR ALL USING (true);
-- CREATE POLICY "Allow all operations on journals" ON journals FOR ALL USING (true);
