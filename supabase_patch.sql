-- ==============================================================================
-- EARTHWORM PLATFORM - NON-DESTRUCTIVE SUPABASE PATCH
-- Run this script in your Supabase Dashboard -> SQL Editor
-- SAFE: DOES NOT DROP, RESET, OR TRUNCATE ANY TABLES OR DELETE EXISTING USERS
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 2. ENSURE TABLES EXIST (WITHOUT DROPPING OR OVERWRITING EXISTING DATA)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer', 'buyer')),
    full_name TEXT NOT NULL DEFAULT 'Farmer',
    phone TEXT,
    district TEXT DEFAULT 'Coimbatore',
    language TEXT DEFAULT 'en',
    entity_name TEXT,
    contact_person TEXT,
    gstin TEXT,
    fssai TEXT,
    aadhaar_pan TEXT,
    proof_doc TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.farms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id TEXT NOT NULL,
    user_uuid UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    district TEXT NOT NULL,
    crop TEXT NOT NULL,
    acreage NUMERIC(6,2) DEFAULT 2.50,
    lat NUMERIC(9,6) DEFAULT 11.0168,
    lng NUMERIC(9,6) DEFAULT 76.9558,
    soil_type TEXT DEFAULT 'Red Sandy Loam',
    soil_ph NUMERIC(4,2) DEFAULT 6.9,
    ndvi_vigor NUMERIC(4,2) DEFAULT 0.74,
    working_capital NUMERIC(10,2) DEFAULT 38500,
    break_even_rate NUMERIC(6,2) DEFAULT 10.20,
    expected_yield TEXT DEFAULT '37.5 Tons',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lot_id TEXT UNIQUE NOT NULL,
    farmer_id TEXT NOT NULL,
    district TEXT NOT NULL,
    location TEXT,
    crop TEXT NOT NULL,
    volume NUMERIC(10,2) NOT NULL DEFAULT 2000,
    grade TEXT NOT NULL DEFAULT 'AI grade not available',
    color_score NUMERIC(5,2) DEFAULT NULL,
    caliber NUMERIC(6,2) DEFAULT NULL,
    defect_rate NUMERIC(5,2) DEFAULT NULL,
    assessment TEXT DEFAULT 'AI quality scan pending',
    price_per_kg NUMERIC(8,2) NOT NULL DEFAULT 28.50,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 57000,
    photo_url TEXT,
    status TEXT DEFAULT 'READY_FOR_BIDDING' CHECK (status IN ('READY_FOR_BIDDING', 'ESCROW_LOCKED', 'IN_TRANSIT', 'SETTLED')),
    storage_buffer TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    txn_id TEXT UNIQUE NOT NULL,
    lot_id TEXT NOT NULL,
    farmer_id TEXT NOT NULL,
    buyer_id TEXT NOT NULL,
    buyer_entity TEXT,
    crop TEXT NOT NULL,
    volume NUMERIC(10,2) NOT NULL,
    price_per_kg NUMERIC(8,2) NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL,
    status TEXT DEFAULT 'ESCROW_LOCKED' CHECK (status IN ('ESCROW_LOCKED', 'WEIGHMENT_CONFIRMED', 'DBT_RELEASED', 'SETTLED', 'DISPUTED')),
    share_pin TEXT,
    utr_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.grievances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    docket_id TEXT UNIQUE NOT NULL,
    farmer_id TEXT NOT NULL,
    district TEXT NOT NULL,
    dispute_type TEXT NOT NULL,
    trader_name TEXT,
    mandi_name TEXT,
    claim_amount NUMERIC(10,2),
    description TEXT,
    status TEXT DEFAULT 'SUBMITTED_24HR_SLA' CHECK (status IN ('SUBMITTED_24HR_SLA', 'UNDER_INVESTIGATION', 'HEARING_SCHEDULED', 'RESOLVED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quality_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id TEXT NOT NULL,
    lot_id TEXT,
    crop TEXT NOT NULL,
    grade TEXT NOT NULL,
    color_score NUMERIC(5,2),
    caliber NUMERIC(6,2),
    defect_rate NUMERIC(5,2),
    assessment TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_farms_farmer_id ON public.farms(farmer_id);
CREATE INDEX IF NOT EXISTS idx_lots_lot_id ON public.lots(lot_id);
CREATE INDEX IF NOT EXISTS idx_lots_farmer_id ON public.lots(farmer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_txn_id ON public.transactions(txn_id);
CREATE INDEX IF NOT EXISTS idx_grievances_farmer_id ON public.grievances(farmer_id);
CREATE INDEX IF NOT EXISTS idx_quality_scans_farmer_id ON public.quality_scans(farmer_id);

-- ------------------------------------------------------------------------------
-- 3. RECONCILE EXISTING INCOMPLETE PROFILES (IF ANY EXIST)
-- ------------------------------------------------------------------------------
UPDATE public.profiles
SET user_id = id::text
WHERE user_id IS NULL OR user_id = '';

-- ------------------------------------------------------------------------------
-- 4. FIX HANDLE_NEW_USER TRIGGER FUNCTION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id TEXT;
  v_role TEXT;
  v_full_name TEXT;
  v_phone TEXT;
  v_district TEXT;
  v_language TEXT;
  v_entity_name TEXT;
  v_contact_person TEXT;
  v_gstin TEXT;
  v_fssai TEXT;
  v_aadhaar_pan TEXT;
  v_proof_doc TEXT;
BEGIN
  -- Extract user_id with fallback to auth UUID
  v_user_id := COALESCE(
    new.raw_user_meta_data->>'user_id',
    new.raw_user_meta_data->>'userId',
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1),
    new.id::text
  );

  v_role := COALESCE(new.raw_user_meta_data->>'role', 'farmer');
  v_full_name := COALESCE(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'contact_person',
    new.raw_user_meta_data->>'entity_name',
    'Earthworm User'
  );
  v_phone := COALESCE(new.raw_user_meta_data->>'phone', '');
  v_district := COALESCE(new.raw_user_meta_data->>'district', 'Coimbatore');
  v_language := COALESCE(new.raw_user_meta_data->>'language', 'en');
  v_entity_name := new.raw_user_meta_data->>'entity_name';
  v_contact_person := new.raw_user_meta_data->>'contact_person';
  v_gstin := new.raw_user_meta_data->>'gstin';
  v_fssai := new.raw_user_meta_data->>'fssai';
  v_aadhaar_pan := new.raw_user_meta_data->>'aadhaar_pan';
  v_proof_doc := new.raw_user_meta_data->>'proof_doc';

  INSERT INTO public.profiles (
    id,
    user_id,
    role,
    full_name,
    phone,
    district,
    language,
    entity_name,
    contact_person,
    gstin,
    fssai,
    aadhaar_pan,
    proof_doc,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    v_user_id,
    v_role,
    v_full_name,
    v_phone,
    v_district,
    v_language,
    v_entity_name,
    v_contact_person,
    v_gstin,
    v_fssai,
    v_aadhaar_pan,
    v_proof_doc,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    district = EXCLUDED.district,
    language = EXCLUDED.language,
    entity_name = EXCLUDED.entity_name,
    contact_person = EXCLUDED.contact_person,
    gstin = EXCLUDED.gstin,
    fssai = EXCLUDED.fssai,
    aadhaar_pan = EXCLUDED.aadhaar_pan,
    proof_doc = EXCLUDED.proof_doc,
    updated_at = NOW();

  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user error for %: %', new.id, SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Rebind trigger cleanly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grievances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_scans ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles read access" ON public.profiles;
CREATE POLICY "Public profiles read access" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id OR auth.role() = 'authenticated');

-- Farms Policies
DROP POLICY IF EXISTS "Allow read access to farms" ON public.farms;
CREATE POLICY "Allow read access to farms" ON public.farms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Farmers can insert their farm" ON public.farms;
CREATE POLICY "Farmers can insert their farm" ON public.farms FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR true);

DROP POLICY IF EXISTS "Farmers can update their farm" ON public.farms;
CREATE POLICY "Farmers can update their farm" ON public.farms FOR UPDATE USING (auth.role() = 'authenticated' OR true);

-- Lots Policies
DROP POLICY IF EXISTS "Public read access for lots" ON public.lots;
CREATE POLICY "Public read access for lots" ON public.lots FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow lot publish" ON public.lots;
CREATE POLICY "Allow lot publish" ON public.lots FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow lot update" ON public.lots;
CREATE POLICY "Allow lot update" ON public.lots FOR UPDATE USING (true);

-- Transactions Policies
DROP POLICY IF EXISTS "Allow read access to transactions" ON public.transactions;
CREATE POLICY "Allow read access to transactions" ON public.transactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow transaction create" ON public.transactions;
CREATE POLICY "Allow transaction create" ON public.transactions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow transaction update" ON public.transactions;
CREATE POLICY "Allow transaction update" ON public.transactions FOR UPDATE USING (true);

-- Grievances Policies
DROP POLICY IF EXISTS "Allow read access to grievances" ON public.grievances;
CREATE POLICY "Allow read access to grievances" ON public.grievances FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow grievance submission" ON public.grievances;
CREATE POLICY "Allow grievance submission" ON public.grievances FOR INSERT WITH CHECK (true);

-- Quality Scans Policies
DROP POLICY IF EXISTS "Allow read access to quality scans" ON public.quality_scans;
CREATE POLICY "Allow read access to quality scans" ON public.quality_scans FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow quality scan insert" ON public.quality_scans;
CREATE POLICY "Allow quality scan insert" ON public.quality_scans FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- PATCH COMPLETE: ALL TABLES & DATA FULLY PRESERVED
-- ==============================================================================
