import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import GravityView from './components/GravityView';
import ListView from './components/ListView';
import AppUpload from './pages/AppUpload';
import AdminDashboard from './pages/AdminDashboard';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, db } from './firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import './i18n'; // Translates setup
import './index.css';

export interface AppData {
  id: string | number;
  name: string;
  desc: string;
  tag: string;
  executionType?: string;
  contentInfo?: string;
}

export const DUMMY_APPS: AppData[] = [
  { id: 1, name: "PDF 병합기", desc: "여러 PDF 파일을 하나로 합쳐보세요.", tag: "#생산성", executionType: 'html', contentInfo: '<h1>PDF 병합기 데모</h1>' },
  { id: 2, name: "비용 정산기", desc: "영수증을 나누고 투명하게 정산하세요.", tag: "#직장인", executionType: 'html', contentInfo: '<h1>비용 정산기 데모</h1>' },
  { id: 3, name: "점심 룰렛", desc: "고르기 힘든 오늘 점심 메뉴, 룰렛으로 결정해 드립니다.", tag: "#엔터테인먼트", executionType: 'html', contentInfo: '<h1>점심 룰렛 데모</h1>' },
  { id: 4, name: "명함 메이커", desc: "나만의 감각적인 디지털 명함을 1분 만에 완성하세요.", tag: "#네트워킹", executionType: 'html', contentInfo: '<h1>명함 메이커 데모</h1>' },
  { id: 5, name: "집중 타이머", desc: "뽀모도로 기법으로 집중력을 높이세요.", tag: "#자기계발", executionType: 'html', contentInfo: '<h1>타이머 데모</h1>' }
];

function MainViews({ isGravityView }: { isGravityView: boolean }) {
  const [liveApps, setLiveApps] = React.useState<AppData[]>(DUMMY_APPS);

  useEffect(() => {
    const loadApprovedApps = async () => {
      if (!db) return;
      try {
        const q = query(collection(db, 'apps'), where('status', '==', 'approved'));
        const snap = await getDocs(q);
        const fetched = snap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            desc: data.desc,
            tag: data.tag || '',
            executionType: data.executionType,
            contentInfo: data.contentInfo
          } as AppData;
        });
        setLiveApps([...DUMMY_APPS, ...fetched]);
      } catch (err) {
        console.error("Failed to load live apps", err);
      }
    };
    loadApprovedApps();
  }, []);

  useEffect(() => {
    if (isGravityView) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; }; // Reset when unmounting
  }, [isGravityView]);

  return (
    <main className="content-area">
      {isGravityView ? (
        <GravityView apps={liveApps} isActive={true} />
      ) : (
        <ListView apps={liveApps} />
      )}
    </main>
  );
}

function App() {
  const [isGravityView, setIsGravityView] = React.useState(true);
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
      <Header 
        isGravityView={isGravityView} 
        onToggle={() => setIsGravityView(!isGravityView)} 
        user={user}
      />
      <Routes>
        <Route path="/" element={<MainViews isGravityView={isGravityView} />} />
        <Route path="/upload" element={<AppUpload user={user} />} />
        <Route path="/admin" element={<AdminDashboard user={user} />} />
      </Routes>
    </Router>
  );
}

export default App;
