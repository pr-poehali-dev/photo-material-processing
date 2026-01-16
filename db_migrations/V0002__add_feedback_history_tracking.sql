-- Add feedback history tracking table
CREATE TABLE IF NOT EXISTS t_p28865948_photo_material_proce.ai_feedback (
    id SERIAL PRIMARY KEY,
    material_id TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    feedback_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    model_version TEXT,
    predicted_code TEXT,
    actual_code TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_feedback_date ON t_p28865948_photo_material_proce.ai_feedback(feedback_date);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_material ON t_p28865948_photo_material_proce.ai_feedback(material_id);

-- Add timestamp to training metrics for historical tracking
ALTER TABLE t_p28865948_photo_material_proce.ai_training_metrics 
ADD COLUMN IF NOT EXISTS training_date TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_training_metrics_date ON t_p28865948_photo_material_proce.ai_training_metrics(training_date);
