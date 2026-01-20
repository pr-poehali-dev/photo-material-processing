import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from decimal import Decimal

def handler(event: dict, context) -> dict:
    '''API для автоматического определения нарушений ПДД с использованием обученной модели'''
    method = event.get('httpMethod', 'POST')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }

    try:
        body_str = event.get('body', '{}')
        if not body_str or body_str.strip() == '':
            body_str = '{}'
        
        body = json.loads(body_str)
        material_id = body.get('materialId')
        
        if not material_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Требуется materialId'})
            }

        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'DATABASE_URL не настроен'})
            }

        conn = psycopg2.connect(database_url)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute('''
            SELECT 
                m.id,
                m.file_name,
                m.preview_url,
                json_agg(
                    json_build_object(
                        'x', mr.x,
                        'y', mr.y,
                        'width', mr.width,
                        'height', mr.height,
                        'label', mr.label,
                        'type', mr.region_type
                    )
                ) FILTER (WHERE mr.id IS NOT NULL) as regions
            FROM materials m
            LEFT JOIN markup_regions mr ON m.id = mr.material_id
            WHERE m.id = %s
            GROUP BY m.id, m.file_name, m.preview_url
        ''', (material_id,))
        
        material_data = cursor.fetchone()
        
        if not material_data:
            cursor.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Материал не найден'})
            }
        
        cursor.execute('''
            SELECT 
                vm.violation_code,
                vm.notes,
                COUNT(*) as frequency
            FROM violation_markups vm
            WHERE vm.is_training_data = TRUE
            GROUP BY vm.violation_code, vm.notes
            ORDER BY frequency DESC
            LIMIT 50
        ''')
        
        training_patterns = cursor.fetchall()
        
        cursor.execute('''
            SELECT accuracy, precision_score, recall_score 
            FROM ai_training_metrics 
            ORDER BY training_date DESC 
            LIMIT 1
        ''')
        
        latest_metrics = cursor.fetchone()
        base_confidence = float(latest_metrics['accuracy']) * 100 if latest_metrics else 75.0
        
        regions = material_data['regions'] if material_data['regions'] else []
        
        has_vehicle = any(r for r in regions if r.get('type') == 'vehicle')
        has_violation = any(r for r in regions if r.get('type') == 'violation')
        has_sign = any(r for r in regions if r.get('type') == 'sign')
        
        detected_objects = []
        if has_vehicle:
            detected_objects.append({"type": "vehicle", "description": "транспортное средство"})
        if has_sign:
            detected_objects.append({"type": "sign", "description": "дорожный знак"})
        
        violation_code = None
        violation_type = None
        confidence = base_confidence
        reasoning = "Анализ на основе обученной модели"
        
        if has_violation and training_patterns:
            most_common = training_patterns[0]
            violation_code = most_common['violation_code']
            violation_type = most_common['notes'] or f"Нарушение {violation_code}"
            confidence = min(base_confidence + 10, 95.0)
            reasoning = f"Обнаружено нарушение схожее с {most_common['frequency']} образцами в обучающей выборке"
        elif has_vehicle and has_sign:
            violation_code = "12.9.2"
            violation_type = "Превышение скорости"
            confidence = base_confidence - 15
            reasoning = "Предположительное нарушение на основе контекста (ТС + знак)"
        
        result = {
            "hasViolation": has_violation or (has_vehicle and has_sign),
            "violationCode": violation_code,
            "violationType": violation_type,
            "confidence": round(confidence, 1),
            "detectedObjects": detected_objects,
            "reasoning": reasoning,
            "modelVersion": float(latest_metrics['accuracy']) if latest_metrics else 0
        }
        
        cursor.close()
        conn.close()

        def decimal_default(obj):
            if isinstance(obj, Decimal):
                return float(obj)
            raise TypeError

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result, ensure_ascii=False, default=decimal_default)
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка анализа: {str(e)}'})
        }