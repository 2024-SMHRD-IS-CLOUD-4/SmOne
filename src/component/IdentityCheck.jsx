import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./IdentityCheck.css";

const IdentityCheck = () => {
  const navigate = useNavigate();
  const [position, setPosition] = useState(""); // 직책 상태 관리
  const [emailLocalPart, setEmailLocalPart] = useState(""); // 이메일 아이디
  const [emailDomainPart, setEmailDomainPart] = useState(""); // 이메일 도메인

  const handleIdentityCheck = (e) => {
    e.preventDefault();
    const fullEmail = `${emailLocalPart}@${emailDomainPart}`; // 이메일 조합
    console.log("선택한 직책:", position);
    console.log("입력한 이메일:", fullEmail);

    // 본인 인증 완료 후 FindPass로 이동
    navigate("/find-pass");
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
          <h1>IDENTITY CHECK</h1>
          <form onSubmit={handleIdentityCheck}>
          <label htmlFor="id">아이디</label>
            <input
              type="text"
              id="id"
              placeholder="아이디 입력"
            />
            <label htmlFor="institution-name">관리자명 / 직책</label>
            <div className="input-row">
              <input
                type="text"
                id="admin-name"
                placeholder="관리자 이름"
              />
              <select
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="select-box"
              >
                <option value="">직책 선택</option>
                <option value="doctor">의사</option>
                <option value="manager">관리자</option>
              </select>
            </div>
            <label htmlFor="center-name">센터명</label>
            <input
              type="text"
              id="center-name"
              placeholder="센터명 입력"
            />
            <label htmlFor="email">이메일 입력</label>
            <div className="input-row">
              <input
                type="text"
                id="email-local"
                placeholder="이메일 아이디"
                value={emailLocalPart}
                onChange={(e) => setEmailLocalPart(e.target.value)}
              />
              <span>@</span>
              <input
                type="text"
                id="email-domain"
                placeholder="직접입력"
                value={emailDomainPart}
                onChange={(e) => setEmailDomainPart(e.target.value)}
              />
            </div>
            
            <br />
            <button type="submit" className="pass-button">
              본인 인증
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IdentityCheck;
