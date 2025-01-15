import React from "react";
import { useNavigate } from "react-router-dom";
import "./FindPass.css";

const FindPass = () => {
  const navigate = useNavigate();

  const handlePasswordChange = (e) => {
    e.preventDefault();
    // 추가 로직 (예: 비밀번호 변경 API 호출) 이후
    navigate("/");
  };

  return (
    <div>
      {/* Video Background */}
      <video className="video-background" autoPlay muted loop>
        <source src="video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="pass-container">
        <div className="pass-box">
          <h1>Change Password</h1>
          <form onSubmit={handlePasswordChange}>
            <label htmlFor="institution-name">기관명</label>
            <input
              type="text1"
              id="institution-name"
              placeholder="기관명 입력"
            />
            <label htmlFor="password">새 비밀번호</label>
            <input
              type="password1"
              id="password"
              placeholder="새로운 비밀번호 입력"
            />
            <label htmlFor="password-confirm">비밀번호 확인</label>
            <input
              type="password1"
              id="password-confirm"
              placeholder="새로운 비밀번호 입력"
            />
            <button type="submit" className="pass-button">
              비밀번호 변경완료
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FindPass;
