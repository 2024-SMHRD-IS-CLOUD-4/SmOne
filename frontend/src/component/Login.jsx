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
            const response = await axios.post(`${process.env.REACT_APP_DB_URL}/users/login`, formData, {
                withCredentials: true,
            });
            if (response.status === 200) {
                alert('로그인 성공!');
                navigate('/main');
            } else {
                alert(`로그인 실패 (DB 연결 성공): ${response.data}`);
            }
        } catch (error) {
            console.error('Error:', error);
            if (error.response) {
                alert(`로그인 실패 (DB 연결 실패): ${error.response.data}`);
            } else {
                alert(`서버와 연결할 수 없습니다. DB URL: ${process.env.REACT_APP_DB_URL}`);
                console.log('현재 DB URL:', process.env.REACT_APP_DB_URL);
            }
        }
     };

    const handleSignup = () => {
        navigate('/signup');
    };

    const handleFindId = () => {
        navigate('/find-id');
    };

    const handleFindPw = () => {
        navigate('/find-pw');
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
                            type="text2"
                            id="userId"
                            name="userId"
                            placeholder="아이디 입력"
                            value={formData.userId}
                            onChange={handleChange}
                            required
                        />
                        <label htmlFor="userPw"></label>
                        <input
                            type="password2"
                            id="userPw"
                            name="userPw"
                            placeholder="비밀번호 입력"
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
