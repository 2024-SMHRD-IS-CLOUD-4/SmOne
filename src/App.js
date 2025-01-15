import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./component/LoginPage";
import Main from "./component/Main";
import JoinPage from "./component/JoinPage";
import FindPass from "./component/FindPass";
import MyPage from "./component/MyPage";
import PatientJoin from "./component/PatientJoin"; // PatientJoin 컴포넌트 추가
import Loading from "./component/Loading";
import Result from "./component/Result";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/main" element={<Main />} />
        <Route path="/signup" element={<JoinPage />} />
        <Route path="/find-password" element={<FindPass />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/patient-join" element={<PatientJoin />} /> {/* PatientJoin 경로 추가 */}
        <Route path="/loading" element={<Loading />} />
        <Route path="/Result" element={<Result />} />
      </Routes>
    </Router>
  );
}

export default App;
