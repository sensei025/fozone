import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Wifi, Copy, RefreshCw } from 'lucide-react';
import { getPaymentStatus } from '../services/payments';
import toast from 'react-hot-toast';

export default function PaymentReturn() {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('paymentId');
  const paymentStatus = searchParams.get('paymentStatus');
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (paymentId) {
      loadPaymentStatus();
    } else {
      setLoading(false);
    }
  }, [paymentId]);

  const loadPaymentStatus = async () => {
    try {
      const response = await getPaymentStatus(paymentId);
      setPayment(response.payment);
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la récupération du paiement');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setChecking(true);
    await loadPaymentStatus();
    setChecking(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copié dans le presse-papiers');
  };

  const formatCredentials = () => {
    // Les tickets peuvent être un tableau ou un objet selon la structure Supabase
    if (payment?.tickets) {
      const tickets = Array.isArray(payment.tickets) ? payment.tickets : [payment.tickets];
      if (tickets.length > 0 && tickets[0].username && tickets[0].password) {
        return {
          username: tickets[0].username,
          password: tickets[0].password,
        };
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const credentials = formatCredentials();
  const isSuccess = paymentStatus === 'success' && payment?.status === 'completed' && credentials;
  const isPending = payment?.status === 'pending';
  const isFailed = paymentStatus === 'failed' || payment?.status === 'failed';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center mb-4">
              <Wifi className="text-primary-600 dark:text-primary-400" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              Ticket WiFi Zone
            </h1>
          </div>

          {/* Statut du paiement */}
          {isSuccess && (
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                <CheckCircle className="text-green-600 dark:text-green-400" size={32} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Paiement réussi !
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Votre ticket a été activé avec succès.
              </p>
            </div>
          )}

          {isPending && (
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full mb-4">
                <RefreshCw className="text-yellow-600 dark:text-yellow-400 animate-spin" size={32} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Paiement en cours de traitement
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Veuillez patienter, nous vérifions votre paiement...
              </p>
              <button
                onClick={handleRefresh}
                disabled={checking}
                className="btn btn-secondary"
              >
                {checking ? 'Vérification...' : 'Actualiser'}
              </button>
            </div>
          )}

          {isFailed && (
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
                <XCircle className="text-red-600 dark:text-red-400" size={32} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Paiement échoué
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Votre paiement n'a pas pu être traité. Veuillez réessayer.
              </p>
            </div>
          )}

          {/* Identifiants WiFi */}
          {isSuccess && credentials && (
            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom d'utilisateur
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={credentials.username}
                    readOnly
                    className="input flex-1 bg-white dark:bg-gray-800"
                  />
                  <button
                    onClick={() => copyToClipboard(credentials.username)}
                    className="p-2 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Copier"
                  >
                    <Copy size={20} />
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mot de passe
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={credentials.password}
                    readOnly
                    className="input flex-1 bg-white dark:bg-gray-800"
                  />
                  <button
                    onClick={() => copyToClipboard(credentials.password)}
                    className="p-2 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Copier"
                  >
                    <Copy size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bouton de connexion */}
          {isSuccess && credentials && (
            <div className="space-y-3">
              <button
                onClick={() => {
                  // Copier les identifiants et afficher un message
                  const text = `Username: ${credentials.username}\nPassword: ${credentials.password}`;
                  copyToClipboard(text);
                  toast.success('Identifiants copiés ! Utilisez-les pour vous connecter au WiFi');
                }}
                className="btn btn-primary w-full flex items-center justify-center"
              >
                <Wifi size={20} className="mr-2" />
                Se connecter au WiFi
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Utilisez ces identifiants pour vous connecter au réseau WiFi
              </p>
            </div>
          )}

          {/* Informations du paiement */}
          {payment && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p>
                  <span className="font-medium">Montant:</span> {payment.amount} XOF
                </p>
                <p>
                  <span className="font-medium">Statut:</span>{' '}
                  <span className={payment.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}>
                    {payment.status === 'completed' ? 'Complété' : 'En attente'}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

