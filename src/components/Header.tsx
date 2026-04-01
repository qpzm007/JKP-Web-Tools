import { LayoutGrid, Rocket, LogIn, Plus, Globe } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { User } from 'firebase/auth';
import { signInWithGoogle, logout } from '../firebaseConfig';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
    isGravityView: boolean;
    onToggle: () => void;
    user: User | null;
}

export default function Header({ isGravityView, onToggle, user }: HeaderProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const isUploadPage = location.pathname === '/upload';
    const { t, i18n } = useTranslation();

    const toggleLang = () => {
        const nextLang = i18n.language.startsWith('ko') ? 'en' : 'ko';
        i18n.changeLanguage(nextLang);
    };

    const isAdmin = user !== null; // 임시: 로그인한 모든 테스트 유저 허용

    return (
        <header className="bg-white px-4 py-3 flex justify-between items-center shadow-sm z-40 relative">
            <div 
                className="flex items-center gap-2 cursor-pointer" 
                onClick={() => navigate('/')}
            >
                <div className="bg-indigo-600 text-white font-bold rounded p-1.5 text-sm flex items-center justify-center">
                    <Rocket size={16} />
                </div>
                <h1 className="font-bold text-lg tracking-tight text-slate-800">{t('JKP Web Tools')}</h1>
            </div>
            
            <div className="flex items-center gap-3">
                <button 
                    className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95 transition-all outline-none flex items-center justify-center" 
                    onClick={onToggle}
                    title={isGravityView ? t('리스트 뷰로 보기') : t('블럭 뷰로 보기')}
                >
                    {isGravityView ? <LayoutGrid size={22} /> : <i className="ph ph-squares-four text-[22px]" />}
                </button>
                
                <button 
                    className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95 transition-all outline-none flex items-center justify-center" 
                    onClick={toggleLang}
                    title="Change Language"
                >
                    <Globe size={20} />
                </button>
            
                {!isUploadPage && (
                    <button 
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 font-medium text-xs sm:text-sm hover:bg-indigo-100 transition-colors"
                        onClick={() => navigate('/upload')}
                    >
                        <Plus size={14} /> <span className="hidden sm:inline">{t('앱 등록')}</span>
                    </button>
                )}
                
                {isAdmin && (
                    <button 
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 font-bold text-xs sm:text-sm border border-amber-200"
                        onClick={() => navigate('/admin')}
                    >
                        👑 <span className="hidden sm:inline">관리자</span>
                    </button>
                )}
                
                {user ? (
                    <button 
                        className="w-9 h-9 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center" 
                        onClick={logout}
                        title={t('로그아웃')}
                    >
                        {user.photoURL ? (
                            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <i className="ph-fill ph-user text-slate-400 mt-1 text-xl"></i>
                        )}
                    </button>
                ) : (
                    <button 
                        className="flex items-center gap-1 sm:gap-2 bg-slate-800 text-white px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-md active:scale-95 transition-transform" 
                        onClick={signInWithGoogle}
                    >
                        <LogIn size={14} /> <span>{t('로그인')}</span>
                    </button>
                )}
            </div>
        </header>
    );
}


