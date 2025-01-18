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
  const [setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const patientList = [
    { name: "김철수", birth: "900101" },
    { name: "김철수", birth: "900102" },
    { name: "김철수", birth: "900103" },
    { name: "김철수", birth: "900104" },
    { name: "김철수", birth: "900105" },
    { name: "김철수", birth: "900106" },
    { name: "김철수", birth: "900107" },
    { name: "김철수", birth: "900108" },
    { name: "김지수", birth: "000000" },
    { name: "김지수", birth: "000101" },
    { name: "김지수", birth: "000202" },
    { name: "김지수", birth: "000303" },
    { name: "최승찬", birth: "880505" },
    { name: "최승찬", birth: "880505" },
    { name: "최승찬", birth: "880505" },
    { name: "최승찬", birth: "880505" },
    { name: "박영희", birth: "850707" },
    { name: "윤지성", birth: "990101" },
    { name: "양윤성", birth: "950312" },
    { name: "정현지", birth: "990102" },
  ];

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
  };

  const handleImagePanelUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImagePanelImage(imageUrl);
    }
  };

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

    if (!nameQuery && !birthQuery) {
      // 이름과 생년월일 모두 입력하지 않았을 경우
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
    if (!imagePanelImage) {
      alert("이미지를 업로드해주세요!");
      return;
    }

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
            <button className="smart-button" onClick={toggleMyPage}>
              스마트인재개발원
            </button>
          </div>
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
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <input
                type="text"
                placeholder="생년월일 6자리를 입력하세요"
                className="search-input2"
                value={searchInputbirth}
                onChange={(e) => setSearchInputbirth(e.target.value)}
              />
            </div>
            {/* Search button */}
            <button className="search-button" onClick={handleSearchChange}>
              검색
            </button>
          </div>
          <button className="print-button" onClick={handleDiagnosisClick}>
            <img src={require("./stethoscope.png")} alt="Stethoscope Icon" />
            진단하기
          </button>
        </header>

        <div className="main">
        <div className="menu-container">
          <Menu />
        </div>
          <div className="left-panel">
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
                    <span>+</span>
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
