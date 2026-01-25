import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWifiZones, deleteWifiZone } from '../services/wifiZones';
import toast from 'react-hot-toast';
import { Plus, MapPin, Trash2, Edit, Wifi } from 'lucide-react';
import CreateWifiZone from './CreateWifiZone';

export default function WifiZones() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    try {
      const response = await getWifiZones();
      setZones(response.zones || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des zones');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette zone ?')) return;

    try {
      await deleteWifiZone(id);
      toast.success('Zone supprimée');
      loadZones();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>;
  }

  return (
    <div className="space-y-6 md:space-y-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
            Zones Wi-Fi
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 font-medium">
            Gérez vos zones Wi-Fi
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn btn-primary flex items-center justify-center gap-2 h-11 px-6 font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-200"
        >
          <Plus size={20} strokeWidth={2.5} />
          Nouvelle zone
        </button>
      </div>

      {/* Formulaire de création */}
      {showCreateForm && (
        <CreateWifiZone onCancel={() => setShowCreateForm(false)} onSuccess={() => {
          setShowCreateForm(false);
          loadZones();
        }} />
      )}

      {/* Liste des zones */}
      {!showCreateForm && (
        <>
          {zones.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-center py-12 md:py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full mb-6">
                <MapPin className="text-gray-400" size={40} strokeWidth={2} />
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Aucune zone Wi-Fi</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Commencez par créer votre première zone</p>
              <button 
                onClick={() => setShowCreateForm(true)} 
                className="btn btn-primary inline-flex items-center gap-2"
              >
                <Plus size={18} strokeWidth={2.5} />
                Créer votre première zone
              </button>
            </div>
          ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {zones.map((zone) => (
            <div key={zone.id} className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="p-2.5 bg-primary-100 dark:bg-primary-900/20 rounded-lg group-hover:bg-primary-200 dark:group-hover:bg-primary-900/30 transition-colors flex-shrink-0">
                    <Wifi className="text-primary-600 dark:text-primary-400" size={20} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 truncate">
                      {zone.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {zone.router_ip}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1.5 ml-2">
                  <Link
                    to={`/zones/${zone.id}`}
                    className="p-2 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
                    title="Modifier"
                  >
                    <Edit size={18} strokeWidth={2} />
                  </Link>
                  <button
                    onClick={() => handleDelete(zone.id)}
                    className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    title="Supprimer"
                  >
                    <Trash2 size={18} strokeWidth={2} />
                  </button>
                </div>
              </div>
              <div className="space-y-2.5 text-sm mb-4">
                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Gérant:</span>
                  <span className="truncate">{zone.manager_phone}</span>
                </p>
                {zone.address && (
                  <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Adresse:</span> {zone.address}
                  </p>
                )}
              </div>
              <Link
                to={`/zones/${zone.id}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors group/link"
              >
                Voir les détails
                <span className="group-hover/link:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          ))}
        </div>
          )}
        </>
      )}
    </div>
  );
}


