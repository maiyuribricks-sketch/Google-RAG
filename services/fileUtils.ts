import { UploadedFile } from '../types';

export const readFileContent = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target?.result as string);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};

export const processFiles = async (files: File[]): Promise<UploadedFile[]> => {
  const processedFiles: UploadedFile[] = [];

  for (const file of files) {
    // Basic filter for text-based files roughly based on type or extension
    // In a real app, this would be more robust.
    if (
      file.type.startsWith('text/') ||
      file.type === 'application/json' ||
      file.name.endsWith('.md') ||
      file.name.endsWith('.ts') ||
      file.name.endsWith('.tsx') ||
      file.name.endsWith('.js') ||
      file.name.endsWith('.py') ||
      file.name.endsWith('.csv')
    ) {
      try {
        const content = await readFileContent(file);
        processedFiles.push({
          id: Math.random().toString(36).substring(7),
          name: file.name,
          content: content,
          type: file.type,
          size: file.size,
        });
      } catch (e) {
        console.error(`Failed to read file ${file.name}`, e);
      }
    } else {
      console.warn(`Skipping non-text file: ${file.name}`);
    }
  }

  return processedFiles;
};
