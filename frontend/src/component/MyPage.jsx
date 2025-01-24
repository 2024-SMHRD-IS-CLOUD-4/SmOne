import React, { useState } from "react";
import "./MyPage.css";

function MyPage() {
  const [userRole, setUserRole] = useState("보건소 관리자");
  const [zipcode, setZipcode] = useState("12345");
  const [address, setAddress] = useState("서울특별시 강남구");

  const handleZipcodeSearch = () => {
    const newZipcode = prompt("우편번호를 입력하세요:", "12345"); // 임시 로직
    const newAddress = prompt("주소를 입력하세요:", "서울특별시 강남구"); // 임시 로직
    if (newZipcode) setZipcode(newZipcode);
    if (newAddress) setAddress(newAddress);
  };

  const handlePasswordChange = () => {
    alert("비밀번호 수정 화면으로 이동합니다."); // 비밀번호 수정 로직 추가
  };

  const handleLogout = () => {
    alert("로그아웃 되었습니다."); // 로그아웃 로직 추가
  };

  return (
    <div className="profile-container">
      <header className="profile-header">
        <h1>MY PAGE</h1>
      </header>
      <div className="profile-form-container">
        <form>
          <label htmlFor="user-id">* 사용자 ID</label>
          <input type="text" id="user-id" value="USER123" readOnly />

          <label htmlFor="user-role">사용자 직업</label>
          <select
            type="text"
            id="user-role"
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
            >
            <option value="의사">의사</option>
            <option value="관리자">관리자</option>
        </select>

          <label htmlFor="user-zipcode">기관 주소</label>
          <div className="profile-address-input">
            <input
              type="text"
              id="user-zipcode"
              value={zipcode}
              onChange={(e) => setZipcode(e.target.value)}
            />
            <button type="button" onClick={handleZipcodeSearch}>
              주소 검색
            </button>
          </div>

          <input
            type="text"
            id="user-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <div className="profile-buttons">
            <button type="button">정보 수정</button>
            <button type="button" onClick={handlePasswordChange}>
              비밀번호 수정
            </button>
            <button type="button" className="profile-danger-button">
              탈퇴하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MyPage;
