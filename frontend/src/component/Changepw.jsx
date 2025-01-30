import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
            const response = await axios.post('http://localhost:8090/SmOne/api/users/password/change', {
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
        <div>
            <h2>비밀번호 변경</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>아이디</label>
                    <input
                        type="text"
                        name="userId"
                        placeholder="아이디를 입력하세요"
                        value={formData.userId}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>새 비밀번호</label>
                    <input
                        type="password"
                        name="newPassword"
                        placeholder="새 비밀번호를 입력하세요"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>새 비밀번호 확인</label>
                    <input
                        type="password"
                        name="confirmNewPassword"
                        placeholder="새 비밀번호를 다시 입력하세요"
                        value={formData.confirmNewPassword}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <p>{passwordMatchMessage}</p> {/* 비밀번호 일치 여부 메시지 출력 */}
                </div>
                <button type="submit" disabled={passwordMatchMessage !== '비밀번호가 일치합니다.'}>
                    변경 완료
                </button>
            </form>
        </div>
    );
};

export default Changepw;