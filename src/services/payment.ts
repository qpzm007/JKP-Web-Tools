import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

/**
 * PortOne (구 아임포트) 국내 결제 연동 스크립트 작성 가이드
 * 실제 사용 시 index.html에 <script src="https://cdn.iamport.kr/v1/iamport.js"></script> 추가 필요
 */
export const processPortOnePayment = () => {
    const { IMP } = window as any;
    if (!IMP) return alert('PortOne 결제 모듈을 불러오지 못했습니다.');
    
    // 식별코드 초기화
    IMP.init('imp00000000'); // TODO: 본인 가맹점 식별코드 

    IMP.request_pay({
        pg: 'kakaopay',
        pay_method: 'card',
        merchant_uid: `mid_${new Date().getTime()}`,
        name: 'JKP Web Tools 무제한 접속권 (월정액)',
        amount: 9900,
        buyer_email: auth?.currentUser?.email,
        buyer_name: auth?.currentUser?.displayName,
    }, async (rsp: any) => {
        if (rsp.success) {
            alert('구독 결제가 완료되었습니다! 이제 앱을 무제한으로 사용 가능합니다.');
            if (auth?.currentUser?.uid && db) {
                // 프론트엔드 즉시 업데이트 (보안을 위해 실무에선 백엔드 웹훅 단에서 처리 요망)
                const userRef = doc(db, 'users', auth.currentUser.uid);
                await updateDoc(userRef, {
                    isSubscribed: true
                });
            }
        } else {
            alert(`결제에 실패하였습니다. 에러 내용: ${rsp.error_msg}`);
        }
    });
};

/**
 * Stripe 글로벌 USD/카드 결제 스크립트 가이드
 */
export const processStripePayment = async () => {
    try {
        console.log("Stripe Checkout Redirect Initiated.");
        alert("Stripe 글로벌 결제 페이지로 이동합니다. \n(실무 세팅: Firebase Functions 같은 백엔드에서 Session 생성 후 리다이렉트 요망)");
        
        // 실제 동작 예시:
        // const response = await fetch('/api/create-checkout-session', { method: 'POST' });
        // const { sessionId } = await response.json();
        // const stripe = await loadStripe('pk_test_...결제키...');
        // await stripe.redirectToCheckout({ sessionId });
        
        // 결제 성공 후 돌아오는 redirect_url 에서 웹훅으로 isSubscribed = true 적용
        
    } catch (err) {
        console.error("Stripe Error:", err);
    }
};
