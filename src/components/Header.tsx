import React from 'react';
import { LayoutGrid, Sparkles, Rocket, LogOut, LogIn, Plus, Globe } from 'lucide-react';
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
        <header style={styles.header}>
            <div 
                style={styles.logo} 
                onClick={() => navigate('/')}
            >
                <Rocket style={styles.logoIcon} size={28} />
                <h1 style={styles.h1}>{t('JKP Web Tools')}</h1>
            </div>
            
            <div style={styles.rightSection}>
                <button 
                    style={styles.iconBtn} 
                    onClick={toggleLang}
                    title="Change Language"
                >
                    <Globe size={18} />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>
                        {i18n.language.startsWith('ko') ? 'EN' : 'KO'}
                    </span>
                </button>
            
                {!isUploadPage && (
                    <button 
                        style={styles.toggleBtn} 
                        onClick={onToggle}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        {isGravityView ? (
                            <><LayoutGrid size={16} /> {t('리스트 뷰로 보기')}</>
                        ) : (
                            <><Sparkles size={16} /> {t('블럭 뷰로 보기')}</>
                        )}
                    </button>
                )}

                <button 
                    style={styles.uploadBtn} 
                    onClick={() => navigate('/upload')}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <Plus size={16} strokeWidth={3} /> {t('앱 등록하기')}
                </button>
                
                {isAdmin && (
                    <button 
                        style={styles.adminBtn} 
                        onClick={() => navigate('/admin')}
                    >
                        👑 관리자
                    </button>
                )}
                
                <div style={styles.divider} />

                {user ? (
                    <div style={styles.userProfile}>
                        <img src={user.photoURL || ''} alt="Profile" style={styles.avatar} />
                        <span style={styles.userName}>{user.displayName}</span>
                        <button 
                            style={styles.iconBtn} 
                            onClick={logout} 
                            title={t('로그아웃')}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#d32f2f'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-sub)'}
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                ) : (
                    <button 
                        style={styles.loginBtn} 
                        onClick={signInWithGoogle}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <LogIn size={16} /> {t('구글 로그인')}
                    </button>
                )}
            </div>
        </header>
    );
}

const styles: Record<string, React.CSSProperties> = {
    header: {
        position: 'relative' as const,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 40px',
        background: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.5)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)'
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer'
    },
    logoIcon: {
        color: '#1a73e8'
    },
    h1: {
        fontSize: '22px',
        fontWeight: 800,
        letterSpacing: '-0.5px',
        background: 'linear-gradient(90deg, #1a73e8, #9333ea)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        margin: 0
    },
    rightSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
    },
    divider: {
        width: '1px',
        height: '30px',
        background: 'rgba(0,0,0,0.1)'
    },
    toggleBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: '#fff',
        border: '1px solid #e0e0e0',
        padding: '10px 20px',
        borderRadius: '30px',
        fontSize: '14px',
        fontWeight: 600,
        color: 'var(--text-main)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    },
    uploadBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: '#fff',
        border: '2px solid #1a73e8',
        padding: '10px 20px',
        borderRadius: '30px',
        fontSize: '14px',
        fontWeight: 700,
        color: '#1a73e8',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 12px rgba(26,115,232,0.15)'
    },
    adminBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: '#fff3e0',
        color: '#e65100',
        border: '1px solid #ffcc80',
        padding: '10px 16px',
        borderRadius: '30px',
        fontSize: '13px',
        fontWeight: 800,
        cursor: 'pointer'
    },
    userProfile: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'rgba(255,255,255,0.7)',
        padding: '6px 16px 6px 6px',
        borderRadius: '40px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    },
    avatar: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        objectFit: 'cover' as const
    },
    userName: {
        fontSize: '14px',
        fontWeight: 600,
        color: 'var(--text-main)',
        whiteSpace: 'nowrap' as const
    },
    loginBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)',
        color: '#fff',
        border: 'none',
        padding: '10px 24px',
        borderRadius: '30px',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 12px rgba(26, 115, 232, 0.3)'
    },
    iconBtn: {
        background: 'transparent',
        border: 'none',
        color: 'var(--text-sub)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '6px 10px',
        borderRadius: '20px',
        transition: 'background 0.2s ease, color 0.2s ease'
    }
};
