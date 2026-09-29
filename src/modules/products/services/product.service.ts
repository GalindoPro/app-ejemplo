import { ProductDTO } from '../dtos/product.dto';
import { httpClient } from '@/shared/utils/httpClient';

export class ProductService {
  /**
   * Obtiene la lista completa de DTOs de productos a través del Proxy BFF (/api/products).
   * Si el token ha expirado, el httpClient interceptará automáticamente el 401,
   * renovará el token con /api/auth/refresh y reintentará esta consulta.
   */
  static async getProducts(): Promise<ProductDTO[]> {
    try {
      const response = await httpClient.get<{ success: boolean; data: ProductDTO[] }>('/api/products');
      if (response && response.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error al obtener productos vía BFF:', error);
      throw error;
    }
  }
}
