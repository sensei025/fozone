import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Moon, Sun, Menu, X, Wifi, Home, DollarSign, Ticket, FileText, LogOut, Settings, Search, X as XIcon } from 'lucide-react';
import { logout, getCurrentUser } from '../services/auth';
import Logo from './Logo';

export default function Layout() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true' || 
           (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });
  const [user, setUser] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setUser(getCurrentUser());
    
    // Appliquer le dark mode
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', newState.toString());
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const getUserDisplayName = () => {
    if (user?.full_name) {
      const parts = user.full_name.split(' ');
      return parts[0] || user.email?.split('@')[0] || 'Utilisateur';
    }
    return user?.email?.split('@')[0] || 'Utilisateur';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    const query = searchQuery.toLowerCase().trim();
    const routes = [
      { path: '/dashboard', keywords: ['dashboard', 'accueil', 'tableau', 'home'] },
      { path: '/zones', keywords: ['zones', 'wifi', 'zone', 'réseau'] },
      { path: '/pricings', keywords: ['tarifs', 'prix', 'forfaits', 'pricing'] },
      { path: '/tickets', keywords: ['tickets', 'billets', 'ticket'] },
      { path: '/accounting', keywords: ['comptabilité', 'compta', 'recettes', 'revenus', 'paiements'] },
      { path: '/profile', keywords: ['profil', 'compte', 'paramètres', 'settings'] },
    ];

    const matchedRoute = routes.find(route => 
      route.keywords.some(keyword => query.includes(keyword))
    );

    if (matchedRoute) {
      navigate(matchedRoute.path);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    setSearchOpen(false);
  }, [location.pathname]);

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/zones', icon: Wifi, label: 'Zones Wi-Fi' },
    { path: '/pricings', icon: DollarSign, label: 'Tarifs' },
    { path: '/tickets', icon: Ticket, label: 'Tickets' },
    { path: '/accounting', icon: FileText, label: 'Comptabilité' },
    { path: '/profile', icon: Settings, label: 'Mon Profil' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
      {/* Sidebar Mobile */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white dark:bg-gray-800 shadow-2xl border-r border-green-100 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-4 border-b border-green-100 dark:border-gray-700 bg-gradient-to-r from-green-400/10 to-white dark:from-green-900/20 dark:to-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm">
                <Wifi className="text-white" size={20} strokeWidth={2.5} />
              </div>
              <Logo size="md" className="text-gray-900 dark:text-white" />
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-lg p-1 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all">
              <X size={24} strokeWidth={2} />
            </button>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md shadow-green-500/30' 
                      : 'hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={20} className="mr-3" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sidebar Desktop */}
      <div className={`hidden lg:flex lg:flex-shrink-0 lg:fixed lg:inset-y-0 lg:left-0 transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'}`}>
        <div className="flex flex-col w-full">
          <div className="flex flex-col flex-1 bg-white dark:bg-gray-800 border-r border-green-100 dark:border-gray-700 h-screen overflow-y-auto shadow-lg">
            <div className="flex items-center justify-between h-16 px-4 border-b border-green-100 dark:border-gray-700 bg-gradient-to-r from-green-400/10 to-white dark:from-green-900/20 dark:to-gray-800">
              <div className={`flex items-center gap-3 transition-opacity duration-300 ${sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                <div className="p-1.5 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm flex-shrink-0">
                  <Wifi className="text-white" size={20} strokeWidth={2.5} />
                </div>
                <Logo size="md" className="text-gray-900 dark:text-white whitespace-nowrap" />
              </div>
              <button
                onClick={toggleSidebar}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200 flex-shrink-0"
                title={sidebarCollapsed ? 'Agrandir le menu' : 'Réduire le menu'}
              >
                <Menu size={20} strokeWidth={2} className={sidebarCollapsed ? 'rotate-180' : ''} />
              </button>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                      sidebarCollapsed ? 'justify-center' : ''
                    } ${
                      isActive 
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md shadow-green-500/30' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400'
                    }`}
                    title={sidebarCollapsed ? item.label : ''}
                  >
                    <Icon size={20} className={`flex-shrink-0 ${sidebarCollapsed ? '' : 'mr-3'}`} />
                    <span className={`transition-all duration-300 whitespace-nowrap ${
                      sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                    }`}>
                      {item.label}
                    </span>
                    {sidebarCollapsed && (
                      <div className="absolute left-full ml-2 px-3 py-1.5 bg-green-600 dark:bg-green-700 text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                        {item.label}
                      </div>
                    )}
                  </Link>
                );
              })}
            </nav>
            <div className={`p-4 border-t border-gray-200 dark:border-gray-700 transition-all duration-300 ${sidebarCollapsed ? 'px-2' : ''}`}>
              <div className={`flex items-center justify-between mb-4 transition-opacity duration-300 ${sidebarCollapsed ? 'opacity-0 h-0 overflow-hidden mb-0' : 'opacity-100'}`}>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.email || 'Utilisateur'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.role || 'Admin'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className={`flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 ${
                  sidebarCollapsed ? 'justify-center' : ''
                }`}
                title={sidebarCollapsed ? 'Déconnexion' : ''}
              >
                <LogOut size={16} className={`flex-shrink-0 ${sidebarCollapsed ? '' : 'mr-2'}`} />
                <span className={`transition-all duration-300 whitespace-nowrap ${
                  sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                }`}>
                  Déconnexion
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        {/* Top Bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 xl:px-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-green-100 dark:border-gray-700 shadow-sm w-full">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-xl p-2 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200 hover:scale-110"
            >
              <Menu size={24} strokeWidth={2} />
            </button>
            
            {/* Message de bienvenue */}
            <div className="hidden sm:block">
              <p className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-300">
                {getGreeting()}, <span className="font-semibold text-green-600 dark:text-green-400">{getUserDisplayName()}</span>
              </p>
            </div>
          </div>

          {/* Barre de recherche et actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Recherche */}
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-3 py-1.5 animate-in fade-in slide-in-from-right-5 duration-200">
                <Search size={18} className="text-green-600 dark:text-green-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une section..."
                  className="bg-transparent border-0 outline-none text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 w-48 md:w-64"
                  onBlur={() => {
                    setTimeout(() => {
                      if (!searchQuery.trim()) setSearchOpen(false);
                    }, 200);
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchOpen(false);
                  }}
                  className="text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  <XIcon size={18} strokeWidth={2} />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-gray-500 dark:text-gray-400 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 transition-all duration-200 hover:scale-110 interactive"
                title="Rechercher une section"
              >
                <Search size={20} strokeWidth={2} />
              </button>
            )}

            {/* Toggle Dark Mode */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-gray-500 dark:text-gray-400 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 transition-all duration-200 hover:scale-110 interactive"
              title={darkMode ? 'Mode clair' : 'Mode sombre'}
            >
              {darkMode ? <Sun size={20} strokeWidth={2} /> : <Moon size={20} strokeWidth={2} />}
            </button>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 overflow-x-hidden bg-gradient-to-br from-green-50/50 via-white to-green-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-0">
          <div className="max-w-[1600px] mx-auto w-full h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}


