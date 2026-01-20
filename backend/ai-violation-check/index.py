import json
import os
import base64
from openai import OpenAI

def handler(event: dict, context) -> dict:
    '''API для автоматического определения нарушений ПДД с помощью GPT-4 Vision'''
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
        body = json.loads(event.get('body', '{}'))
        image_url = body.get('imageUrl')
        image_base64 = body.get('imageBase64')
        
        if not image_url and not image_base64:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Требуется imageUrl или imageBase64'})
            }

        api_key = os.environ.get('OPENAI_API_KEY')
        if not api_key:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'OPENAI_API_KEY не настроен'})
            }

        client = OpenAI(api_key=api_key)

        if image_base64:
            image_content = f"data:image/jpeg;base64,{image_base64}"
        else:
            image_content = image_url

        prompt = """Проанализируй это изображение с камеры фотофиксации нарушений ПДД.

Определи:
1. Есть ли нарушение ПДД на фото? (да/нет)
2. Если есть, какой код нарушения по КоАП РФ (например: 12.9.2, 12.12.1, 12.6 и т.д.)
3. Краткое описание нарушения (1-2 предложения)
4. Уровень уверенности в % (0-100)
5. Обнаруженные объекты (транспортные средства, светофоры, знаки)

Верни ответ СТРОГО в формате JSON:
{
  "hasViolation": true/false,
  "violationCode": "код или null",
  "violationType": "описание или null",
  "confidence": число от 0 до 100,
  "detectedObjects": [
    {"type": "vehicle", "description": "легковой автомобиль"},
    {"type": "signal", "description": "красный сигнал светофора"}
  ],
  "reasoning": "краткое объяснение"
}"""

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": image_content}}
                    ]
                }
            ],
            max_tokens=500
        )

        result_text = response.choices[0].message.content.strip()
        
        if result_text.startswith('```json'):
            result_text = result_text[7:]
        if result_text.startswith('```'):
            result_text = result_text[3:]
        if result_text.endswith('```'):
            result_text = result_text[:-3]
        
        result = json.loads(result_text.strip())

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result, ensure_ascii=False)
        }

    except json.JSONDecodeError as e:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка парсинга JSON: {str(e)}'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка анализа: {str(e)}'})
        }
