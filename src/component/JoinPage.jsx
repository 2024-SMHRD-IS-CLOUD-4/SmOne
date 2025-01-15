import React from "react";
import { useNavigate } from "react-router-dom";
import "./JoinPage.css";

const JoinPage = () => {
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    // 추가 로직 (예: 회원가입 API 호출) 이후
    navigate("/");
  };

  const handleSearch = () => {
    // 우편번호 검색 로직 추가
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
            {/* 기관명 */}   
            <div className="input-group">
            <label htmlFor="institution-name">기관명</label>
            <input
              type="text"
              id="institution-name"
              placeholder="기관명 입력"
            />

            {/* 비밀번호 */}
            <label htmlFor="password">비밀번호</label>
            <input type="password" id="password" placeholder="비밀번호 입력" />
              {/* 관리자 이름과 직업 */}
            <label htmlFor="manager-info">관리자 정보</label>
            <div className="input-gruop">
              <input
                type="text"
                id="manager-name"
                placeholder="관리자 이름 입력"
              />
              <label htmlFor="manager-info">직업</label>
              <input
                type="text"
                id="manager-role"
                placeholder="직업 입력"
              />
              </div>
              </div>
              {/* 이메일 입력 */}
              <div className="input-group">
                  <label htmlFor="email">이메일</label>
                  <input
                      type="email"
                      id="email"
                      placeholder="이메일 입력"

                  />
              </div>  
            
            {/* 기관 주소 */}
            <label htmlFor="address">기관주소</label>
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
