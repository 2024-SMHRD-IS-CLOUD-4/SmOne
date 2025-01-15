import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./JoinPage.css";

const JoinPage = () => {
  const navigate = useNavigate();
  const [position, setPosition] = useState(""); // 직책 상태 관리
  const [emailLocalPart, setEmailLocalPart] = useState(""); // 이메일 아이디
  const [emailDomainPart, setEmailDomainPart] = useState(""); // 이메일 도메인

  const handleRegister = (e) => {
    e.preventDefault();
    const fullEmail = `${emailLocalPart}@${emailDomainPart}`; // 이메일 조합
    console.log("선택한 직책:", position);
    console.log("입력한 이메일:", fullEmail);
    navigate("/");
  };

  const handleSearch = () => {
    alert("우편번호 검색 기능 실행!");
  };

  return (
    <div>
      {/* Video Background */}
      <video className="video-background" autoPlay muted loop>
        <source src="video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="join-container">
        <div className="join-box">
          <h1>JOIN</h1>
          <form onSubmit={handleRegister}>
            {/* 아이디 */}
            <div className="input-group">
              <label htmlFor="id">아이디</label>
              <input type="text" id="id" placeholder="아이디 입력" />
            </div>

            {/* 비밀번호 */}
            <div className="input-group">
              <label htmlFor="password">비밀번호</label>
              <input type="password" id="password" placeholder="비밀번호 입력" />
            </div>

            {/* 관리자 이름과 직책 */}
            <div className="input-group">
              <label htmlFor="manager-info">관리자명 / 직책</label>
              <div className="half-input-group">
                <input
                  type="text"
                  id="manager-name"
                  className="half-input"
                  placeholder="관리자 이름 입력"
                />
                <select
                  id="position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="select-box1"
                >
                  <option value="">직책 선택</option>
                  <option value="doctor">의사</option>
                  <option value="manager">관리자</option>
                </select>
              </div>
            </div>

            {/* 이메일 */}
            <div className="input-group">
              <label htmlFor="email">이메일</label>
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
                  placeholder="직접 입력"
                  value={emailDomainPart}
                  onChange={(e) => setEmailDomainPart(e.target.value)}
                />
              </div>
            </div>

            {/* 기관명 */}
            <div className="input-group">
              <label htmlFor="institution-name">기관명</label>
              <input
                type="text"
                id="institution-name"
                placeholder="기관명 입력"
              />
            </div>

            {/* 기관 주소 */}
            <div className="input-group">
              <label htmlFor="address">기관 주소</label>
              <div className="input-search-group">
                <input
                  type="text"
                  id="address"
                  className="input-box"
                  placeholder="우편번호 입력"
                />
                <button
                  type="button"
                  className="search-btn"
                  onClick={handleSearch}
                >
                  검색
                </button>
              </div>
              <input
                type="text"
                id="detail-address"
                className="detail-address"
                placeholder="상세주소 입력"
              />
            </div>

            {/* 기관 등록 버튼 */}
            <button type="submit" className="join-button">
              기관등록
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JoinPage;
