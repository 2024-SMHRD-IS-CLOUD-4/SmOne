import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./Changepw.css";
import hiddenIcon from './png/001.png';
import visibleIcon from './png/002.png';

const Changepw = () => {
    const [formData, setFormData] = useState({
        userId: '',
        newPassword: '',
        confirmNewPassword: '',
    });

    const [passwordError, setPasswordError] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState("");
    const [shake, setShake] = useState(false);
    const [passwordMatchMessage, setPasswordMatchMessage] = useState("");
    const [isConfirmTouched, setIsConfirmTouched] = useState(false);
    const [containerHeight, setContainerHeight] = useState("450px");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordIconTop, setPasswordIconTop] = useState("95px");
    const navigate = useNavigate();

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
            validatePassword(value);
        }

        if (name === "confirmNewPassword") {
            setIsConfirmTouched(true);
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
                navigate('/');
            }
        } catch (error) {
            console.error('비밀번호 변경 실패:', error);
            alert('비밀번호 변경 중 오류가 발생했습니다.');
        }
    };

    const validatePassword = (password) => {
        const hasLetter = /[a-zA-Z]/.test(password);
        const isValidLength = password.length >= 5 && password.length <= 12;

        if (!hasLetter || !isValidLength) {
            setPasswordError(true);
            setShake(true);
            setPasswordMessage("비밀번호는 영문 포함 5~12자여야 합니다.");
            setTimeout(() => setShake(false), 500);
            return false;
        }

        setPasswordError(false);
        setPasswordMessage("");
        return true;
    };

    useEffect(() => {
        if (passwordMessage && passwordMatchMessage) {
            setContainerHeight("500px");
        } else {
            setContainerHeight("450px");
        }
    }, [passwordMessage, passwordMatchMessage]);

    useEffect(() => {
        if (passwordMessage) {
          setPasswordIconTop("132px");
        } else {
          setPasswordIconTop("95px");
        }
      }, [passwordMessage]);

      useEffect(() => {
        if (passwordMessage) {
          setContainerHeight("470px");
        } else {
          setContainerHeight("450px");
        }
      }, [passwordMessage]);


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
                        onBlur={() => setIsConfirmTouched(true)}
                    />

                    <button type="button" className="toggle-password-btn" onClick={toggleConfirmPasswordVisibility}>
                        <img
                            src={showConfirmPassword ? visibleIcon : hiddenIcon}
                            alt={showConfirmPassword ? "비밀번호 보임" : "비밀번호 숨김"}
                            className="password-icon password-icon-pw4"
                            onClick={toggleConfirmPasswordVisibility}
                            style={{ top: passwordIconTop }}
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