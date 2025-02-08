import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./Changepw.css";
import hiddenIcon from './png/001.png'; // 비밀번호 숨길 때
import visibleIcon from './png/002.png'; // 비밀번호 보일 때




const Changepw = () => {
    const [formData, setFormData] = useState({
        userId: '',
        newPassword: '',
        confirmNewPassword: '',
    });

    const [passwordError, setPasswordError] = useState(false); // 비밀번호 오류 상태
    const [passwordMessage, setPasswordMessage] = useState(""); // 비밀번호 오류 메시지
    const [shake, setShake] = useState(false); // 흔들림 애니메이션
    const [passwordMatchMessage, setPasswordMatchMessage] = useState(""); // 비밀번호 일치 메시지
    const [isConfirmTouched, setIsConfirmTouched] = useState(false); // 새 비밀번호 확인 입력 여부
    const [containerHeight, setContainerHeight] = useState("450px"); // 기본 높이

    const [showPassword, setShowPassword] = useState(false); // 비밀번호 표시 상태
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // 비밀번호 확인 표시 상태
    const [passwordIconTop, setPasswordIconTop] = useState("95px"); // 기본 높이


    const navigate = useNavigate();

    // 👁 비밀번호 보기 버튼 클릭 시 상태 변경
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === "newPassword") {
            validatePassword(value); // 비밀번호 유효성 검사
        }

        if (name === "confirmNewPassword") {
            setIsConfirmTouched(true); // 새 비밀번호 확인 칸이 입력됨을 표시
        }

        if (name === 'confirmNewPassword' || name === 'newPassword') {
            if (formData.newPassword && value === formData.newPassword) {
                setPasswordMatchMessage("비밀번호가 일치합니다.");
            } else {
                setPasswordMatchMessage(isConfirmTouched ? "비밀번호가 일치하지 않습니다." : "");
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

    const validatePassword = (password) => {
        const hasLetter = /[a-zA-Z]/.test(password); // 영문 포함 여부
        const isValidLength = password.length >= 5 && password.length <= 12; // 길이 조건

        if (!hasLetter || !isValidLength) {
            setPasswordError(true);
            setShake(true); // 흔들림 효과
            setPasswordMessage("비밀번호는 영문 포함 5~12자여야 합니다.");
            setTimeout(() => setShake(false), 500); // 흔들림 초기화
            return false;
        }

        setPasswordError(false);
        setPasswordMessage("");
        return true;
    };

    useEffect(() => {
        if (passwordMessage && passwordMatchMessage) {
            setContainerHeight("500px"); // ✅ 두 메시지가 동시에 표시될 때
        } else {
            setContainerHeight("450px"); // ✅ 하나만 표시되거나 없을 때
        }
    }, [passwordMessage, passwordMatchMessage]);

    useEffect(() => {
        if (passwordMessage) {
          setPasswordIconTop("132px"); // 🔺 비밀번호 오류 메시지가 있을 때
        } else {
          setPasswordIconTop("95px"); // 🔻 비밀번호 오류 메시지가 없을 때
        }
      }, [passwordMessage]); // passwordMessage 상태 변경 시 실행

      useEffect(() => {
        if (passwordMessage) {
          setContainerHeight("470px"); // 🔺 비밀번호 오류 메시지가 있을 때
        } else {
          setContainerHeight("450px"); // 🔻 비밀번호 오류 메시지가 없을 때
        }
      }, [passwordMessage]); // passwordMessage 상태 변경 시 실행


    return (
        <div className="changepw-container" style={{ height: containerHeight, height: containerHeight }}>
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
                    <div className={`password-container ${shake ? "shake" : ""}`}>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="newPassword"
                            placeholder="새 비밀번호를 입력하세요"
                            className={`changepw-pw1 ${passwordError ? "error-border1" : ""}`}
                            value={formData.newPassword}
                            onChange={handleChange}
                            required
                        />
                        {/* 👁 비밀번호 보기 버튼 */}
                        <button type="button" className="toggle-password-btn" onClick={togglePasswordVisibility}>
                            <img
                                src={showPassword ? visibleIcon : hiddenIcon}
                                alt={showPassword ? "비밀번호 보임" : "비밀번호 숨김"}
                                className="password-icon password-icon-pw3"
                                onClick={togglePasswordVisibility}
                            />
                        </button>
                    </div>
                    {passwordMessage && <p className="password-error-message">{passwordMessage}</p>}

                    <label className='cp-pw2'>새 비밀번호 확인</label>
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmNewPassword"
                        placeholder="새 비밀번호를 다시 입력하세요"
                        className="changepw-pw2"
                        value={formData.confirmNewPassword}
                        onChange={handleChange}
                        required
                        onBlur={() => setIsConfirmTouched(true)} // 포커스를 잃으면 입력된 것으로 처리
                    />
                    {/* 👁 비밀번호 확인 보기 버튼 */}
                    <button type="button" className="toggle-password-btn" onClick={toggleConfirmPasswordVisibility}>
                        <img
                            src={showConfirmPassword ? visibleIcon : hiddenIcon}
                            alt={showConfirmPassword ? "비밀번호 보임" : "비밀번호 숨김"}
                            className="password-icon password-icon-pw4"
                            onClick={toggleConfirmPasswordVisibility}
                            style={{ top: passwordIconTop }} // 🔥 동적으로 위치 변경
                        />
                    </button>
                    <div>

                        {isConfirmTouched && passwordMatchMessage && (
                            <p className="password-match-message" style={{ marginTop: "18px", marginBottom: "2px" }}>{passwordMatchMessage}</p>
                        )}

                    </div>
                    <button type="submit"
                        className="changepw_btn"
                        style={{ marginTop: "10px", marginBottom: "-15px" }}
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