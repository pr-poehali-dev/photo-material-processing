import json
import os
import hashlib
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def verify_admin(token: str) -> dict:
    if not token:
        return None
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """SELECT u.id, u.email, u.role 
                   FROM user_sessions s 
                   JOIN users u ON s.user_id = u.id 
                   WHERE s.session_token = %s AND s.expires_at > %s AND u.role = 'admin'""",
                (token, datetime.now())
            )
            return cur.fetchone()
    finally:
        conn.close()

def handler(event: dict, context) -> dict:
    '''API для управления пользователями: список, создание, изменение пароля, блокировка, архивирование, логи входа'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            'body': ''
        }
    
    headers = event.get('headers', {})
    token = (headers.get('x-auth-token', '') or 
             headers.get('X-Auth-Token', '') or
             headers.get('authorization', '').replace('Bearer ', '') or
             headers.get('Authorization', '').replace('Bearer ', ''))
    
    admin = verify_admin(token)
    if not admin:
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Доступ запрещен. Требуются права администратора'})
        }
    
    try:
        if method == 'GET':
            action = event.get('queryStringParameters', {}).get('action', 'list')
            if action == 'list':
                return list_users()
            elif action == 'logs':
                user_id = event.get('queryStringParameters', {}).get('user_id')
                return get_login_logs(user_id)
        elif method == 'POST':
            return create_user(event)
        elif method == 'PUT':
            return update_user(event)
        elif method == 'DELETE':
            return archive_user(event)
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid method'})
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }

def list_users() -> dict:
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """SELECT id, email, full_name, role, is_blocked, is_approved, created_at, last_login 
                   FROM users 
                   WHERE is_archived = FALSE 
                   ORDER BY is_approved ASC, created_at DESC"""
            )
            users = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'users': [dict(u) for u in users]
                }, default=str)
            }
    finally:
        conn.close()

def create_user(event: dict) -> dict:
    data = json.loads(event.get('body', '{}'))
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    full_name = data.get('full_name', '').strip()
    role = data.get('role', 'user')
    
    if not email or not password:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Email и пароль обязательны'})
        }
    
    if len(password) < 6:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Пароль должен быть не менее 6 символов'})
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT id FROM users WHERE email = %s", (email,))
            if cur.fetchone():
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Пользователь с таким email уже существует'})
                }
            
            password_hash = hash_password(password)
            cur.execute(
                "INSERT INTO users (email, password_hash, full_name, role, is_approved) VALUES (%s, %s, %s, %s, TRUE) RETURNING id, email, full_name, role, created_at",
                (email, password_hash, full_name, role)
            )
            user = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'user': dict(user)
                }, default=str)
            }
    finally:
        conn.close()

def update_user(event: dict) -> dict:
    data = json.loads(event.get('body', '{}'))
    user_id = data.get('user_id')
    action = data.get('action')
    
    if not user_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'user_id обязателен'})
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            if action == 'change_password':
                new_password = data.get('new_password', '')
                if len(new_password) < 6:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Пароль должен быть не менее 6 символов'})
                    }
                password_hash = hash_password(new_password)
                cur.execute(
                    "UPDATE users SET password_hash = %s, updated_at = %s WHERE id = %s AND is_archived = FALSE",
                    (password_hash, datetime.now(), user_id)
                )
            elif action == 'block':
                cur.execute(
                    "UPDATE users SET is_blocked = TRUE, updated_at = %s WHERE id = %s AND is_archived = FALSE",
                    (datetime.now(), user_id)
                )
            elif action == 'unblock':
                cur.execute(
                    "UPDATE users SET is_blocked = FALSE, updated_at = %s WHERE id = %s AND is_archived = FALSE",
                    (datetime.now(), user_id)
                )
            elif action == 'approve':
                cur.execute(
                    "UPDATE users SET is_approved = TRUE, updated_at = %s WHERE id = %s AND is_archived = FALSE",
                    (datetime.now(), user_id)
                )
            elif action == 'unapprove':
                cur.execute(
                    "UPDATE users SET is_approved = FALSE, updated_at = %s WHERE id = %s AND is_archived = FALSE",
                    (datetime.now(), user_id)
                )
            elif action == 'update_info':
                full_name = data.get('full_name')
                role = data.get('role')
                if full_name:
                    cur.execute(
                        "UPDATE users SET full_name = %s, updated_at = %s WHERE id = %s AND is_archived = FALSE",
                        (full_name, datetime.now(), user_id)
                    )
                if role:
                    cur.execute(
                        "UPDATE users SET role = %s, updated_at = %s WHERE id = %s AND is_archived = FALSE",
                        (role, datetime.now(), user_id)
                    )
            else:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неизвестное действие'})
                }
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True})
            }
    finally:
        conn.close()

def archive_user(event: dict) -> dict:
    data = json.loads(event.get('body', '{}'))
    user_id = data.get('user_id')
    
    if not user_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'user_id обязателен'})
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE users SET is_archived = TRUE, updated_at = %s WHERE id = %s",
                (datetime.now(), user_id)
            )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True})
            }
    finally:
        conn.close()

def get_login_logs(user_id: str = None) -> dict:
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if user_id:
                cur.execute(
                    """SELECT * FROM login_logs 
                       WHERE user_id = %s 
                       ORDER BY login_time DESC 
                       LIMIT 100""",
                    (user_id,)
                )
            else:
                cur.execute(
                    """SELECT * FROM login_logs 
                       ORDER BY login_time DESC 
                       LIMIT 100"""
                )
            
            logs = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'logs': [dict(log) for log in logs]
                }, default=str)
            }
    finally:
        conn.close()