import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db } from '../firebaseConfig';
import { CheckCircle, Clock, Edit2, Trash2, Plus, Save, ArrowLeft, ArrowRight } from 'lucide-react';

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
    searchTags?: string[];
}

export default function AdminDashboard({ user }: { user: User | null }) {
    const navigate = useNavigate();
    const [apps, setApps] = useState<AppDoc[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Inline Edit State
    const [editingAppId, setEditingAppId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<AppDoc>>({});

    const isAdmin = user !== null;

    useEffect(() => {
        if (!user) return;
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
            const catDoc = await getDoc(doc(db, 'settings', 'app_categories'));
            if (catDoc.exists()) {
                setCategories(catDoc.data().list || []);
            } else {
                setCategories(['💼 직장인', '🎓 학생', '🛠 유틸리티', '🎮 게임']);
            }

            const snap = await getDocs(q);
            const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() })) as AppDoc[];
            fetched.sort((a, b) => {
                if (a.status === 'pending' && b.status !== 'pending') return -1;
                if (a.status !== 'pending' && b.status === 'pending') return 1;
                return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
            });
            setApps(fetched);
        } catch (error) {
            console.error(error);
            alert("앱 목록을 불러오는 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (id: string, name: string) => {
        if (!db || !window.confirm(`'${name}' 앱을 승인하시겠습니까?`)) return;
        try {
            await updateDoc(doc(db, 'apps', id), { status: 'approved' });
            setApps(apps.map(app => app.id === id ? { ...app, status: 'approved' } : app));
        } catch (error) {
            console.error(error);
            alert("승인 오류");
        }
    };

    const handleReject = async (id: string, name: string) => {
        if (!db || !window.confirm(`'${name}' 앱을 삭제하시겠습니까?`)) return;
        try {
            await deleteDoc(doc(db, 'apps', id));
            setApps(apps.filter(app => app.id !== id));
        } catch (error) {
            console.error(error);
            alert("삭제 오류");
        }
    };

    const startEdit = (app: AppDoc) => {
        setEditingAppId(app.id);
        setEditForm({ ...app });
    };

    const cancelEdit = () => {
        setEditingAppId(null);
        setEditForm({});
    };

    const saveEdit = async (id: string) => {
        if (!db) return;
        try {
            await updateDoc(doc(db, 'apps', id), {
                name: editForm.name,
                desc: editForm.desc,
                tag: editForm.tag,
                searchTags: editForm.searchTags,
                contentInfo: editForm.contentInfo
            });
            setApps(apps.map(a => a.id === id ? { ...a, ...editForm } : a));
            setEditingAppId(null);
            alert("저장되었습니다.");
        } catch (e) {
            console.error(e);
            alert("저장 실패");
        }
    };

    // Category Handlers
    const handleCategoryAdd = async () => {
        if (!db) return;
        const newCat = window.prompt("새 카테고리 (예: 📱 라이프스타일):");
        if (!newCat?.trim()) return;
        const newArr = [...categories, newCat];
        await setDoc(doc(db, 'settings', 'app_categories'), { list: newArr });
        setCategories(newArr);
    };

    const handleCategoryDelete = async (cat: string) => {
        if (!db || !window.confirm(`'${cat}' 삭제?`)) return;
        const newArr = categories.filter(c => c !== cat);
        await setDoc(doc(db, 'settings', 'app_categories'), { list: newArr });
        setCategories(newArr);
    };

    const handleCategoryEdit = async (cat: string, idx: number) => {
        if (!db) return;
        const newName = window.prompt("새 이름:", cat);
        if (!newName?.trim()) return;
        const newArr = [...categories];
        newArr[idx] = newName;
        await setDoc(doc(db, 'settings', 'app_categories'), { list: newArr });
        setCategories(newArr);
    };

    const handleCategoryMove = async (idx: number, direction: -1 | 1) => {
        if (!db) return;
        if (idx + direction < 0 || idx + direction >= categories.length) return;
        const newArr = [...categories];
        const temp = newArr[idx];
        newArr[idx] = newArr[idx + direction];
        newArr[idx + direction] = temp;
        await setDoc(doc(db, 'settings', 'app_categories'), { list: newArr });
        setCategories(newArr);
    };

    if (!user || isLoading) {
        return <div className="p-10 text-center text-slate-500">데이터를 불러오는 중...</div>;
    }

    const pendingApps = apps.filter(a => a.status === 'pending');
    const approvedApps = apps.filter(a => a.status === 'approved');

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 pb-20 font-sans min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-slate-100">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">🛡️ 관리자 대시보드</h2>
                <div className="flex gap-2">
                    <span className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm">
                        대기 중: {pendingApps.length}건
                    </span>
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm">
                        활성 앱: {approvedApps.length}개
                    </span>
                </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800">카테고리(분류) 관리</h3>
                    <button 
                        onClick={handleCategoryAdd}
                        className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                    >
                        <Plus size={16} /> <span className="hidden sm:inline">추가</span>
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    <div className="bg-slate-100 text-slate-400 px-3 py-1.5 rounded-lg text-sm font-semibold cursor-not-allowed">
                        전체보기 (기본)
                    </div>
                    {categories.map((cat, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-slate-50 border border-slate-200 pl-3 pr-1.5 py-1.5 rounded-lg text-sm transition-all hover:bg-slate-100">
                            <span className="font-semibold text-slate-700">{cat}</span>
                            <div className="flex gap-1 ml-2 items-center">
                                <div className="flex bg-slate-200 rounded mr-1">
                                    <button onClick={() => handleCategoryMove(idx, -1)} disabled={idx === 0} className="p-1 disabled:opacity-30 text-slate-600 hover:bg-slate-300 rounded-l">
                                        <ArrowLeft size={14} />
                                    </button>
                                    <button onClick={() => handleCategoryMove(idx, 1)} disabled={idx === categories.length - 1} className="p-1 disabled:opacity-30 text-slate-600 hover:bg-slate-300 rounded-r">
                                        <ArrowRight size={14} />
                                    </button>
                                </div>
                                <button onClick={() => handleCategoryEdit(cat, idx)} className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                                    <Edit2 size={14} />
                                </button>
                                <button onClick={() => handleCategoryDelete(cat)} className="p-1 text-red-600 hover:bg-red-100 rounded">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* App List */}
            <div className="space-y-4">
                <div className="mb-2">
                    <h3 className="text-lg font-bold text-slate-800">등록된 앱 목록</h3>
                    <p className="text-sm text-slate-500">모바일 환경에서도 앱 정보를 즉시 수정할 수 있습니다.</p>
                </div>

                {apps.length === 0 ? (
                    <div className="text-center p-10 bg-white rounded-2xl text-slate-500 border border-slate-200">
                        등록된 데이터가 없습니다.
                    </div>
                ) : (
                    apps.map(app => {
                        const isEditing = editingAppId === app.id;

                        return (
                            <div key={app.id} className={`bg-white rounded-2xl p-4 sm:p-5 border shadow-sm transition-all ${app.status === 'pending' ? 'border-orange-300 shadow-orange-100/50' : 'border-slate-200'}`}>
                                
                                {/* ---------------- EDIT MODE ---------------- */}
                                {isEditing ? (
                                    <div className="flex flex-col gap-3">
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <div className="flex-1">
                                                <label className="block text-xs font-bold text-slate-500 mb-1">앱 이름</label>
                                                <input 
                                                    value={editForm.name || ''} 
                                                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                                                />
                                            </div>
                                            <div className="sm:w-1/3">
                                                <label className="block text-xs font-bold text-slate-500 mb-1">태그 (카테고리)</label>
                                                <input 
                                                    value={editForm.tag || ''} 
                                                    onChange={e => setEditForm({...editForm, tag: e.target.value})}
                                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">서비스 설명</label>
                                            <textarea 
                                                value={editForm.desc || ''} 
                                                onChange={e => setEditForm({...editForm, desc: e.target.value})}
                                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm min-h-[60px] focus:outline-none focus:border-indigo-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">검색 태그 (콤마 구분)</label>
                                            <input 
                                                value={(editForm.searchTags || []).join(', ')} 
                                                onChange={e => setEditForm({...editForm, searchTags: e.target.value.split(',').map(t=>t.trim()).filter(Boolean)})}
                                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                                                placeholder="예: 뽀모도로, 타이머"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">HTML 소스/링크 (Content Info)</label>
                                            <textarea 
                                                value={editForm.contentInfo || ''} 
                                                onChange={e => setEditForm({...editForm, contentInfo: e.target.value})}
                                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono bg-slate-50 min-h-[120px] focus:outline-none focus:border-indigo-500 break-all whitespace-pre-wrap"
                                            />
                                        </div>

                                        <div className="flex justify-end gap-2 mt-2">
                                            <button onClick={cancelEdit} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">
                                                취소
                                            </button>
                                            <button onClick={() => saveEdit(app.id)} className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                                                <Save size={16} /> 저장
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                /* ---------------- VIEW MODE ---------------- */
                                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                <h3 className="text-lg font-bold text-slate-900 truncate">{app.name}</h3>
                                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold">{app.tag}</span>
                                                {app.status === 'pending' ? (
                                                    <span className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full"><Clock size={12}/> 대기</span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"><CheckCircle size={12}/> 승인</span>
                                                )}
                                            </div>
                                            <div className="flex gap-1 flex-wrap mb-2">
                                                {(app.searchTags || []).map((t, i) => (
                                                    <span key={i} className="text-[11px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100">#{t}</span>
                                                ))}
                                            </div>
                                            <p className="text-sm text-slate-600 mb-2 line-clamp-2">{app.desc}</p>
                                            
                                            <div className="text-xs text-slate-400 mb-3 flex flex-col sm:flex-row sm:gap-4 gap-1">
                                                <span><b className="font-semibold text-slate-500">방식:</b> {app.executionType === 'link' ? '외부 링크' : 'HTML 소스'}</span>
                                                <span><b className="font-semibold text-slate-500">대상(EN):</b> {app.name_en || 'N/A'}</span>
                                                <span><b className="font-semibold text-slate-500">작성자:</b> {app.authorUid.substring(0,8)}...</span>
                                            </div>

                                            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs font-mono text-slate-600 max-h-32 overflow-y-auto w-full break-all whitespace-pre-wrap">
                                                {app.contentInfo}
                                            </div>
                                        </div>

                                        <div className="flex sm:flex-col gap-2 shrink-0 justify-end sm:justify-start border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-4">
                                            {app.status === 'pending' && (
                                                <button onClick={() => handleApprove(app.id, app.name)} className="flex-1 sm:flex-none flex justify-center items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors">
                                                    <CheckCircle size={16} /> <span className="hidden sm:inline">승인</span>
                                                </button>
                                            )}
                                            <button onClick={() => startEdit(app)} className="flex-1 sm:flex-none flex justify-center items-center gap-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-sm font-semibold transition-colors">
                                                <Edit2 size={16} /> 수정
                                            </button>
                                            <button onClick={() => handleReject(app.id, app.name)} className="flex-1 sm:flex-none flex justify-center items-center gap-1 bg-white border border-red-200 hover:bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm font-semibold transition-colors">
                                                <Trash2 size={16} /> 삭제
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
