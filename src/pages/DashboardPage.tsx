import { Users, FileText, CheckCircle2, Clock } from 'lucide-react';
import { useClientes } from '@/contexts/ClientContext';
import { useContratos } from '@/contexts/ContractContext';

export default function DashboardPage() {
  const { clientes } = useClientes();
  const { contratos } = useContratos();

  const signedContratos = contratos.filter(c => c.estado === 'firmado').length;
  const pendingContratos = contratos.filter(c => c.estado === 'borrador' || c.estado === 'pendiente').length;

  const getFullName = (cliente: { nombre?: string | null; a_paterno?: string | null; a_materno?: string | null; apellidos_y_nombres?: string | null }) => {
    const apellidos = [cliente.a_paterno, cliente.a_materno].filter(Boolean).join(' ').trim();
    const nombre = (cliente.nombre ?? '').trim();
    const apellidosYNombre = (cliente.apellidos_y_nombres ?? '').trim();
    const combined = [apellidos, nombre].filter(Boolean).join(' ').trim();
    return apellidosYNombre || combined || nombre || apellidos || 'Sin nombre';
  };

  const getClienteNombre = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) return 'Cliente desconocido';
    return getFullName(cliente);
  };

  const stats = [
    {
      title: 'Total Clientes',
      value: clientes.length,
      icon: Users,
      color: 'bg-gradient-to-br from-blue-400 to-blue-600 text-white',
    },
    {
      title: 'Total Contratos',
      value: contratos.length,
      icon: FileText,
      color: 'bg-gradient-to-br from-purple-400 to-purple-600 text-white',
    },
    {
      title: 'Contratos Firmados',
      value: signedContratos,
      icon: CheckCircle2,
      color: 'bg-gradient-to-br from-green-400 to-green-600 text-white',
    },
    {
      title: 'Pendientes',
      value: pendingContratos,
      icon: Clock,
      color: 'bg-gradient-to-br from-orange-400 to-orange-600 text-white',
    },
  ];

  const recentClientes = clientes.slice(-5).reverse();
  const recentContratos = contratos.slice(-5).reverse();

  return (
    <div className="space-y-8 motion-safe:animate-fade-in">
      {/* Header */}
      <div className="section-header">
        <h1 className="section-title">Dashboard</h1>
        <p className="section-subtitle">Resumen general de tu gestión empresarial</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, index) => (
          <div
            key={stat.title}
            className="stat-card motion-safe:animate-slide-in group"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">{stat.title}</p>
                <p className="text-4xl font-bold text-foreground mt-3 group-hover:text-primary transition-colors">{stat.value}</p>
              </div>
              <div className={`p-4 rounded-xl ${stat.color} shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                <stat.icon className="w-8 h-8" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Clients */}
        <div className="dashboard-card overflow-hidden">
          <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/0">
            <h3 className="font-semibold text-foreground flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-primary" />
              Clientes Recientes
            </h3>
          </div>
          <div className="divide-y divide-border">
            {recentClientes.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No hay clientes registrados
              </div>
            ) : (
              recentClientes.map(cliente => (
                <div key={cliente.id} className="p-5 hover:bg-muted/40 transition-colors duration-200">
                  <p className="font-medium text-foreground whitespace-normal break-words">{getFullName(cliente)}</p>
                  <p className="text-sm text-muted-foreground mt-1">DNI: {cliente.dni} | COD: {cliente.cod}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Contracts */}
        <div className="dashboard-card overflow-hidden">
          <div className="p-6 border-b border-border bg-gradient-to-r from-accent/5 to-accent/0">
            <h3 className="font-semibold text-foreground flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-accent-foreground" />
              Contratos Recientes
            </h3>
          </div>
          <div className="divide-y divide-border">
            {recentContratos.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No hay contratos registrados
              </div>
            ) : (
              recentContratos.map(contrato => (
                <div key={contrato.id} className="p-5 hover:bg-muted/40 transition-colors duration-200">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-foreground flex-1 truncate">
                      Contrato de trabajo para {getClienteNombre(contrato.cliente_id)}
                    </p>
                    <span className={`
                        px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap
                        ${contrato.estado === 'firmado' ? 'bg-success/15 text-success' : ''}
                        ${contrato.estado === 'pendiente' ? 'bg-warning/15 text-warning' : ''}
                        ${contrato.estado === 'borrador' ? 'bg-muted text-muted-foreground' : ''}
                      `}>
                      {contrato.estado === 'firmado' ? 'Firmado' : 
                        contrato.estado === 'pendiente' ? 'Pendiente' : 'Borrador'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {new Date(contrato.created_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
