import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db } from '../firebaseConfig';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface AppDoc {
    id: string;
    name: string;
    name_en?: string;
    desc: string;
    authorUid: string;
    status: string;
    createdAt: any;
    executionType: string;
    contentInfo: string;
    tag?: string;
}

export default function AdminDashboard({ user }: { user: User | null }) {
    const navigate = useNavigate();
    const [apps, setApps] = useState<AppDoc[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const isAdmin = user !== null; // 임시: 로그인한 모든 테스트 유저 허용

    useEffect(() => {
        if (!user) return; // wait for auth init
        
        if (!isAdmin) {
            alert('관리자 권한이 필요합니다.');
            navigate('/');
            return;
        }

        fetchApps();
    }, [user, isAdmin, navigate]);

    const fetchApps = async () => {
        if (!db) return;
        setIsLoading(true);
        try {
            const q = query(collection(db, 'apps'));
            const snap = await getDocs(q);
            const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() })) as AppDoc[];
            // Sort to show pending first, then by newest
            fetched.sort((a, b) => {
                if (a.status === 'pending' && b.status !== 'pending') return -1;
                if (a.status !== 'pending' && b.status === 'pending') return 1;
                return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
            });
            setApps(fetched);
        } catch (error) {
            console.error("Error fetching apps:", error);
            alert("앱 목록을 불러오는 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (id: string, name: string) => {
        if (!db || !window.confirm(`'${name}' 앱을 승인하시겠습니까? 메인 화면에 즉시 표시됩니다.`)) return;
        try {
            await updateDoc(doc(db, 'apps', id), { status: 'approved' });
            setApps(apps.map(app => app.id === id ? { ...app, status: 'approved' } : app));
        } catch (error) {
            console.error(error);
            alert("승인 처리 중 오류 발생");
        }
    };

    const handleReject = async (id: string, name: string) => {
        if (!db || !window.confirm(`'${name}' 앱을 거절 및 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return;
        try {
            await deleteDoc(doc(db, 'apps', id));
            setApps(apps.filter(app => app.id !== id));
        } catch (error) {
            console.error(error);
            alert("삭제 처리 중 오류 발생");
        }
    };

    if (!user || isLoading) {
        return <div style={styles.loading}>데이터를 불러오는 중... (관리자 확인 중)</div>;
    }

    const pendingApps = apps.filter(a => a.status === 'pending');
    const approvedApps = apps.filter(a => a.status === 'approved');

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>🛡️ 관리자 대시보드 - 앱 심사소</h2>
                <div style={styles.stats}>
                    <span style={styles.statBadge}>대기 중: {pendingApps.length}건</span>
                    <span style={styles.statBadge}>활성 앱: {approvedApps.length}개</span>
                </div>
            </div>

            <div style={styles.listContainer}>
                {apps.length === 0 ? (
                    <div style={styles.empty}>등록된 앱이 없습니다.</div>
                ) : (
                    apps.map(app => (
                        <div key={app.id} style={{...styles.card, opacity: app.status === 'pending' ? 1 : 0.7}}>
                            <div style={styles.cardHeader}>
                                <div>
                                    <h3 style={styles.appName}>
                                        {app.name} <span style={styles.tag}>{app.tag}</span>
                                    </h3>
                                    <p style={styles.appDesc}>{app.desc}</p>
                                    <p style={styles.appInfo}>
                                        <b>방식:</b> {app.executionType === 'link' ? '외부 링크' : 'HTML 소스'} | 
                                        <b> 대상(EN):</b> {app.name_en || 'N/A'} | 
                                        <b> 작성자 UID:</b> {app.authorUid.substring(0,6)}...
                                    </p>
                                    <p style={styles.sourceBox}>
                                        {app.contentInfo}
                                    </p>
                                </div>
                                <div style={styles.statusBox}>
                                    {app.status === 'pending' ? (
                                        <span style={styles.pendingBadge}><Clock size={14} /> 대기 중</span>
                                    ) : (
                                        <span style={styles.approvedBadge}><CheckCircle size={14} /> 승인됨</span>
                                    )}
                                </div>
                            </div>
                            
                            <div style={styles.actions}>
                                {app.status === 'pending' && (
                                    <button style={styles.approveBtn} onClick={() => handleApprove(app.id, app.name)}>
                                        <CheckCircle size={16} /> 앱 승인/출시
                                    </button>
                                )}
                                <button style={styles.rejectBtn} onClick={() => handleReject(app.id, app.name)}>
                                    <XCircle size={16} /> 삭제 (반려)
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        padding: '40px',
        maxWidth: '1000px',
        margin: '0 auto',
        fontFamily: 'var(--font-pretendard)',
        minHeight: 'calc(100vh - 80px)'
    },
    loading: {
        padding: '100px',
        textAlign: 'center',
        fontSize: '18px',
        color: '#666'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '2px solid rgba(0,0,0,0.05)'
    },
    title: {
        fontSize: '28px',
        fontWeight: 800,
        color: '#111'
    },
    stats: {
        display: 'flex',
        gap: '12px'
    },
    statBadge: {
        background: '#e3f2fd',
        color: '#1565c0',
        padding: '8px 16px',
        borderRadius: '20px',
        fontWeight: 700,
        fontSize: '14px'
    },
    empty: {
        padding: '40px',
        textAlign: 'center',
        color: '#888',
        background: '#fff',
        borderRadius: '16px'
    },
    listContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    card: {
        background: '#fff',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        border: '1px solid #eee',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    appName: {
        fontSize: '20px',
        fontWeight: 700,
        marginBottom: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    tag: {
        fontSize: '13px',
        background: '#f1f3f4',
        padding: '4px 8px',
        borderRadius: '6px',
        fontWeight: 600,
        color: '#555'
    },
    appDesc: {
        fontSize: '15px',
        color: '#444',
        marginBottom: '12px',
        lineHeight: 1.5
    },
    appInfo: {
        fontSize: '12px',
        color: '#888',
        marginBottom: '12px'
    },
    sourceBox: {
        background: '#f8f9fa',
        padding: '12px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#333',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        maxHeight: '60px'
    },
    pendingBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: '#fff3e0',
        color: '#e65100',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: 700
    },
    approvedBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: '#e8f5e9',
        color: '#2e7d32',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: 700
    },
    actions: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end',
        borderTop: '1px solid #f1f3f4',
        paddingTop: '20px'
    },
    approveBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: '#2e7d32',
        color: '#fff',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '8px',
        fontWeight: 600,
        cursor: 'pointer'
    },
    rejectBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: '#fff',
        color: '#d32f2f',
        border: '1px solid #ef9a9a',
        padding: '10px 20px',
        borderRadius: '8px',
        fontWeight: 600,
        cursor: 'pointer'
    }
};
