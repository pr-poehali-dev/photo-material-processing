-- Удаляем старое ограничение
ALTER TABLE markup_regions DROP CONSTRAINT IF EXISTS markup_regions_region_type_check;

-- Добавляем новое ограничение с дополнительными типами
ALTER TABLE markup_regions ADD CONSTRAINT markup_regions_region_type_check 
CHECK (region_type IN ('vehicle', 'plate', 'signal', 'sign', 'seatbelt', 'headlight', 'other'));