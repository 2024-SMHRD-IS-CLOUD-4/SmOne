import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Result.css";
import MyPage from "./MyPage";
import PatientJoin from "./PatientJoin";
import XrayImage from "./x-ray.png";
import Loading from "./Loading";
import LogoImage from "./teamlogo.png";

function Result() {
  const location = useLocation();
  const [showMyPage, setShowMyPage] = useState(false);
  const [showPatientJoin, setShowPatientJoin] = useState(false);
  const [image, setImage] = useState(location.state?.uploadedImage || null);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const patientList = [
    "김철수",
    "김지수",
    "김시윤",
    "최승찬",
    "정현지",
    "박영호",
    "양윤성",
    "박영희",
    "이민수",
    "김순",
    "최영호",
    "홍길동",
  ];

  const toggleMyPage = () => {
    setShowMyPage((prevState) => !prevState);
    setShowPatientJoin(false);
  };

  const togglePatientJoin = () => {
    setShowPatientJoin((prevState) => !prevState);
    setShowMyPage(false);
  };

  const resetToResult = () => {
    setShowMyPage(false);
    setShowPatientJoin(false);
    setSearchResults([]);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchInput(query);

    if (query.trim() === "") {
      setSearchResults([]);
    } else {
      const filteredResults = patientList.filter((patient) =>
        patient.includes(query)
      );
      setSearchResults(filteredResults);
    }
  };

  const handleDiagnosisClick = () => {
    if (!image) {
      alert("이미지를 업로드해주세요!");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate("/NextStep", { state: { uploadedImage: image } });
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
            {/* 로고 이미지로 변경 */}
          <img
            src={LogoImage}
            alt="I Lung View Logo"
            className="logo"
            onClick={() => navigate("/Main")} // 클릭 시 메인 화면으로 이동
            style={{ cursor: "pointer" }}
          />
          <button className="print-button" onClick={handleDiagnosisClick}>
            <img src={require("./printerimg.png")} alt="Stethoscope Icon" />
            출력하기
          </button>
        </header>
        <div className="main">
          <div className="left-panel">
            <div className="search-bar">
              <input
                type="text"
                placeholder="환자이름을 입력하세요"
                className="search-input"
                value={searchInput}
                onChange={handleSearchChange}
              />
              <button className="search-button">검색</button>
            </div>
            <button className="smart-button" onClick={toggleMyPage}>
              스마트인재개발원
            </button>
            {searchResults.length > 0 && (
              <ul className="search-results">
                {searchResults.map((result, index) => (
                  <li key={index} className="search-result-item">
                    {result}
                  </li>
                ))}
              </ul>
            )}
            <div className="patient-info-header">
              <span className="patient-info-title">환자 정보</span>
              <button
                className="add-patient-button"
                onClick={togglePatientJoin}
              >
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
              isLoading ? "loading-mode" : ""
            } ${showMyPage || showPatientJoin ? "show-my-page" : ""}`}
          >
            {isLoading ? (
              <Loading />
            ) : (
              <>
                {showMyPage && <MyPage />}
                {showPatientJoin && <PatientJoin />}
                {!showMyPage && !showPatientJoin && (
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
                      <img src={XrayImage} alt="X-ray" className="xray-image" />
                    </div>
                  </div>
                )}
                {!showMyPage && !showPatientJoin && !isLoading && (
                  <div className="diagnosis-info">
                    폐렴 확률 90% 이상 고위험 환자입니다. 
                    빠른 시일내에 병원을 방문하기를 권장합니다.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <footer className="footer"></footer>
      </div>
    </div>
  );
}

export default Result;
