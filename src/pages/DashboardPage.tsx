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
      title: 'Total clientes',
      value: clientes.length,
      icon: Users,
      barColor: 'bg-blue-500',
      iconBoxColor: 'bg-blue-50 border-blue-100',
      iconColor: 'text-blue-600 dark:text-blue-300',
    },
    {
      title: 'Total contratos',
      value: contratos.length,
      icon: FileText,
      barColor: 'bg-indigo-500',
      iconBoxColor: 'bg-indigo-50 border-indigo-100',
      iconColor: 'text-indigo-600 dark:text-indigo-300',
    },
    {
      title: 'Contratos firmados',
      value: signedContratos,
      icon: CheckCircle2,
      barColor: 'bg-emerald-500',
      iconBoxColor: 'bg-emerald-50 border-emerald-100',
      iconColor: 'text-emerald-600 dark:text-emerald-300',
    },
    {
      title: 'Pendientes',
      value: pendingContratos,
      icon: Clock,
      barColor: 'bg-amber-500',
      iconBoxColor: 'bg-amber-50 border-amber-100',
      iconColor: 'text-amber-600 dark:text-amber-300',
    },
  ];

  const recentClientes = clientes.slice(-5).reverse();
  const recentContratos = contratos.slice(-5).reverse();

  const getEstadoClasses = (estado: string) => {
    if (estado === 'firmado') return 'bg-emerald-100 text-emerald-700';
    if (estado === 'pendiente') return 'bg-amber-100 text-amber-700';
    return 'bg-slate-100 text-slate-700';
  };

  const getEstadoLabel = (estado: string) => {
    if (estado === 'firmado') return 'Firmado';
    if (estado === 'pendiente') return 'Pendiente';
    return 'Borrador';
  };

  return (
    <div className="space-y-7 motion-safe:animate-fade-in">
      <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-6 shadow-sm backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80">
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">Resumen general de tu gestion empresarial</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <article
            key={stat.title}
            className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`absolute inset-x-0 top-0 h-1 ${stat.barColor}`} />
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">{stat.title}</p>
                <p className="mt-4 text-4xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              </div>
              <div className={`flex h-14 w-14 items-center justify-center rounded-xl border ${stat.iconBoxColor} transition-transform duration-300 group-hover:scale-105 dark:border-gray-700 dark:bg-gray-800`}>
                <stat.icon className={`h-7 w-7 ${stat.iconColor}`} />
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50/80 px-5 py-4 dark:border-gray-700 dark:bg-gray-800/80">
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-300" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Clientes Recientes</h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-gray-800">
            {recentClientes.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">No hay clientes registrados</div>
            ) : (
              recentClientes.map(cliente => (
                <div key={cliente.id} className="px-5 py-4 transition-colors duration-200 hover:bg-slate-50/80 dark:hover:bg-gray-800/60">
                  <p className="whitespace-normal break-words font-medium text-slate-900 dark:text-white">{getFullName(cliente)}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">DNI: {cliente.dni} | COD: {cliente.cod}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50/80 px-5 py-4 dark:border-gray-700 dark:bg-gray-800/80">
            <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Contratos Recientes</h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-gray-800">
            {recentContratos.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">No hay contratos registrados</div>
            ) : (
              recentContratos.map(contrato => (
                <div key={contrato.id} className="px-5 py-4 transition-colors duration-200 hover:bg-slate-50/80 dark:hover:bg-gray-800/60">
                  <div className="flex items-center justify-between gap-3">
                    <p className="flex-1 whitespace-normal break-words font-medium text-slate-900 dark:text-white">
                      Contrato de trabajo para {getClienteNombre(contrato.cliente_id)}
                    </p>
                    <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${getEstadoClasses(contrato.estado)}`}>
                      {getEstadoLabel(contrato.estado)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {new Date(contrato.created_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
