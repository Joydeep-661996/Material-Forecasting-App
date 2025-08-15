
import React from 'react';
import { Supplier, Language, TranslationSet } from '../types';
import { PhoneIcon, MapPinIcon, StarIcon } from './icons';

interface SupplierListProps {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;
  lang: Language;
  translations: TranslationSet;
}

const SupplierSkeleton: React.FC = () => (
  <div className="animate-pulse flex space-x-4 p-4 border-b border-slate-200 dark:border-slate-700">
    <div className="flex-1 space-y-3 py-1">
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
    </div>
    <div className="flex flex-col items-end justify-between w-1/4">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mt-2"></div>
    </div>
  </div>
);

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className="flex items-center">
            {[...Array(fullStars)].map((_, i) => (
                <StarIcon key={`full-${i}`} className="w-4 h-4 text-amber-400" />
            ))}
            {/* Note: Simplified to only show full stars for brevity */}
            {[...Array(emptyStars)].map((_, i) => (
                 <StarIcon key={`empty-${i}`} className="w-4 h-4 text-slate-300 dark:text-slate-600" />
            ))}
             <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">({rating.toFixed(1)})</span>
        </div>
    )
}

export const SupplierList: React.FC<SupplierListProps> = ({ suppliers, loading, error, lang, translations }) => {
  if (loading) {
    return (
      <div className="mt-6 border-t border-slate-200 dark:border-slate-700">
        {[...Array(3)].map((_, i) => <SupplierSkeleton key={i} />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 pt-4 text-center text-red-600 dark:text-red-400 border-t border-slate-200 dark:border-slate-700">
        <p><strong>{translations.errorTitle as string}:</strong> {error}</p>
      </div>
    );
  }

  if (suppliers.length === 0) {
    return (
         <div className="mt-6 pt-6 text-center text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700">
            <p>{translations.noSuppliersFound as string}</p>
        </div>
    )
  }

  return (
    <div className="mt-6 border-t border-slate-200 dark:border-slate-700">
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {suppliers.map((supplier, index) => (
                <div key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-4">
                    <div className="flex-1">
                        <h4 className="font-bold text-md text-slate-900 dark:text-white">{supplier.name}</h4>
                        <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mt-1">
                            <MapPinIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span>{supplier.address}</span>
                        </div>
                         <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mt-1">
                            <PhoneIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span>{supplier.phone}</span>
                        </div>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-start sm:items-end w-full sm:w-auto">
                        <p className="text-xl font-bold text-sky-600 dark:text-sky-400">
                            ₹{supplier.price.toLocaleString('en-IN')}
                        </p>
                        <StarRating rating={supplier.rating} />
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};
