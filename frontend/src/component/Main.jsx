import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Main.css";
import MyPage from "./MyPage";
import PatientJoin from "./PatientJoin";
// import XrayImage from "./x-ray.png";
import Loading from "./Loading";
import LogoImage from "./teamlogo.png";
import Menu from "./Menu"; // Menu 컴포넌트 추가

function Main() {
  const [showMyPage, setShowMyPage] = useState(false);
  const [showPatientJoin, setShowPatientJoin] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePanelImage, setImagePanelImage] = useState(null); // image-panel 업로드 이미지
  const [searchInput, setSearchInput] = useState(""); // 이름 검색 상태
  const [searchInputbirth, setSearchInputbirth] = useState(""); // 생년월일 검색 상태
  const [searchResults, setSearchResults] = useState([]); // 검색 결과 상태를 추가
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1); // State for the current page
  const patientsPerPage = 5; // Number of patients per page



  const patientList = [
    { name: "김철수", birth: "900101", phone: "010-1234-5678" },
    { name: "김철수", birth: "900102", phone: "010-1234-5678" },
    { name: "김철수", birth: "900103", phone: "010-1234-5678" },
    { name: "김철수", birth: "900104", phone: "010-1234-5678" },
    { name: "김철수", birth: "900105", phone: "010-1234-5678" },
    { name: "김철수", birth: "900106", phone: "010-1234-5678" },
    { name: "김철수", birth: "900107", phone: "010-1234-5678" },
    { name: "김철수", birth: "900108", phone: "010-1234-5678" },
    { name: "김지수", birth: "000000", phone: "010-1234-5678" },
    { name: "김지수", birth: "000101", phone: "010-1234-5678" },
    { name: "김지수", birth: "000202", phone: "010-1234-5678" },
    { name: "김지수", birth: "000303", phone: "010-1234-5678" },
    { name: "최승찬", birth: "880505", phone: "010-1234-5678" },
    { name: "최승찬", birth: "880505", phone: "010-1234-5678" },
    { name: "최승찬", birth: "880505", phone: "010-1234-5678" },
  ];
  const totalPages = Math.ceil(patientList.length / patientsPerPage); // Total number of pages

  // Get patients for the current page
  const currentPatients = patientList.slice(
    (currentPage - 1) * patientsPerPage,
    currentPage * patientsPerPage
  );

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
  };
  const handleHomeClick = () => {
    setShowMyPage(false); // MyPage 비활성화
    setShowPatientJoin(false); // PatientJoin 비활성화
  };
  const handleImagePanelUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImagePanelImage(imageUrl);
    }
  };
  const handleProfileClick = () => {
    setShowMyPage(true); // Profile 클릭 시 MyPage 활성화
    setShowPatientJoin(false);
  };
  const toggleMyPage = () => {
    setShowMyPage((prevState) => !prevState);
    setShowPatientJoin(false);
  };

  const togglePatientJoin = () => {
    setShowPatientJoin((prevState) => !prevState);
    setShowMyPage(false);
  };


  const handlePatientClick = () => {
    setShowPatientJoin(true);
    setShowMyPage(false);
  };
  const handleSearchChange = () => {
    const nameQuery = searchInput.trim(); // 이름 검색 값
    const birthQuery = searchInputbirth.trim(); // 생년월일 검색 값

    if (!nameQuery && !birthQuery) {
      // 이름과 생년월일 모두 입력하지 않았을 경우
      setSearchResults([]);
      return;
    }

    // 조건에 따라 환자 리스트 필터링
    const filteredResults = patientList.filter((patient) => {
      const matchesName = nameQuery === "" || patient.name.includes(nameQuery);
      const matchesBirth =
        birthQuery === "" || patient.birth.startsWith(birthQuery); // 생년월일 앞자리만 체크
      return matchesName && matchesBirth; // 이름과 생년월일 모두 일치하는 경우
    });

    setSearchResults(filteredResults);
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
  };

  const handleDiagnosisClick = () => {
    if (!imagePanelImage) {
      alert("이미지를 업로드해주세요!");
      return;
    }// 현재 보여줄 환자 리스트 (검색 결과 혹은 전체 리스트)
    const currentPatients = (searchResults.length > 0 ? searchResults : patientList).slice(
      (currentPage - 1) * patientsPerPage,
      currentPage * patientsPerPage
    );

    const totalPages = Math.ceil(
      (searchResults.length > 0 ? searchResults.length : patientList.length) / patientsPerPage
    );

    const handlePageChange = (pageNumber) => {
      setCurrentPage(pageNumber);
    };

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate("/Result", {
        state: {
          uploadedImage: image,
          uploadedImagePanel: imagePanelImage,
        },
      });
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
                navigate("/Main");
              }}
              style={{ cursor: "pointer" }}
            />
          </div>

          {/* 검색 창 */}
          <div className="search-bar">
            <input
              type="text"
              placeholder="이름을 입력하세요"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <input
              type="text"
              placeholder="생년월일 6자리를 입력하세요"
              value={searchInputbirth}
              onChange={(e) => setSearchInputbirth(e.target.value)}
            />
            <button onClick={handleSearchChange}>검색</button>
          </div>
          <button className="print-button" onClick={handleDiagnosisClick}>
            <img src={require("./stethoscope.png")} alt="Stethoscope Icon" />
            진단하기
          </button>
        </header>

        <div className="main">
          <div className="menu-container">
            <Menu onProfileClick={handleProfileClick}
              onPatientClick={handlePatientClick}
              onHomeClick={handleHomeClick} />
          </div>
          <div className="left-panel">
            <button className="smart-button" onClick={toggleMyPage}>
              스마트인재개발원
            </button>
            <div className="patient-list-container">
              <h3>환자 리스트</h3>
              <div className="patient-list">
                {searchInput || searchInputbirth ? (
                  // 검색을 수행한 경우
                  searchResults.length > 0 ? (
                    searchResults.map((patient, index) => (
                      <div key={index} className="patient-item">
                        <span>이름: {patient.name}</span> |{" "}
                        <span>생년월일: {patient.birth}</span> |{" "}
                        <span>전화번호: {patient.phone}</span>
                      </div>
                    ))
                  ) : (
                    // 검색 결과가 없을 경우
                    <div className="no-results">
                      일치하는 환자가 없습니다.
                    </div>
                  )
                ) : (
                  // 검색을 하지 않았을 경우 기본 5명의 환자 리스트
                  currentPatients.map((patient, index) => (
                    <div key={index} className="patient-item">
                      <span>이름: {patient.name}</span> |{" "}
                      <span>생년월일: {patient.birth}</span> |{" "}
                      <span>전화번호: {patient.phone}</span>
                    </div>
                  ))
                )}
              </div>

              {/* 페이지네이션 (검색 결과가 없거나 검색을 하지 않았을 때만 표시) */}
              {!searchInput && !searchInputbirth && (
                <div className="pagination">
                  {Array.from({ length: totalPages }, (_, index) => (
                    <button
                      key={index}
                      className={`pagination-button ${currentPage === index + 1 ? "active" : ""
                        }`}
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="patient-info-header">
              <span className="patient-info-title">환자 정보</span>
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
                    <div className="diagnosis">
                      <label htmlFor="image-upload" className="upload-box">
                        {image ? (
                          <img
                            src={image}
                            alt="Uploaded"
                            className="uploaded-image"
                          />
                        ) : (
                          <span>클릭하여 환자의 X-Ray<br></br>사진을 올려주세요</span>
                        )}
                      </label>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: "none" }}
                      />
                    </div>
                    <div className="image-panel">
                      <label htmlFor="image-panel-upload" className="upload-box">
                        {imagePanelImage ? (
                          <img
                            src={imagePanelImage}
                            alt="Uploaded to Panel"
                            className="uploaded-image"
                          />
                        ) : (
                          <span>클릭하여 정상 X-Ray<br></br>사진을 올려주세요</span>
                        )}
                      </label>
                      <input
                        id="image-panel-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImagePanelUpload}
                        style={{ display: "none" }}
                      />
                    </div>
                  </div>
                )}
                {!showMyPage && !showPatientJoin && !isLoading && (
                  <div className="diagnosis-info">
                    진단내용 및 진단을 내린 대략적인 이유
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

export default Main;
