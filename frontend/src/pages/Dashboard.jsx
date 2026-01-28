import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getGlobalStats } from '../services/dashboard';
import { getWifiZones } from '../services/wifiZones';
import toast from 'react-hot-toast';
import { Wifi, DollarSign, Ticket, TrendingUp, MapPin } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, zonesData] = await Promise.all([
        getGlobalStats(),
        getWifiZones(),
      ]);
      setStats(statsData.stats);
      setZones(zonesData.zones || []);
    } catch (error) {
      console.error('[Dashboard] Erreur:', error);
      toast.error(error.message || 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Chiffre d\'affaires total',
      value: `${(stats?.total_revenue || 0).toLocaleString()} XOF`,
      icon: DollarSign,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20',
    },
    {
      title: 'Tickets vendus',
      value: stats?.total_tickets_sold || 0,
      icon: Ticket,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20',
    },
    {
      title: 'Recettes du jour',
      value: `${(stats?.today_revenue || 0).toLocaleString()} XOF`,
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20',
    },
    {
      title: 'Zones actives',
      value: `${stats?.active_zones || 0} / ${stats?.total_zones || 0}`,
      icon: Wifi,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20',
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8 w-full">
      {/* En-tête */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
          Dashboard
        </h1>
        <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 font-medium">
          Vue d'ensemble de votre activité
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-green-100 dark:border-gray-700 p-5 md:p-6 hover:shadow-xl hover:border-green-300 dark:hover:border-green-700 hover:scale-[1.02] transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                    {stat.title}
                  </p>
                  <p className="text-xl md:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white tracking-tight break-words">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2.5 md:p-3 rounded-xl ${stat.bgColor} flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className={`${stat.color}`} size={22} strokeWidth={2.5} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Zones Wi-Fi */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-green-100 dark:border-gray-700 p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Zones Wi-Fi
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Vos zones actives
            </p>
          </div>
          <Link 
            to="/zones" 
            className="text-sm font-semibold text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors flex items-center gap-1 hover:gap-2"
          >
            Voir tout
            <span>→</span>
          </Link>
        </div>
        {zones.length === 0 ? (
          <div className="text-center py-12 md:py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20 rounded-2xl mb-4">
              <MapPin className="text-green-600 dark:text-green-400" size={36} strokeWidth={2} />
            </div>
            <p className="text-base font-semibold text-gray-900 dark:text-white mb-2">Aucune zone Wi-Fi</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Commencez par créer votre première zone</p>
            <Link to="/zones" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
              <Wifi size={18} />
              Créer une zone
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {zones.slice(0, 5).map((zone) => (
              <Link
                key={zone.id}
                to={`/zones/${zone.id}`}
                className="flex items-center justify-between p-4 border border-green-100 dark:border-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-white dark:hover:from-green-900/20 dark:hover:to-gray-700/50 hover:border-green-300 dark:hover:border-green-700 transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20 rounded-xl group-hover:from-green-200 group-hover:to-green-100 dark:group-hover:from-green-900/40 dark:group-hover:to-green-800/30 transition-all shadow-sm">
                    <Wifi className="text-green-600 dark:text-green-400" size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-base">{zone.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{zone.router_ip}</p>
                  </div>
                </div>
                <span className="text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors text-xl">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


