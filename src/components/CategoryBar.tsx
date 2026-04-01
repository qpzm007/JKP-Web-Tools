interface CategoryBarProps {
    categories: string[];
    active: string;
    onSelect: (cat: string) => void;
}

export default function CategoryBar({ categories, active, onSelect }: CategoryBarProps) {
    const fullCategories = ['전체보기', ...categories];

    return (
        <div className="bg-white border-b border-slate-100 z-30 relative shadow-sm">
            <div className="flex gap-2 overflow-x-auto px-4 py-3 hide-scrollbar snap-x">
                {fullCategories.map(cat => (
                    <button 
                        key={cat}
                        onClick={() => onSelect(cat)}
                        className={`snap-start shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            active === cat 
                            ? 'bg-slate-800 text-white' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
    );
}
