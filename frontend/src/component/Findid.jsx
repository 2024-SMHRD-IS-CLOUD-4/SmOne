import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Findid.css";

const Findid = () => {
    const [formData, setFormData] = useState({
        centerId: "",
        userName: "",
        role: "의사",
        emailId: "",
        emailDomain: "",
    });

    const [foundUserId, setFoundUserId] = useState("");
    const navigate = useNavigate();

    // 입력값 변경 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // 아이디 찾기 요청
    const handleFindId = async () => {
        const { centerId, userName, role, emailId, emailDomain } = formData;

        // 입력값 검증
        if (!centerId.trim()) {
            alert("센터명을 입력해주세요.");
            return;
        }
        if (!userName.trim()) {
            alert("관리자명을 입력해주세요.");
            return;
        }
        if (!emailId.trim() || !emailDomain.trim()) {
            alert("이메일을 입력해주세요.");
            return;
        }

        // 이메일 조합
        const finalEmail = `${emailId}@${emailDomain}`;
        const sendData = { centerId, userName, role, email: finalEmail };

        console.log("전송 데이터:", sendData);

        try {
            const response = await axios.post(`${process.env.REACT_APP_DB_URL}/users/findid`, sendData);
            if (response && response.data) {
                setFoundUserId(response.data);
                alert(`아이디를 찾았습니다: ${response.data}`);
            } else {
                alert("알 수 없는 오류가 발생했습니다.");
            }
        } catch (error) {
            console.error("아이디 찾기 오류:", error);
            if (error.response && error.response.status === 404) {
                alert("입력하신 정보와 일치하는 아이디가 없습니다.");
            } else {
                alert("아이디를 찾는 중 오류가 발생했습니다.");
            }
        }
    };

    // 확인 버튼 -> 로그인 페이지 이동
    const handleConfirm = () => {
        navigate("/");
    };

    return (
        <div>
            {/* 비디오 배경 유지 */}
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
                                className="centername_input"
                                placeholder="센터명을 입력하세요"
                                value={formData.centerId}
                                onChange={handleChange}
                                required
                            />

                        </div>

                        <label htmlFor="admin-name"></label>
                        <div className="input-row">
                            <input
                                type="text"
                                name="userName"
                                id="admin-name"
                                className="centeradmin_name"
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
                            <label htmlFor="email"></label>
                            <div className="flex-row">
                                <input
                                    type="text"
                                    name="emailId"
                                    id="email-id"
                                    className="email-input"
                                    placeholder="이메일 아이디"
                                    value={formData.emailId}
                                    onChange={handleChange}
                                    required
                                />
                                <span className="at-symbol">@</span>
                                <input
                                    type="text"
                                    name="emailDomain"
                                    id="email-domain"
                                    className="email-input"
                                    placeholder="도메인 (ex: gmail.com)"
                                    value={formData.emailDomain}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                        <button type="button" onClick={handleFindId} className="pass-button">
                            아이디 찾기
                        </button>
                    </form><br></br>

                    {foundUserId && (
                        <div>
                            <p>찾은 아이디: <strong>{foundUserId}</strong></p><br />
                            <button onClick={handleConfirm} className="pass-button0">확인</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Findid;
