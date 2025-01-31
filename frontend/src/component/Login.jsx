// src/component/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css'; // (★) 로그인 전용 CSS
import teamLogo from './png/teamlogo.png'; // (★) 로고 이미지 추가

const Login = () => {
  const [formData, setFormData] = useState({ userId: '', userPw: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // 입력 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 로그인 요청
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_DB_URL}/users/login`,
        formData,
        { withCredentials: true }
      );
      if (response.status === 200) {
        alert('로그인 성공!');
        sessionStorage.setItem('userId', formData.userId);
        navigate('/main');
      } else {
        alert(`로그인 실패: ${response.data}`);
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      if (error.response) {
        alert(`로그인 실패: ${error.response.data}`);
      } else {
        alert('서버와 연결할 수 없습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 부가 버튼들
  const handleSignup = () => navigate('/signup');
  const handleFindId = () => navigate('/findid');
  const handleFindPw = () => navigate('/findpw');

  return (
    <div className="login-page">
      <img src={teamLogo} alt="Team Logo" className="team-logo" />
      <h1 className="login-title">LOGIN</h1>

      <form className="login-form" onSubmit={handleSubmit}>
        <label>아이디</label>
        <input
          type="text"
          name="userId"
          placeholder="아이디를 입력하세요"
          value={formData.userId}
          onChange={handleChange}
          required
        />

        <label>비밀번호</label>
        <input
          type="password"
          name="userPw"
          placeholder="비밀번호를 입력하세요"
          value={formData.userPw}
          onChange={handleChange}
          required
        />

        <button type="submit" className="login-btn" disabled={isLoading}>
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <div className="login-extra">
        <span onClick={handleFindId}>아이디 찾기</span>
        <span onClick={handleFindPw}>비밀번호 찾기</span>
        <span onClick={handleSignup}>회원가입</span>
      </div>
    </div>
  );
};

export default Login;