import React, { useState } from "react";
import "./MyPage.css"; // 기존 CSS 파일 사용

function MyPage() {
  const [userRole, setUserRole] = useState("보건소 관리자");
  const [zipcode, setZipcode] = useState("12345");
  const [address, setAddress] = useState("서울특별시 강남구");

  const handleZipcodeSearch = () => {
    // 주소 검색 로직 추가 (예: API 호출 또는 모달 열기)
    const newZipcode = prompt("우편번호를 입력하세요:", "12345"); // 임시 로직
    const newAddress = prompt("주소를 입력하세요:", "서울특별시 강남구"); // 임시 로직
    if (newZipcode) setZipcode(newZipcode);
    if (newAddress) setAddress(newAddress);
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
          <input
            type="text"
            id="user-role"
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
          />

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
