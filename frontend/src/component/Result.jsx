import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Result.css";
import MyPage from "./MyPage";
import PatientJoin from "./PatientJoin";
import LogoImage from "./teamlogo.png";
import Diagnosis from "./Diagnosis";

function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMyPage, setShowMyPage] = useState(false);
  const [showPatientJoin, setShowPatientJoin] = useState(false);
  const [showDiagnosis, setShowDiagnosis] = useState(false); // Diagnosis 화면 표시 상태
  const [image] = useState(location.state?.uploadedImage || null);
  const [imagePanel] = useState(location.state?.uploadedImagePanel || null);
  const [searchInput, setSearchInput] = useState("");
  const [searchInputbirth, setSearchInputbirth] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const diagnosisRef = useRef(); // Diagnosis 화면을 참조

  const patientList = [
    { name: "김철수", birth: "900101" },
    { name: "김지수", birth: "000101" },
    { name: "최승찬", birth: "880505" },
    { name: "박영희", birth: "850707" },
    { name: "양윤성", birth: "950312" },
    { name: "정현지", birth: "990102" },
  ];

  const handlePrintClick = () => {
    setShowDiagnosis(true); // Diagnosis 화면 표시
    setTimeout(() => {
      if (diagnosisRef.current) {
        const originalTitle = document.title;
        document.title = "진단서 출력";
        window.print();
        document.title = originalTitle;
      }
    }, 500); // Diagnosis 렌더링 대기
  };

  const toggleMyPage = () => {
    setShowMyPage((prevState) => !prevState);
    setShowPatientJoin(false);
    setShowDiagnosis(false);
  };

  const togglePatientJoin = () => {
    setShowPatientJoin((prevState) => !prevState);
    setShowMyPage(false);
    setShowDiagnosis(false);
  };

  const handleSearchChange = () => {
    const nameQuery = searchInput.trim();
    const birthQuery = searchInputbirth.trim();

    if (!nameQuery && !birthQuery) {
      setSearchResults([]);
      return;
    }

    const filteredResults = patientList.filter((patient) => {
      const matchesName = nameQuery === "" || patient.name.includes(nameQuery);
      const matchesBirth = birthQuery === "" || patient.birth.includes(birthQuery);
      return matchesName && matchesBirth;
    });

    setSearchResults(filteredResults);
  };

  return (
    <div>
      <video className="video-background" autoPlay muted loop>
        <source src="video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="container">
        <header className="header">
          <img
            src={LogoImage}
            alt="I Lung View Logo"
            className="logo"
            onClick={() => navigate("/Main")}
            style={{ cursor: "pointer" }}
          />
          <button className="smart-button" onClick={toggleMyPage}>
            스마트인재개발원
          </button>
          <button className="print-button" onClick={handlePrintClick}>
            <img src={require("./printerimg.png")} alt="Stethoscope Icon" />
            출력하기
          </button>
        </header>
        <div className="main">
          <div className="left-panel">
            <div className="search-bar">
              <div>
                <input
                  type="text"
                  placeholder="이름을 입력하세요"
                  className="search-input3"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="생년월일 6자리를 입력하세요"
                  className="search-input4"
                  value={searchInputbirth}
                  onChange={(e) => setSearchInputbirth(e.target.value)}
                />
              </div>
              <button className="search-button" onClick={handleSearchChange}>
                검색
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
              <div className="patient-info-row">생년월일: 000809</div>
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
            className={`right-panel ${
              showMyPage || showPatientJoin || showDiagnosis ? "show-my-page" : ""
            }`}
          >
            {showMyPage && <MyPage />}
            {showPatientJoin && <PatientJoin />}
            {showDiagnosis && (
              <div ref={diagnosisRef} className="centered-container">
                <Diagnosis />
              </div>
            )}
            {!showMyPage && !showPatientJoin && !showDiagnosis && (
              <div className="upload-area">
                <div className="diagnosis">
                  <label htmlFor="image-upload" className="upload-box">
                    {image ? (
                      <img
                        src={image}
                        alt="Uploaded"
                        className="uploaded-image"
                      />
                    ) : (
                      <span>+</span>
                    )}
                  </label>
                </div>
                <div className="image-panel">
                  {imagePanel ? (
                    <img
                      src={imagePanel}
                      alt="Uploaded to Panel"
                      className="uploaded-image"
                    />
                  ) : (
                    <span>No Image Uploaded</span>
                  )}
                </div>
              </div>
            )}
            {!showMyPage && !showPatientJoin && !showDiagnosis && (
              <div className="diagnosis-info">
                폐렴 확률 90% 이상 고위험 환자입니다. 빠른 시일내에 병원을 방문하기를 권장합니다.
              </div>
            )}
          </div>
        </div>
        <footer className="footer"></footer>
      </div>
    </div>
  );
}

export default Result;
