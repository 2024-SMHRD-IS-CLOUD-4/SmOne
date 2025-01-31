import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Main.css";
import Menu from "./Menu"; // Menu 컴포넌트 추가
import MyPage from "./Mypage";

import DateList from "./Xray/DateList";
import FirstVisitUI from "./Xray/FirstVisitUI";
import SecondVisitUI from "./Xray/SecondVisitUI";
import teamLogo from "./teamlogo.png"; // 로고 이미지 추가

const Main = () => {
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
  const handleLogoClick = () => {
    setSelectedPatient(null);
    setOldImages([]);
    setOldBigPreview(null);
    setNewImages([]);
    setNewBigPreview(null);
    setDiagnosisMessage("");
    setDiagDates([]);
    setSelectedDate(null);
    setDatePage(1);
  };
  // Logout
  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:8090/SmOne/api/users/logout", {}, { withCredentials: true });
      // alert("로그아웃 성공!");
      navigate("/");
    } catch (e) {
      console.error(e);
      alert("로그아웃 실패");
    }
  };

  // New X-ray
  const handleNewPhotoRegister = () => {
    if (!selectedPatient) {
      alert("환자를 먼저 선택하세요.");
      return;
    }
    if (newImages.length >= 5) {
      alert("최대5장까지만 등록 가능합니다.");
      return;
    }
    newFileInputRef.current.click();
  };
  const handleNewFileChange = (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const fs = e.target.files;
    const temp = [];
    for (let i = 0; i < fs.length; i++) {
      if (newImages.length + temp.length >= 5) {
        alert("5장 초과 불가");
        break;
      }
      const file = fs[i];
      const previewUrl = URL.createObjectURL(file);
      temp.push({ id: Date.now() + i, file, previewUrl });
    }
    setNewImages(prev => [...prev, ...temp]);
    e.target.value = null;
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
    try {
      const f = new FormData();
      f.append("pIdx", selectedPatient.pIdx);
      newImages.forEach(item => f.append("files", item.file));

      await axios.post("http://localhost:8090/SmOne/api/xray/diagnose", f, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("진단 완료! (RESULT=null)");
      setDiagnosisMessage("진단내용 및 진단을 내린 대략적인 이유");

      const r2 = await axios.get(`http://localhost:8090/SmOne/api/xray/dates?pIdx=${selectedPatient.pIdx}`);
      setDiagDates(r2.data);
      setDatePage(1);
      if (r2.data && r2.data.length > 0) {
        const fd = r2.data[0];
        setSelectedDate(fd);
        handleDateClick(fd, selectedPatient);
      }
    } catch (err) {
      console.error("업로드 실패:", err);
      alert("업로드 실패");
    }
  };

  // Edit / Delete
  const handleEditPatient = (thePatient) => {
    navigate(`/patients/edit/${thePatient.pIdx}`);
  };
  const handleDeletePatient = async (thePatient) => {
    const c = window.confirm(`정말로 [${thePatient.pName}] 환자를 삭제하시겠습니까?`);
    if (!c) return;
    try {
      await axios.delete(`http://localhost:8090/SmOne/api/patients/${thePatient.pIdx}`);
      alert("삭제되었습니다.");
      const newRes = await axios.get("http://localhost:8090/SmOne/api/patients");
      setPatients(newRes.data);
      setFiltered(newRes.data);
      setSelectedPatient(null);
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };



  // earliestDate / latestDate
  let earliestDate = null;
  let latestDate = null;
  if (diagDates && diagDates.length > 0) {
    latestDate = diagDates[0];
    earliestDate = diagDates[diagDates.length - 1];
  }

  const topRightElement = (
    <div style={{ color: "#ccc", fontSize: "14px" }}>
      * 최대5장, 현재 {newImages.length}장
    </div>
  );

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

      {/* 사이드 메뉴 */}
      <div className={`side-menu ${sideOpen ? "open" : ""}`}>
        <button className="menu-item" onClick={() => navigate("/mypage")}>
          마이 페이지
        </button>
        <button className="menu-item" onClick={handleLogout}>
          로그아웃
        </button>
      </div>

      {/* 본문 */}
      <div className="main-content">
        <div className="menu-container">
          <Menu
            onPatientClick={handlePatientClick}
          />
        </div>
        {/* 왼쪽 패널 */}
        <div className="left-panel">
          <h2 style={{ marginTop: 0 }}>환자 정보</h2>
          <ul className="patient-list panel-block">
            {currentPatients.length > 0 ? (
              currentPatients.map((pt, idx) => (
                <li key={pt.pIdx || idx} onClick={() => handlePatientClick(pt)}>
                  {pt.pName} - {pt.birth.slice(0, 6)}-****** ({pt.tel})
                </li>
              ))
            ) : (
              <li>등록된 환자 정보가 없습니다.</li>
            )}
          </ul>

          <div className="pagination">
            <button onClick={goFirst} disabled={currentPage === 1}>{"<<"}</button>
            <button onClick={goPrev} disabled={currentPage === 1}>{"<"}</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
              <button
                key={num}
                onClick={() => handlePageChange(num)}
                style={{ backgroundColor: currentPage === num ? "#ccc" : "#fff" }}
              >
                {num}
              </button>
            ))}
            <button onClick={goNext} disabled={currentPage === totalPages}>{">"}</button>
            <button onClick={goLast} disabled={currentPage === totalPages}>{">>"}</button>
          </div>

          {selectedPatient && (
            <div className="patient-detail">
              <h3 style={{ marginTop: 0 }}>환자 상세 정보</h3>
              <p>환자 번호: {selectedPatient.pIdx}</p>
              <p>환자 이름: {selectedPatient.pName}</p>
              <p>생년월일: {selectedPatient.birth}</p>
              <p>연락처: {selectedPatient.tel}</p>
              <p>주소: {selectedPatient.pAdd}</p>

              <button className="btn" onClick={() => handleEditPatient(selectedPatient)}>
                수정
              </button>
              <button className="btn" onClick={() => handleDeletePatient(selectedPatient)}>
                삭제
              </button>
            </div>
          )}

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
