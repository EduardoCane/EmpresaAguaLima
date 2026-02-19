import { useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  LayoutDashboard, 
  Menu, 
  X,
  ChevronLeft,
  Moon,
  Sun
} from 'lucide-react';

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();

  const navItems = useMemo(
    () => [
      { path: '/', label: 'Dashboard', icon: LayoutDashboard, description: 'Resumen general' },
      { path: '/clientes', label: 'Clientes', icon: Users, description: 'Gestión de clientes' },
      { path: '/contratos', label: 'Fichas / Contratos', icon: FileText, description: 'Contratos y fichas' },
    ],
    []
  );

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-sidebar text-sidebar-foreground lg:hidden shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full transition-all duration-300 flex flex-col
          ${isDarkMode 
            ? 'bg-gray-900 border-r-2 border-gray-800' 
            : 'bg-white border-r-2 border-gray-200'}
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className={`
          flex items-center justify-between h-20 px-6 border-b-2 transition-all duration-300
          ${isDarkMode 
            ? 'border-gray-800 bg-gray-800' 
            : 'border-gray-200 bg-white'}
        `}>
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                isDarkMode
                  ? 'bg-gray-700/70 border border-gray-500/70'
                  : 'bg-white/65 backdrop-blur-md border border-white/90 ring-1 ring-gray-200/80'
              }`}
            >
              <span
                className={`text-2xl leading-none rounded-full w-8 h-8 inline-flex items-center justify-center ${
                  isDarkMode ? 'text-emerald-300 bg-gray-800/70' : 'text-emerald-600 bg-white/70'
                }`}
                aria-hidden="true"
              >
                {'\u{1F331}'}
              </span>
            </div>
            {!isCollapsed && (
              <div className="motion-safe:animate-fade-in">
                <h1 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>AGUALIMA</h1>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sistema Reclutamiento</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className={`p-1 rounded-lg transition-colors lg:hidden ${
              isDarkMode 
                ? 'hover:bg-gray-700 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-900'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6">
          <ul className="space-y-3 px-4">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={`
                    group flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-300 relative font-semibold
                    ${isActive(item.path) 
                      ? isDarkMode
                        ? 'bg-gray-700 text-white shadow-xl scale-105 border border-gray-600'
                        : 'bg-white/75 backdrop-blur-sm border border-white/90 ring-1 ring-gray-200/90 text-gray-900 shadow-md'
                      : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-800 hover:text-white hover:translate-x-1'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:translate-x-1'}
                  `}
                >
                  <item.icon className="w-6 h-6 shrink-0" />
                  {!isCollapsed && (
                    <div className="motion-safe:animate-fade-in flex-1 min-w-0">
                      <span className="text-base font-bold block">{item.label}</span>
                      <span className={`text-xs ${
                        isActive(item.path) 
                          ? isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          : isDarkMode 
                          ? 'text-gray-500' 
                          : 'text-gray-500'
                      }`}>
                        {item.description}
                      </span>
                    </div>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Collapse button (desktop only) */}
        <div className={`
          hidden lg:block p-4 border-t-2 space-y-3 transition-all duration-300
          ${isDarkMode 
            ? 'border-gray-800 bg-gray-800' 
            : 'border-gray-200 bg-white'}
        `}>
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border transition-all duration-300 text-sm font-semibold ${
              isDarkMode
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 border-transparent text-white hover:opacity-90'
                : 'bg-white/80 backdrop-blur-sm border-white/90 ring-1 ring-gray-200/90 text-gray-800 hover:bg-white'
            }`}
          >
            {isDarkMode ? (
              <>
                <Sun className="w-4 h-4" />
                {!isCollapsed && <span>Modo Claro</span>}
              </>
            ) : (
              <>
                <Moon className="w-4 h-4" />
                {!isCollapsed && <span>Modo Oscuro</span>}
              </>
            )}
          </button>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`
              w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg transition-all duration-300 text-sm font-semibold
              ${isDarkMode
                ? 'hover:bg-gray-700 text-gray-300'
                : 'hover:bg-gray-100 text-gray-700'}
            `}
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
            {!isCollapsed && <span>Contraer menú</span>}
          </button>
        </div>
      </aside>

      {/* Spacer for main content */}
      <div className={`hidden lg:block shrink-0 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`} />
    </>
  );
}
