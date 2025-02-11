const loadKakaoMapScript = (onLoad) => {
  // 기존 스크립트가 있는지 확인
  const existingScript = document.getElementById("kakao-map-script");
  if (existingScript) {
    console.log("✅ 기존 스크립트 감지됨");
    window.kakao.maps.load(() => {
      console.log("🎉 기존 스크립트 로드 완료 후 실행");
      console.log("🔍 window.kakao:", window.kakao);
      console.log("🔍 window.kakao.maps:", window.kakao?.maps);
      console.log("🔍 window.kakao.maps.services:", window.kakao?.maps?.services);

      if (window.kakao.maps.services) {
        console.log("✅ services 로드 성공");
        onLoad(window.kakao.maps);
      } else {
        console.error("❌ 기존 스크립트에서 services 로드 실패");
      }
    });
    return;
  }

  // 새로운 스크립트 추가
  console.log("📌 카카오맵 스크립트 로드 중...");
  const script = document.createElement("script");
  script.id = "kakao-map-script";
  script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_MAP_API_KEY}&libraries=services`;
  script.defer = true; // 동기 로드 보장

  script.onload = () => {
    console.log("✅ 카카오맵 스크립트 로드 완료");

    if (window.kakao) {
      console.log("🔍 window.kakao 객체 확인:", window.kakao);
    } else {
      console.error("❌ window.kakao 객체가 정의되지 않았습니다.");
      return;
    }


    window.kakao.maps.load(() => {
      console.log("🔍 window.kakao.maps.services:", window.kakao?.maps?.services);

      if (window.kakao.maps.services) {
        console.log("🎉 services 로드 성공");
        onLoad(window.kakao.maps);
      } else {
        console.error("❌ services 로드 실패");
      }
    });
  };

  script.onerror = () => {
    console.error("❌ 카카오맵 스크립트 로드 실패!");
  };

  // 스크립트를 document.head에 추가
  document.head.appendChild(script);
};

export default loadKakaoMapScript;
