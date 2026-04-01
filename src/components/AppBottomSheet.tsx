import type { AppData } from '../App';

interface BottomSheetProps {
    app: AppData | null;
    onClose: () => void;
    onLaunch: (app: AppData) => void;
}

export default function AppBottomSheet({ app, onClose, onLaunch }: BottomSheetProps) {
    if (!app) return null;

    // Use a basic mapping for icons/colors dynamically
    let icon = '📄';
    let bgColor = 'bg-indigo-50';
    let textColor = 'text-indigo-600';

    // Extract emoji from the tag dynamically if exists
    const emojiMatch = (app.tag || '').match(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u);
    if (emojiMatch) {
        icon = emojiMatch[0];
    }
    
    // Assign generic colors based on tag string hash or hardcoded keywords
    if ((app.tag || '').includes('게임') || (app.tag || '').includes('엔터테인먼트')) { bgColor = 'bg-green-50'; textColor = 'text-green-600'; }
    else if ((app.tag || '').includes('학생')) { bgColor = 'bg-blue-50'; textColor = 'text-blue-600'; }
    else if ((app.tag || '').includes('직장인')) { bgColor = 'bg-orange-50'; textColor = 'text-orange-600'; }

    return (
        <>
            <div 
                className="fixed inset-0 bg-black/40 z-50 transition-opacity duration-300" 
                onClick={onClose} 
            />
            <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-6 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transform transition-transform duration-300">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
                
                <div className="flex gap-4 items-start mb-6">
                    <div className={`w-16 h-16 rounded-2xl ${bgColor} flex items-center justify-center text-3xl shadow-inner ${textColor}`}>
                        {icon}
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-primary mb-1">{app.tag || '미분류'}</div>
                        <h2 className="text-xl font-bold text-slate-800 mb-1">{app.name}</h2>
                        <p className="text-sm text-slate-500 leading-snug">{app.desc}</p>
                    </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700">라이센스 상태</span>
                        <span className="text-sm font-bold text-primary">Freemium (제한적 해제)</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full w-full"></div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">10개 이상의 다른 앱을 해제 시 JKP PRO 무제한 구독이 필요합니다.</p>
                </div>

                <button 
                    onClick={() => { onClose(); onLaunch(app); }} 
                    className="w-full bg-slate-800 text-white font-bold py-4 rounded-xl text-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                    <i className="ph-fill ph-play-circle text-xl"></i> 앱 실행하기
                </button>
            </div>
        </>
    );
}
