import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/auth';
import toast from 'react-hot-toast';
import { Wifi, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Connexion réussie !');
      navigate('/dashboard');
    } catch (error) {
      console.error('[Login] Erreur:', error);
      toast.error(error.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg shadow-green-500/20">
              <Wifi className="text-white" size={36} strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex items-center justify-center mb-2">
            <Logo size="xl" className="text-gray-900 dark:text-white" />
          </div>
          <p className="text-base text-gray-600 dark:text-gray-400 font-medium">
            Connectez-vous à votre compte
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-green-100 dark:border-gray-700 p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2.5">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" strokeWidth={2} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input pl-12 h-12 text-base"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2.5">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" strokeWidth={2} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input pl-12 pr-12 h-12 text-base"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" strokeWidth={2} /> : <Eye className="h-5 w-5" strokeWidth={2} />}
                </button>
              </div>
            </div>

            {/* Mot de passe oublié */}
            <div className="flex items-center justify-end">
              <Link to="#" className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors">
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          {/* Lien d'inscription */}
          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Vous n'avez pas encore de compte ?{' '}
            <Link to="/register" className="font-semibold text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 underline transition-colors">
              Créez-en un
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
