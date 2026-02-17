import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useClientes } from '@/contexts/ClientContext';
import { Cliente } from '@/types';
import { ClientBarcode } from '@/components/ClientBarcode';

interface ClientSelectorProps {
  selectedClient: Cliente | null;
  onSelectClient: (client: Cliente | null) => void;
  onRegisterNewClient?: (dni?: string) => void;
}

export function ClientSelector({ selectedClient, onSelectClient, onRegisterNewClient }: ClientSelectorProps) {
  const { clientes } = useClientes();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const getFullName = (cliente: Cliente) => {
    const apellidos = [cliente.a_paterno, cliente.a_materno].filter(Boolean).join(' ').trim();
    const nombre = (cliente.nombre ?? '').trim();
    const apellidosYNombre = (cliente.apellidos_y_nombres ?? '').trim();
    const combined = [apellidos, nombre].filter(Boolean).join(' ').trim();
    return apellidosYNombre || combined || nombre || apellidos || '-';
  };

  const filteredClientes = clientes.filter(cliente =>
    getFullName(cliente).toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cod.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.dni.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (term: string) => {
    const cleanTerm = term.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    if (/^\d+$/.test(cleanTerm) && cleanTerm.length > 8) {
      return;
    }

    setSearchTerm(cleanTerm);
    setShowDropdown(cleanTerm.length > 0);
  };

  const handleSelectClient = (cliente: Cliente) => {
    onSelectClient(cliente);
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleClearSelection = () => {
    onSelectClient(null);
  };

  if (selectedClient) {
    return (
      <div className="dashboard-card p-4 motion-safe:animate-fade-in">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">Cliente seleccionado</p>
            <h3 className="text-lg font-semibold text-foreground">{getFullName(selectedClient)}</h3>
            <p className="text-sm text-muted-foreground">COD: {selectedClient.cod} | DNI: {selectedClient.dni}</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <Button variant="ghost" size="sm" onClick={handleClearSelection}>
              <X className="w-4 h-4 mr-1" />
              Cambiar
            </Button>
            <ClientBarcode dni={selectedClient.dni} height={40} width={1.2} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => searchTerm && setShowDropdown(true)}
          className="input-field pl-10"
          placeholder="Buscar por nombre, COD o DNI..."
          maxLength={12}
        />

        {showDropdown && filteredClientes.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto motion-safe:animate-fade-in">
            {filteredClientes.map(cliente => (
              <button
                key={cliente.id}
                onClick={() => handleSelectClient(cliente)}
                className="w-full px-4 py-3 text-left hover:bg-muted transition-colors border-b border-border last:border-0"
              >
                <p className="font-medium text-foreground">{getFullName(cliente)}</p>
                <p className="text-sm text-muted-foreground">COD: {cliente.cod} | DNI: {cliente.dni}</p>
              </button>
            ))}
          </div>
        )}

        {showDropdown && filteredClientes.length === 0 && (
          <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg p-4 space-y-3">
            <p className="text-center text-muted-foreground text-sm">No se encontraron clientes</p>
            {onRegisterNewClient && /^\d{8}$/.test(searchTerm) && (
              <button
                onClick={() => onRegisterNewClient(searchTerm)}
                className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium text-sm"
              >
                Registrar Nuevo Trabajador
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
