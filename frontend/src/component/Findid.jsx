import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Findid.css"; 

const Findid = () => {
  const [formData, setFormData] = useState({
    centerId: "",
    userName: "",
    role: "의사",
    emailId: "",
    emailDomain: "",
  });
  const [foundUserId, setFoundUserId] = useState("");
  const navigate = useNavigate();

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 아이디 찾기 요청
  const handleFindId = async () => {
    if (!formData.centerId.trim()) {
      alert("기관명을 입력해주세요.");
      return;
    }
    if (!formData.userName.trim()) {
      alert("관리자명을 입력해주세요.");
      return;
    }
    if (!formData.emailId.trim() || !formData.emailDomain.trim()) {
      alert("이메일을 입력해주세요.");
      return;
    }

    // 이메일 합치기
    const finalEmail = `${formData.emailId}@${formData.emailDomain}`;
    const sendData = {
      centerId: formData.centerId,
      userName: formData.userName,
      role: formData.role,
      email: finalEmail
    };
    
    console.log("전송 데이터:", sendData);

    try {
      const response = await axios.post("http://localhost:8090/SmOne/api/users/findid", sendData);
      if (response && response.data) {
        setFoundUserId(response.data);
        alert(`아이디를 찾았습니다: ${response.data}`);
      } else {
        alert("알 수 없는 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("아이디 찾기 오류:", error);
      if (error.response && error.response.status === 404) {
        alert("입력하신 정보와 일치하는 아이디가 없습니다.");
      } else {
        alert("아이디를 찾는 중 오류가 발생했습니다.");
      }
    }
  };

  // 확인 버튼 -> 로그인 페이지
  const handleConfirm = () => {
    navigate("/");
  };

  return (
    <div className="findid-container">
      <h1 className="findid-title">FIND ID</h1>

      <div className="findid-form">
        {/* 기관명/직책 */}
        <label>기관명 / 직책</label>
        <div className="flex-row">
          <input
            type="text"
            name="centerId"
            placeholder="기관명을 입력하세요"
            value={formData.centerId}
            onChange={handleChange}
            className="long-input"  
          />
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="role-select" 
          >
            <option value="의사">의사</option>
            <option value="관리자">관리자</option>
          </select>
        </div>

        {/* 관리자명 */}
        <label>관리자명</label>
        <input
          type="text"
          name="userName"
          placeholder="관리자명을 입력하세요"
          value={formData.userName}
          onChange={handleChange}
        />

        {/* 이메일 */}
        <label>이메일 입력</label>
        <div className="flex-row">
          <input
            type="text"
            name="emailId"
            placeholder="이메일 아이디"
            value={formData.emailId}
            onChange={handleChange}
            className="email-input"
          />
          <span className="at-symbol">@</span>
          <input
            type="text"
            name="emailDomain"
            placeholder="직접입력"
            value={formData.emailDomain}
            onChange={handleChange}
            className="email-input"
          />
        </div>

        {/* 아이디 찾기 버튼 */}
        <button className="findid-btn" onClick={handleFindId}>
          아이디 찾기
        </button>

        {foundUserId && (
          <div className="result-box">
            <p>찾은 아이디: <strong>{foundUserId}</strong></p>
            <button onClick={handleConfirm}>확인</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Findid;