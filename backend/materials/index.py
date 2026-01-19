import json
import os
import psycopg2
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''API для управления материалами в базе данных'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Authorization'
            },
            'body': ''
        }
    
    try:
        body = json.loads(event.get('body', '{}')) if event.get('body') else {}
        action = body.get('action', 'list')
        
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor()
        
        if action == 'list':
            cursor.execute('''
                SELECT id, file_name, timestamp, preview_url, status, 
                       violation_type, violation_code, created_at, updated_at
                FROM t_p28865948_photo_material_proce.materials
                ORDER BY timestamp DESC
            ''')
            rows = cursor.fetchall()
            materials = []
            for row in rows:
                materials.append({
                    'id': row[0],
                    'fileName': row[1],
                    'timestamp': row[2].isoformat() if row[2] else None,
                    'preview': row[3],
                    'status': row[4],
                    'violationType': row[5],
                    'violationCode': row[6],
                    'createdAt': row[7].isoformat() if row[7] else None,
                    'updatedAt': row[8].isoformat() if row[8] else None
                })
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'materials': materials})
            }
        
        elif action == 'create':
            material = body.get('material', {})
            cursor.execute('''
                INSERT INTO t_p28865948_photo_material_proce.materials 
                (id, file_name, timestamp, preview_url, status, violation_type, violation_code)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            ''', (
                material['id'],
                material['fileName'],
                material.get('timestamp'),
                material.get('preview'),
                material.get('status', 'pending'),
                material.get('violationType'),
                material.get('violationCode')
            ))
            conn.commit()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'id': material['id']})
            }
        
        elif action == 'update':
            material_id = body.get('id')
            updates = body.get('updates', {})
            
            set_parts = []
            values = []
            
            if 'status' in updates:
                set_parts.append('status = %s')
                values.append(updates['status'])
            if 'violationCode' in updates:
                set_parts.append('violation_code = %s')
                values.append(updates['violationCode'])
            if 'violationType' in updates:
                set_parts.append('violation_type = %s')
                values.append(updates['violationType'])
            
            set_parts.append('updated_at = CURRENT_TIMESTAMP')
            values.append(material_id)
            
            query = f'''
                UPDATE t_p28865948_photo_material_proce.materials 
                SET {', '.join(set_parts)}
                WHERE id = %s
            '''
            
            cursor.execute(query, values)
            conn.commit()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True})
            }
        
        elif action == 'delete':
            material_ids = body.get('ids', [])
            placeholders = ', '.join(['%s'] * len(material_ids))
            
            cursor.execute(f'''
                DELETE FROM t_p28865948_photo_material_proce.materials 
                WHERE id IN ({placeholders})
            ''', material_ids)
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'deleted': len(material_ids)})
            }
        
        elif action == 'bulk_create':
            materials = body.get('materials', [])
            
            for material in materials:
                cursor.execute('''
                    INSERT INTO t_p28865948_photo_material_proce.materials 
                    (id, file_name, timestamp, preview_url, status, violation_type, violation_code)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO UPDATE SET
                        status = EXCLUDED.status,
                        violation_code = EXCLUDED.violation_code,
                        violation_type = EXCLUDED.violation_type,
                        updated_at = CURRENT_TIMESTAMP
                ''', (
                    material['id'],
                    material['fileName'],
                    material.get('timestamp'),
                    material.get('preview'),
                    material.get('status', 'pending'),
                    material.get('violationType'),
                    material.get('violationCode')
                ))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'count': len(materials)})
            }
        
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Unknown action'})
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
