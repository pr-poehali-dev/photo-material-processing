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
          for (const codeConfig of violationCodes) {
            if (codeConfig.xmlTag) {
              const regex = new RegExp(`<${codeConfig.xmlTag}[^>]*>`, 'i');
              if (regex.test(text)) {
                violationCode = codeConfig.code;
                break;
              }
            }
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
    console.error('Ошибка парсинга TAR:', error);
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