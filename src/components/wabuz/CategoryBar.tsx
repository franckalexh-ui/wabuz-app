'use client';

import { CATEGORIES } from '@/lib/data';
import { useAppStore } from '@/lib/store';

export function CategoryBar() {
  const { selectedCategory, setSelectedCategory } = useAppStore();

  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <div className="flex gap-3 px-4 py-3" style={{ minWidth: 'max-content' }}>
        <button
          onClick={() => setSelectedCategory(null)}
          className={`flex flex-col items-center gap-1.5 min-w-[68px] transition-all ${
            !selectedCategory ? 'scale-105' : ''
          }`}
        >
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all ${
              !selectedCategory
                ? 'bg-orange-500 shadow-lg shadow-orange-500/30 scale-105'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <span className={!selectedCategory ? '' : ''}>🔥</span>
          </div>
          <span
            className={`text-[11px] font-medium leading-tight ${
              !selectedCategory ? 'text-orange-600' : 'text-gray-500'
            }`}
          >
            Tout
          </span>
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
            className={`flex flex-col items-center gap-1.5 min-w-[68px] transition-all ${
              selectedCategory === cat.id ? 'scale-105' : ''
            }`}
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all ${
                selectedCategory === cat.id
                  ? 'bg-orange-500 shadow-lg shadow-orange-500/30 scale-105'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              {cat.icon}
            </div>
            <span
              className={`text-[11px] font-medium leading-tight ${
                selectedCategory === cat.id ? 'text-orange-600' : 'text-gray-500'
              }`}
            >
              {cat.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
