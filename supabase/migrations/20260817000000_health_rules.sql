-- 20260817000000_health_rules.sql

-- 20260817000000_health_rules.sql

-- We already have a `health_conditions` table that acts as the user mapping.
-- This table defines the global rules for those conditions based on `condition_name`.
CREATE TABLE system_health_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    condition_name TEXT UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    severity VARCHAR(50) CHECK (severity IN ('advisory', 'important', 'critical')) NOT NULL,
    
    allowed_categories JSONB,
    restricted_categories JSONB,
    flagged_ingredients JSONB,
    
    preferred_nutrients JSONB,
    restricted_nutrients JSONB,
    
    warning_message TEXT NOT NULL,
    risk_message TEXT NOT NULL,
    
    calorie_modifier JSONB,
    macro_overrides JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed basic data (Example: Coeliac Disease)
INSERT INTO system_health_rules (condition_name, display_name, severity, restricted_categories, flagged_ingredients, warning_message, risk_message) VALUES 
(
    'Coeliac Disease', 
    'Gluten Restriction', 
    'critical', 
    '["Bread", "Pasta", "Cereals"]', 
    '["gluten", "wheat", "barley", "rye", "oats"]', 
    'This food may contain gluten, which is restricted for Coeliac Disease.', 
    'Logging gluten can cause severe autoimmune reactions and damage to the small intestine.'
);

-- Add the foreign key relationship to link the user's `health_conditions` to the `system_health_rules`
ALTER TABLE public.health_conditions
  ADD CONSTRAINT health_conditions_condition_name_fkey 
  FOREIGN KEY (condition_name) 
  REFERENCES public.system_health_rules(condition_name) 
  ON UPDATE CASCADE 
  ON DELETE RESTRICT;

