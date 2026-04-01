import type { CSSProperties } from 'react';
import type { AppData } from '../App';

interface AppCardProps {
    app: AppData;
    style?: CSSProperties;
    onClick?: () => void;
}

export default function AppCard({ app, style, onClick }: AppCardProps) {
    let icon = '📄';
    let colorClass = 'bg-indigo-50 text-indigo-600';
    if (app.tag.includes('게임') || app.tag.includes('엔터테인먼트')) { icon = '🎮'; colorClass = 'bg-green-50 text-green-600'; }
    else if (app.tag.includes('학생')) { icon = '💯'; colorClass = 'bg-blue-50 text-blue-600'; }
    else if (app.tag.includes('직장인')) { icon = '💼'; colorClass = 'bg-orange-50 text-orange-600'; }
    else if (app.tag.includes('유틸리티') || app.tag.includes('생산성')) { icon = '⚙️'; colorClass = 'bg-slate-100 text-slate-600'; }

    return (
        <div 
            className="w-full h-full bg-white rounded-2xl p-4 flex flex-col justify-between border border-slate-100 shadow-card cursor-pointer pointer-events-auto hover:shadow-lg transition-shadow"
            style={style} 
            onClick={onClick}
        >
            <div>
                <div className="flex justify-between items-start mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${colorClass}`}>
                        {icon}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded-md whitespace-nowrap">{app.tag || '미분류'}</span>
                </div>
                <h3 className="font-bold text-slate-800 text-[15px] mb-1 truncate">{app.name}</h3>
                <p className="text-[12px] text-slate-500 line-clamp-2 leading-relaxed">{app.desc}</p>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-50 flex justify-between items-center text-indigo-600">
                <span className="text-xs font-semibold">실행하기</span>
                <i className="ph-bold ph-arrow-right"></i>
            </div>
        </div>
    );
}
