import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface AppUploadProps {
    user: User | null;
}

export default function AppUpload({ user }: AppUploadProps) {
    const navigate = useNavigate();
    
    const [titleKo, setTitleKo] = useState('');
    const [titleEn, setTitleEn] = useState('');
    const [activeLang, setActiveLang] = useState<'ko' | 'en'>('ko');
    const [desc, setDesc] = useState('');
    const [category, setCategory] = useState('유틸리티');
    // We will save fake thumbnail data for now since actual storage setup wasn't requested yet
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [execType, setExecType] = useState<'link' | 'html'>('link');
    const [execContent, setExecContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!user) {
            alert('앱을 등록하려면 먼저 구글 로그인이 필요합니다.');
            return;
        }
        
        if (!titleKo || !desc || !execContent) {
            alert('필수 입력 항목을 모두 채워주세요.');
            return;
        }

        setIsSubmitting(true);
        try {
            if (!db) throw new Error("Firebase DB가 연결되지 않았습니다. API 키를 확인하세요.");
            
            // Thumbnail logging (for now, until storage logic is requested)
            if (thumbnail) console.log("Thumbnail selected:", thumbnail.name);
            
            // 4. DB에 저장될 때 'status: pending(심사 대기 중)' 필드 추가
            await addDoc(collection(db, 'apps'), {
                name: titleKo,
                name_en: titleEn,
                desc: desc,
                tag: `#${category}`,
                executionType: execType,
                contentInfo: execContent,
                authorUid: user.uid,
                language: 'ko',
                status: 'pending', // 심사 대기 상태
                createdAt: serverTimestamp(),
                viewCount: 0
            });
            
            alert('성공적으로 제출되었습니다! 현재 심사 대기 중입니다.');
            navigate('/');
        } catch (error: any) {
            console.error('Upload Error:', error);
            alert(`등록 중 오류가 발생했습니다: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.formWrapper}>
                <h2 style={styles.pageTitle}>새로운 앱 등록하기</h2>
                <p style={styles.pageSubtitle}>직관적이고 유용한 앱을 커뮤니티와 공유하세요.</p>
                
                {/* 2. 깔끔한 블로그 글쓰기 형태(일반 UI) 입력 폼 */}
                <form onSubmit={handleSubmit} style={styles.form}>
                    
                    {/* 앱 제목 (한국어/영어 탭 분리) */}
                    <div style={styles.formGroup}>
                        <div style={styles.tabHeader}>
                            <button 
                                type="button" 
                                style={activeLang === 'ko' ? styles.tabActive : styles.tab} 
                                onClick={() => setActiveLang('ko')}
                            >한국어 제목</button>
                            <button 
                                type="button" 
                                style={activeLang === 'en' ? styles.tabActive : styles.tab} 
                                onClick={() => setActiveLang('en')}
                            >영어 제목</button>
                        </div>
                        {activeLang === 'ko' ? (
                            <input 
                                style={styles.inputLarge} 
                                placeholder="예: 점심 룰렛 (한국어 제목)" 
                                value={titleKo} 
                                onChange={e => setTitleKo(e.target.value)} 
                                required 
                            />
                        ) : (
                            <input 
                                style={styles.inputLarge} 
                                placeholder="Ex: Lunch Roulette (English Title)" 
                                value={titleEn} 
                                onChange={e => setTitleEn(e.target.value)} 
                            />
                        )}
                    </div>
                    
                    {/* 짧은 설명 / 타겟 유저 */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>짧은 설명 (타겟 유저 설명)</label>
                        <textarea 
                            style={styles.textarea} 
                            placeholder="직장인들이 점심 메뉴를 고를 때 유용한 룰렛입니다." 
                            value={desc} 
                            onChange={e => setDesc(e.target.value)} 
                            required 
                        />
                    </div>
                    
                    <div style={styles.row}>
                        {/* 카테고리 드롭다운 */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>카테고리</label>
                            <select style={styles.select} value={category} onChange={e => setCategory(e.target.value)}>
                                <option value="게임">게임</option>
                                <option value="유틸리티">유틸리티</option>
                                <option value="직장인">직장인</option>
                                <option value="학생">학생</option>
                            </select>
                        </div>
                        
                        {/* 앱 썸네일 이미지 업로드 */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>썸네일 이미지 파일 업로드</label>
                            <input 
                                type="file" 
                                style={styles.fileInput} 
                                accept="image/*" 
                                onChange={e => setThumbnail(e.target.files ? e.target.files[0] : null)} 
                            />
                        </div>
                    </div>
                    
                    {/* 실행 방식 선택 라디오 버튼 */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>앱 실행 방식</label>
                        <div style={styles.radioGroup}>
                            <label style={styles.radioLabel}>
                                <input 
                                    type="radio" 
                                    name="execType" 
                                    checked={execType === 'link'} 
                                    onChange={() => setExecType('link')} 
                                /> 외부 링크 입력 (새 탭)
                            </label>
                            <label style={styles.radioLabel}>
                                <input 
                                    type="radio" 
                                    name="execType" 
                                    checked={execType === 'html'} 
                                    onChange={() => setExecType('html')} 
                                /> HTML 소스코드 직접 입력 (팝업 실행)
                            </label>
                        </div>
                        
                        {execType === 'link' ? (
                            <input 
                                style={styles.input} 
                                placeholder="https://example.com/my-tool" 
                                value={execContent} 
                                onChange={e => setExecContent(e.target.value)} 
                                required 
                            />
                        ) : (
                            <textarea 
                                style={{...styles.textarea, height: '200px', fontFamily: 'monospace'}} 
                                placeholder="<!DOCTYPE html><html>...</html>" 
                                value={execContent} 
                                onChange={e => setExecContent(e.target.value)} 
                                required 
                            />
                        )}
                    </div>
                    
                    {/* 제출 버튼 */}
                    <div style={styles.submitRow}>
                        <button type="button" style={styles.cancelBtn} onClick={() => navigate('/')}>취소</button>
                        <button type="submit" style={styles.submitBtn} disabled={isSubmitting}>
                            {isSubmitting ? '요청 처리 중...' : '앱 심사 제출하기'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        width: '100%',
        height: 'calc(100vh - 80px)', // adjust for nav header
        overflowY: 'auto' as const,
        backgroundColor: 'var(--bg-color)',
        display: 'flex',
        justifyContent: 'center',
        padding: '60px 20px',
    },
    formWrapper: {
        width: '100%',
        maxWidth: '740px',
        backgroundColor: '#fff',
        borderRadius: '24px',
        padding: '50px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
        border: '1px solid rgba(0,0,0,0.05)',
        alignSelf: 'flex-start'
    },
    pageTitle: {
        fontSize: '32px',
        fontWeight: 800,
        color: 'var(--text-main)',
        marginBottom: '8px',
        letterSpacing: '-1px'
    },
    pageSubtitle: {
        fontSize: '15px',
        color: 'var(--text-sub)',
        marginBottom: '40px'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '30px'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        flex: 1
    },
    row: {
        display: 'flex',
        gap: '24px'
    },
    label: {
        fontSize: '14px',
        fontWeight: 600,
        color: 'var(--text-main)'
    },
    tabHeader: {
        display: 'flex',
        gap: '12px',
        borderBottom: '2px solid #f1f3f4',
        marginBottom: '8px'
    },
    tab: {
        background: 'none',
        border: 'none',
        padding: '8px 4px',
        fontSize: '15px',
        fontWeight: 600,
        color: 'var(--text-sub)',
        cursor: 'pointer',
        borderBottom: '2px solid transparent',
        transition: 'color 0.2s ease'
    },
    tabActive: {
        background: 'none',
        border: 'none',
        padding: '8px 4px',
        fontSize: '15px',
        fontWeight: 700,
        color: 'var(--primary)',
        cursor: 'pointer',
        borderBottom: '2px solid var(--primary)',
    },
    inputLarge: {
        fontSize: '28px',
        fontWeight: 800,
        border: 'none',
        borderBottom: '1px dashed #dadddf',
        padding: '12px 0',
        color: 'var(--text-main)',
        outline: 'none',
        background: 'transparent',
    },
    input: {
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid #dadddf',
        fontSize: '15px',
        outline: 'none',
        transition: 'border-color 0.2s',
        width: '100%',
        backgroundColor: '#f8fafd'
    },
    textarea: {
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid #dadddf',
        fontSize: '15px',
        outline: 'none',
        minHeight: '120px',
        resize: 'vertical',
        width: '100%',
        fontFamily: 'inherit',
        lineHeight: 1.5,
        backgroundColor: '#f8fafd'
    },
    select: {
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid #dadddf',
        fontSize: '15px',
        outline: 'none',
        background: '#f8fafd',
        width: '100%',
        cursor: 'pointer'
    },
    fileInput: {
        padding: '12px 0',
        fontSize: '14px',
        color: 'var(--text-sub)'
    },
    radioGroup: {
        display: 'flex',
        gap: '24px',
        padding: '10px 0'
    },
    radioLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '15px',
        color: 'var(--text-main)',
        cursor: 'pointer',
        fontWeight: 500
    },
    submitRow: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        marginTop: '30px',
        borderTop: '1px solid #f1f3f4',
        paddingTop: '20px'
    },
    cancelBtn: {
        padding: '14px 28px',
        borderRadius: '30px',
        border: '1px solid #dadddf',
        background: '#fff',
        color: 'var(--text-sub)',
        fontSize: '15px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'background 0.2s ease'
    },
    submitBtn: {
        padding: '14px 36px',
        borderRadius: '30px',
        border: 'none',
        background: 'linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)',
        color: '#fff',
        fontSize: '15px',
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: '0 4px 14px rgba(26,115,232,0.3)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    }
};
