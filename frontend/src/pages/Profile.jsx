import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { User, Edit3, Lock, Shield, Save, X, Eye, EyeOff } from 'lucide-react';
import { getProfile, updateProfile, changePassword } from '../services/profile';
import { getCurrentUser } from '../services/auth';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Profile() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // État pour l'édition du profil
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    phone: ''
  });

  // État pour le changement de mot de passe
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    loadProfile();
    setCurrentUser(getCurrentUser());
  }, []);

  // Détecter l'onglet depuis l'URL
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && ['overview', 'edit', 'password', 'security'].includes(hash)) {
      setActiveTab(hash);
    }
  }, [location]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      setUser(response.user);
      setEditForm({
        full_name: response.user.full_name || '',
        email: response.user.email || '',
        phone: response.user.phone || ''
      });
    } catch (error) {
      // Logger les détails techniques uniquement en console
      console.error('[Profile] Erreur lors du chargement:', error);
      // Message user-friendly
      toast.error(error.message || 'Impossible de charger votre profil');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await updateProfile(editForm);
      setUser(response.user);
      setCurrentUser({ ...currentUser, ...response.user });
      localStorage.setItem('user', JSON.stringify(response.user));
      toast.success('Profil mis à jour avec succès !');
      setActiveTab('overview');
    } catch (error) {
      // Logger les détails techniques uniquement en console
      console.error('[Profile] Erreur lors de la mise à jour:', error);
      // Message user-friendly
      toast.error(error.message || 'Impossible de mettre à jour votre profil');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordForm.new_password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      setSaving(true);
      await changePassword(passwordForm.current_password, passwordForm.new_password);
      toast.success('Mot de passe modifié avec succès !');
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setActiveTab('overview');
    } catch (error) {
      // Logger les détails techniques uniquement en console
      console.error('[Profile] Erreur lors du changement de mot de passe:', error);
      // Message user-friendly
      toast.error(error.message || 'Impossible de modifier le mot de passe');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const tabs = [
    { id: 'overview', label: 'Aperçu', icon: User },
    { id: 'edit', label: 'Éditer le Profil', icon: Edit3 },
    { id: 'password', label: 'Changer le Mot de Passe', icon: Lock },
    { id: 'security', label: 'Sécurité 2FA', icon: Shield }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 w-full">
      {/* En-tête */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
          Mon Profil
        </h1>
        <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 font-medium">
          Gérez vos informations personnelles et vos paramètres de sécurité
        </p>
      </div>

      {/* Carte de profil utilisateur */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8 hover-lift hover-glow">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-2xl md:text-3xl font-bold shadow-lg">
              {getInitials(user?.full_name || user?.email || 'U')}
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 md:w-8 md:h-8 bg-green-500 rounded-full border-4 border-white dark:border-gray-800"></div>
          </div>

          {/* Informations */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {user?.full_name || user?.email || 'Utilisateur'}
            </h2>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mb-4">
              Profil utilisateur
            </p>
            {user?.role && (
              <span className="inline-block px-3 py-1 text-xs md:text-sm font-semibold text-primary-700 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/20 rounded-full">
                {user.role === 'admin' ? 'Administrateur' : user.role}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover-glow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex overflow-x-auto -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 md:px-6 py-4 text-sm md:text-base font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon size={18} strokeWidth={2} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="p-6 md:p-8">
          {/* Onglet Aperçu */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Détails du Profil
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom
                  </label>
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                    {user?.full_name?.split(' ')[0] || 'Non renseigné'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prénom
                  </label>
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                    {user?.full_name?.split(' ').slice(1).join(' ') || 'Non renseigné'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                    {user?.email || 'Non renseigné'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Téléphone
                  </label>
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                    {user?.phone || 'Non renseigné'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rôle
                  </label>
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                    {user?.role === 'admin' ? 'Administrateur' : user?.role || 'Non renseigné'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date de création
                  </label>
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                    {user?.created_at
                      ? format(new Date(user.created_at), 'dd MMMM yyyy', { locale: fr })
                      : 'Non renseigné'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Éditer le Profil */}
          {activeTab === 'edit' && (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Modifier vos informations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    className="input w-full"
                    placeholder="Votre nom complet"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="input w-full"
                    placeholder="votre@email.com"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Numéro de téléphone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="input w-full"
                    placeholder="+229 XX XX XX XX"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary inline-flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save size={18} strokeWidth={2} />
                      Enregistrer les modifications
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditForm({
                      full_name: user?.full_name || '',
                      email: user?.email || '',
                      phone: user?.phone || ''
                    });
                    setActiveTab('overview');
                  }}
                  className="btn btn-secondary inline-flex items-center gap-2"
                >
                  <X size={18} strokeWidth={2} />
                  Annuler
                </button>
              </div>
            </form>
          )}

          {/* Onglet Changer le Mot de Passe */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-6">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Modifier votre mot de passe
              </h3>
              <div className="space-y-4 max-w-md">
                <div>
                  <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      id="current_password"
                      value={passwordForm.current_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                      className="input w-full pr-10"
                      placeholder="Entrez votre mot de passe actuel"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      id="new_password"
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                      className="input w-full pr-10"
                      placeholder="Entrez votre nouveau mot de passe"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Le mot de passe doit contenir au moins 6 caractères
                  </p>
                </div>
                <div>
                  <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirmer le nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      id="confirm_password"
                      value={passwordForm.confirm_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                      className="input w-full pr-10"
                      placeholder="Confirmez votre nouveau mot de passe"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary inline-flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Modification...
                    </>
                  ) : (
                    <>
                      <Save size={18} strokeWidth={2} />
                      Modifier le mot de passe
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPasswordForm({
                      current_password: '',
                      new_password: '',
                      confirm_password: ''
                    });
                    setActiveTab('overview');
                  }}
                  className="btn btn-secondary inline-flex items-center gap-2"
                >
                  <X size={18} strokeWidth={2} />
                  Annuler
                </button>
              </div>
            </form>
          )}

          {/* Onglet Sécurité 2FA */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Authentification à deux facteurs (2FA)
              </h3>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <Shield className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" size={24} strokeWidth={2} />
                  <div>
                    <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      Sécurité renforcée
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
                      L'authentification à deux facteurs ajoute une couche supplémentaire de sécurité à votre compte.
                      Cette fonctionnalité sera disponible prochainement.
                    </p>
                    <button
                      disabled
                      className="btn btn-secondary opacity-50 cursor-not-allowed"
                    >
                      Activer la 2FA (Bientôt disponible)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

