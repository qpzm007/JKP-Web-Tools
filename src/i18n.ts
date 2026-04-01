import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ko: {
    translation: {
      "JKP Web Tools": "JKP Web Tools",
      "리스트 뷰로 보기": "리스트 뷰로 보기",
      "안티그래비티 뷰": "안티그래비티 뷰",
      "앱 등록하기": "앱 등록하기",
      "구글 로그인": "구글 로그인",
      "로그아웃": "로그아웃"
    }
  },
  en: {
    translation: {
      "JKP Web Tools": "JKP Web Tools",
      "리스트 뷰로 보기": "List View",
      "안티그래비티 뷰": "Gravity View",
      "앱 등록하기": "Submit App",
      "구글 로그인": "Login with Google",
      "로그아웃": "Logout"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "ko", 
    fallbackLng: "ko",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
