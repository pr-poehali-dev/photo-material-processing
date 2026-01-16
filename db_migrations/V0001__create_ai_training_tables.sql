-- Таблица для хранения материалов
CREATE TABLE IF NOT EXISTS materials (
    id TEXT PRIMARY KEY,
    file_name TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    preview_url TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'violation', 'clean', 'analytics', 'processed')),
    violation_type TEXT,
    violation_code TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для хранения размеченных регионов
CREATE TABLE IF NOT EXISTS markup_regions (
    id TEXT PRIMARY KEY,
    material_id TEXT NOT NULL REFERENCES materials(id),
    x NUMERIC NOT NULL,
    y NUMERIC NOT NULL,
    width NUMERIC NOT NULL,
    height NUMERIC NOT NULL,
    label TEXT,
    region_type TEXT NOT NULL CHECK (region_type IN ('vehicle', 'plate', 'signal', 'sign', 'other')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для хранения разметки нарушений
CREATE TABLE IF NOT EXISTS violation_markups (
    id SERIAL PRIMARY KEY,
    material_id TEXT NOT NULL REFERENCES materials(id),
    violation_code TEXT,
    notes TEXT,
    confidence NUMERIC,
    is_training_data BOOLEAN DEFAULT FALSE,
    marked_by TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(material_id)
);

-- Таблица для хранения параметров нарушений
CREATE TABLE IF NOT EXISTS violation_parameters (
    id SERIAL PRIMARY KEY,
    markup_id INTEGER NOT NULL REFERENCES violation_markups(id),
    parameter_id TEXT NOT NULL,
    parameter_name TEXT NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для хранения обучающих данных ИИ
CREATE TABLE IF NOT EXISTS ai_training_data (
    id SERIAL PRIMARY KEY,
    material_id TEXT NOT NULL REFERENCES materials(id),
    markup_id INTEGER NOT NULL REFERENCES violation_markups(id),
    model_version TEXT,
    features JSONB,
    prediction_result TEXT,
    actual_result TEXT,
    is_correct BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для метрик обучения ИИ
CREATE TABLE IF NOT EXISTS ai_training_metrics (
    id SERIAL PRIMARY KEY,
    model_version TEXT NOT NULL,
    accuracy NUMERIC,
    precision_score NUMERIC,
    recall_score NUMERIC,
    f1_score NUMERIC,
    training_samples_count INTEGER,
    training_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_materials_status ON materials(status);
CREATE INDEX IF NOT EXISTS idx_materials_violation_code ON materials(violation_code);
CREATE INDEX IF NOT EXISTS idx_markup_regions_material_id ON markup_regions(material_id);
CREATE INDEX IF NOT EXISTS idx_violation_markups_material_id ON violation_markups(material_id);
CREATE INDEX IF NOT EXISTS idx_violation_markups_training_data ON violation_markups(is_training_data);
CREATE INDEX IF NOT EXISTS idx_ai_training_data_material_id ON ai_training_data(material_id);
CREATE INDEX IF NOT EXISTS idx_ai_training_metrics_version ON ai_training_metrics(model_version);
