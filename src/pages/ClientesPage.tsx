import { useState } from 'react';
import { Plus, Edit2, Trash2, Search, ScanBarcode, FileDown, PenTool, CheckCircle2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClientModal } from '@/components/ClientModal';
import { ReportModal } from '@/components/ReportModal';
import { SignaturePad } from '@/components/SignaturePad';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useClientes } from '@/contexts/ClientContext';
import { Cliente, ClienteFirma } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export default function ClientesPage() {
  const { clientes, deleteCliente, getClienteByDni, getClienteByCod } = useClientes();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Cliente | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [scanSearch, setScanSearch] = useState('');
  const [showSignaturesModal, setShowSignaturesModal] = useState(false);
  const [signaturesClient, setSignaturesClient] = useState<Cliente | null>(null);
  const [viewingClient, setViewingClient] = useState<Cliente | null>(null);
  const [signatures, setSignatures] = useState<ClienteFirma[]>([]);
  const [signaturesLoading, setSignaturesLoading] = useState(false);
  const [newSignature, setNewSignature] = useState('');
  const [newSignatureClear, setNewSignatureClear] = useState(0);
  const [editingSignatureId, setEditingSignatureId] = useState<string | null>(null);
  const [editingSignatureValue, setEditingSignatureValue] = useState('');
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    description?: string;
    confirmText?: string;
    destructive?: boolean;
    onConfirm?: () => Promise<void> | void;
  }>({
    open: false,
    title: '',
  });

  const getFullName = (cliente: Cliente) => {
    const apellidos = [cliente.a_paterno, cliente.a_materno].filter(Boolean).join(' ').trim();
    const nombre = (cliente.nombre ?? '').trim();
    const apellidosYNombre = (cliente.apellidos_y_nombres ?? '').trim();
    const combined = [apellidos, nombre].filter(Boolean).join(' ').trim();
    return apellidosYNombre || combined || nombre || apellidos || '-';
  };

  const filteredClientes = clientes.filter(cliente =>
    getFullName(cliente).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cliente.cod?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (cliente.dni?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const handleEdit = (cliente: Cliente) => {
    setEditingClient(cliente);
    setIsModalOpen(true);
  };

  const openConfirm = (options: {
    title: string;
    description?: string;
    confirmText?: string;
    destructive?: boolean;
    onConfirm: () => Promise<void> | void;
  }) => {
    setConfirmState({
      open: true,
      title: options.title,
      description: options.description,
      confirmText: options.confirmText,
      destructive: options.destructive,
      onConfirm: options.onConfirm,
    });
  };

  const handleConfirmClose = () => {
    setConfirmState(prev => ({ ...prev, open: false, onConfirm: undefined }));
  };

  const handleConfirmAction = async () => {
    if (confirmState.onConfirm) {
      await confirmState.onConfirm();
    }
    handleConfirmClose();
  };

  const handleDelete = (cliente: Cliente) => {
    openConfirm({
      title: 'Eliminar cliente',
      description: `Se eliminara al cliente ${getFullName(cliente)}. Esta accion no se puede deshacer.`,
      confirmText: 'Eliminar',
      destructive: true,
      onConfirm: async () => {
        const { count, error: countError } = await supabase
          .from('contratos')
          .select('id', { count: 'exact', head: true })
          .eq('cliente_id', cliente.id);

        if (countError) {
          toast.error('No se pudo validar los contratos del cliente');
          return;
        }

        if ((count || 0) > 0) {
          toast.error('No se puede eliminar: el cliente tiene contratos registrados');
          return;
        }

        await deleteCliente(cliente.id);
        toast.success('Cliente eliminado correctamente');
      },
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const handleAddNew = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleScanSearch = () => {
    if (!scanSearch) return;
    // Primero buscar por COD
    let cliente = getClienteByCod(scanSearch);
    if (cliente) {
      setSearchTerm(cliente.cod);
      toast.success(`Cliente encontrado: ${getFullName(cliente)} (COD: ${cliente.cod})`);
    } else {
      // Si no se encuentra por COD, intentar por DNI
      cliente = getClienteByDni(scanSearch);
      if (cliente) {
        setSearchTerm(cliente.cod);
        toast.success(`Cliente encontrado: ${getFullName(cliente)} (COD: ${cliente.cod})`);
      } else {
        toast.error('No se encontró ningún cliente con ese COD o DNI');
      }
    }
    setScanSearch('');
  };

  const loadSignatures = async (clienteId: string) => {
    try {
      setSignaturesLoading(true);
      const { data, error } = await supabase
        .from('cliente_firmas')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const formatted = (data || []).map(firma => ({
        ...firma,
        created_at: new Date(firma.created_at),
      }));
      setSignatures(formatted);
    } catch (err) {
      console.error('Error cargando firmas del cliente:', err);
      toast.error('No se pudieron cargar las firmas');
      setSignatures([]);
    } finally {
      setSignaturesLoading(false);
    }
  };

  const handleOpenSignatures = async (cliente: Cliente) => {
    setSignaturesClient(cliente);
    setShowSignaturesModal(true);
    setNewSignature('');
    setEditingSignatureId(null);
    setEditingSignatureValue('');
    await loadSignatures(cliente.id);
  };

  const handleCloseSignatures = () => {
    setShowSignaturesModal(false);
    setSignaturesClient(null);
    setSignatures([]);
    setNewSignature('');
    setEditingSignatureId(null);
    setEditingSignatureValue('');
  };

  const handleSaveNewSignature = async () => {
    if (!signaturesClient) return;
    if (!newSignature) {
      toast.error('Debe registrar una firma');
      return;
    }

    try {
      await supabase
        .from('cliente_firmas')
        .update({ activa: false })
        .eq('cliente_id', signaturesClient.id)
        .eq('activa', true);

      const { error } = await supabase
        .from('cliente_firmas')
        .insert({
          cliente_id: signaturesClient.id,
          firma_url: newSignature,
          activa: true,
        });

      if (error) {
        throw error;
      }

      toast.success('Firma guardada');
      setNewSignature('');
      setNewSignatureClear(prev => prev + 1);
      await loadSignatures(signaturesClient.id);
    } catch (err) {
      console.error('Error guardando firma:', err);
      toast.error('No se pudo guardar la firma');
    }
  };

  const handleSetActiveSignature = async (firmaId: string) => {
    if (!signaturesClient) return;
    try {
      await supabase
        .from('cliente_firmas')
        .update({ activa: false })
        .eq('cliente_id', signaturesClient.id)
        .eq('activa', true);

      const { error } = await supabase
        .from('cliente_firmas')
        .update({ activa: true })
        .eq('id', firmaId);

      if (error) {
        throw error;
      }

      await loadSignatures(signaturesClient.id);
      toast.success('Firma activada');
    } catch (err) {
      console.error('Error activando firma:', err);
      toast.error('No se pudo activar la firma');
    }
  };

  const handleEditSignature = (firma: ClienteFirma) => {
    setEditingSignatureId(firma.id);
    setEditingSignatureValue(firma.firma_url);
  };

  const handleSaveEditedSignature = async () => {
    if (!signaturesClient || !editingSignatureId) return;
    if (!editingSignatureValue) {
      toast.error('Debe registrar una firma');
      return;
    }

    try {
      const { error } = await supabase
        .from('cliente_firmas')
        .update({ firma_url: editingSignatureValue })
        .eq('id', editingSignatureId);

      if (error) {
        throw error;
      }

      toast.success('Firma actualizada');
      setEditingSignatureId(null);
      setEditingSignatureValue('');
      await loadSignatures(signaturesClient.id);
    } catch (err) {
      console.error('Error actualizando firma:', err);
      toast.error('No se pudo actualizar la firma');
    }
  };

  const performDeleteSignature = async (firmaId: string) => {
    if (!signaturesClient) return;
    try {
      const { count, error: countError } = await supabase
        .from('firmas')
        .select('id', { count: 'exact', head: true })
        .eq('cliente_firma_id', firmaId);

      if (countError) {
        throw countError;
      }

      if ((count || 0) > 0) {
        toast.error('No se puede eliminar: la firma ya está usada en un contrato');
        return;
      }

      const { error } = await supabase
        .from('cliente_firmas')
        .delete()
        .eq('id', firmaId);

      if (error) {
        throw error;
      }

      toast.success('Firma eliminada');
      await loadSignatures(signaturesClient.id);
    } catch (err) {
      console.error('Error eliminando firma:', err);
      toast.error('No se pudo eliminar la firma');
    }
  };

  const handleDeleteSignature = (firmaId: string) => {
    openConfirm({
      title: 'Eliminar firma',
      description: 'Esta accion no se puede deshacer.',
      confirmText: 'Eliminar',
      destructive: true,
      onConfirm: async () => {
        await performDeleteSignature(firmaId);
      },
    });
  };

  return (
    <>
      <div className="space-y-6 motion-safe:animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 section-header">
          <div className="flex-1">
            <h1 className="section-title">Clientes</h1>
            <p className="section-subtitle">Administra la base de datos de tus clientes</p>
          </div>
          <div className="flex gap-3 flex-col sm:flex-row">
            <Button 
              onClick={() => setIsReportModalOpen(true)} 
              variant="outline" 
              size="lg" 
              className="gap-2"
            >
              <FileDown className="w-5 h-5" />
              <span>Generar Reporte</span>
            </Button>
            <Button onClick={handleAddNew} size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              <span>Nuevo Cliente</span>
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="dashboard-card p-6">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground mb-4">Buscar y Filtrar</h3>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 w-full"
                placeholder="Buscar por nombre, apellidos, COD o DNI..."
              />
            </div>
          </div>
        </div>

        {/* Clients Table */}
        <div className="dashboard-card overflow-hidden">
          <div className="p-6 border-b border-border bg-gradient-to-r from-muted/30 to-muted/10">
            <p className="text-sm text-muted-foreground mt-1">Total: {clientes.length} cliente(s)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-header border-b border-border">
                  <th className="text-left px-6 py-4 font-semibold">Nombre Completo</th>
                  <th className="text-left px-6 py-4 font-semibold">DNI</th>
                  <th className="text-left px-6 py-4 hidden lg:table-cell font-semibold">COD</th>
                  <th className="text-left px-6 py-4 hidden md:table-cell font-semibold">Sexo</th>
                  <th className="text-right px-6 py-4 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredClientes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      {searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
                    </td>
                  </tr>
                ) : (
                  filteredClientes.map((cliente, index) => (
                    <tr
                      key={cliente.id}
                      className="border-b border-border last:border-0 hover:bg-muted/50 transition-all duration-200 motion-safe:animate-slide-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-foreground">{getFullName(cliente)}</p>
                          <p className="text-sm text-muted-foreground md:hidden">{cliente.sexo || '-'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-foreground">{cliente.dni}</td>
                      <td className="px-6 py-4 hidden lg:table-cell text-foreground font-semibold">{cliente.cod || '-'}</td>
                      <td className="px-6 py-4 hidden md:table-cell text-muted-foreground">
                        {cliente.sexo === 'M' ? 'Masculino' : cliente.sexo === 'F' ? 'Femenino' : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewingClient(cliente)}
                          >
                            <Eye className="w-4 h-4" />
                            <span className="sr-only sm:not-sr-only sm:ml-1">Ver</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenSignatures(cliente)}
                          >
                            <PenTool className="w-4 h-4" />
                            <span className="sr-only sm:not-sr-only sm:ml-1">Firmas</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(cliente)}
                          >
                            <Edit2 className="w-4 h-4" />
                            <span className="sr-only sm:not-sr-only sm:ml-1">Editar</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(cliente)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="sr-only sm:not-sr-only sm:ml-1">Eliminar</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats */}
        <div className="text-sm text-muted-foreground">
          Mostrando {filteredClientes.length} de {clientes.length} clientes
        </div>
      </div>

      <ClientModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingClient={editingClient}
      />
      
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        clientes={clientes}
      />

      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        description={confirmState.description}
        confirmText={confirmState.confirmText}
        destructive={confirmState.destructive}
        onConfirm={handleConfirmAction}
        onCancel={handleConfirmClose}
      />

      {showSignaturesModal && signaturesClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg shadow-2xl max-w-3xl w-full mx-4 p-6 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Firmas del Cliente</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {getFullName(signaturesClient)} - DNI {signaturesClient.dni}
                </p>
              </div>
              <Button variant="outline" onClick={handleCloseSignatures}>
                Cerrar
              </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Firmas registradas</h3>
                <div className="space-y-3">
                  {signaturesLoading && (
                    <div className="text-sm text-muted-foreground">Cargando firmas...</div>
                  )}
                  {!signaturesLoading && signatures.length === 0 && (
                    <div className="text-sm text-muted-foreground">No hay firmas registradas.</div>
                  )}
                  {signatures.map(firma => (
                    <div
                      key={firma.id}
                      className="border border-border rounded-lg p-3 bg-muted/20 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          {firma.activa ? (
                            <span className="inline-flex items-center gap-1 text-success">
                              <CheckCircle2 className="w-4 h-4" />
                              Activa
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Inactiva</span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {firma.created_at.toLocaleDateString('es-ES')} {firma.created_at.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {!firma.activa && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetActiveSignature(firma.id)}
                            >
                              Activar
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditSignature(firma)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSignature(firma.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="border border-border rounded bg-white p-2">
                        <img
                          src={firma.firma_url}
                          alt="Firma"
                          className="max-h-24 mx-auto"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Nueva firma</h3>
                  <SignaturePad
                    onSignatureComplete={setNewSignature}
                    clearSignal={newSignatureClear}
                  />
                  <Button onClick={handleSaveNewSignature}>
                    Guardar firma
                  </Button>
                </div>

                {editingSignatureId && (
                  <div className="space-y-3 border-t border-border pt-6">
                    <h3 className="text-sm font-semibold text-foreground">Editar firma</h3>
                    <SignaturePad
                      onSignatureComplete={setEditingSignatureValue}
                      existingSignature={editingSignatureValue}
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingSignatureId(null);
                          setEditingSignatureValue('');
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleSaveEditedSignature}>
                        Guardar cambios
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {viewingClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Datos del Cliente</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Información completa registrada
                </p>
              </div>
              <Button variant="outline" onClick={() => setViewingClient(null)}>
                Cerrar
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Datos Personales */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Datos Personales
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Apellidos y nombre</p>
                    <p className="text-foreground font-semibold">{getFullName(viewingClient)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">DNI</p>
                    <p className="text-foreground font-mono">{viewingClient.dni || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Código</p>
                    <p className="text-foreground font-mono font-semibold">{viewingClient.cod || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Repetir Código</p>
                    <p className="text-foreground font-mono">{viewingClient.repetir_codigo || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Fecha de Nacimiento</p>
                    <p className="text-foreground">
                      {viewingClient.fecha_nac 
                        ? new Date(viewingClient.fecha_nac).toLocaleDateString('es-ES')
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Edad</p>
                    <p className="text-foreground">{viewingClient.edad || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Sexo</p>
                    <p className="text-foreground">
                      {viewingClient.sexo === 'M' ? 'Masculino' : viewingClient.sexo === 'F' ? 'Femenino' : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Estado Civil</p>
                    <p className="text-foreground">{viewingClient.estado_civil || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Grado de Instrucción</p>
                    <p className="text-foreground">{viewingClient.grado_instruccion || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Dirección */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Dirección
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Dirección</p>
                    <p className="text-foreground">{viewingClient.direccion || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Distrito</p>
                    <p className="text-foreground">{viewingClient.distrito || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Provincia</p>
                    <p className="text-foreground">{viewingClient.provincia || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Departamento</p>
                    <p className="text-foreground">{viewingClient.departamento || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Información Laboral */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Información Laboral
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Fecha de Reclutamiento</p>
                    <p className="text-foreground">
                      {viewingClient.fecha_reclutamiento 
                        ? new Date(viewingClient.fecha_reclutamiento).toLocaleDateString('es-ES')
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Código Grupo Trabajo</p>
                    <p className="text-foreground">
                      {viewingClient.codigogrupotrabajo || (viewingClient as any).codigo_grupo_trabajo || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Área</p>
                    <p className="text-foreground">{viewingClient.area || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Descripción Zona</p>
                    <p className="text-foreground">{viewingClient.descripcion_zona || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Asignación</p>
                    <p className="text-foreground">{viewingClient.asignacion || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Estado Actual</p>
                    <p className="text-foreground">{viewingClient.estado_actual || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Cargo</p>
                    <p className="text-foreground">{viewingClient.cargo || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Información de Contrato */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Información de Contrato
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Fecha Inicio Contrato</p>
                    <p className="text-foreground">
                      {viewingClient.fecha_inicio_contrato 
                        ? new Date(viewingClient.fecha_inicio_contrato).toLocaleDateString('es-ES')
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Fecha Término Contrato</p>
                    <p className="text-foreground">
                      {viewingClient.fecha_termino_contrato 
                        ? new Date(viewingClient.fecha_termino_contrato).toLocaleDateString('es-ES')
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Tipo de Contrato</p>
                    <p className="text-foreground">{viewingClient.tipo_contrato || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Remuneración</p>
                    <p className="text-foreground font-mono">
                      {viewingClient.remuneracion 
                        ? `S/ ${viewingClient.remuneracion.toFixed(2)}`
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Planilla</p>
                    <p className="text-foreground">{viewingClient.planilla || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Información AFP */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Información de AFP
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">ID AFP</p>
                    <p className="text-foreground">{viewingClient.id_afp || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">CUSPP</p>
                    <p className="text-foreground font-mono">{viewingClient.cuspp || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Fecha Inicio Afiliación</p>
                    <p className="text-foreground">
                      {viewingClient.fecha_inicio_afiliacion 
                        ? new Date(viewingClient.fecha_inicio_afiliacion).toLocaleDateString('es-ES')
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Porcentaje Comisión</p>
                    <p className="text-foreground">
                      {viewingClient.porcentaje_comision 
                        ? `${viewingClient.porcentaje_comision}%`
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Nueva Afiliación</p>
                    <p className="text-foreground">
                      {viewingClient.nueva_afiliacion === true ? 'Sí' : viewingClient.nueva_afiliacion === false ? 'No' : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información Adicional */}
              {(viewingClient.observaciones || viewingClient.referido || viewingClient.lugar || viewingClient.cooperador) && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                    Información Adicional
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {viewingClient.referido && (
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Referido</p>
                        <p className="text-foreground">{viewingClient.referido}</p>
                      </div>
                    )}
                    {viewingClient.lugar && (
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Lugar</p>
                        <p className="text-foreground">{viewingClient.lugar}</p>
                      </div>
                    )}
                    {viewingClient.cooperador && (
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Cooperador</p>
                        <p className="text-foreground">{viewingClient.cooperador}</p>
                      </div>
                    )}
                    {viewingClient.observaciones && (
                      <div className="md:col-span-2">
                        <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Observaciones</p>
                        <p className="text-foreground whitespace-pre-wrap">{viewingClient.observaciones}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Información del Sistema */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Información del Sistema
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Fecha de Registro</p>
                    <p className="text-foreground">
                      {viewingClient.created_at 
                        ? new Date(viewingClient.created_at).toLocaleString('es-ES')
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
