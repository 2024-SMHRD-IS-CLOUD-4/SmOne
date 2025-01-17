import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./LoginPage.css";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    userId: "", // 스프링 부트에서 기대하는 이름으로 변경
    userPw: "", // 스프링 부트에서 기대하는 이름으로 변경
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    console.log("Form Data:", formData); // 전송 데이터 확인
    try {
      const response = await axios.post("http://localhost:8090/SmOne/api/users/login", formData);
      if (response.status === 200) {
        alert("로그인 성공!");
        navigate("/main"); // 로그인 성공 시 메인 페이지로 이동
      } else {
        alert(`로그인 실패: ${response.data}`);
      }
    } catch (error) {
      console.error("Error:", error);
      if (error.response) {
        alert(`로그인 실패: ${error.response.data}`);
      } else {
        alert("서버와 연결할 수 없습니다.");
      }
    }
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
            <label htmlFor="userId">아이디</label>
            <input
              type="text"
              id="userId"
              name="userId" // 이름 변경
              value={formData.userId}
              onChange={handleChange}
              placeholder="아이디 입력"
              required
            />
            <label htmlFor="userPw">비밀번호</label>
            <input
              type="password"
              id="userPw"
              name="userPw" // 이름 변경
              value={formData.userPw}
              onChange={handleChange}
              placeholder="비밀번호 입력"
              required
            />
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
