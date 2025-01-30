import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./component/Login";
import Main from "./component/Main";
import Signup from "./component/Signup";
import Findid from "./component/Findid";
import Changepw from "./component/Changepw";
import IdentityCheck from "./component/IdentityCheck";
import MyPage from "./component/MyPage";
import PatientJoin from "./component/PatientJoin";
import Patientedit from "./component/Patientedit";
import Loading from "./component/Loading";
import Result from "./component/Result";
import Diagnosis from "./component/Diagnosis";

function App() {
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false);
  const KAKAO_MAP_API_KEY = process.env.REACT_APP_KAKAO_MAP_API_KEY;

  useEffect(() => {
    const loadKakaoMap = () => {
      if (window.kakao && window.kakao.maps) {
        console.log("✅ 카카오 맵 API 이미 로드됨.");
        setIsKakaoLoaded(true);
        return;
      }
  
      const script = document.createElement("script");
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_MAP_API_KEY}&libraries=services`;
      script.async = true;
      script.onload = () => {
        console.log("✅ 카카오 맵 API 스크립트 로드 완료");
  
        const checkKakaoAPI = setInterval(() => {
          if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
            console.log("✅ 카카오 API 최종 로드 완료");
            setIsKakaoLoaded(true);
            clearInterval(checkKakaoAPI);
          }
        }, 500);
      };
  
      document.head.appendChild(script);
    };
  
    loadKakaoMap();
  }, []);
  
  

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />
        <Route path="/main" element={<Main />} />
        <Route path="/signup" element={<Signup isKakaoLoaded={isKakaoLoaded} />} />
        <Route path="/Changepw" element={<Changepw />} />
        <Route path="/findid" element={<Findid />} />
        <Route path="/identitycheck" element={<IdentityCheck />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/patient-join" element={<PatientJoin />} />
        <Route path="/patientedit" element={<Patientedit />} />
        <Route path="/loading" element={<Loading />} />
        <Route path="/Result" element={<Result />} />
        <Route path="/Diagnosis" element={<Diagnosis />} />
      </Routes>
    </Router>
  );
}

export default App;
