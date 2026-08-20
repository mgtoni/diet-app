-- 20260820143000_add_missing_health_rules.sql
BEGIN;

INSERT INTO system_health_rules (condition_name, display_name, severity, restricted_categories, flagged_ingredients, warning_message, risk_message) VALUES 
('Gluten Intolerance', 'Gluten Sensitivity', 'important', '["Bread", "Pasta", "Cereals"]', '["gluten", "wheat", "barley", "rye"]', 'This food contains gluten.', 'May cause digestive discomfort.'),
('Lactose Intolerance', 'Lactose Sensitivity', 'important', '["Dairy"]', '["lactose", "milk", "cheese", "cream"]', 'This food contains lactose.', 'May cause bloating and digestive issues.'),
('IBS', 'Irritable Bowel Syndrome', 'important', '[]', '["garlic", "onion", "beans", "artificial sweeteners"]', 'This food contains common IBS triggers.', 'May trigger IBS symptoms.'),
('Low FODMAP', 'Low FODMAP Diet', 'important', '[]', '["fructose", "lactose", "fructans", "galactans", "polyols"]', 'This food is high in FODMAPs.', 'Can cause severe bloating and pain.'),
('Hypertension', 'High Blood Pressure', 'critical', '[]', '["salt", "sodium", "msg"]', 'This food is high in sodium.', 'Excess sodium can increase blood pressure.'),
('High Cholesterol', 'High Cholesterol', 'important', '[]', '["trans fats", "saturated fat", "palm oil"]', 'This food is high in saturated or trans fats.', 'Can contribute to cardiovascular disease.'),
('Kidney Disease', 'Renal Diet', 'critical', '[]', '["sodium", "potassium", "phosphorus"]', 'This food contains high levels of restricted minerals.', 'Can cause serious complications for kidney function.'),
('Gout', 'Gout Diet', 'critical', '[]', '["purines", "alcohol", "red meat", "shellfish"]', 'This food is high in purines.', 'May trigger a painful gout attack.')
ON CONFLICT (condition_name) DO NOTHING;

COMMIT;
