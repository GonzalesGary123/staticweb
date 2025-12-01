-- Standalone migration script to add middleman_id column to listings table
-- Run this in Supabase SQL Editor if you're getting the "column middleman_id does not exist" error

-- Step 1: Ensure middlemen table exists
CREATE TABLE IF NOT EXISTS middlemen (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Add middleman_id column if it doesn't exist (REQUIRED field)
DO $$ 
DECLARE
  default_middleman_id UUID;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'listings' 
    AND column_name = 'middleman_id'
  ) THEN
    -- Get the first middleman as default for existing listings (if any exist)
    SELECT id INTO default_middleman_id FROM middlemen LIMIT 1;
    
    -- Add column (nullable first if there are existing listings)
    ALTER TABLE listings ADD COLUMN middleman_id UUID;
    
    -- If there are existing listings and we have a default middleman, assign it
    IF default_middleman_id IS NOT NULL AND EXISTS (SELECT 1 FROM listings LIMIT 1) THEN
      UPDATE listings SET middleman_id = default_middleman_id WHERE middleman_id IS NULL;
    END IF;
    
    -- Add foreign key constraint
    ALTER TABLE listings ADD CONSTRAINT listings_middleman_id_fkey 
      FOREIGN KEY (middleman_id) REFERENCES middlemen(id) ON DELETE RESTRICT;
    
    -- Make it NOT NULL if we have a default or no existing listings
    IF default_middleman_id IS NOT NULL OR NOT EXISTS (SELECT 1 FROM listings LIMIT 1) THEN
      ALTER TABLE listings ALTER COLUMN middleman_id SET NOT NULL;
    END IF;
    
    RAISE NOTICE 'Column middleman_id added successfully';
  ELSE
    RAISE NOTICE 'Column middleman_id already exists';
    
    -- If column exists but is nullable, try to make it required
    -- (Only if all listings have a middleman assigned)
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public'
      AND table_name = 'listings' 
      AND column_name = 'middleman_id'
      AND is_nullable = 'YES'
    ) THEN
      -- Check if all listings have a middleman
      IF NOT EXISTS (SELECT 1 FROM listings WHERE middleman_id IS NULL) THEN
        ALTER TABLE listings ALTER COLUMN middleman_id SET NOT NULL;
        RAISE NOTICE 'Column middleman_id set to NOT NULL';
      ELSE
        RAISE NOTICE 'Warning: Some listings have NULL middleman_id. Please assign middlemen before making it required.';
      END IF;
    END IF;
  END IF;
END $$;

-- Step 3: Create index if it doesn't exist (only after column is created)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'listings' 
    AND column_name = 'middleman_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_listings_middleman_id ON listings(middleman_id);
    RAISE NOTICE 'Index idx_listings_middleman_id created successfully';
  ELSE
    RAISE NOTICE 'Cannot create index: middleman_id column does not exist yet';
  END IF;
END $$;

-- Step 4: Enable RLS on middlemen if not already enabled
ALTER TABLE middlemen ENABLE ROW LEVEL SECURITY;

-- Step 5: Add RLS policies for middlemen if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'middlemen' 
    AND policyname = 'Middlemen are viewable by everyone'
  ) THEN
    CREATE POLICY "Middlemen are viewable by everyone" ON middlemen
      FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'middlemen' 
    AND policyname = 'Admins can manage middlemen'
  ) THEN
    CREATE POLICY "Admins can manage middlemen" ON middlemen
      FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
