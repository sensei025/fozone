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
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Chiffre d\'affaires total',
      value: `${(stats?.total_revenue || 0).toLocaleString()} XOF`,
      icon: DollarSign,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'Tickets vendus',
      value: stats?.total_tickets_sold || 0,
      icon: Ticket,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Recettes du jour',
      value: `${(stats?.today_revenue || 0).toLocaleString()} XOF`,
      icon: TrendingUp,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      title: 'Zones actives',
      value: `${stats?.active_zones || 0} / ${stats?.total_zones || 0}`,
      icon: Wifi,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
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
            <div key={index} className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 md:p-6 hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-200">
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">
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
            className="text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors flex items-center gap-1"
          >
            Voir tout
            <span>→</span>
          </Link>
        </div>
        {zones.length === 0 ? (
          <div className="text-center py-12 md:py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
              <MapPin className="text-gray-400" size={32} strokeWidth={2} />
            </div>
            <p className="text-base font-medium text-gray-600 dark:text-gray-400 mb-2">Aucune zone Wi-Fi</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">Commencez par créer votre première zone</p>
            <Link to="/zones" className="btn btn-primary inline-flex items-center gap-2">
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
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg group-hover:bg-primary-200 dark:group-hover:bg-primary-900/30 transition-colors">
                    <Wifi className="text-primary-600 dark:text-primary-400" size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-base">{zone.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{zone.router_ip}</p>
                  </div>
                </div>
                <span className="text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


