import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getWifiZoneById, updateWifiZone, deleteWifiZone } from '../services/wifiZones';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Edit2, 
  Trash2, 
  Link as LinkIcon, 
  Code, 
  MapPin, 
  Server, 
  Phone,
  ExternalLink,
  X
} from 'lucide-react';

export default function WifiZoneDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [zone, setZone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showIntegrationCode, setShowIntegrationCode] = useState(false);
  const [copied, setCopied] = useState({ buyLink: false, integrationCode: false });
  
  const [editForm, setEditForm] = useState({
    name: '',
    router_ip: '',
    manager_phone: '',
    address: '',
    latitude: '',
    longitude: ''
  });

  useEffect(() => {
    loadZone();
  }, [id]);

  const loadZone = async () => {
    try {
      const response = await getWifiZoneById(id);
      setZone(response.zone);
      setEditForm({
        name: response.zone.name || '',
        router_ip: response.zone.router_ip || '',
        manager_phone: response.zone.manager_phone || '',
        address: response.zone.address || '',
        latitude: response.zone.latitude || '',
        longitude: response.zone.longitude || ''
      });
    } catch (error) {
      console.error('[WifiZoneDetail] Erreur lors du chargement:', error);
      toast.error(error.message || 'Impossible de charger la zone');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        name: editForm.name,
        router_ip: editForm.router_ip,
        manager_phone: editForm.manager_phone,
        address: editForm.address || null,
        latitude: editForm.latitude ? parseFloat(editForm.latitude) : null,
        longitude: editForm.longitude ? parseFloat(editForm.longitude) : null
      };

      const response = await updateWifiZone(id, updateData);
      setZone(response.zone);
      setEditing(false);
      toast.success('Zone Wi-Fi mise à jour avec succès !');
    } catch (error) {
      console.error('[WifiZoneDetail] Erreur lors de la mise à jour:', error);
      toast.error(error.message || 'Impossible de mettre à jour la zone');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette zone Wi-Fi ? Cette action est irréversible et supprimera également tous les tarifs et tickets associés.')) {
      return;
    }

    setDeleting(true);
    try {
      await deleteWifiZone(id);
      toast.success('Zone Wi-Fi supprimée avec succès !');
      navigate('/zones');
    } catch (error) {
      console.error('[WifiZoneDetail] Erreur lors de la suppression:', error);
      toast.error(error.message || 'Impossible de supprimer la zone');
      setDeleting(false);
    }
  };

  const getBuyLink = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/buy/${id}`;
  };

  const getIntegrationCode = () => {
    const buyLink = getBuyLink();
    const recoveryLink = `${window.location.origin}/payment/return`;
    
    return `<style>
.wifi-button {
    display: inline-block;
    padding: 12px 24px;
    margin: 8px;
    font-weight: 600;
    text-decoration: none;
    border-radius: 50px;
    transition: all 0.3s ease;
    text-align: center;
    width: 100%;
    max-width: 300px;
}

.wifi-button-primary {
    background: linear-gradient(45deg, #e31837, #ff2d55);
    color: white;
    border: none;
    box-shadow: 0 4px 15px rgba(227, 24, 55, 0.2);
}

.wifi-button-secondary {
    background: linear-gradient(45deg, #28a745, #34ce57);
    color: white;
    border: none;
    box-shadow: 0 4px 15px rgba(40, 167, 69, 0.2);
}

.wifi-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.wifi-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 20px;
}
</style>

<div class="wifi-container">
    <a href="${buyLink}" target="_blank" class="wifi-button wifi-button-primary">
        Acheter un Ticket WiFi
    </a>
    <a href="${recoveryLink}" target="_blank" class="wifi-button wifi-button-secondary">
        Récupérer mon Ticket
    </a>
</div>`;
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied({ ...copied, [type]: true });
      toast.success(type === 'buyLink' ? 'Lien copié !' : 'Code copié !');
      setTimeout(() => {
        setCopied({ ...copied, [type]: false });
      }, 2000);
    } catch (error) {
      toast.error('Impossible de copier');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!zone) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Zone non trouvée</p>
        <Link to="/zones" className="btn btn-primary mt-4 inline-block">
          Retour aux zones
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 w-full">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <Link to="/zones" className="flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-500 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Retour aux zones
        </Link>
        <div className="flex items-center gap-3">
          {!editing && (
            <>
              <button
                onClick={() => setEditing(true)}
                className="btn btn-secondary inline-flex items-center gap-2"
              >
                <Edit2 size={18} strokeWidth={2} />
                Modifier
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="btn btn-danger inline-flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Suppression...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} strokeWidth={2} />
                    Supprimer
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
          {zone.name}
        </h1>
        <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 font-medium">
          Détails de la zone Wi-Fi
        </p>
      </div>

      {/* Formulaire d'édition */}
      {editing ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              Modifier la zone Wi-Fi
            </h2>
            <button
              onClick={() => {
                setEditing(false);
                loadZone(); // Recharger les données originales
              }}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X size={24} strokeWidth={2} />
            </button>
          </div>
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom de la zone *
                </label>
                <input
                  type="text"
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label htmlFor="router_ip" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Adresse IP du routeur *
                </label>
                <input
                  type="text"
                  id="router_ip"
                  value={editForm.router_ip}
                  onChange={(e) => setEditForm({ ...editForm, router_ip: e.target.value })}
                  className="input w-full"
                  placeholder="192.168.1.1 ou vpn.example.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="manager_phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Téléphone du gérant *
                </label>
                <input
                  type="tel"
                  id="manager_phone"
                  value={editForm.manager_phone}
                  onChange={(e) => setEditForm({ ...editForm, manager_phone: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Adresse
                </label>
                <input
                  type="text"
                  id="address"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="input w-full"
                  placeholder="Adresse complète de la zone"
                />
              </div>
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  id="latitude"
                  value={editForm.latitude}
                  onChange={(e) => setEditForm({ ...editForm, latitude: e.target.value })}
                  className="input w-full"
                  placeholder="6.4969"
                />
              </div>
              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  id="longitude"
                  value={editForm.longitude}
                  onChange={(e) => setEditForm({ ...editForm, longitude: e.target.value })}
                  className="input w-full"
                  placeholder="2.6289"
                />
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button type="submit" className="btn btn-primary">
                Enregistrer les modifications
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  loadZone();
                }}
                className="btn btn-secondary"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <MapPin size={24} strokeWidth={2} />
                Informations générales
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Nom de la zone</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">{zone.name}</p>
                </div>
                <div className="flex items-start gap-2">
                  <Server size={18} className="text-gray-400 dark:text-gray-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Adresse IP du routeur</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">{zone.router_ip}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone size={18} className="text-gray-400 dark:text-gray-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Téléphone du gérant</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">{zone.manager_phone}</p>
                  </div>
                </div>
                {zone.address && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Adresse</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">{zone.address}</p>
                  </div>
                )}
                {(zone.latitude && zone.longitude) && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Coordonnées GPS</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                      {zone.latitude}, {zone.longitude}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Liens et intégration */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <LinkIcon size={24} strokeWidth={2} />
                Liens et intégration
              </h2>
              <div className="space-y-4">
                {/* Lien Buy */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Lien de la page d'achat
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={getBuyLink()}
                      className="input flex-1 bg-gray-50 dark:bg-gray-700/50 text-sm"
                      onClick={(e) => e.target.select()}
                    />
                    <button
                      onClick={() => copyToClipboard(getBuyLink(), 'buyLink')}
                      className="btn btn-secondary inline-flex items-center gap-2 px-4"
                      title="Copier le lien"
                    >
                      {copied.buyLink ? (
                        <Check size={18} strokeWidth={2} />
                      ) : (
                        <Copy size={18} strokeWidth={2} />
                      )}
                    </button>
                    <a
                      href={getBuyLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary inline-flex items-center gap-2 px-4"
                      title="Ouvrir dans un nouvel onglet"
                    >
                      <ExternalLink size={18} strokeWidth={2} />
                    </a>
                  </div>
                </div>

                {/* Code d'intégration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Code d'intégration HTML
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowIntegrationCode(!showIntegrationCode)}
                      className="btn btn-secondary w-full inline-flex items-center justify-center gap-2"
                    >
                      <Code size={18} strokeWidth={2} />
                      {showIntegrationCode ? 'Masquer le code' : 'Afficher le code'}
                    </button>
                    {showIntegrationCode && (
                      <div className="relative">
                        <textarea
                          readOnly
                          value={getIntegrationCode()}
                          rows={25}
                          className="input w-full font-mono text-xs bg-gray-50 dark:bg-gray-700/50 resize-none"
                          onClick={(e) => e.target.select()}
                        />
                        <button
                          onClick={() => copyToClipboard(getIntegrationCode(), 'integrationCode')}
                          className="absolute top-2 right-2 btn btn-primary inline-flex items-center gap-2 px-3 py-1.5 text-sm"
                          title="Copier le code"
                        >
                          {copied.integrationCode ? (
                            <>
                              <Check size={16} strokeWidth={2} />
                              Copié !
                            </>
                          ) : (
                            <>
                              <Copy size={16} strokeWidth={2} />
                              Copier
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Actions rapides
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link to={`/pricings?zone=${id}`} className="btn btn-primary text-center">
                Gérer les tarifs
              </Link>
              <Link to={`/tickets?zone=${id}`} className="btn btn-secondary text-center">
                Gérer les tickets
              </Link>
              <Link to={`/accounting?zone=${id}`} className="btn btn-secondary text-center">
                Voir la comptabilité
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
