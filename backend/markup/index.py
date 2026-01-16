import json
import os
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''API для управления разметкой материалов'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'DATABASE_URL not configured'})
        }
    
    try:
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            material_id = event.get('queryStringParameters', {}).get('material_id')
            
            if material_id:
                cursor.execute('''
                    SELECT 
                        vm.*,
                        json_agg(
                            json_build_object(
                                'id', mr.id,
                                'x', mr.x,
                                'y', mr.y,
                                'width', mr.width,
                                'height', mr.height,
                                'label', mr.label,
                                'type', mr.region_type
                            )
                        ) FILTER (WHERE mr.id IS NOT NULL) as regions
                    FROM violation_markups vm
                    LEFT JOIN markup_regions mr ON vm.material_id = mr.material_id
                    WHERE vm.material_id = %s
                    GROUP BY vm.id
                ''', (material_id,))
                markup = cursor.fetchone()
                
                if markup:
                    cursor.execute('''
                        SELECT * FROM violation_parameters 
                        WHERE markup_id = %s
                    ''', (markup['id'],))
                    parameters = cursor.fetchall()
                    
                    markup_dict = dict(markup)
                    markup_dict['parameters'] = [dict(p) for p in parameters]
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'markup': markup_dict}, default=str)
                    }
                else:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Markup not found'})
                    }
            else:
                cursor.execute('''
                    SELECT 
                        vm.*,
                        m.file_name,
                        COUNT(mr.id) as regions_count
                    FROM violation_markups vm
                    JOIN materials m ON vm.material_id = m.id
                    LEFT JOIN markup_regions mr ON vm.material_id = mr.material_id
                    GROUP BY vm.id, m.file_name
                    ORDER BY vm.created_at DESC
                ''')
                markups = cursor.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'markups': [dict(m) for m in markups]}, default=str)
                }
        
        elif method == 'POST':
            data = json.loads(event.get('body', '{}'))
            material_id = data.get('material_id')
            violation_code = data.get('violation_code')
            regions = data.get('regions', [])
            notes = data.get('notes', '')
            is_training_data = data.get('is_training_data', False)
            parameters = data.get('parameters', [])
            
            if not material_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'material_id is required'})
                }
            
            cursor.execute('''
                INSERT INTO violation_markups 
                (material_id, violation_code, notes, is_training_data)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (material_id) 
                DO UPDATE SET 
                    violation_code = EXCLUDED.violation_code,
                    notes = EXCLUDED.notes,
                    is_training_data = EXCLUDED.is_training_data,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING id
            ''', (material_id, violation_code, notes, is_training_data))
            
            markup_id = cursor.fetchone()['id']
            
            cursor.execute('SELECT id FROM markup_regions WHERE material_id = %s', (material_id,))
            existing_regions = cursor.fetchall()
            for region in existing_regions:
                cursor.execute('UPDATE markup_regions SET label = label WHERE id = %s', (region['id'],))
            
            for region in regions:
                cursor.execute('''
                    INSERT INTO markup_regions 
                    (id, material_id, x, y, width, height, label, region_type)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO UPDATE SET
                        x = EXCLUDED.x,
                        y = EXCLUDED.y,
                        width = EXCLUDED.width,
                        height = EXCLUDED.height,
                        label = EXCLUDED.label,
                        region_type = EXCLUDED.region_type
                ''', (
                    region['id'],
                    material_id,
                    region['x'],
                    region['y'],
                    region['width'],
                    region['height'],
                    region.get('label', ''),
                    region['type']
                ))
            
            cursor.execute('SELECT id FROM violation_parameters WHERE markup_id = %s', (markup_id,))
            existing_params = cursor.fetchall()
            for param in existing_params:
                cursor.execute('UPDATE violation_parameters SET value = value WHERE id = %s', (param['id'],))
            
            for param in parameters:
                cursor.execute('''
                    INSERT INTO violation_parameters 
                    (markup_id, parameter_id, parameter_name, value)
                    VALUES (%s, %s, %s, %s)
                ''', (
                    markup_id,
                    param['parameterId'],
                    param['parameterId'],
                    str(param['value'])
                ))
            
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'markup_id': markup_id,
                    'material_id': material_id
                })
            }
        
        elif method == 'PUT':
            data = json.loads(event.get('body', '{}'))
            material_id = data.get('material_id')
            
            if not material_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'material_id is required'})
                }
            
            cursor.execute('''
                UPDATE violation_markups 
                SET 
                    violation_code = %s,
                    notes = %s,
                    is_training_data = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE material_id = %s
                RETURNING id
            ''', (
                data.get('violation_code'),
                data.get('notes', ''),
                data.get('is_training_data', False),
                material_id
            ))
            
            result = cursor.fetchone()
            if not result:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Markup not found'})
                }
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'markup_id': result['id']})
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()
