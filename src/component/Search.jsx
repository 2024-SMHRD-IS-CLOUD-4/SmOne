import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Search.css";
import MyPage from "./MyPage";
import PatientJoin from "./PatientJoin";
// import XrayImage from "./x-ray.png";
import Loading from "./Loading";
import LogoImage from "./teamlogo.png";

function Search() {
  const [showMyPage, setShowMyPage] = useState(false);
  const [showPatientJoin, setShowPatientJoin] = useState(false);
  const [image, setImage] = useState(null);
  const [setImagePanelImage] = useState(null); // image-panel 업로드 이미지
  const [searchInput, setSearchInput] = useState(""); // 이름 검색 상태
  const [searchInputbirth, setSearchInputbirth] = useState(""); // 생년월일 검색 상태
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const patientList = [
    { name: "김철수", birth: "900101", phone: "010-1234-5678", address: "서울시 강남구" },
    { name: "김철수", birth: "900102", phone: "010-1234-5678", address: "서울시 강남구" },
    { name: "김철수", birth: "900103", phone: "010-1234-5678", address: "서울시 강남구" },
    { name: "김철수", birth: "900104", phone: "010-5678-1234", address: "광주시 북구" },
    { name: "김철수", birth: "900105", phone: "010-1234-5678", address: "서울시 강남구" },
    { name: "김철수", birth: "900106", phone: "010-2222-3333", address: "부산시 해운대구" },
    { name: "김철수", birth: "900107", phone: "010-1234-5678", address: "서울시 강남구" },
    { name: "김철수", birth: "900108", phone: "010-2222-3333", address: "부산시 해운대구" },
    { name: "김지수", birth: "000000", phone: "010-1234-5678", address: "서울시 강남구" },
    { name: "김지수", birth: "000101", phone: "010-1111-2222", address: "대전시 동구" },
    { name: "김지수", birth: "000202", phone: "010-1111-2222", address: "대전시 동구" },
    { name: "김지수", birth: "000303", phone: "010-1234-5678", address: "서울시 강남구" },
    { name: "최승찬", birth: "880505", phone: "010-1111-2222", address: "대전시 동구" },
    { name: "최승찬", birth: "880505", phone: "010-1111-2222", address: "대전시 동구" },
    { name: "최승찬", birth: "880505", phone: "010-2222-3333", address: "부산시 해운대구" },
    { name: "최승찬", birth: "880505", phone: "010-1234-5678", address: "서울시 강남구" },
    { name: "박영희", birth: "850707", phone: "010-5678-1234", address: "광주시 북구" },
    { name: "양윤성", birth: "950312", phone: "010-1234-5678", address: "서울시 강남구" },
    { name: "정현지", birth: "990102", phone: "010-2222-3333", address: "부산시 해운대구" },
  ];

  const toggleMyPage = () => {
    setShowMyPage((prevState) => !prevState);
    setShowPatientJoin(false);
  };

  const togglePatientJoin = () => {
    setShowPatientJoin((prevState) => !prevState);
    setShowMyPage(false);
  };

  const handleSearchChange = () => {
    const nameQuery = searchInput.trim();
    const birthQuery = searchInputbirth.trim();


    // 조건: 이름은 2글자 이상, 생년월일은 1글자 이상
    if (nameQuery.length < 2 && birthQuery.length < 1) {
      setSearchResults([]);
      return;
    }

    const filteredResults = patientList.filter((patient) => {
      const matchesName = nameQuery === "" || patient.name.includes(nameQuery);
      const matchesBirth = birthQuery === "" || patient.birth.includes(birthQuery);
      return matchesName && matchesBirth; // 이름과 생년월일 모두 일치하거나 하나만 일치
    });

    setSearchResults(filteredResults);
  };



  const handleDiagnosisClick = () => {
    if (!image) {
      alert("이미지를 업로드해주세요!");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate("/Result", { state: { uploadedImage: image } });
    }, 3000);
  };

  return (
    <div>
      <video className="video-background" autoPlay muted loop>
        <source src="video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="container">
        <header className="header">
          <div className="logo-container">
            <img
              src={LogoImage}
              alt="I Lung View Logo"
              className="logo"
              onClick={() => {
                setShowMyPage(false);
                setShowPatientJoin(false);
                setImage(null); // 업로드된 이미지 초기화
                setImagePanelImage(null); // 패널에 업로드된 이미지 초기화
                navigate("/Search");
              }}
              style={{ cursor: "pointer" }}
            />
            <button className="smart-button" onClick={toggleMyPage}>
              스마트인재개발원
            </button>
          </div>
          <button className="print-button" onClick={handleDiagnosisClick}>
            <img src={require("./stethoscope.png")} alt="Stethoscope Icon" />
            진단하기
          </button>
        </header>

        <div className="main">
          <div className="left-panel">
            <div
              className="search-bar"
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <input
                  type="text"
                  placeholder="이름을 입력하세요"
                  className="search-input1"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    handleSearchChange();
                  }}
                />
                <input
                  type="text"
                  placeholder="생년월일 6자리를 입력하세요"
                  className="search-input2"
                  value={searchInputbirth}
                  onChange={(e) => {
                    setSearchInputbirth(e.target.value);
                    handleSearchChange();
                  }}
                />
              </div>
              {/* 검색 버튼 */}
              <button className="search-button" onClick={handleSearchChange}>
                상세검색
              </button>
            </div>
            {searchResults.length > 0 && (
              <ul className="search-results">
                {searchResults.map((result, index) => (
                  <li key={index} className="search-result-item">
                    {result.name} - {result.birth}
                  </li>
                ))}
              </ul>
            )}
            <div className="patient-info-header">
              <span className="patient-info-title">환자 정보</span>
              <button className="add-patient-button" onClick={togglePatientJoin}>
                환자 등록
              </button>
            </div>
            <div className="patient-info-container">
              <div className="patient-info-row">환자 번호: 001</div>
              <div className="patient-info-row">환자 성명: 김지수</div>
              <div className="patient-info-row">생년월일: 920208</div>
              <div className="patient-info-row">연락처: 010-2188-7111</div>
              <div className="patient-info-row">주소: 광주광역시 동구 중앙로 196</div>
            </div>
            <div className="diagnosis-date-header">
              <span className="diagnosis-date-title">진단 날짜</span>
            </div>
            <div className="diagnosis-date-container">
              <div className="diagnosis-date-row">2025-01-13</div>
            </div>
          </div>
          <div
            className={`right-panel ${isLoading ? "loading-mode" : ""} ${showMyPage || showPatientJoin ? "show-my-page" : ""
              }`}
          >
            {isLoading ? (
              <Loading />
            ) : (
              <>
                {showMyPage && <MyPage />}
                {showPatientJoin && <PatientJoin />}
                {!showMyPage && !showPatientJoin && (
                  <div className="upload-area">


                  </div>
                )}
                <div className="diagnosis-info2">
                  Search
                </div>
              </>
            )}
          </div>
        </div>
        <footer className="footer"></footer>
      </div>
    </div>
  );
}

export default Search;
