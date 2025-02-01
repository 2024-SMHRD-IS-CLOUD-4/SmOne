import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import PrintPage from './component/PrintPage';

function App() {
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
        <Route path='/result' element={<Result/>} />
        <Route path='print' element={<PrintPage/>} />
      </Routes>
    </Router>
    </div>
  );
}

export default App;
