import { doc, getDoc, updateDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

export const handleAppLaunch = async (appData: any) => {
    // 1. Guest Logic (Not Logged In)
    if (!auth || !auth.currentUser || !db) {
        const guestKey = 'jkp_guest_usage';
        const currentUsage = parseInt(localStorage.getItem(guestKey) || '0', 10);
        
        if (currentUsage >= 3) {
            alert("🔒 비로그인 무료 체험(3회)이 모두 소진되었습니다.\n무료 회원가입(구글 로그인)을 하시면 10개의 앱을 평생 무제한으로 사용하실 수 있습니다!");
            return false;
        }
        
        localStorage.setItem(guestKey, (currentUsage + 1).toString());
        return true;
    }

    // 2. Authenticated User Logic
    const uid = auth.currentUser.uid;
    const userRef = doc(db, 'users', uid);
    
    try {
        const userSnap = await getDoc(userRef);
        let accessedApps: string[] = [];
        let isSubscribed = false;

        if (userSnap.exists()) {
            const data = userSnap.data();
            accessedApps = data.accessedApps || [];
            isSubscribed = data.isSubscribed || false;
        } else {
            // Initialize new user document with empty array
            await setDoc(userRef, { accessedApps: [], isSubscribed: false, createdAt: new Date() });
        }

        const stringAppId = String(appData.id);
        const isAppUnlocked = accessedApps.includes(stringAppId);

        // Unlimited usage for already unlocked apps or premium users
        if (isAppUnlocked || isSubscribed) {
            return true; 
        }

        // New app unlock attempt checking against 10-app limit
        if (accessedApps.length >= 10) {
            alert(`⚠️ 무료 앱 해제 한도(10개)를 모두 소진하셨습니다.\n(현재 잠금 해제된 앱: ${accessedApps.length}개)\n\n새로운 앱('${appData.name}')을 추가로 이용하시려면 무제한 요금제를 구독해 주세요.`);
            return false; 
        }

        // Unlock new app
        await updateDoc(userRef, {
            accessedApps: arrayUnion(stringAppId)
        });
        
        return true; 
    } catch (error) {
        console.error("App Usage Check Error:", error);
        alert("서버 연결에 문제가 발생했습니다. 인터넷 혹은 데이터베이스 설정을 확인해 주세요.");
        return false;
    }
};
