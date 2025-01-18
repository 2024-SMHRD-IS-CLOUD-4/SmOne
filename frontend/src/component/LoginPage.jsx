import React from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLogin = (event) => {
    event.preventDefault();
    navigate("/main");
  };

  return (
    <div>
      {/* Video Background */}
      <video className="video-background" autoPlay muted loop>
        <source src="video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Login Form */}
      <div className="login-container">
        <div className="login-box">
          <h1>LOGIN</h1>
          <form onSubmit={handleLogin}>
            <label htmlFor="institution-name">기관명</label>
            <input
              type="text2"
              id="institution-name"
              placeholder="기관명 입력"
            />
            <label htmlFor="password">비밀번호</label>
            <input type="password2" id="password" placeholder="비밀번호 입력" />
            <button type="submit" className="login-button">
              로그인
            </button>
          </form>
          <div className="login-links">
            <a href="/find-id">아이디 찾기</a>
            <a
              href="/identity-check"
              onClick={(e) => {
                e.preventDefault();
                navigate("/identity-check");
              }}
            >
              비밀번호 찾기
            </a>

            <a href="/signup">회원가입</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
