import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./Findid.css";

const Findid = () => {

    const [formData, setFormData] = useState({
        centerId: '',
        userName: '',
        role: '의사',
        email: '',
    });

    const [userId, setUserId] = useState('');
    const navigate = useNavigate();

    // 입력값 변경 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // 아이디 찾기 요청 핸들러
    const handleFindId = async () => {
        const { centerId, userName, role, email } = formData;

        // 입력값 검증
        if (!centerId || !userName || !role || !email) {
            alert('모든 필드를 입력해주세요.');
            return;
        }

        console.log('전송 데이터:', formData);

        try {
            const response = await axios.post('http://localhost:8090/SmOne/api/users/findid', formData);
            if (response && response.data) {
                setUserId(response.data);
                alert(`아이디를 찾았습니다: ${response.data}`);
            } else {
                alert('알 수 없는 오류가 발생했습니다.');
            }

        } catch (error) {
            console.error('아이디 찾기 오류:', error);
            if (error.response && error.response.status === 404) {
                alert('입력하신 정보와 일치하는 아이디가 없습니다.');
            } else {
                alert('아이디를 찾는 중 오류가 발생했습니다.');
            }
        }
    };

    // 확인 버튼 핸들러
    const handleConfirm = () => {
        navigate('/'); // 로그인 페이지로 이동
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
                    <h1>FIND ID</h1>
                    <form>
                        <div className="input-findid">
                            <label htmlFor="center-name"></label>
                            <input
                                type="text"
                                name="centerId"
                                id="center-name"
                                placeholder="센터명을 입력하세요"
                                value={formData.centerId}
                                onChange={handleChange}
                                required
                                style={{ width: '430px', height: '35px' }}
                            />

                            <label htmlFor="email"></label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                placeholder="이메일 주소를 입력하세요"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                style={{ width: '430px', height: '35px' }}
                            />
                        </div>

                        <label htmlFor="admin-name"></label>
                        <div className="input-row">
                            <input
                                type="text"
                                name="userName"
                                id="admin-name"
                                placeholder="관리자명을 입력하세요"
                                value={formData.userName}
                                onChange={handleChange}
                                required
                            />
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="select-box"
                            >
                                <option value="의사">의사</option>
                                <option value="관리자">관리자</option>
                            </select>
                        </div>

                        <button type="button" onClick={handleFindId} className="pass-button">
                            아이디 찾기
                        </button>
                    </form>

                    {userId && (
                        <div>
                            <p>찾은 아이디: <strong>{userId}</strong></p>
                            <button onClick={handleConfirm} className="pass-button">확인</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Findid;