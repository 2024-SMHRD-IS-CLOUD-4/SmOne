import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from "react"; // useEffect 추가
import './App.css';
import Signup from './component/Signup';
import Login from './component/Login';
import Main from './component/Main';
import Patients from './component/Patients';
import Changepw from './component/Changepw';
import Findid from './component/Findid';
import Findpw from './component/Findpw';
import Mypage from './component/Mypage';
import PatientEdit from './component/PatientEdit';
import Result from './component/Result';
import Diagnosis from './component/Diagnosis'

function App() {
  useEffect(() => {
    // 카카오 맵 스크립트가 중복 로드되지 않도록 확인
    if (!document.getElementById("kakao-map-script")) {
      const script = document.createElement("script");
      script.id = "kakao-map-script"; // 중복 로드를 방지하기 위한 ID
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_MAP_KEY}&libraries=services`;
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div className="app-container">
      {/* 배경 영상 */}
      <video 
        autoPlay
        loop
        muted
        playsInline
        className="bg-video"
        src="/video.mp4" // public 폴더에 있는 video.mp4
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
        <Route path="/patients/edit/:pIdx" element={<PatientEdit />} />
        <Route path="/result" element={<Result/>} />
        <Route path="/diagnosis" element={<Diagnosis/>} />
      </Routes>
    </Router>
    </div>
  );
}

export default App;
