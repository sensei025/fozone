import { Wifi } from 'lucide-react';

/**
 * Composant Logo FÔ-ZÔNE
 * Affiche le logo avec les icônes wifi intégrées dans les Ô
 */
export default function Logo({ className = '', size = 'md' }) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-1 font-bold tracking-tight ${sizeClasses[size]} ${className}`}>
      {/* F */}
      <span className="text-blue-900 dark:text-blue-100">F</span>
      
      {/* Premier Ô avec wifi (jaune/orange) */}
      <div className="relative inline-flex items-center justify-center">
        <span className="text-amber-500 dark:text-amber-400">Ô</span>
        <div className="absolute -top-1 left-1/2 -translate-x-1/2">
          <Wifi size={size === 'sm' ? 10 : size === 'lg' ? 14 : size === 'xl' ? 16 : 12} className="text-amber-500 dark:text-amber-400" strokeWidth={2.5} />
        </div>
      </div>
      
      {/* Trait d'union */}
      <span className="text-blue-900 dark:text-blue-100">-</span>
      
      {/* Z */}
      <span className="text-blue-900 dark:text-blue-100">Z</span>
      
      {/* Deuxième Ô avec wifi (bleu foncé) */}
      <div className="relative inline-flex items-center justify-center">
        <span className="text-blue-900 dark:text-blue-100">Ô</span>
        <div className="absolute -top-1 left-1/2 -translate-x-1/2">
          <Wifi size={size === 'sm' ? 10 : size === 'lg' ? 14 : size === 'xl' ? 16 : 12} className="text-blue-900 dark:text-blue-100" strokeWidth={2.5} />
        </div>
      </div>
      
      {/* N */}
      <span className="text-blue-900 dark:text-blue-100">N</span>
      
      {/* E */}
      <span className="text-blue-900 dark:text-blue-100">E</span>
    </div>
  );
}

