import { useEffect, useState } from "react";

const KakaoMapLoader = ({ onLoad }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ✅ 이미 스크립트가 로드되었는지 확인
    if (window.kakao && window.kakao.maps) {
      console.log("✅ 기존 카카오맵 API 로드됨");
      onLoad(window.kakao.maps);
      setIsLoading(false);
      return;
    }

    // ✅ 기존 스크립트가 있는지 확인하고 중복 로드 방지
    const existingScript = document.getElementById("kakao-map-script");
    if (existingScript) {
      console.log("🔄 기존 카카오맵 스크립트 감지됨, 다시 로드하지 않음.");
      setIsLoading(false);
      return;
    }

    console.log("📌 카카오맵 API 로드 중...");
    const script = document.createElement("script");
    script.id = "kakao-map-script";
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_MAP_KEY}&libraries=services`;
    script.async = true;
    script.onload = () => {
      console.log("🎉 카카오 지도 API 로드 완료!");
      setIsLoading(false);
      if (window.kakao && window.kakao.maps) {
        onLoad(window.kakao.maps);
      } else {
        console.error("❌ 카카오 지도 API 로드 실패");
      }
    };

    document.head.appendChild(script);
  }, [onLoad]);

  return isLoading ? <p>카카오맵 로딩 중...</p> : null;
};

export default KakaoMapLoader;
