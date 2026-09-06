-- ==============================================================================
-- EARTHWORM PLATFORM - SUPABASE DATABASE SCHEMA & RLS POLICIES
-- Run this script in your Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 2. SCHEMA DEFINITION (NON-DESTRUCTIVE: Tables created if not present)
-- ------------------------------------------------------------------------------

-- ------------------------------------------------------------------------------
-- 3. PROFILES TABLE (Both Farmers and Institutional Buyers)
-- ------------------------------------------------------------------------------
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer', 'buyer')),
    full_name TEXT NOT NULL,
    phone TEXT,
    district TEXT,
    language TEXT DEFAULT 'en',
    -- Buyer Specific Fields (Optional for farmers)
    entity_name TEXT,
    contact_person TEXT,
    gstin TEXT,
    fssai TEXT,
    aadhaar_pan TEXT,
    proof_doc TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user_id lookups
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles read access" ON public.profiles;
CREATE POLICY "Public profiles read access" ON public.profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- 4. FARMS TABLE (Farmer Digital Twins, Acreage, GIS & Soil Telemetry)
-- ------------------------------------------------------------------------------
CREATE TABLE public.farms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id TEXT NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
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

CREATE INDEX idx_farms_farmer_id ON public.farms(farmer_id);
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read access to farms" ON public.farms;
CREATE POLICY "Allow read access to farms" ON public.farms
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Farmers can insert their farm" ON public.farms;
CREATE POLICY "Farmers can insert their farm" ON public.farms
    FOR INSERT WITH CHECK (auth.uid() = user_uuid OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Farmers can update their farm" ON public.farms;
CREATE POLICY "Farmers can update their farm" ON public.farms
    FOR UPDATE USING (auth.uid() = user_uuid OR auth.role() = 'authenticated');

-- ------------------------------------------------------------------------------
-- 5. LOTS TABLE (Published Produce Lots for Marketplace Bidding)
-- ------------------------------------------------------------------------------
CREATE TABLE public.lots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lot_id TEXT UNIQUE NOT NULL,
    farmer_id TEXT NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
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

CREATE INDEX idx_lots_lot_id ON public.lots(lot_id);
CREATE INDEX idx_lots_farmer_id ON public.lots(farmer_id);
CREATE INDEX idx_lots_status ON public.lots(status);
ALTER TABLE public.lots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for lots" ON public.lots;
CREATE POLICY "Public read access for lots" ON public.lots
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert lots" ON public.lots;
CREATE POLICY "Authenticated users can insert lots" ON public.lots
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update lots" ON public.lots;
CREATE POLICY "Authenticated users can update lots" ON public.lots
    FOR UPDATE USING (auth.role() = 'authenticated');

-- ------------------------------------------------------------------------------
-- 6. TRANSACTIONS TABLE (24-Hour Escrow Settlements & Direct Bank Transfers)
-- ------------------------------------------------------------------------------
CREATE TABLE public.transactions (
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

CREATE INDEX idx_transactions_txn_id ON public.transactions(txn_id);
CREATE INDEX idx_transactions_farmer_id ON public.transactions(farmer_id);
CREATE INDEX idx_transactions_buyer_id ON public.transactions(buyer_id);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read access to transactions" ON public.transactions;
CREATE POLICY "Allow read access to transactions" ON public.transactions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert transactions" ON public.transactions;
CREATE POLICY "Authenticated users can insert transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update transactions" ON public.transactions;
CREATE POLICY "Authenticated users can update transactions" ON public.transactions
    FOR UPDATE USING (auth.role() = 'authenticated');

-- ------------------------------------------------------------------------------
-- 7. GRIEVANCES TABLE (APMC Form 8 Dispute Redressal Dockets)
-- ------------------------------------------------------------------------------
CREATE TABLE public.grievances (
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

CREATE INDEX idx_grievances_farmer_id ON public.grievances(farmer_id);
ALTER TABLE public.grievances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read access to grievances" ON public.grievances;
CREATE POLICY "Allow read access to grievances" ON public.grievances
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert grievances" ON public.grievances;
CREATE POLICY "Authenticated users can insert grievances" ON public.grievances
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ------------------------------------------------------------------------------
-- 8. QUALITY_SCANS TABLE (AI Multimodal Assaying Records & Grade Certifications)
-- ------------------------------------------------------------------------------
CREATE TABLE public.quality_scans (
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

CREATE INDEX idx_quality_scans_farmer_id ON public.quality_scans(farmer_id);
ALTER TABLE public.quality_scans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read access to quality scans" ON public.quality_scans;
CREATE POLICY "Allow read access to quality scans" ON public.quality_scans
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert quality scans" ON public.quality_scans;
CREATE POLICY "Authenticated users can insert quality scans" ON public.quality_scans
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ==============================================================================
-- SCHEMA SETUP COMPLETE
-- ==============================================================================
