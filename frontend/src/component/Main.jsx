import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Main.css";
import MyPage from "./MyPage";
import PatientJoin from "./PatientJoin";
import Patientedit from "./Patientedit";
// import XrayImage from "./x-ray.png";
import Loading from "./Loading";
import LogoImage from "./teamlogo.png";
import Menu from "./Menu"; // Menu 컴포넌트 추가

function Main() {
  const [showMyPage, setShowMyPage] = useState(false);
  const [showPatientJoin, setShowPatientJoin] = useState(false);
  const [showPatientedit, setShowPatientedit] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePanelImage, setImagePanelImage] = useState(null); // image-panel 업로드 이미지
  const [searchInput, setSearchInput] = useState(""); // 이름 검색 상태
  const [searchInputbirth, setSearchInputbirth] = useState(""); // 생년월일 검색 상태
  const [searchResults, setSearchResults] = useState([]); // 검색 결과 상태를 추가
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1); // State for the current page
  const patientsPerPage = 5; // Number of patients per page
  const [boxImages, setBoxImages] = useState(Array(5).fill(null)); // 박스 5개의 초기 상태



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
    setShowPatientedit(false); // PatientJoin 비활성화
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
    setShowPatientedit(false);
  };
  const toggleMyPage = () => {
    setShowMyPage((prevState) => !prevState);
    setShowPatientJoin(false);
  };

  const togglePatientJoin = () => {
    setShowPatientJoin((prevState) => !prevState);
    setShowMyPage(false);
  };

  const handleBoxImageUpload = (event, index) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      const updatedImages = [...boxImages];
      updatedImages[index] = imageUrl;
      setBoxImages(updatedImages);
    }
  };
  const handleBoxImageClick = (event, index) => {
    // 박스에 이미지가 있는 경우 업로드 창을 차단
    if (boxImages[index]) {
      event.preventDefault(); // 기본 동작 차단
      setImage(boxImages[index]); // 패널 이미지로 설정
    }
  };
  const [panelBoxImages, setPanelBoxImages] = useState(Array(5).fill(null)); // image-panel의 5개 박스 초기 상태

  const handlePanelBoxImageUpload = (event, index) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      const updatedImages = [...panelBoxImages];
      updatedImages[index] = imageUrl;
      setPanelBoxImages(updatedImages);
    }
  };

  const handlePanelBoxImageClick = (index) => {
    if (panelBoxImages[index]) {
      setImagePanelImage(panelBoxImages[index]); // 클릭한 이미지가 image-panel-upload에 표시되도록 설정
    }
  };

  const handleRemovePanelBoxImage = (index) => {
    const updatedImages = [...panelBoxImages];
    updatedImages[index] = null; // 해당 박스의 이미지를 삭제
    setPanelBoxImages(updatedImages);
  };

  const handleRemoveBoxImage = (index) => {
    const updatedImages = [...boxImages];
    updatedImages[index] = null; // 해당 박스의 이미지를 삭제
    setBoxImages(updatedImages);
  };

  const handlePatientClick = () => {
    setShowPatientJoin(true);
    setShowMyPage(false);
  };
  const handleSearchChange = (nameQuery, birthQuery) => {
    nameQuery = nameQuery.trim(); // 이름 검색 값
    birthQuery = birthQuery.trim(); // 생년월일 검색 값
  
    if (!nameQuery && !birthQuery) {
      setSearchResults([]); // 검색 조건이 없으면 빈 결과로 설정
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
  const handleEditPatient = () => {
    setShowPatientedit(true); // ✅ 추가
    setShowMyPage(false);
    setShowPatientJoin(false);
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
                setShowPatientedit(false);
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
              className="search-input1"
              onChange={(e) => {
                setSearchInput(e.target.value);
                handleSearchChange(e.target.value, searchInputbirth);
              }}
            />
            <input
              type="text"
              placeholder="생년월일 6자리를 입력하세요"
              value={searchInputbirth}
              className="search-input2"
              onChange={(e) => {
                setSearchInputbirth(e.target.value);
                handleSearchChange(searchInput, e.target.value);
              }}
            />
            <button className="search-button" onClick={handleSearchChange}>검색</button>
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
                        <span> {patient.name}</span> |{" "}
                        <span> {patient.birth}</span> |{" "}
                        <span> {patient.phone}</span>
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
                      <span> {patient.name}</span> |{" "}
                      <span> {patient.birth}</span> |{" "}
                      <span> {patient.phone}</span>
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
              <button className="edit-patient-button" onClick={handleEditPatient}>
                환자 수정
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
            className={`right-panel ${isLoading ? "loading-mode" : ""} ${showMyPage || showPatientJoin || showPatientedit ? "show-my-page" : ""
              }`}
          >
            {isLoading ? (
              <Loading />
            ) : (
              <>
                {showMyPage && <MyPage />}
                {showPatientJoin && <PatientJoin />}
                {showPatientedit && <Patientedit />}
                {!showMyPage && !showPatientJoin &&  !showPatientedit &&(
                  <div className="upload-area">
                    <div className="diagnosis">
                      <label htmlFor="image-upload" className="upload-box">
                        {image ? (
                          <img src={image} alt="Uploaded Image" className="uploaded-image" />
                        ) : (
                          <span>과거 X-Ray 사진을<br /> 올려주세요</span>
                        )}
                      </label>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleImageUpload}
                      />
                      {/* 박스 5개 추가 */}
                      <div className="upload-box-row">
                        {[...Array(5)].map((_, index) => (
                          <div
                            key={index}
                            className="upload-box-item"
                            onClick={() => {
                              if (boxImages[index]) {
                                setImage(boxImages[index]); // 클릭한 이미지가 image-upload에 표시되도록 설정
                              }
                            }}
                          >
                            <label htmlFor={`box-upload-${index}`} style={{ cursor: 'pointer' }}>
                              {boxImages[index] ? (
                                <img
                                  src={boxImages[index]}
                                  alt={`Box ${index + 1}`}
                                  style={{ marginLeft: '5px', width: '90%', height: '90%', borderRadius: '5px' }}
                                />
                              ) : (
                                <span>X-ray {index + 1}</span>
                              )}
                            </label>
                            {boxImages[index] && (
                              <button
                                className="remove-image-button"
                                onClick={(e) => {
                                  e.stopPropagation(); // 버튼 클릭 시 부모 클릭 이벤트 차단
                                  handleRemoveBoxImage(index);
                                }}
                              >
                                X
                              </button>
                            )}
                            {!boxImages[index] && (
                              <input
                                id={`box-upload-${index}`}
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={(event) => handleBoxImageUpload(event, index)}
                              />
                            )}
                          </div>
                        ))}
                      </div>


                    </div>
                    <div className="current-image-panel">
                      <label htmlFor="image-panel-upload" className="upload-box">
                        {imagePanelImage ? (
                          <img
                            src={imagePanelImage}
                            alt="Uploaded to Panel"
                            className="uploaded-image"
                          />
                        ) : (
                          <span> 현재 X-Ray 사진을<br /> 올려주세요</span>
                        )}
                      </label>
                      <input
                        id="image-panel-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImagePanelUpload}
                        style={{ display: "none" }}
                      />
                      {/* 5개의 박스 추가 */}
                      <div className="upload-box-row">
                        {[...Array(5)].map((_, index) => (
                          <div
                            key={index}
                            className="upload-box-item"
                            onClick={() => handlePanelBoxImageClick(index)} // 클릭 이벤트
                          >
                            <label htmlFor={`panel-box-upload-${index}`} style={{ cursor: 'pointer' }}>
                              {panelBoxImages[index] ? (
                                <img
                                  src={panelBoxImages[index]}
                                  alt={`Panel Box ${index + 1}`}
                                  style={{ marginLeft: '5px', width: '90%', height: '90%', borderRadius: '5px' }}
                                />
                              ) : (
                                <span>X-ray {index + 1}</span>
                              )}
                            </label>
                            {panelBoxImages[index] && (
                              <button
                                className="remove-image-button"
                                onClick={(e) => {
                                  e.stopPropagation(); // 버튼 클릭 시 부모 클릭 이벤트 차단
                                  handleRemovePanelBoxImage(index);
                                }}
                              >
                                X
                              </button>
                            )}
                            {!panelBoxImages[index] && (
                              <input
                                id={`panel-box-upload-${index}`}
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={(event) => handlePanelBoxImageUpload(event, index)}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

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
