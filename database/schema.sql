-- Legends of Ymir Account Marketplace Database Schema
-- Run this SQL in your Supabase SQL Editor to create the necessary tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  is_admin BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Middlemen table (only admins can manage) - MUST be created before listings
CREATE TABLE IF NOT EXISTS middlemen (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Listings table
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  server TEXT NOT NULL,
  growth_power TEXT NOT NULL,
  classes_list TEXT[] NOT NULL DEFAULT '{}',
  asking_price TEXT NOT NULL,
  contact_link TEXT,
  contact_number TEXT NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'sold')),
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Note: middleman_id is added via migration below (required field)

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('pending_review', 'approved', 'rejected', 'sold')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
-- Note: idx_listings_middleman_id is created after the migration adds the column (see migration section below)
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_server ON listings(server);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Feedback table (for middleman vouches and app feedback)
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  middleman_id UUID REFERENCES middlemen(id) ON DELETE SET NULL,
  -- 'middleman' = vouch for middleman, 'app' = general app feedback
  type TEXT NOT NULL CHECK (type IN ('middleman', 'app')),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(type);
CREATE INDEX IF NOT EXISTS idx_feedback_middleman_id ON feedback(middleman_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE middlemen ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
-- Drop existing policies if they exist, then create them
DROP POLICY IF EXISTS "Users are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Anyone can register" ON users;

-- Allow anyone to read users (for public profiles if needed)
CREATE POLICY "Users are viewable by everyone" ON users
  FOR SELECT USING (true);

-- Allow anyone to insert users (registration)
CREATE POLICY "Anyone can register" ON users
  FOR INSERT WITH CHECK (true);

-- RLS Policies for listings table
-- Drop existing policies if they exist, then create them
DROP POLICY IF EXISTS "Listings are viewable by everyone" ON listings;
DROP POLICY IF EXISTS "Anyone can create listings" ON listings;
DROP POLICY IF EXISTS "Anyone can update listings" ON listings;

-- Allow anyone to read listings
CREATE POLICY "Listings are viewable by everyone" ON listings
  FOR SELECT USING (true);

-- Allow anyone to insert listings (for now)
-- You can restrict this later to require authentication
CREATE POLICY "Anyone can create listings" ON listings
  FOR INSERT WITH CHECK (true);

-- Allow updates to listings (admin approval is checked in application code)
CREATE POLICY "Anyone can update listings" ON listings
  FOR UPDATE USING (true) WITH CHECK (true);

-- RLS Policies for notifications table
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;

-- Allow users to read their own notifications
-- Note: Application-level filtering ensures users only see their own notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (true);

-- Allow inserting notifications (application will handle this)
CREATE POLICY "Users can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Allow users to update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (true) WITH CHECK (true);

-- RLS Policies for middlemen table
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Middlemen are viewable by everyone" ON middlemen;
DROP POLICY IF EXISTS "Admins can manage middlemen" ON middlemen;

-- Allow anyone to read middlemen (for selection in forms)
CREATE POLICY "Middlemen are viewable by everyone" ON middlemen
  FOR SELECT USING (true);

-- Only admins can insert/update/delete middlemen (checked in application code)
-- Note: Application-level authorization is required for INSERT/UPDATE/DELETE
CREATE POLICY "Admins can manage middlemen" ON middlemen
  FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for feedback table
DROP POLICY IF EXISTS "Feedback viewable by everyone" ON feedback;
DROP POLICY IF EXISTS "Users can insert feedback" ON feedback;

-- Anyone can read feedback (for transparency / vouches)
CREATE POLICY "Feedback viewable by everyone" ON feedback
  FOR SELECT USING (true);

-- Anyone can insert feedback (auth handled in application)
CREATE POLICY "Users can insert feedback" ON feedback
  FOR INSERT WITH CHECK (true);

-- Allow users to update their own listings (optional, for future features)
-- CREATE POLICY "Users can update own listings" ON listings
--   FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own listings (optional, for future features)
-- CREATE POLICY "Users can delete own listings" ON listings
--   FOR DELETE USING (auth.uid() = user_id);

-- Migration: Add is_admin column to existing users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE NOT NULL;

-- Migration: Add approval fields to existing listings table if they don't exist
ALTER TABLE listings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' NOT NULL;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- Update constraint to include 'sold' status
-- First drop the old constraint if it exists
ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_status_check;

-- Add the updated constraint with 'sold' status
ALTER TABLE listings ADD CONSTRAINT listings_status_check 
  CHECK (status IN ('pending', 'approved', 'rejected', 'sold'));

-- Update existing listings to approved status (optional - you may want to review these manually)
-- UPDATE listings SET status = 'approved' WHERE status IS NULL OR status = '';

-- Migration: Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('pending_review', 'approved', 'rejected', 'sold')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migration: Add notification indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Migration: Add middleman_id to listings table if it doesn't exist
DO $$ 
BEGIN
  -- Ensure middlemen table exists first
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'middlemen') THEN
    CREATE TABLE middlemen (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      link TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;
  
  -- Add middleman_id column if it doesn't exist
  -- Note: Column is nullable in DB for backward compatibility, but required at application level
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'middleman_id'
  ) THEN
    ALTER TABLE listings ADD COLUMN middleman_id UUID;
    
    -- Add foreign key constraint if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'listings_middleman_id_fkey'
    ) THEN
      ALTER TABLE listings ADD CONSTRAINT listings_middleman_id_fkey 
        FOREIGN KEY (middleman_id) REFERENCES middlemen(id) ON DELETE RESTRICT;
    END IF;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_listings_middleman_id ON listings(middleman_id);

-- To make a user an admin, run this SQL (replace 'user@example.com' with the actual email):
-- UPDATE users SET is_admin = TRUE WHERE email = 'user@example.com';

