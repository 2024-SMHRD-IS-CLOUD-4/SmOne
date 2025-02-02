import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Main.css";

import Menu from "./Menu";
import DateList from "./Xray/DateList";
import FirstVisitUI from "./Xray/FirstVisitUI";
import SecondVisitUI from "./Xray/SecondVisitUI";
import teamLogo from "./png/teamlogo.png";
import stethoscopeIcon from "./png/stethoscope.png";
import magnifyingGlassIcon from "./png/magnifying-glass.png";

function Main() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [nameSearch, setNameSearch] = useState("");
  const [birthSearch, setBirthSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const searchRef = useRef(null);
  const newFileInputRef = useRef(null);
  const patientsPerPage = 5;

  // 선택된 환자
  const [selectedPatient, setSelectedPatient] = useState(null);

  // 사이드 메뉴 열림 여부
  const [sideOpen, setSideOpen] = useState(false);

  // 캐시 (pIdx별로 상태 저장)
  const [patientCache, setPatientCache] = useState({});

  // 과거 X-ray
  const [oldImages, setOldImages] = useState([]);
  const [oldBigPreview, setOldBigPreview] = useState(null);
  const [selectedOldImage, setSelectedOldImage] = useState(null);

  // 신규 X-ray
  const [newImages, setNewImages] = useState([]);
  const [newBigPreview, setNewBigPreview] = useState(null);
  const [selectedNewImage, setSelectedNewImage] = useState(null);

  // 파일 입력 ref
  const fileInputRef = useRef(null);

  // 날짜 목록
  const [diagDates, setDiagDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [datePage, setDatePage] = useState(1);
  const datesPerPage = 5;

  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const toggleSearchBar = () => {
    setIsSearchVisible(!isSearchVisible);
  };


  // 환자 목록 불러오기
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_DB_URL}/patients`)
      .then(res => {
        // pIdx 큰 순으로 정렬
        const sorted = [...res.data].sort((a, b) => b.pIdx - a.pIdx);
        setPatients(sorted);
        setFiltered(sorted);
      })
      .catch(err => console.error(err));
  }, []);
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchVisible(false); // 외부 클릭 시 검색창 닫기
      }
    }

    if (isSearchVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchVisible]);
  
  // 검색
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const f = patients.filter((p) => {
      console.log("검색 실행:", nameSearch, birthSearch);
      const nameOk = nameSearch ? p.pName.includes(nameSearch) : true;
      const birthOk = birthSearch ? p.birth.startsWith(birthSearch) : true;
      return nameOk && birthOk;
    });
    setFiltered(f);
    setCurrentPage(1);
  };

  // 페이지네이션
  const totalPages = Math.ceil(filtered.length / patientsPerPage);
  const indexOfLast = currentPage * patientsPerPage;
  const indexOfFirst = indexOfLast - patientsPerPage;
  const currentPatients = filtered.slice(indexOfFirst, indexOfLast);

  const goFirst = () => setCurrentPage(1);
  const goLast = () => setCurrentPage(totalPages);
  const goPrev = () => setCurrentPage(p => Math.max(p - 1, 1));
  const goNext = () => setCurrentPage(p => Math.min(p + 1, totalPages));
  const handlePageChange = (p) => setCurrentPage(p);

  // 캐시 저장
  function storeCurrentPatientStateToCache(pIdx) {
    if (!pIdx) return;
    setPatientCache(prev => ({
      ...prev,
      [pIdx]: {
        diagDates,
        selectedDate,
        oldImages,
        selectedOldImage,
        oldBigPreview,
        newImages,
        selectedNewImage,
        newBigPreview
      }
    }));
  }
  const handleLogoClick = () => {
    setSelectedPatient(null);
    setOldImages([]);
    setOldBigPreview(null);
    setNewImages([]);
    setNewBigPreview(null);
    setDiagDates([]);
    setSelectedDate(null);
    setDatePage(1);
  };
  // 캐시 복원
  async function restorePatientStateFromCache(pIdx, newlyLoadedDates = []) {
    const data = patientCache[pIdx];
    if (!data) {
      // 캐시 없으면 초기화
      setDiagDates(newlyLoadedDates);
      setSelectedDate(null);
      setOldImages([]);
      setSelectedOldImage(null);
      setOldBigPreview(null);
      setNewImages([]);
      setSelectedNewImage(null);
      setNewBigPreview(null);
      return;
    }
    // 있으면 복원
    const finalDates = newlyLoadedDates.length > 0 ? newlyLoadedDates : (data.diagDates || []);
    setDiagDates(finalDates);
    setSelectedDate(data.selectedDate || null);
    setOldImages(data.oldImages || []);
    setSelectedOldImage(data.selectedOldImage || null);
    setOldBigPreview(data.oldBigPreview || null);
    setNewImages(data.newImages || []);
    setSelectedNewImage(data.selectedNewImage || null);
    setNewBigPreview(data.newBigPreview || null);


    // 날짜별 X-ray 다시 로드
    if (data.selectedDate) {
      try {
        const x = await axios.get(
          `${process.env.REACT_APP_DB_URL}/xray/byDate?pIdx=${pIdx}&date=${data.selectedDate}`
        );
        setOldImages(x.data);
        const foundBig = x.data.find(m => m.bigXray != null);
        if (foundBig) {
          setSelectedOldImage(foundBig);
          setOldBigPreview(`${process.env.REACT_APP_DB_URL2}/images/${foundBig.bigXray}`);
        } else if (data.selectedOldImage) {
          const found = x.data.find(m => m.imgIdx === data.selectedOldImage.imgIdx);
          if (found) {
            setSelectedOldImage(found);
            setOldBigPreview(`${process.env.REACT_APP_DB_URL2}/images/${found.imgPath}`);
          } else {
            setSelectedOldImage(null);
            setOldBigPreview(null);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  // 환자 클릭
  async function handlePatientClick(pt) {
    // 기존 환자 상태 캐시
    if (selectedPatient) {
      storeCurrentPatientStateToCache(selectedPatient.pIdx);
    }
    setSelectedPatient(pt);

    let loadedDates = [];
    try {
      const r = await axios.get(`${process.env.REACT_APP_DB_URL}/xray/dates?pIdx=${pt.pIdx}`);
      loadedDates = r.data;
    } catch (e) {
      console.error(e);
    }

    // 캐시 있으면 복원, 없으면 초기화
    if (patientCache[pt.pIdx]) {
      restorePatientStateFromCache(pt.pIdx, loadedDates);
    } else {
      setDiagDates(loadedDates);
      setSelectedDate(null);
      setOldImages([]);
      setSelectedOldImage(null);
      setOldBigPreview(null);
      setNewImages([]);
      setSelectedNewImage(null);
      setNewBigPreview(null);

      // 날짜 목록 있으면 자동으로 최신 날짜
      if (loadedDates.length > 0) {
        const newest = loadedDates[0];
        setSelectedDate(newest);
        try {
          const x = await axios.get(
            `${process.env.REACT_APP_DB_URL}/xray/byDate?pIdx=${pt.pIdx}&date=${newest}`
          );
          setOldImages(x.data);
          const foundBig = x.data.find(m => m.bigXray != null);
          if (foundBig) {
            setSelectedOldImage(foundBig);
            setOldBigPreview(`${process.env.REACT_APP_DB_URL2}/images/${foundBig.bigXray}`);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }

  // 날짜 클릭
  async function handleDateClick(dateStr, thePatient) {
    if (!thePatient) return;
    try {
      const r = await axios.get(
        `${process.env.REACT_APP_DB_URL}/xray/byDate?pIdx=${thePatient.pIdx}&date=${dateStr}`
      );
      setOldImages(r.data);
      setSelectedDate(dateStr);

      const foundBig = r.data.find(m => m.bigXray != null);
      if (foundBig) {
        setSelectedOldImage(foundBig);
        setOldBigPreview(`${process.env.REACT_APP_DB_URL2}/images/${foundBig.bigXray}`);
      } else {
        if (selectedOldImage) {
          const found = r.data.find(m => m.imgIdx === selectedOldImage.imgIdx);
          if (found) {
            setSelectedOldImage(found);
            setOldBigPreview(`${process.env.REACT_APP_DB_URL2}/images/${found.imgPath}`);
          } else {
            setSelectedOldImage(null);
            setOldBigPreview(null);
          }
        } else {
          setOldBigPreview(null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  // 로그아웃
  async function handleLogout() {
    const ok = window.confirm("정말 로그아웃하시겠습니까?");
    if (!ok) return;
    try {
      await axios.post(
        `${process.env.REACT_APP_DB_URL}/users/logout`,
        {},
        { withCredentials: true }
      );
      navigate("/");
    } catch (e) {
      console.error(e);
      window.alert("로그아웃 실패");
    }
  }

  // 신규 사진 등록(파일 선택)
  function handleNewPhotoRegister() {
    if (!selectedPatient) {
      window.alert("환자를 먼저 선택하세요.");
      return;
    }
    if (newImages.length >= 5) {
      window.alert("최대5장까지만 등록 가능합니다.");
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  function handleFileChange(e) {
    if (!e.target.files || e.target.files.length === 0) return;
    const fs = e.target.files;
    const temp = [];
    for (let i = 0; i < fs.length; i++) {
      if (newImages.length + temp.length >= 5) {
        window.alert("5장 초과 업로드 불가");
        break;
      }
      const file = fs[i];
      const previewUrl = URL.createObjectURL(file);
      temp.push({ id: Date.now() + i, file, previewUrl });
    }
    setNewImages(prev => [...prev, ...temp]);
    e.target.value = null;
  }

  function handleRemoveNewImage(id) {
    const ok = window.confirm("이 이미지를 삭제하시겠습니까?");
    if (!ok) return;
    setNewImages(prev => prev.filter(x => x.id !== id));
    const target = newImages.find(x => x.id === id);
    if (target && target.previewUrl === newBigPreview) {
      setNewBigPreview(null);
      setSelectedNewImage(null);
    }
  }

  // 진단하기 -> 업로드 후 -> Result 페이지로 이동
  async function handleDiagnose() {
    if (!selectedPatient) {
      alert("환자를 먼저 선택하세요.");
      return;
    }

    if (newImages.length > 0) {
      if (!selectedNewImage) {
        alert("신규 X-ray 중 한 장을 클릭(확대)해야 진단 가능합니다.");
        return;
      }
      try {
        // 1) 업로드
        const formData = new FormData();
        formData.append("pIdx", selectedPatient.pIdx);

        newImages.forEach(obj => {
          formData.append("files", obj.file);
        });

        const bigFilename = selectedNewImage.file.name;
        formData.append("bigFilename", bigFilename);

        await axios.post(
          `${process.env.REACT_APP_DB_URL}/xray/diagnose`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        // 2) (예시) AI 결과
        const aiResult = "AI 예측 결과: 이상소견 없음 (예시)";

        // 3) 결과 페이지로 이동
        navigate("/result", {
          state: {
            patient: selectedPatient,
            newlyUploaded: newImages.map(img => img.file.name),
            bigFilename,
            aiResult
          }
        });

      } catch (err) {
        console.error(err);
        alert("업로드 중 오류 발생");
      }
    } else {
      alert("신규 X-ray가 없습니다. (진단 불가)");
    }
  }

  // 환자 수정/삭제
  function handleEditPatient(thePatient) {
    navigate(`/patients/edit/${thePatient.pIdx}`);
  }
  async function handleDeletePatient(thePatient) {
    const ok = window.confirm(`정말 [${thePatient.pName}] 환자를 삭제?`);
    if (!ok) return;
    try {
      await axios.delete(`${process.env.REACT_APP_DB_URL}patients/${thePatient.pIdx}`);
      const newList = await axios.get(`${process.env.REACT_APP_DB_URL}/patients`);
      const sorted = [...(await newList).data].sort((a, b) => b.pIdx - a.pIdx);
      setPatients(sorted);
      setFiltered(sorted);
      setSelectedPatient(null);
      window.alert(`환자 [${thePatient.pName}] 삭제 완료`);
    } catch (e) {
      console.error(e);
      window.alert("삭제 중 오류 발생");
    }
  }

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
      <Menu /> {/* Menu.jsx를 왼쪽에 배치 */}
      {/* 상단 바 */}
      <div className="top-bar" ref={searchRef}>
        {/* 돋보기 버튼 */}
        {!isSearchVisible && (
          <button className="search-toggle-button" onClick={toggleSearchBar}>
            <img src={magnifyingGlassIcon} alt="검색" className="search-icon" />
          </button>
        )}
        {/* 검색 바 (isSearchVisible이 true일 때만 표시) */}
        {isSearchVisible && (
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
            <button type="submit" className="search-button">
              <img src={magnifyingGlassIcon} alt="검색" className="search-icon" />
            </button>
          </form>
        )}

        {/* 진단하기 버튼 */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <button className="diagnose-top-btn" onClick={handleDiagnose} disabled={newImages.length > 0 && !selectedNewImage}>
            <img src={stethoscopeIcon} alt="진단 아이콘" className="stethoscope-icon" />
            진단하기
          </button>
          {(newImages.length > 0 && !selectedNewImage) && (
            <p style={{ margin: "5px 0 0", color: "yellow", fontSize: "14px" }}>
              등록한 X-ray 중 한 장을 클릭(확대)해야 진단 가능합니다.
            </p>
          )}
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="main-content">
        {/* 왼쪽 패널: 환자 목록, 검색결과 */}
        <div className="left-panel">

          <ul className="patient-list panel-block">
            <h2 style={{ marginTop: 5, marginLeft: 10 }}>환자 정보</h2>
            {currentPatients.length > 0 ? (
              currentPatients.map((pt, idx) => (
                <li key={pt.pIdx || idx} onClick={() => handlePatientClick(pt)}>
                  {pt.pName} - {pt.birth.slice(0, 6)}-****** ({pt.tel})
                </li>
              ))
            ) : (
              <li>등록된 환자 정보가 없습니다.</li>
            )}

            {/* Pagination을 patient-list 안으로 이동 */}
            <li className="pagination-container">
              <div className="pagination">
                <button onClick={goFirst} disabled={currentPage === 1}>{"<<"}</button>
                <button onClick={goPrev} disabled={currentPage === 1}>{"<"}</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                  <button
                    key={num}
                    onClick={() => handlePageChange(num)}
                    className={currentPage === num ? "active" : ""}
                  >
                    {num}
                  </button>
                ))}
                <button onClick={goNext} disabled={currentPage === totalPages}>{">"}</button>
                <button onClick={goLast} disabled={currentPage === totalPages}>{">>"}</button>
              </div>
            </li>
          </ul>


          {selectedPatient && (
            <div className="patient-detail">
              <h2 style={{ marginTop: 0 }}>환자 상세 정보</h2>
              <p>환자 번호 : {selectedPatient.pIdx}</p>
              <p>환자 이름 : {selectedPatient.pName}</p>
              <p>생년월일 : {selectedPatient.birth}</p>
              <p>연락처 : {selectedPatient.tel}</p>
              <p>주소 : {selectedPatient.pAdd}</p>

              <button className="btn" onClick={() => handleEditPatient(selectedPatient)} style={{ fontWeight: "bold" }} >수정</button>
              <button className="btn" onClick={() => handleDeletePatient(selectedPatient)} style={{ fontWeight: "bold" }} >삭제</button>
            </div>
          )}

          {/* 날짜 리스트 */}
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

        {/* 오른쪽 패널: X-ray 등록 */}
        <div className="right-panel">
          <div className="xray-panel">
            <div className="xray-header">
              <h2 style={{ marginTop: 0 }}>X-ray 등록</h2>
              {topRightElement}
            </div>

            {/* 환자 미선택 or 과거 없음 => FirstVisitUI */}
            {!selectedPatient ? (
              <>
                <p>선택한 환자: (없음)</p>
                <span className="new-patient-info">신규 환자 (기존 X-ray 없음)</span>
                <FirstVisitUI
                  newImages={newImages}
                  setNewImages={setNewImages}
                  newBigPreview={newBigPreview}
                  setNewBigPreview={setNewBigPreview}
                  selectedNewImage={selectedNewImage}
                  setSelectedNewImage={setSelectedNewImage}
                  handleNewPhotoRegister={handleNewPhotoRegister}
                  handleRemoveNewImage={handleRemoveNewImage}
                />
              </>
            ) : oldImages.length === 0 ? (
              <>
                <p>선택한 환자: {selectedPatient.pName}</p>
                <span className="new-patient-info">신규 환자 (기존 X-ray 없음)</span>
                <FirstVisitUI
                  newImages={newImages}
                  setNewImages={setNewImages}
                  newBigPreview={newBigPreview}
                  setNewBigPreview={setNewBigPreview}
                  selectedNewImage={selectedNewImage}
                  setSelectedNewImage={setSelectedNewImage}
                  handleNewPhotoRegister={handleNewPhotoRegister}
                  handleRemoveNewImage={handleRemoveNewImage}
                />
              </>
            ) : (
              <>
                <p>
                  선택한 환자: {selectedPatient.pName}<br />
                  최초 내원일: {earliestDate} / 최종 내원일: {latestDate}
                </p>
                <SecondVisitUI
                  oldImages={oldImages}
                  setOldImages={setOldImages}
                  oldBigPreview={oldBigPreview}
                  setOldBigPreview={setOldBigPreview}
                  selectedOldImage={selectedOldImage}
                  setSelectedOldImage={setSelectedOldImage}

                  newImages={newImages}
                  setNewImages={setNewImages}
                  newBigPreview={newBigPreview}
                  setNewBigPreview={setNewBigPreview}
                  selectedNewImage={selectedNewImage}
                  setSelectedNewImage={setSelectedNewImage}
                  handleNewPhotoRegister={handleNewPhotoRegister}
                  handleRemoveNewImage={handleRemoveNewImage}

                  selectedDate={selectedDate}
                  patientName={selectedPatient.pName}
                  earliestDate={earliestDate}
                  latestDate={latestDate}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* 파일 인풋 (hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
}

export default Main;
