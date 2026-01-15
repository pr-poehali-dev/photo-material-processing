import untar from 'js-untar';
import { ViolationCode } from '@/components/ViolationCodesManager';

export interface TarImages {
  collage?: string;
  violation?: string;
  plate?: string;
  general?: string;
  time1?: string;
  time2?: string;
  fix1?: string;
  fix2?: string;
  video?: string;
}

export interface TarMetadata {
  fileName: string;
  violationCode?: string;
  timestamp?: string;
  preview?: string;
  images?: TarImages;
}

export async function parseTarFile(file: File, violationCodes?: ViolationCode[]): Promise<TarMetadata> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const files = await untar(arrayBuffer);
    
    let violationCode: string | undefined;
    let timestamp: string | undefined;
    const images: TarImages = {};
    
    for (const entry of files) {
      const fileName = entry.name.toLowerCase();
      
      if (entry.name.endsWith('.xml') || entry.name.includes('targetinfo')) {
        const text = new TextDecoder('utf-8').decode(entry.buffer);
        
        if (violationCodes && violationCodes.length > 0) {
          // Ищем <nDirection>1</nDirection>
          const directionIndex = text.indexOf('<nDirection>1</nDirection>');
          
          if (directionIndex !== -1) {
            // Получаем текст после <nDirection>1</nDirection>
            const afterDirection = text.substring(directionIndex + '<nDirection>1</nDirection>'.length);
            
            // Ищем следующий тег с значением 1
            const nextTagMatch = afterDirection.match(/<([^>\s\/]+)[^>]*>\s*1\s*<\/\1>/i);
            
            if (nextTagMatch && nextTagMatch[1]) {
              const tagName = nextTagMatch[1].trim();
              
              console.log('🔍 Найден тег после nDirection:', tagName);
              
              // Ищем настроенный код с таким XML-тегом
              const foundCode = violationCodes.find(c => 
                c.xmlTag && c.xmlTag.toLowerCase() === tagName.toLowerCase()
              );
              
              if (foundCode) {
                violationCode = foundCode.code;
                console.log('✅ Найден код нарушения:', foundCode.code, foundCode.description);
              } else {
                console.log('❌ Код не найден в настройках для тега:', tagName);
              }
            } else {
              console.log('⚠️ Не найден тег со значением 1 после nDirection');
            }
          } else {
            console.log('⚠️ Тег <nDirection>1</nDirection> не найден в XML');
          }
        }
        
        const timeMatch = text.match(/<timestamp>([^<]+)<\/timestamp>/i);
        if (timeMatch) {
          timestamp = timeMatch[1];
        }
      }
      
      if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
        const blob = new Blob([entry.buffer], { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        
        if (fileName.includes('_0.jpg')) {
          images.collage = url;
        } else if (fileName.includes('_1.jpg')) {
          images.time1 = url;
        } else if (fileName.includes('_2.jpg')) {
          images.time2 = url;
        } else if (fileName.includes('_3.jpg')) {
          images.fix1 = url;
        } else if (fileName.includes('_4.jpg')) {
          images.fix2 = url;
        } else if (fileName.includes('_grz.jpg')) {
          images.plate = url;
        } else if (fileName.endsWith('.jpg') && !fileName.includes('_')) {
          images.general = url;
        }
      }
      
      if (fileName.endsWith('.mp4')) {
        const blob = new Blob([entry.buffer], { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);
        images.video = url;
      }
    }
    
    return {
      fileName: file.name,
      violationCode,
      timestamp: timestamp || new Date().toLocaleString('ru-RU'),
      preview: images.collage || images.general,
      images,
    };
  } catch (error) {
    console.error('❌ Ошибка парсинга TAR:', error);
    return {
      fileName: file.name,
      timestamp: new Date().toLocaleString('ru-RU'),
    };
  }
}

export async function parseTarFiles(files: File[], violationCodes?: ViolationCode[]): Promise<TarMetadata[]> {
  const promises = files.map(file => parseTarFile(file, violationCodes));
  return Promise.all(promises);
}