-- 20260817000000_health_rules.sql

CREATE TABLE health_conditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE, -- e.g., "Coeliac Disease", "Diabetes"
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE health_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    condition_id UUID REFERENCES health_conditions(id) ON DELETE CASCADE,
    display_name VARCHAR(255) NOT NULL,
    severity VARCHAR(50) CHECK (severity IN ('advisory', 'important', 'critical')) NOT NULL,
    
    allowed_categories JSONB, -- Array of strings
    restricted_categories JSONB, -- Array of strings
    flagged_ingredients JSONB, -- Array of strings
    
    preferred_nutrients JSONB, -- Record of { min: number }
    restricted_nutrients JSONB, -- Record of { max: number }
    
    warning_message TEXT NOT NULL,
    risk_message TEXT NOT NULL,
    
    calorie_modifier JSONB, -- { type: 'multiplier'|'absolute', value: number }
    macro_overrides JSONB, -- { protein?: number, fat?: number, carbohydrates?: number }
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_health_conditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    condition_id UUID REFERENCES health_conditions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, condition_id)
);

-- Seed basic data (Example: Coeliac Disease)
INSERT INTO health_conditions (id, name, description) VALUES 
('c0000000-0000-0000-0000-000000000001', 'Coeliac Disease', 'Autoimmune reaction to gluten.');

INSERT INTO health_rules (id, condition_id, display_name, severity, restricted_categories, flagged_ingredients, warning_message, risk_message) VALUES 
(
    'r0000000-0000-0000-0000-000000000001', 
    'c0000000-0000-0000-0000-000000000001', 
    'Gluten Restriction', 
    'critical', 
    '["Bread", "Pasta", "Cereals"]', 
    '["gluten", "wheat", "barley", "rye", "oats"]', 
    'This food may contain gluten, which is restricted for Coeliac Disease.', 
    'Logging gluten can cause severe autoimmune reactions and damage to the small intestine.'
);
