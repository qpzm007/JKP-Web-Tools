// src/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

// Initialize Firebase Application conditionally
const app = firebaseConfig.apiKey ? initializeApp(firebaseConfig) : null;

// Initialize Firebase Services safely
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const googleProvider = app ? new GoogleAuthProvider() : null;

// Auth Helpers
export const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
        alert("Firebase 설정이 누락되었습니다. src/firebaseConfig.ts 파일에 API 키를 입력해 주세요.");
        return null;
    }
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error("Google Sign-In Error:", error);
        throw error;
    }
};

export const logout = async () => {
    if (!auth) return;
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Logout Error:", error);
        throw error;
    }
};

/* ==========================================
   [Firestore DB 데이터 모델 설계]
=============================================
1. Collection: `users`
   Document ID: Firebase Auth UID
   Fields:
   - displayName (string): 유저 프로필 이름
   - email (string): 유저 이메일
   - photoURL (string): 유저 구글 프로필 이미지 URL
   - isSubscribed (boolean): 월정액 결제(페이월) 등 유료 구독 여부 (기본값: false)
   - usageCount (number): 앱 사용 횟수 카운터 (무료 배정 10회 제한 체크용)
   - createdAt (timestamp): 유저 가입 일자

2. Collection: `apps`
   Document ID: Firestore Auto-generated ID
   Fields:
   - name (string): 등록될 앱 이름
   - desc (string): 앱의 짧은 설명 (목록/디테일 표기용)
   - tag (string): 태그 분류 (예: "#직장인")
   - contentInfo (map or string): 구동할 HTML 코드, 사설 웹뷰 로딩을 위한 외부 링크 URL
   - authorUid (string): 앱을 직접 업로드하고 등록한 퍼블리셔(유저)의 Auth UID
   - language (string): 언어 코드 (다국어 글로벌 진출용, 예: "ko", "en")
   - createdAt (timestamp): 앱 등록/심사 통과 일자
   - viewCount/usageCount (number): 해당 앱이 클릭 및 실행된 횟수 (유저 수익 배분 기준 통계 데이터)
============================================= */
