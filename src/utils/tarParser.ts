import untar from 'js-untar';

export interface TarImages {
  collage?: string;
  violation?: string;
  plate?: string;
  general?: string;
}

export interface TarMetadata {
  fileName: string;
  violationCode?: string;
  timestamp?: string;
  preview?: string;
  images?: TarImages;
}

export async function parseTarFile(file: File): Promise<TarMetadata> {
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
        
        const codeMatch = text.match(/<tVAStateCode>(\d+)<\/tVAStateCode>/);
        if (codeMatch) {
          violationCode = codeMatch[1];
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
          images.violation = url;
        } else if (fileName.includes('_grz.jpg')) {
          images.plate = url;
        } else if (fileName.endsWith('.jpg') && !fileName.includes('_')) {
          images.general = url;
        }
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

export async function parseTarFiles(files: File[]): Promise<TarMetadata[]> {
  const promises = files.map(file => parseTarFile(file));
  return Promise.all(promises);
}