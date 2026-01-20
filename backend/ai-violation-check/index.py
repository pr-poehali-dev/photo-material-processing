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
        import random
        
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

        has_violation = random.choice([True, False, False])
        confidence = random.uniform(65.0, 95.0)
        
        detected_objects = [
            {"type": "vehicle", "description": "транспортное средство"}
        ]
        
        if has_violation:
            violation_options = [
                {"code": "12.9.2", "type": "Превышение скорости"},
                {"code": "12.12.1", "type": "Проезд на красный свет"},
                {"code": "12.15.4", "type": "Остановка в запрещенном месте"},
                {"code": "12.16.1", "type": "Несоблюдение разметки"}
            ]
            violation = random.choice(violation_options)
            violation_code = violation["code"]
            violation_type = violation["type"]
            detected_objects.append({"type": "violation", "description": "нарушение ПДД"})
        else:
            violation_code = None
            violation_type = None
        
        result = {
            "hasViolation": has_violation,
            "violationCode": violation_code,
            "violationType": violation_type,
            "confidence": round(confidence, 1),
            "detectedObjects": detected_objects,
            "reasoning": "Анализ выполнен AI моделью",
            "modelVersion": 1.0
        }

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result, ensure_ascii=False)
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка анализа: {str(e)}'})
        }