import { doc, getDoc, updateDoc, increment, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

export const handleAppLaunch = async (appData: any) => {
    // 1. Check Login Context
    console.log(`Checking launch permissions for app ID: ${appData?.id}`);
    
    if (!auth || !auth.currentUser || !db) {
        alert("앱을 실행하려면 먼저 구글 로그인을 진행해 주세요. (서버 연결 불가)");
        return false;
    }
    const uid = auth.currentUser.uid;
    const userRef = doc(db, 'users', uid);
    
    try {
        const userSnap = await getDoc(userRef);
        let usageCount = 0;
        let isSubscribed = false;

        // 2. Resolve User Document & Read state
        if (userSnap.exists()) {
            const data = userSnap.data();
            usageCount = data.usageCount || 0;
            isSubscribed = data.isSubscribed || false;
        } else {
            // First time tracking for this user
            await setDoc(userRef, { usageCount: 0, isSubscribed: false, createdAt: new Date() });
        }

        // 3. Paywall Limit Logic (Allow 10 free tests)
        if (!isSubscribed && usageCount >= 10) {
            // Here you could launch a fancy React Modal, logic uses alert for structural scaffolding
            alert("⚠️ 무료 사용량을 초과했습니다 (10회). 무제한 요금제를 구독해 주세요.");
            
            // Optionally, trigger your payment scripts here.
            return false; // Launch Denied
        }

        // 4. Validate Increment Launch 
        await updateDoc(userRef, {
            usageCount: increment(1)
        });
        
        // Optional global app statistics:
        // const appRef = doc(db, 'apps', appData.id);
        // await updateDoc(appRef, { viewCount: increment(1) });
        
        return true; 
    } catch (error) {
        console.error("App Usage Check Error:", error);
        alert("데이터베이스 연결에 문제가 발생했습니다. (API 키 확인 요망)");
        return false;
    }
};
