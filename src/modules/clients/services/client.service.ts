import { HttpClient, ApiResponse } from '@/shared/api/httpClient';
import { ClientAdapter } from '../adapters/client.adapter';
import { ClientModel } from '../models/client.model';
import { ClientDTO } from '../dtos/client.dto';
import clientsFallbackData from '@/shared/data/clients.json';

export interface PageResult<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export class ClientService {
  /**
   * Obtiene la lista de clientes paginada desde el backend REST.
   * Con fallback a datos locales en caso de que el backend no esté disponible.
   */
  static async getClients(
    search: string = '',
    page: number = 0,
    size: number = 5
  ): Promise<PageResult<ClientModel>> {
    try {
      const searchParam = search.trim() ? `&search=${encodeURIComponent(search.trim())}` : '';
      const response = await HttpClient.get<ApiResponse<PageResult<ClientDTO>>>(
        `/clients?page=${page}&size=${size}${searchParam}`
      );

      if (response.success && response.data) {
        return {
          content: response.data.content.map(ClientAdapter.toModel),
          pageNumber: response.data.pageNumber,
          pageSize: response.data.pageSize,
          totalElements: response.data.totalElements,
          totalPages: response.data.totalPages,
        };
      }
      throw new Error('Respuesta inválida del servidor');
    } catch (error) {
      console.warn('Backend no disponible, usando fallback local:', error);
      // Fallback local
      let data: ClientModel[] = (clientsFallbackData as ClientDTO[]).map(ClientAdapter.toModel);
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        data = data.filter(
          (c) =>
            c.fullName.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q) ||
            c.nit.toLowerCase().includes(q) ||
            c.phone.includes(q)
        );
      }
      const totalElements = data.length;
      const totalPages = Math.ceil(totalElements / size);
      const content = data.slice(page * size, (page + 1) * size);

      return {
        content,
        pageNumber: page,
        pageSize: size,
        totalElements,
        totalPages,
      };
    }
  }

  static async create(data: Omit<ClientModel, 'id' | 'createdAt'>): Promise<ClientModel> {
    const response = await HttpClient.post<ApiResponse<ClientDTO>>('/clients', {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      nit: data.nit,
      isActive: data.isActive,
    });
    return ClientAdapter.toModel(response.data);
  }

  static async update(
    id: string,
    data: Partial<Omit<ClientModel, 'id' | 'createdAt'>>
  ): Promise<ClientModel> {
    const response = await HttpClient.put<ApiResponse<ClientDTO>>(`/clients/${id}`, data);
    return ClientAdapter.toModel(response.data);
  }

  static async toggleActive(id: string): Promise<ClientModel> {
    const response = await HttpClient.patch<ApiResponse<ClientDTO>>(`/clients/${id}/toggle-status`);
    return ClientAdapter.toModel(response.data);
  }

  static async delete(id: string): Promise<void> {
    await HttpClient.delete<ApiResponse<void>>(`/clients/${id}`);
  }
}
