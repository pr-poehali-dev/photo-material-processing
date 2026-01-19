import { TarImages } from './tarParser';

interface Material {
  id: string;
  fileName: string;
  timestamp: string;
  preview: string;
  violationType?: string;
  violationCode?: string;
  status: 'pending' | 'violation' | 'clean' | 'analytics' | 'processed';
  images?: TarImages;
  tarFile?: File;
  aiPrediction?: {
    hasViolation: boolean;
    confidence: number;
    violationCode?: string;
    violationType?: string;
    detectedObjects?: Array<{
      type: string;
      confidence: number;
      bbox: number[];
    }>;
  };
  isProcessingAI?: boolean;
}

const DB_NAME = 'trafficvision_db';
const DB_VERSION = 1;
const MATERIALS_STORE = 'materials';

let dbInstance: IDBDatabase | null = null;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(MATERIALS_STORE)) {
        db.createObjectStore(MATERIALS_STORE, { keyPath: 'id' });
      }
    };
  });
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const base64ToBlob = (base64: string): Blob => {
  const [header, data] = base64.split(',');
  const mime = header.match(/:(.*?);/)?.[1] || 'application/octet-stream';
  const binary = atob(data);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return new Blob([array], { type: mime });
};

const serializeMaterial = async (material: Material): Promise<any> => {
  const serialized: any = { ...material };

  if (material.tarFile) {
    serialized.tarFileData = {
      name: material.tarFile.name,
      type: material.tarFile.type,
      data: await blobToBase64(material.tarFile),
    };
    delete serialized.tarFile;
  }

  if (material.images) {
    const images: any = {};
    for (const [key, value] of Object.entries(material.images)) {
      if (value.type === 'photo') {
        images[key] = {
          type: 'photo',
          data: await blobToBase64(value.data),
          name: value.name,
        };
      } else if (value.type === 'video') {
        images[key] = {
          type: 'video',
          data: await blobToBase64(value.data),
          name: value.name,
        };
      }
    }
    serialized.imagesData = images;
    delete serialized.images;
  }

  return serialized;
};

const deserializeMaterial = (serialized: any): Material => {
  const material: Material = { ...serialized };

  if (serialized.tarFileData) {
    const blob = base64ToBlob(serialized.tarFileData.data);
    material.tarFile = new File([blob], serialized.tarFileData.name, {
      type: serialized.tarFileData.type,
    });
    delete (material as any).tarFileData;
  }

  if (serialized.imagesData) {
    const images: TarImages = {};
    for (const [key, value] of Object.entries(serialized.imagesData)) {
      const imgData = value as any;
      const blob = base64ToBlob(imgData.data);
      images[key] = {
        type: imgData.type,
        data: blob,
        name: imgData.name,
      };
    }
    material.images = images;
    delete (material as any).imagesData;
  }

  return material;
};

export const saveMaterials = async (materials: Material[]): Promise<void> => {
  try {
    const db = await openDB();
    const transaction = db.transaction([MATERIALS_STORE], 'readwrite');
    const store = transaction.objectStore(MATERIALS_STORE);

    await store.clear();

    for (const material of materials) {
      const serialized = await serializeMaterial(material);
      await store.put(serialized);
    }

    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('Ошибка сохранения материалов в IndexedDB:', error);
  }
};

export const loadMaterials = async (): Promise<Material[]> => {
  try {
    const db = await openDB();
    const transaction = db.transaction([MATERIALS_STORE], 'readonly');
    const store = transaction.objectStore(MATERIALS_STORE);
    const request = store.getAll();

    const serializedMaterials = await new Promise<any[]>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return serializedMaterials.map(deserializeMaterial);
  } catch (error) {
    console.error('Ошибка загрузки материалов из IndexedDB:', error);
    return [];
  }
};

export const clearMaterials = async (): Promise<void> => {
  try {
    const db = await openDB();
    const transaction = db.transaction([MATERIALS_STORE], 'readwrite');
    const store = transaction.objectStore(MATERIALS_STORE);
    await store.clear();
  } catch (error) {
    console.error('Ошибка очистки материалов:', error);
  }
};
