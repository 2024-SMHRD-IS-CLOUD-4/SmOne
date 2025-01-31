import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Main.css";
import Menu from "./Menu"; // Menu 컴포넌트 추가

function Main() {
  const [showMypage, setShowMypage] = useState(false);
  const [showPatientJoin, setShowPatientJoin] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePanelImage, setImagePanelImage] = useState(null); // image-panel 업로드 이미지
  const [searchInput, setSearchInput] = useState(""); // 이름 검색 상태
  const [searchInputbirth, setSearchInputbirth] = useState(""); // 생년월일 검색 상태
  const [searchResults, setSearchResults] = useState([]); // 검색 결과 상태를 추가
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [showMyPage, setShowMyPage] = useState(false); // MyPage 표시 상태 추가

  const [patients, setPatients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [nameSearch, setNameSearch] = useState("");
  const [birthSearch, setBirthSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 5;
  const [sideOpen, setSideOpen] = useState(false);

  const [oldImages, setOldImages] = useState([]);
  const [oldBigPreview, setOldBigPreview] = useState(null);

  const [newImages, setNewImages] = useState([]);
  const [newBigPreview, setNewBigPreview] = useState(null);
  const newFileInputRef = useRef(null);

  const [diagnosisMessage, setDiagnosisMessage] = useState("");

  const [diagDates, setDiagDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [datePage, setDatePage] = useState(1);
  const datesPerPage = 5;

  // Load patients
  useEffect(() => {
    axios.get("http://localhost:8090/SmOne/api/patients")
      .then(res => {
        setPatients(res.data);
        setFiltered(res.data);
      })
      .catch(err => console.error(err));
  }, []);

  // Search
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const f = patients.filter(p => {
      const nm = nameSearch ? p.pName.includes(nameSearch) : true;
      const bt = birthSearch ? p.birth.startsWith(birthSearch) : true;
      return nm && bt;
    });
    setFiltered(f);
    setCurrentPage(1);
  };
  const totalPages = Math.ceil(filtered.length / patientsPerPage);
  const indexOfLast = currentPage * patientsPerPage;
  const indexOfFirst = indexOfLast - patientsPerPage;
  const currentPatients = filtered.slice(indexOfFirst, indexOfLast);

  const goFirst = () => setCurrentPage(1);
  const goLast = () => setCurrentPage(totalPages);
  const goPrev = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const goNext = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const handlePageChange = (p) => setCurrentPage(p);

  // X-ray by date
  const handleDateClick = async (dateStr, thePatient) => {
    if (!thePatient) {
      alert("환자를 먼저 선택해주세요.");
      return;
    }
    try {
      const r = await axios.get(`http://localhost:8090/SmOne/api/xray/byDate?pIdx=${thePatient.pIdx}&date=${dateStr}`);
      setOldImages(r.data);
      setOldBigPreview(null);
      setSelectedDate(dateStr);
    } catch (e) {
      console.error(e);
      alert("날짜별 X-ray 조회 실패");
    }
  };

  // Patient click
  const handlePatientClick = async (pt) => {
    setSelectedPatient(pt);
    setOldImages([]);
    setOldBigPreview(null);
    setNewImages([]);
    setNewBigPreview(null);
    setDiagnosisMessage("");
    setDiagDates([]);
    setSelectedDate(null);
    setDatePage(1);

    try {
      const r2 = await axios.get(`http://localhost:8090/SmOne/api/xray/dates?pIdx=${pt.pIdx}`);
      setDiagDates(r2.data);
      if (r2.data && r2.data.length > 0) {
        const firstDate = r2.data[0];
        setSelectedDate(firstDate);
        handleDateClick(firstDate, pt);
      }
    } catch (e) {
      console.error(e);
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
  const handleRemoveNewImage = (id) => {
    if (!window.confirm("이 이미지를 삭제하시겠습니까?")) return;
    setNewImages(prev => prev.filter(x => x.id !== id));
    const target = newImages.find(x => x.id === id);
    if (target && target.previewUrl === newBigPreview) {
      setNewBigPreview(null);
    }
  };

  // Diagnose
  const handleDiagnose = async () => {
    if (!selectedPatient) {
      alert("환자를 먼저 선택하세요.");
      return;
    }
    if (newImages.length === 0) {
      alert("X-ray 이미지를 등록하세요.");
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
    navigate("/Patientedit"); // Patientedit.jsx로 이동
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
    <div className="main-container">
      {/* 상단 바 */}
      <div className="top-bar">
      <img src={teamLogo} alt="Team Logo" className="main-team-logo" onClick={handleLogoClick} style={{ cursor: "pointer" }} />
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="이름을 입력하세요"
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
          />
          <input
            type="text"
            placeholder="생년월일 6자리를 입력하세요"
            value={birthSearch}
            onChange={(e) => setBirthSearch(e.target.value)}
          />
          <button type="submit">검색</button>
        </form>
        <button className="diagnose-top-btn" onClick={handleDiagnose}>
          진단하기
        </button>
      </div>

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
          

          <div className="date-list-container panel-block" style={{ marginTop: "10px" }}>
            <DateList
              diagDates={diagDates}
              currentPage={datePage}
              setCurrentPage={setDatePage}
              datesPerPage={datesPerPage}
              onDateClick={(dateStr) => handleDateClick(dateStr, selectedPatient)}
            />
          </div>
        </div>

        {/* 오른쪽 패널 */}
        <div className="right-panel">
          <div className="xray-panel">
            <div className="xray-header">
              <h2 style={{ marginTop: 0 }}>X-ray 등록</h2>
              {topRightElement}
            </div>

            {!selectedPatient ? (
              <>
                <p>선택한 환자: (없음)</p>
                <span className="new-patient-info">
                  신규 환자 (기존 X-ray 없음)
                </span>
                <FirstVisitUI
                  newImages={newImages}
                  setNewImages={setNewImages}
                  newBigPreview={newBigPreview}
                  setNewBigPreview={setNewBigPreview}
                  handleNewPhotoRegister={handleNewPhotoRegister}
                  handleNewFileChange={handleNewFileChange}
                  handleRemoveNewImage={handleRemoveNewImage}
                  diagnosisMessage={diagnosisMessage}
                  newFileInputRef={newFileInputRef}
                />
              </>
            ) : (
              oldImages.length === 0 ? (
                <>
                  <p>선택한 환자: {selectedPatient.pName}</p>
                  <span className="new-patient-info">
                    신규 환자 (기존 X-ray 없음)
                  </span>
                  <FirstVisitUI
                    newImages={newImages}
                    setNewImages={setNewImages}
                    newBigPreview={newBigPreview}
                    setNewBigPreview={setNewBigPreview}
                    handleNewPhotoRegister={handleNewPhotoRegister}
                    handleNewFileChange={handleNewFileChange}
                    handleRemoveNewImage={handleRemoveNewImage}
                    diagnosisMessage={diagnosisMessage}
                    newFileInputRef={newFileInputRef}
                  />
                </>
              ) : (
                <>
                  <p>
                    선택한 환자: {selectedPatient.pName} <br />
                    최초 내원일: {earliestDate} / 최종 내원일: {latestDate}
                  </p>
                  <SecondVisitUI
                    oldImages={oldImages}
                    setOldImages={setOldImages}
                    oldBigPreview={oldBigPreview}
                    setOldBigPreview={setOldBigPreview}

                    newImages={newImages}
                    setNewImages={setNewImages}
                    newBigPreview={newBigPreview}
                    setNewBigPreview={setNewBigPreview}

                    handleNewPhotoRegister={handleNewPhotoRegister}
                    handleNewFileChange={handleNewFileChange}
                    handleRemoveNewImage={handleRemoveNewImage}
                    diagnosisMessage={diagnosisMessage}
                    newFileInputRef={newFileInputRef}
                    selectedDate={selectedDate}
                    patientName={selectedPatient.pName}
                    earliestDate={earliestDate}
                    latestDate={latestDate}
                  />
                </>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
