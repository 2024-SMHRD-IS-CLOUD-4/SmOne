import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./Login.css";

const Login = () => {
    const [formData, setFormData] = useState({
        userId: '',
        userPw: '',
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
     
        try {
            // 정확한 경로 확인을 위한 로깅 추가
            console.log('요청 URL:', `${process.env.REACT_APP_DB_URL}/users/login`);
            console.log('요청 데이터:', formData);
        
            const response = await axios.post(
                `${process.env.REACT_APP_DB_URL}/users/login`, formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'  // 명시적으로 Content-Type 설정
                }
            });
            
            // 200 이외의 성공 상태 코드도 처리
            if (response.status >= 200 && response.status < 300) {
                navigate('/main');
            } else {
                alert(`로그인 실패: ${JSON.stringify(response.data)}`);
            }
        } catch (error) {
            console.error('Error details:', error);
            
            if (error.response) {
                // 에러 응답 상세 정보 표시
                console.log('Error status:', error.response.status);
                console.log('Error data:', error.response.data);
                alert(`로그인 실패: ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
                // 요청은 보냈지만 응답을 받지 못한 경우
                alert('서버 응답이 없습니다.');
            } else {
                alert(`서버와 연결할 수 없습니다. URL: ${process.env.REACT_APP_DB_URL}`);
            }
        }
     };

    const handleSignup = () => {
        navigate('/signup');
    };

    const handleFindId = () => {
        navigate('/findid');
    };

    const handleFindPw = () => {
        navigate('/IdentityCheck');
    };

    return (
        <div>
            <video className="video-background" autoPlay muted loop>
                <source src="video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            <div className="login-container">
                <div className="login-box">
                    <h1>LOGIN</h1>
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="userId"></label>
                        <input
                            type="text"
                            id="userId"
                            name="userId"
                            placeholder="아이디 입력"
                            className="user-id-input" // 클래스 추가
                            value={formData.userId}
                            onChange={handleChange}
                            required
                        />
                        <label htmlFor="userPw"></label>
                        <input
                            type="password"
                            id="userPw"
                            name="userPw"
                            placeholder="비밀번호 입력"
                            className='user-pw-input'
                            value={formData.userPw}
                            onChange={handleChange}
                            required
                        />
                        <button type="submit" className="login-button">
                            로그인
                        </button>
                    </form>
                    <div className="login-links">
                        <a href="/findid" onClick={(e) => { e.preventDefault(); handleFindId(); }}>아이디 찾기</a>
                        <a href="/findpw" onClick={(e) => { e.preventDefault(); handleFindPw(); }}>비밀번호 찾기</a>
                        <a href="/signup" onClick={(e) => { e.preventDefault(); handleSignup(); }}>회원가입</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
