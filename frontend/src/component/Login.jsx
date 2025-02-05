import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import teamLogo from './png/teamlogo.png';
import idIcon from './png/id.png';
import pwIcon from './png/pw.png';

const Login = () => {
  const [formData, setFormData] = useState({ userId: '', userPw: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [errorState, setErrorState] = useState({ userId: false, userPw: false });
  const [shake, setShake] = useState({ userId: false, userPw: false });
  const [errorMessage, setErrorMessage] = useState(''); // 추가: 에러 메시지 상태
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrorState({ ...errorState, [name]: false });
    setShake({ ...shake, [name]: false });
    setErrorMessage(''); // 입력 시 에러 메시지 초기화
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorState({ userId: false, userPw: false });
    setShake({ userId: false, userPw: false });
    setErrorMessage('');

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_DB_URL}/users/login`,
        formData,
        { withCredentials: true }
      );

      if (response.status === 200) {
        sessionStorage.setItem('userId', formData.userId);
        navigate('/main');
      } else {
        setErrorState({ userId: true, userPw: true });
        setShake({ userId: true, userPw: true });
        setErrorMessage('아이디 또는 비밀번호가 일치하지 않습니다!'); // 에러 메시지 설정
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      setErrorState({ userId: true, userPw: true });
      setShake({ userId: true, userPw: true });
      setErrorMessage('아이디 또는 비밀번호가 일치하지 않습니다!'); // 에러 메시지 설정
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <img src={teamLogo} alt="Team Logo" className="login-team-logo" />
      <form className="login-form" onSubmit={handleSubmit}>

        {/* 아이디 입력 필드 */}
        <div className={`input-container ${shake.userId ? 'shake' : ''}`}>
          <img src={idIcon} alt="아이디 아이콘" className="input-icon" />
          <input
            type="text"
            name="userId"
            placeholder="아이디를 입력하세요"
            value={formData.userId}
            onChange={handleChange}
            className={`${errorState.userId ? 'error-border' : ''}`}
            required
          />
        </div>

        {/* 비밀번호 입력 필드 */}
        <div className={`input-container ${shake.userPw ? 'shake' : ''}`}>
          <img src={pwIcon} alt="비밀번호 아이콘" className="input-icon" />
          <input
            type="password"
            name="userPw"
            placeholder="비밀번호를 입력하세요"
            value={formData.userPw}
            onChange={handleChange}
            className={`${errorState.userPw ? 'error-border' : ''}`}
            required
          />
        </div>


        {/* 에러 메시지 출력 */}
        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <button type="submit" className="login-btn" disabled={isLoading}>
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <div className="login-extra">
        <span onClick={() => navigate('/findid')}>아이디 찾기</span>
        <span className="separator">|</span>  {/* 구분자 추가 */}
        <span onClick={() => navigate('/findpw')}>비밀번호 찾기</span>
        <span className="separator">|</span>  {/* 구분자 추가 */}
        <span onClick={() => navigate('/signup')}>회원가입</span>
      </div>


    </div>
  );
};

export default Login;
