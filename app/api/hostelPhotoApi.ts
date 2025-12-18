import ApiClient from "./ApiClient";

export interface Photo {
  _id: string;
  filename: string;
  originalName: string;
  url: string;
  isPrimary: boolean;
  uploadDate: string;
}

export interface PhotoUploadResponse {
  success: boolean;
  message: string;
  data: {
    photos: Photo[];
  };
}

export interface DeletePhotoResponse {
  success: boolean;
  message: string;
  data: {
    deletedPhotoId: string;
    remainingPhotos: number;
  };
}

class HostelPhotoApi {
  // Convert base64 to blob for web platform
  private base64ToBlob(base64: string, contentType: string = 'image/jpeg'): Blob {
    const base64Data = base64.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);

      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  }

  // Upload photos - WEB COMPATIBLE VERSION
  async uploadPhotos(photos: any[]): Promise<PhotoUploadResponse> {
    try {
      const formData = new FormData();

      console.log('🔄 Preparing FormData with photos:', photos.length);

      photos.forEach((photo, index) => {
        console.log(`📄 Photo ${index + 1}:`, {
          uri: photo.uri?.substring(0, 50) + '...',
          type: photo.type,
          fileName: photo.fileName,
          isBase64: photo.uri?.startsWith('data:')
        });

        let file: any;

        if (photo.uri && photo.uri.startsWith('data:')) {
          // Handle base64 for web platform
          console.log('🌐 Web platform detected - converting base64 to file');
          const contentType = photo.uri.split(';')[0].split(':')[1] || 'image/jpeg';
          const blob = this.base64ToBlob(photo.uri, contentType);

          file = new File([blob], photo.fileName || `photo_${Date.now()}_${index}.jpg`, {
            type: contentType
          });
        } else {
          // Handle file URI for native platform
          file = {
            uri: photo.uri,
            type: photo.type || 'image/jpeg',
            name: photo.fileName || `photo_${Date.now()}_${index}.jpg`,
          };
        }

        formData.append('photos', file);
      });

      console.log('🚀 Sending FormData to backend...');

      const response = await ApiClient.post("/hostel-operations/upload-photos", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });

      console.log('✅ Upload successful!', response.data);
      return response;
    } catch (error: any) {
      console.error("❌ Upload photos error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error(error.response?.data?.message || "Failed to upload photos");
    }
  }

  // Get hostel photos
  async getHostelPhotos(): Promise<PhotoUploadResponse> {
    try {
      console.log('📞 Calling GET /hostel-operations/photos');
      const response = await ApiClient.get("/hostel-operations/photos");

      console.log('📸 Raw API Response:', JSON.stringify(response, null, 2));

      // The response from Postman shows the data is directly in response.data
      return response;
    } catch (error: any) {
      console.error("❌ Owner Get photos API error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw new Error(error.response?.data?.message || "Failed to get photos");
    }
  }

  // Delete hostel photo
  async deletePhoto(photoId: string): Promise<DeletePhotoResponse> {
    try {
      console.log('🗑️ Deleting photo:', photoId);
      const response = await ApiClient.delete(`/hostel-operations/photos/${photoId}`);
      console.log('✅ Delete successful!', response.data);
      return response;
    } catch (error: any) {
      console.error("❌ Delete photo error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error(error.response?.data?.message || "Failed to delete photo");
    }
  }

  // Set primary photo
  async setPrimaryPhoto(photoId: string): Promise<PhotoUploadResponse> {
    try {
      console.log('⭐ Setting primary photo:', photoId);
      const response = await ApiClient.patch(`/hostel-operations/photos/${photoId}/set-primary`);
      console.log('✅ Primary photo set!', response.data);
      return response;
    } catch (error: any) {
      console.error("❌ Set primary photo error:", error);
      throw new Error(error.response?.data?.message || "Failed to set primary photo");
    }
  }
}

export default new HostelPhotoApi();