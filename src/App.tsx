import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import CategoryBar from './components/CategoryBar';
import ListView from './components/ListView';
import AppUpload from './pages/AppUpload';
import AdminDashboard from './pages/AdminDashboard';
import AppSandbox from './components/AppSandbox';
import AppBottomSheet from './components/AppBottomSheet';
import Fuse from 'fuse.js';
import { Search } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, db } from './firebaseConfig';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import './i18n'; // Translates setup
import './index.css';

export interface AppData {
  id: string | number;
  name: string;
  desc: string;
  tag: string;
  searchTags?: string[];
  executionType?: string;
  contentInfo?: string;
  createdAt?: any;
}

function MainViews() {
  const [liveApps, setLiveApps] = React.useState<AppData[]>([]);
  const [categories, setCategories] = React.useState<string[]>(['💼 직장인', '🎓 학생', '🛠 유틸리티', '🎮 게임']);
  const [activeCategory, setActiveCategory] = React.useState('전체보기');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedApp, setSelectedApp] = React.useState<AppData | null>(null);
  const [executingApp, setExecutingApp] = React.useState<AppData | null>(null);

  useEffect(() => {
    const loadApprovedAppsAndCategories = async () => {
      if (!db) return;
      try {
        // Fetch Categories
        const catDoc = await getDoc(doc(db, 'settings', 'app_categories'));
        if (catDoc.exists()) {
          setCategories(catDoc.data().list || []);
        }

        // Fetch Apps
        const q = query(collection(db, 'apps'), where('status', '==', 'approved'));
        const snap = await getDocs(q);
        const fetched = snap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            desc: data.desc,
            tag: data.tag || '',
            searchTags: data.searchTags || [],
            executionType: data.executionType,
            contentInfo: data.contentInfo,
            createdAt: data.createdAt
          } as AppData;
        });
        
        // 정렬: 최신 등록순 (createdAt 기준 내림차순)
        fetched.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });
        
        setLiveApps(fetched);
      } catch (err) {
        console.error("Failed to load live apps", err);
      }
    };
    loadApprovedAppsAndCategories();
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'auto';
  }, []);

  const filteredByCategory = activeCategory === '전체보기' 
      ? liveApps 
      : liveApps.filter(app => app.tag.includes(activeCategory.replace(/[^가-힣]/g, '')));

  let displayApps = filteredByCategory;
  if (searchQuery.trim()) {
      const fuse = new Fuse(filteredByCategory, {
          keys: ['name', 'name_en', 'desc', 'tag', 'searchTags'],
          threshold: 0.4,
      });
      displayApps = fuse.search(searchQuery).map(result => result.item);
  }

  return (
    <main className="flex-1 relative bg-slate-50 overflow-hidden flex flex-col h-screen h-[100dvh]">
      
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center shadow-sm z-10">
        <Search className="text-slate-400 mr-2 shrink-0" size={20} />
        <input 
          type="text" 
          placeholder="앱 이름, 키워드, 태그로 AI(흐름) 검색..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-transparent outline-none text-slate-700 font-medium placeholder:text-slate-300"
        />
      </div>

      <CategoryBar categories={categories} active={activeCategory} onSelect={setActiveCategory} />
      
      <div className="flex-1 relative overflow-auto pb-[100px]">
        <ListView apps={displayApps} onAppOpen={setSelectedApp} />
      </div>
      
      <AppBottomSheet 
          app={selectedApp} 
          onClose={() => setSelectedApp(null)} 
          onLaunch={(app) => {
              setSelectedApp(null);
              setExecutingApp(app);
          }}
      />
      
      {executingApp && (
        <AppSandbox 
            app={executingApp} 
            onClose={() => setExecutingApp(null)} 
        />
      )}
    </main>
  );
}

function App() {
  const [user, setUser] = React.useState<User | null>(null);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Header user={user} />
      <Routes>
        <Route path="/" element={<MainViews />} />
        <Route path="/upload" element={<AppUpload user={user} />} />
        <Route path="/admin" element={<AdminDashboard user={user} />} />
      </Routes>
    </Router>
  );
}

export default App;
