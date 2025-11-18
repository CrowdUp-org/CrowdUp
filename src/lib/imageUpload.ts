/**
 * Image upload utility for converting images to base64 data URLs
 * This allows storing images directly without needing external storage
 */

export interface ImageUploadResult {
  success: boolean;
  dataUrl?: string;
  error?: string;
}

/**
 * Convert an image file to a base64 data URL
 * @param file - The image file to convert
 * @param maxSizeKB - Maximum file size in KB (default: 500KB)
 * @returns Promise with the result containing dataUrl or error
 */
export async function uploadImageToDataUrl(
  file: File,
  maxSizeKB: number = 500
): Promise<ImageUploadResult> {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'Please select a valid image file',
      };
    }

    // Validate file size
    const fileSizeKB = file.size / 1024;
    if (fileSizeKB > maxSizeKB) {
      return {
        success: false,
        error: `Image size must be less than ${maxSizeKB}KB. Current size: ${Math.round(fileSizeKB)}KB`,
      };
    }

    // Convert to data URL
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    return {
      success: true,
      dataUrl,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to process image',
    };
  }
}

/**
 * Compress and resize an image before converting to data URL
 * @param file - The image file to process
 * @param maxWidth - Maximum width in pixels (default: 400)
 * @param maxHeight - Maximum height in pixels (default: 400)
 * @param quality - JPEG quality 0-1 (default: 0.8)
 * @returns Promise with the result containing dataUrl or error
 */
export async function compressAndUploadImage(
  file: File,
  maxWidth: number = 400,
  maxHeight: number = 400,
  quality: number = 0.8
): Promise<ImageUploadResult> {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'Please select a valid image file',
      };
    }

    // Create image element
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = URL.createObjectURL(file);
    });

    // Calculate new dimensions
    let width = img.width;
    let height = img.height;

    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = width * ratio;
      height = height * ratio;
    }

    // Create canvas and draw resized image
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return {
        success: false,
        error: 'Failed to create canvas context',
      };
    }

    ctx.drawImage(img, 0, 0, width, height);

    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/jpeg', quality);

    // Clean up
    URL.revokeObjectURL(img.src);

    return {
      success: true,
      dataUrl,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to process image',
    };
  }
}
