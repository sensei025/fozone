import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getWifiZoneById } from '../services/wifiZones';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

export default function WifiZoneDetail() {
  const { id } = useParams();
  const [zone, setZone] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadZone();
  }, [id]);

  const loadZone = async () => {
    try {
      const response = await getWifiZoneById(id);
      setZone(response.zone);
    } catch (error) {
      toast.error('Erreur lors du chargement de la zone');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>;
  }

  if (!zone) {
    return <div className="text-center py-12">
      <p className="text-gray-600 dark:text-gray-400">Zone non trouvée</p>
      <Link to="/zones" className="btn btn-primary mt-4 inline-block">
        Retour aux zones
      </Link>
    </div>;
  }

  return (
    <div className="space-y-6">
      <Link to="/zones" className="flex items-center text-primary-600 hover:text-primary-700">
        <ArrowLeft size={20} className="mr-2" />
        Retour aux zones
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{zone.name}</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Détails de la zone Wi-Fi
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Informations générales</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Adresse IP du routeur</p>
              <p className="font-medium">{zone.router_ip}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Téléphone du gérant</p>
              <p className="font-medium">{zone.manager_phone}</p>
            </div>
            {zone.address && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Adresse</p>
                <p className="font-medium">{zone.address}</p>
              </div>
            )}
            {(zone.latitude && zone.longitude) && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Coordonnées</p>
                <p className="font-medium">{zone.latitude}, {zone.longitude}</p>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Actions rapides</h2>
          <div className="space-y-3">
            <Link to={`/pricings?zone=${id}`} className="block btn btn-primary text-center">
              Gérer les tarifs
            </Link>
            <Link to={`/tickets?zone=${id}`} className="block btn btn-secondary text-center">
              Gérer les tickets
            </Link>
            <Link to={`/accounting?zone=${id}`} className="block btn btn-secondary text-center">
              Voir la comptabilité
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


