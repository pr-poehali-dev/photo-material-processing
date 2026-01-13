import untar from 'js-untar';

export interface TarMetadata {
  fileName: string;
  violationCode?: string;
  timestamp?: string;
  preview?: string;
}

export async function parseTarFile(file: File): Promise<TarMetadata> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const files = await untar(arrayBuffer);
    
    let violationCode: string | undefined;
    let timestamp: string | undefined;
    
    for (const entry of files) {
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
        
        if (violationCode) break;
      }
    }
    
    return {
      fileName: file.name,
      violationCode,
      timestamp: timestamp || new Date().toLocaleString('ru-RU'),
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
