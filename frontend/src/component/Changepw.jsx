import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./Changepw.css";

const Changepw = () => {
    const [formData, setFormData] = useState({
        userId: '',
        newPassword: '',
        confirmNewPassword: '',
    });

    const [passwordMatchMessage, setPasswordMatchMessage] = useState(''); // 비밀번호 일치 여부 메시지 상태
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // 비밀번호 확인 로직
        if (name === 'confirmNewPassword' || name === 'newPassword') {
            if (
                (name === 'confirmNewPassword' && value === formData.newPassword) ||
                (name === 'newPassword' && value === formData.confirmNewPassword)
            ) {
                setPasswordMatchMessage('비밀번호가 일치합니다.');
            } else {
                setPasswordMatchMessage('비밀번호가 일치하지 않습니다.');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { userId, newPassword, confirmNewPassword } = formData;

        // 입력값 검증
        if (!userId || !newPassword || !confirmNewPassword) {
            alert('모든 필드를 입력해주세요.');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            alert('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
            return;
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_DB_URL}/users/password/change`, {
                userId,
                newPassword,
            });

            if (response.status === 200) {
                alert('비밀번호 변경이 완료되었습니다.');
                navigate('/'); // 로그인 페이지로 이동
            }
        } catch (error) {
            console.error('비밀번호 변경 실패:', error);
            alert('비밀번호 변경 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="changepw-container">
            <button className="changepw-close-btn" onClick={() => navigate("/")}>X</button>
            <h1 className="changepw-title">비밀번호 변경</h1>
            <form onSubmit={handleSubmit}>

                <div class='changepw-form'>
                    <label className='cp-id'>아이디</label>
                    <input
                        type="text"
                        name="userId"
                        placeholder="아이디를 입력하세요"
                        className="changepw-id"
                        value={formData.userId}
                        onChange={handleChange}
                        required
                    />
                        <label className='cp-pw1'>새 비밀번호</label>
                        <div>
                            <input
                                type="password"
                                name="newPassword"
                                placeholder="새 비밀번호를 입력하세요"
                                className="changepw-pw1"
                                value={formData.newPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <label className='cp-pw2'>새 비밀번호 확인</label>
                            <input
                                type="password"
                                name="confirmNewPassword"
                                placeholder="새 비밀번호를 다시 입력하세요"
                                className="changepw-pw2"
                                value={formData.confirmNewPassword}
                                onChange={handleChange}
                                required
                            />
                    <div>
                        <p>{passwordMatchMessage}</p> {/* 비밀번호 일치 여부 메시지 출력 */}
                    </div>
                    <button type="submit"
                        className="changepw_btn"
                        disabled={passwordMatchMessage !== '비밀번호가 일치합니다.'
                        }>
                        변경 완료
                    </button>
                </div >
            </form>
        </div>

    );
};

export default Changepw;