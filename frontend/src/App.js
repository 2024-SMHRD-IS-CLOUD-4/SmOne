import React, { useEffect, createContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./component/Signup";
import Login from "./component/Login";
import Main from "./component/Main";
import Patients from "./component/Patients";
import Changepw from "./component/Changepw";
import Findid from "./component/Findid";
import Findpw from "./component/Findpw";
import Mypage from "./component/Mypage";
import PatientEdit from "./component/PatientEdit";
import Result from "./component/Result";
import PrintPage from "./component/PrintPage";
import Loading from "./component/Loading";

import './App.css';

export const KakaoMapContext = createContext(null);

function App() {
  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      return;
    }

    const scriptId = "kakao-map-script";
    if (document.getElementById(scriptId)) return;

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_MAP_API_KEY}&libraries=services`;
    script.defer = true;

    script.onload = () => {
      let attempt = 0;
      const checkKakao = setInterval(() => {
        if (window.kakao && window.kakao.maps) {
          clearInterval(checkKakao);
        } else {
          attempt++;
          if (attempt > 10) {
            clearInterval(checkKakao);
          }
        }
      }, 500);
    };

    script.onerror = () => {};

    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <div className="app-container">
      <video 
        autoPlay
        loop
        muted
        playsInline
        className="bg-video"
        src="/video.mp4"
      />
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/main" element={<Main />} />
          <Route path='/patients' element={<Patients/>} />
          <Route path='changepw' element={<Changepw/>} />
          <Route path="/findid" element={<Findid />} />
          <Route path="/findpw" element={<Findpw />} />
          <Route path="/mypage" element={<Mypage/>} />
          <Route path="/loading" element={<Loading />} />
          <Route path="/patients/edit/:pIdx" element={<PatientEdit />} />
          <Route path='/result' element={<Result/>} />
          <Route path='print' element={<PrintPage/>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
