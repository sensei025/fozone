import { useState, useEffect } from 'react';
import { getWifiZones } from '../services/wifiZones';
import { getPaymentStats, getTicketsSoldStats, getPaymentHistory, exportPaymentHistoryCSV } from '../services/accounting';
import toast from 'react-hot-toast';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Ticket, 
  Download, 
  Calendar, 
  Search, 
  Eye,
  Filter,
  Clock
} from 'lucide-react';

export default function Accounting() {
  const [paymentStats, setPaymentStats] = useState([]);
  const [ticketsStats, setTicketsStats] = useState([]);
  const [payments, setPayments] = useState([]);
  const [wifiZones, setWifiZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Filtres pour les graphiques
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [period, setPeriod] = useState('days');

  // Filtres pour le tableau
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPayments, setTotalPayments] = useState(0);

  useEffect(() => {
    loadZones();
    loadStats();
    loadPaymentHistory();
  }, []);

  useEffect(() => {
    loadStats();
  }, [year, month, period]);

  useEffect(() => {
    loadPaymentHistory();
  }, [startDate, endDate, searchTerm, selectedZone, page, limit]);

  const loadZones = async () => {
    try {
      const response = await getWifiZones();
      setWifiZones(response.zones || []);
    } catch (error) {
      console.error('[Accounting] Erreur lors du chargement des zones:', error);
    }
  };

  const loadStats = async () => {
    setLoading(true);
    try {
      const [paymentData, ticketsData] = await Promise.all([
        getPaymentStats({ year, month, period }),
        getTicketsSoldStats({ month, period })
      ]);
      setPaymentStats(paymentData.stats || []);
      setTicketsStats(ticketsData.stats || []);
    } catch (error) {
      toast.error(error.message || 'Impossible de charger les statistiques');
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentHistory = async () => {
    setLoadingPayments(true);
    try {
      const params = {
        page,
        limit,
      };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (searchTerm) params.search = searchTerm;
      if (selectedZone) params.zoneId = selectedZone;

      const response = await getPaymentHistory(params);
      setPayments(response.payments || []);
      setTotalPayments(response.pagination?.total || 0);
    } catch (error) {
      toast.error(error.message || 'Impossible de charger l\'historique');
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (selectedZone) params.zoneId = selectedZone;

      await exportPaymentHistoryCSV(params);
      toast.success('Export CSV réussi !');
    } catch (error) {
      toast.error(error.message || 'Impossible d\'exporter les données');
    } finally {
      setExporting(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadPaymentHistory();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const months = [
    { value: 1, label: 'Janv.' },
    { value: 2, label: 'Fév.' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avr.' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juil.' },
    { value: 8, label: 'Août' },
    { value: 9, label: 'Sept.' },
    { value: 10, label: 'Oct.' },
    { value: 11, label: 'Nov.' },
    { value: 12, label: 'Déc.' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6 md:space-y-8 w-full">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary-700 dark:text-primary-500 tracking-tight">
          Bienvenue dans votre espace d'administration de Ticket Wifi Zone
        </h1>
        <nav className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          <span>Accueil</span>
          <span className="mx-2">/</span>
          <span>Gestion de comptabilité</span>
          <span className="mx-2">/</span>
          <span className="text-primary-600 dark:text-primary-400 font-medium">
            Historique des paiements
          </span>
        </nav>
      </div>

      {/* Graphique 1: Statistiques des paiements */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
              <TrendingUp className="text-primary-600 dark:text-primary-400" size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Statistiques des paiements
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Chiffre d'affaires</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="input text-sm py-2"
            >
              {years.map(y => (
                <option key={y} value={y}>Année : {y}</option>
              ))}
            </select>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="input text-sm py-2"
            >
              <option value="days">Par jours</option>
              <option value="weeks">Par semaines</option>
              <option value="months">Par mois</option>
            </select>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="input text-sm py-2"
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          </div>
        ) : paymentStats.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Aucune donnée disponible</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={paymentStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ value: 'Chiffre d\'affaires (XOF)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value) => [`${value.toLocaleString()} XOF`, 'Chiffre d\'affaires']}
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb' }}
              />
              <Bar dataKey="revenue" fill="#14b8a6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Graphique 2: Nombre de tickets vendus */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Ticket className="text-orange-600 dark:text-orange-400" size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Nombre de tickets vendus
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ventes réalisées</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="input text-sm py-2"
            >
              <option value="days">Affichage : Par Jours</option>
              <option value="weeks">Affichage : Par Semaines</option>
              <option value="months">Affichage : Par Mois</option>
            </select>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="input text-sm py-2"
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          </div>
        ) : ticketsStats.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Aucune donnée disponible</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ticketsStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ value: 'Tickets vendus', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value) => [value, 'Tickets vendus']}
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb' }}
              />
              <Bar dataKey="tickets_sold" fill="#f97316" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Section Mes Recettes */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Clock className="text-blue-600 dark:text-blue-400" size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Mes Recettes
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Historique des paiements</p>
            </div>
          </div>
        </div>

        {/* Filtres de date et export */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
            <div className="flex items-center space-x-2">
              <Calendar size={18} className="text-gray-400" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Du</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input text-sm py-2"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Calendar size={18} className="text-gray-400" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Au</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input text-sm py-2"
              />
            </div>
            {wifiZones.length > 0 && (
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="input text-sm py-2"
              >
                <option value="">Toutes les zones</option>
                {wifiZones.map(zone => (
                  <option key={zone.id} value={zone.id}>{zone.name}</option>
                ))}
              </select>
            )}
          </div>
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="btn btn-primary flex items-center"
          >
            {exporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Export...
              </>
            ) : (
              <>
                <Download size={18} strokeWidth={2} className="mr-2" />
                Exporter en CSV
              </>
            )}
          </button>
        </div>

        {/* Recherche et pagination */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-2 flex-1 max-w-md">
            <Search size={18} className="text-gray-400" />
            <form onSubmit={handleSearch} className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher :"
                className="input text-sm py-2"
              />
            </form>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">Afficher</label>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(parseInt(e.target.value));
                setPage(1);
              }}
              className="input text-sm py-2"
            >
              <option value={10}>10 entrées</option>
              <option value={25}>25 entrées</option>
              <option value={50}>50 entrées</option>
              <option value={100}>100 entrées</option>
            </select>
          </div>
        </div>

        {/* Tableau */}
        {loadingPayments ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Aucun paiement trouvé</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      WIFIZONE
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      TARIF
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      REVENU
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      COMMISSION
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      RÉFÉRENCE DE PAIEMENT
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      DATE/HEURE
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      RÉSEAU
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      NUMÉRO
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      TICK
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {payment.zone_name || 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {payment.pricing_amount ? `${parseFloat(payment.pricing_amount).toLocaleString()} XOF` : `${parseFloat(payment.amount).toLocaleString()} XOF`}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                        {payment.revenue ? `${parseFloat(payment.revenue).toFixed(2)} XOF` : 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {payment.commission_rate ? `${payment.commission_rate.toFixed(0)} %` : 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {payment.moneroo_payment_id || 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(payment.completed_at || payment.created_at)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {payment.network || 'MTN MoMo Benin'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {payment.phone || 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {payment.ticket && (
                          <button
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            title={`Username: ${payment.ticket.username}, Password: ${payment.ticket.password}`}
                          >
                            <Eye size={18} strokeWidth={2} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-0">
                Affichage de {(page - 1) * limit + 1} à {Math.min(page * limit, totalPayments)} sur {totalPayments} entrées
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn btn-secondary text-sm py-1 px-3 disabled:opacity-50"
                >
                  Précédent
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {page} sur {Math.ceil(totalPayments / limit) || 1}
                </span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= Math.ceil(totalPayments / limit)}
                  className="btn btn-secondary text-sm py-1 px-3 disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
