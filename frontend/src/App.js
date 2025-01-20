import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./component/Login";
import Main from "./component/Main";
import Signup from "./component/Signup";
import Findid from "./component/Findid";
import Findpw from "./component/Findpw";
import IdentityCheck from "./component/IdentityCheck";
import MyPage from "./component/MyPage";
import PatientJoin from "./component/PatientJoin"; // PatientJoin 컴포넌트 추가
import Loading from "./component/Loading";
import Result from "./component/Result";
import Diagnosis from "./component/Diagnosis";

function App() {
  return (
    <Router>
      <Routes>
      <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />
        <Route path="/main" element={<Main />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/find-pw" element={<Findpw />} />
        <Route path="/find-id" element={<Findid />} />
        <Route path="/identitycheck" element={<IdentityCheck />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/patient-join" element={<PatientJoin />} /> {/* PatientJoin 경로 추가 */}
        <Route path="/loading" element={<Loading />} />
        <Route path="/Result" element={<Result />} />
        <Route path="/Diagnosis" element={<Diagnosis />} />
      </Routes>
    </Router>
  );
}

export default App;
