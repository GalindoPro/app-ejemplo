'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Users, Pencil, Trash2, Mail, Phone, MapPin, FileText } from 'lucide-react';

import { ClientService } from '@/modules/clients/services/client.service';
import { ClientModel } from '@/modules/clients/models/client.model';
import { ClientModal } from '@/modules/clients/components/ClientModal';

import { PageHeader } from '@/shared/components/PageHeader';
import { SearchBar } from '@/shared/components/SearchBar';
import { DataTable, TableColumn } from '@/shared/components/DataTable';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { ToggleStatusButton } from '@/shared/components/ToggleStatusButton';
import { ConfirmModal } from '@/shared/components/ConfirmModal';
import { Pagination } from '@/shared/components/Pagination';

interface ClientFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  nit: string;
  isActive: boolean;
}

type ModalState =
  | { type: 'closed' }
  | { type: 'create' }
  | { type: 'edit'; client: ClientModel }
  | { type: 'delete'; client: ClientModel };

const PAGE_SIZE = 5;

// ─── Columnas ─────────────────────────────────────────────────────────────────
const columns: TableColumn<ClientModel>[] = [
  {
    key: 'name',
    header: 'Cliente',
    render: (c) => (
      <div className="space-y-0.5">
        <p className="font-semibold text-slate-900 text-sm">{c.fullName}</p>
        <p className="text-xs text-slate-400 flex items-center space-x-1">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate max-w-[160px]">{c.address}</span>
        </p>
        <p className="text-xs text-slate-400 flex items-center space-x-1">
          <FileText className="w-3 h-3 shrink-0" />
          <span>NIT: {c.nit}</span>
        </p>
      </div>
    ),
  },
  {
    key: 'contact',
    header: 'Contacto',
    render: (c) => (
      <div className="space-y-0.5">
        <p className="text-xs text-slate-600 flex items-center space-x-1.5">
          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
          <span>{c.email}</span>
        </p>
        <p className="text-xs text-slate-600 flex items-center space-x-1.5">
          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
          <span>{c.phone}</span>
        </p>
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Estado',
    align: 'center',
    render: (c) => <StatusBadge isActive={c.isActive} />,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ClientsPage() {
  const [clients, setClients] = useState<ClientModel[]>([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState<ModalState>({ type: 'closed' });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchClients = useCallback(async (searchTerm: string, pageNum: number) => {
    setIsLoading(true);
    try {
      const result = await ClientService.getClients(searchTerm, pageNum - 1, PAGE_SIZE);
      setClients(result.content);
      setTotalElements(result.totalElements);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Error cargando clientes:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients(search, currentPage);
  }, [search, currentPage, fetchClients]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleSave = async (data: ClientFormData) => {
    setIsSaving(true);
    try {
      if (modal.type === 'create') {
        await ClientService.create(data);
      } else if (modal.type === 'edit') {
        await ClientService.update(modal.client.id, data);
      }
      setModal({ type: 'closed' });
      fetchClients(search, currentPage);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error al guardar cliente';
      alert(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (client: ClientModel) => {
    try {
      await ClientService.delete(client.id);
      setModal({ type: 'closed' });
      fetchClients(search, currentPage);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error al eliminar cliente';
      alert(msg);
    }
  };

  const handleToggleActive = async (client: ClientModel) => {
    try {
      await ClientService.toggleActive(client.id);
      fetchClients(search, currentPage);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error al cambiar estado';
      alert(msg);
    }
  };

  const renderActions = (client: ClientModel) => (
    <>
      <ToggleStatusButton
        isActive={client.isActive}
        onToggle={() => handleToggleActive(client)}
      />
      <button
        onClick={() => setModal({ type: 'edit', client })}
        title="Editar cliente"
        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
      >
        <Pencil className="w-4 h-4" />
      </button>
      <button
        onClick={() => setModal({ type: 'delete', client })}
        title="Eliminar cliente"
        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Users}
        title="Clientes"
        subtitle={`${totalElements} clientes registrados`}
        actionLabel="Nuevo Cliente"
        onAction={() => setModal({ type: 'create' })}
      />

      <SearchBar
        value={search}
        onChange={handleSearch}
        placeholder="Buscar por nombre, NIT, email o teléfono..."
      />

      <DataTable
        data={clients}
        columns={columns}
        keyExtractor={(c) => c.id}
        renderActions={renderActions}
        actionsAlign="center"
        emptyMessage={isLoading ? 'Cargando clientes...' : 'No se encontraron clientes.'}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={PAGE_SIZE}
        totalItems={totalElements}
      />

      {(modal.type === 'create' || modal.type === 'edit') && (
        <ClientModal
          mode={modal.type}
          client={modal.type === 'edit' ? modal.client : undefined}
          onClose={() => setModal({ type: 'closed' })}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}

      {modal.type === 'delete' && (
        <ConfirmModal
          title="Eliminar Cliente"
          description={
            <>
              ¿Estás seguro que deseas eliminar a{' '}
              <strong className="text-slate-900">{modal.client.fullName}</strong>?
            </>
          }
          confirmLabel="Sí, eliminar"
          onConfirm={() => handleDelete(modal.client)}
          onCancel={() => setModal({ type: 'closed' })}
        />
      )}
    </div>
  );
}
