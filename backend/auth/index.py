import json
import os
import hashlib
import secrets
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def generate_session_token() -> str:
    return secrets.token_urlsafe(32)

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    '''API для аутентификации: регистрация, вход, проверка сессии, выход'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            'body': ''
        }
    
    path = event.get('queryStringParameters', {}).get('action', '')
    
    try:
        if method == 'POST' and path == 'register':
            return register(event)
        elif method == 'POST' and path == 'login':
            return login(event)
        elif method == 'POST' and path == 'logout':
            return logout(event)
        elif method == 'GET' and path == 'verify':
            return verify_session(event)
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid action'})
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }

def register(event: dict) -> dict:
    data = json.loads(event.get('body', '{}'))
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    full_name = data.get('full_name', '').strip()
    
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
                "INSERT INTO users (email, password_hash, full_name, is_approved) VALUES (%s, %s, %s, FALSE) RETURNING id, email, full_name, role, is_approved",
                (email, password_hash, full_name)
            )
            user = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'message': 'Регистрация успешна. Ожидайте подтверждения администратора.',
                    'user': dict(user)
                })
            }
    finally:
        conn.close()

def login(event: dict) -> dict:
    data = json.loads(event.get('body', '{}'))
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    ip_address = event.get('requestContext', {}).get('identity', {}).get('sourceIp', '')
    user_agent = event.get('headers', {}).get('user-agent', '')
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            password_hash = hash_password(password)
            cur.execute(
                "SELECT id, email, full_name, role, is_blocked, is_approved FROM users WHERE email = %s AND password_hash = %s AND is_archived = FALSE",
                (email, password_hash)
            )
            user = cur.fetchone()
            
            if not user:
                cur.execute(
                    "INSERT INTO login_logs (email, ip_address, user_agent, success, failure_reason) VALUES (%s, %s, %s, %s, %s)",
                    (email, ip_address, user_agent, False, 'Неверный email или пароль')
                )
                conn.commit()
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверный email или пароль'})
                }
            
            if not user['is_approved']:
                cur.execute(
                    "INSERT INTO login_logs (user_id, email, ip_address, user_agent, success, failure_reason) VALUES (%s, %s, %s, %s, %s, %s)",
                    (user['id'], email, ip_address, user_agent, False, 'Учетная запись не подтверждена администратором')
                )
                conn.commit()
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Учетная запись еще не подтверждена администратором'})
                }
            
            if user['is_blocked']:
                cur.execute(
                    "INSERT INTO login_logs (user_id, email, ip_address, user_agent, success, failure_reason) VALUES (%s, %s, %s, %s, %s, %s)",
                    (user['id'], email, ip_address, user_agent, False, 'Пользователь заблокирован')
                )
                conn.commit()
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Пользователь заблокирован'})
                }
            
            session_token = generate_session_token()
            expires_at = datetime.now() + timedelta(days=7)
            
            cur.execute(
                "INSERT INTO user_sessions (user_id, session_token, ip_address, user_agent, expires_at) VALUES (%s, %s, %s, %s, %s)",
                (user['id'], session_token, ip_address, user_agent, expires_at)
            )
            
            cur.execute(
                "UPDATE users SET last_login = %s WHERE id = %s",
                (datetime.now(), user['id'])
            )
            
            cur.execute(
                "INSERT INTO login_logs (user_id, email, ip_address, user_agent, success) VALUES (%s, %s, %s, %s, %s)",
                (user['id'], email, ip_address, user_agent, True)
            )
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'session_token': session_token,
                    'user': {
                        'id': user['id'],
                        'email': user['email'],
                        'full_name': user['full_name'],
                        'role': user['role']
                    }
                })
            }
    finally:
        conn.close()

def logout(event: dict) -> dict:
    auth_header = event.get('headers', {}).get('x-authorization', '') or event.get('headers', {}).get('authorization', '')
    token = auth_header.replace('Bearer ', '') if auth_header else ''
    
    if not token:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Токен не предоставлен'})
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("UPDATE user_sessions SET expires_at = %s WHERE session_token = %s", (datetime.now(), token))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True})
            }
    finally:
        conn.close()

def verify_session(event: dict) -> dict:
    auth_header = event.get('headers', {}).get('x-authorization', '') or event.get('headers', {}).get('authorization', '')
    token = auth_header.replace('Bearer ', '') if auth_header else ''
    
    if not token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Токен не предоставлен'})
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """SELECT u.id, u.email, u.full_name, u.role, u.is_blocked, u.is_approved 
                   FROM user_sessions s 
                   JOIN users u ON s.user_id = u.id 
                   WHERE s.session_token = %s AND s.expires_at > %s AND u.is_archived = FALSE""",
                (token, datetime.now())
            )
            user = cur.fetchone()
            
            if not user:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Недействительная сессия'})
                }
            
            if user['is_blocked']:
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Пользователь заблокирован'})
                }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'user': dict(user)
                })
            }
    finally:
        conn.close()