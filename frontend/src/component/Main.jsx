import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Main.css";

import Menu from "./Menu";
import DateList from "./Xray/DateList";
import FirstVisitUI from "./Xray/FirstVisitUI";
import SecondVisitUI from "./Xray/SecondVisitUI";
import stethoscopeIcon from "./png/stethoscope.png";
import magnifyingGlassIcon from "./png/magnifying-glass.png";
import documentIcon from "./png/document.png"; // 추가
import patientIcon from "./png/patientedit.png";
import trashIcon from "./png/trash.png";
import warningIcon from "./png/warning.png"; // 경고 아이콘 추가
import yellowwarningIcon from "./png/yellowwarning.png";

function Main() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [nameSearch, setNameSearch] = useState("");
  const [birthSearch, setBirthSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const searchRef = useRef(null);
  // const newFileInputRef = useRef(null);
  const patientsPerPage = 5;

  // const userId = sessionStorage.getItem("userId")

  // 선택된 환자
  const [selectedPatient, setSelectedPatient] = useState(null);

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
  const datesPerPage = 2;

  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [hideSearchBar, setHideSearchBar] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [hideDiagnosisWarningModal, setHideDiagnosisWarningModal] = useState(false);
  const [showDiagnosisWarningModal, setShowDiagnosisWarningModal] = useState(false); // ✅ 진단 불가 모달 상태 추가
  const [showNoHistoryModal, setShowNoHistoryModal] = useState(false); // ✅ 과거 진단 기록 없음 모달 상태 추가
  const [hideNoHistoryModal, setHideNoHistoryModal] = useState(false);
  const [showImageDeleteModal, setShowImageDeleteModal] = useState(false); // ✅ 이미지 삭제 확인 모달 상태 추가
  const [imageToDelete, setImageToDelete] = useState(null); // ✅ 삭제할 이미지 상태 추가
  const [showImageWarningModal, setShowImageWarningModal] = useState(false);
  const [hideImageWarningModal, setHideImageWarningModal] = useState(false);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_DB_URL}/patients`)
      .then(res => setPatients(res.data))
      .catch(err => console.error(err));
  }, []);
  const toggleSearchBar = () => {
    if (isSearchVisible) {
      setHideSearchBar(true); // 먼저 fadeOut 애니메이션 실행
      setTimeout(() => {
        setIsSearchVisible(false); // 애니메이션 후 display: none 적용
        setHideSearchBar(false); // 다시 검색 바가 나타날 수 있도록 초기화
      }, 300); // fadeOut 애니메이션 시간 (0.3초)과 동일하게 설정
    } else {
      setIsSearchVisible(true);
    }
  };
  const [showWarningModal, setShowWarningModal] = useState(false); // ✅ 환자 선택 요청 모달 상태 추가const [showWarningModal, setShowWarningModal] = useState(false); // ✅ 환자 선택 요청 모달 상태 추가
  const [hideWarningModal, setHideWarningModal] = useState(false);

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
  },);

  // 이미지 미리보기
  useEffect(() => {
    if (oldImages.length > 0) {
      setOldBigPreview(oldImages[0]?.imgPath || null);
    } else {
      setOldBigPreview(null);
    }
  }, [oldImages]);
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

  const goFirst = () => {
    setCurrentPage(1);
    setPageGroup(1);
  };

  const goLast = () => {
    setCurrentPage(totalPages);
    setPageGroup(totalGroups);
  };

  const goPrev = () => {
    setCurrentPage((prev) => {
      const prevPage = Math.max(prev - 1, 1);
      if (prevPage === 5 || prevPage === 10) {
        setPageGroup((prevGroup) => Math.max(prevGroup - 1, 1));
      }
      return prevPage;
    });
  };

  const goNext = () => {
    setCurrentPage((prev) => {
      const nextPage = Math.min(prev + 1, totalPages);
      if (nextPage === 6 || nextPage === 11) {
        setPageGroup((prevGroup) => prevGroup + 1);
      }
      return nextPage;
    });
  };
  const handlePageChange = (p) => setCurrentPage(p);
  // 페이지네이션에서 현재 보여줄 첫 번째 페이지와 마지막 페이지 계산
  const [pageGroup, setPageGroup] = useState(1);
  const pagesPerGroup = 5;
  const totalGroups = Math.ceil(totalPages / pagesPerGroup);
  const startPage = (pageGroup - 1) * pagesPerGroup + 1;
  const endPage = Math.min(startPage + pagesPerGroup - 1, totalPages);
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
  // [진단하기]
  async function handleDiagnose() {
    if (!selectedPatient) {
      setShowDiagnosisWarningModal(true); // ✅ 모달 표시

      setTimeout(() => {
        setHideDiagnosisWarningModal(true); // ✅ 숨김 애니메이션 적용
        setTimeout(() => {
          setShowDiagnosisWarningModal(false);
          setHideDiagnosisWarningModal(false);
        }, 300); // ✅ 애니메이션 지속 시간 후 제거
      }, 1500); // ✅ 1.5초 후 모달 숨김 시작

      return;
    }
    if (newImages.length === 0) {
      setShowDiagnosisWarningModal(true); // ✅ 진단 불가 모달 표시
      setTimeout(() => {
        setShowDiagnosisWarningModal(false); // ✅ 3초 후 자동 닫힘
      }, 3000);
      return;
    }

    if (!selectedNewImage) {
      alert("등록한 X-ray 중 한 장을 클릭(확대)해야 진단 가능합니다.");
      return;
    }
    navigate("/loading", {
      state: {
        patient: selectedPatient,
        newlyUploaded: newImages.map((img) => img.file.name),
        bigFilename: selectedNewImage.file.name,
      },
    });
    try {
      // 1) 업로드
      const formData = new FormData();
      formData.append("pIdx", selectedPatient.pIdx);
      newImages.forEach((obj) => formData.append("files", obj.file));
      const bigFilename = selectedNewImage.file.name;
      formData.append("bigFilename", bigFilename);

      const response = await axios.post(`${process.env.REACT_APP_DB_URL}/xray/diagnose`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // 2) (임시) AI 결과
      const aiResult = "결핵";

      const imgPaths = response.data.map((item) => item.imgPath);

      // 3) 결과 페이지 이동
      navigate("/result", {
        state: {
          patient: selectedPatient,
          aiResult,
          newlyUploaded: imgPaths,
          bigFilename,
          fromHistory: false,
        },
      });
    } catch (e) {
      console.error(e);
      alert("업로드 중 오류 발생");
    }
  }
  // ✅ 모달 수동 닫기 함수
  const closeDiagnosisWarningModal = () => {
    setHideDiagnosisWarningModal(true); // ✅ 숨김 애니메이션 적용
    setTimeout(() => {
      setShowDiagnosisWarningModal(false);
      setHideDiagnosisWarningModal(false);
    }, 300);
  };
  // ✅ 과거 진단 기록 버튼 클릭 시 실행
  function handleViewOldResult() {
    if (!selectedPatient) {
      setShowWarningModal(true);
      setTimeout(() => {
        setShowWarningModal(false);
      }, 1500);
      return;
    }

    if (!selectedDate) {
      setShowNoHistoryModal(true); // ✅ 모달 표시

      setTimeout(() => {
        setHideNoHistoryModal(true); // ✅ 숨김 애니메이션 적용
        setTimeout(() => {
          setShowNoHistoryModal(false);
          setHideNoHistoryModal(false);
        }, 300); // ✅ 애니메이션 지속 시간 후 제거
      }, 1500); // ✅ 1.5초 후 모달 숨김 시작

      return;
    }

    navigate("/result", {
      state: {
        patient: selectedPatient,
        aiResult: "(이전결과)",
        newlyUploaded: [],
        bigFilename: null,
        fromHistory: true,
        selectedDate,
      },
    });
  }

  // ✅ 모달 수동 닫기 함수
  const closeNoHistoryModal = () => {
    setHideNoHistoryModal(true); // ✅ 숨김 애니메이션 적용
    setTimeout(() => {
      setShowNoHistoryModal(false);
      setHideNoHistoryModal(false);
    }, 300);
  };

  // ✅ 모달 수동 닫기 함수
  const closeWarningModal = () => {
    setHideWarningModal(true); // ✅ 숨김 애니메이션 적용
    setTimeout(() => {
      setShowWarningModal(false);
      setHideWarningModal(false);
    }, 300);
  };
  const closeImageWarningModal = () => {
    setHideImageWarningModal(true);
    setTimeout(() => {
      setShowImageWarningModal(false);
      setHideImageWarningModal(false);
    }, 300);
  };
  // const handleLogoClick = () => {
  //   setSelectedPatient(null);
  //   setOldImages([]);
  //   setOldBigPreview(null);
  //   setNewImages([]);
  //   setNewBigPreview(null);
  //   setDiagDates([]);
  //   setSelectedDate(null);
  //   setDatePage(1);
  // };
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

    if (selectedPatient && selectedPatient.pIdx === pt.pIdx) {
      // ✅ 같은 환자를 다시 클릭하면 초기화
      setSelectedPatient(null);
      setDiagDates([]);
      setSelectedDate(null);
      setOldImages([]);
      setSelectedOldImage(null);
      setOldBigPreview(null);
      setNewImages([]);
      setSelectedNewImage(null);
      setNewBigPreview(null);
      return;
    }

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

  // // 로그아웃
  // async function handleLogout() {
  //   const ok = window.confirm("정말 로그아웃하시겠습니까?");
  //   if (!ok) return;
  //   try {
  //     await axios.post(
  //       `${process.env.REACT_APP_DB_URL}/users/logout`,
  //       {},
  //       { withCredentials: true }
  //     );
  //     navigate("/");
  //   } catch (e) {
  //     console.error(e);
  //     window.alert("로그아웃 실패");
  //   }
  // }

  // 신규 사진 등록(파일 선택)
  function handleNewPhotoRegister() {
    if (!selectedPatient) {
      setShowWarningModal(true); // ✅ 모달 표시
      setTimeout(() => {
        setShowWarningModal(false); // ✅ 3초 후 자동 닫힘
      }, 3000);
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

  // ✅ 이미지 삭제 버튼 클릭 시 모달 표시
  function handleRemoveNewImage(id) {
    const targetImage = newImages.find(x => x.id === id);
    if (!targetImage) return;

    setImageToDelete(targetImage);
    setShowImageDeleteModal(true);
  }

  // ✅ 이미지 삭제 확인 버튼 클릭 시 실행
  const confirmImageDelete = () => {
    if (!imageToDelete) return;

    setNewImages(prev => prev.filter(x => x.id !== imageToDelete.id));

    if (imageToDelete.previewUrl === newBigPreview) {
      setNewBigPreview(null);
      setSelectedNewImage(null);
    }

    setShowImageDeleteModal(false);
    setImageToDelete(null);
  };

  // ✅ 모달 수동 닫기 함수
  const closeImageDeleteModal = () => {
    setShowImageDeleteModal(false);
    setImageToDelete(null);
  };

  // Edit / Delete
  const handleEditPatient = (thePatient) => {
    navigate(`/patients/edit/${thePatient.pIdx}`);
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeletePatient = async (thePatient) => {
    if (isDeleting) return; // ✅ 중복 실행 방지
    setIsDeleting(true);

    const c = window.confirm(`[${thePatient.pName}] 환자를 삭제하시겠습니까?`);
    if (!c) return;
    try {
      await axios.delete(`${process.env.REACT_APP_DB_URL}/patients/${thePatient.pIdx}`);
      alert("삭제되었습니다.");
      setPatients(prev => prev.filter(p => p.pIdx !== thePatient.pIdx));
      setFiltered(prev => prev.filter(p => p.pIdx !== thePatient.pIdx));
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
  // 삭제 모달 열기
  const openDeleteModal = () => {
    if (!selectedPatient) return;
    setShowDeleteModal(true);
    setTimeout(() => setModalVisible(true), 10); // 애니메이션 적용
  };

  // 삭제 실행
  const handleDeleteConfirm = async () => {
    if (!selectedPatient) return;

    try {
      await axios.delete(`${process.env.REACT_APP_DB_URL}/patients/${selectedPatient.pIdx}`);
      setPatients(prev => prev.filter(p => p.pIdx !== selectedPatient.pIdx));
      setSelectedPatient(null);
      closeDeleteModal();
    } catch (err) {
      console.error("삭제 실패:", err);
    }
  };

  // 모달 닫기
  const closeDeleteModal = () => {
    setModalVisible(false);
    setTimeout(() => setShowDeleteModal(false), 300); // 애니메이션이 끝난 후 숨김
  };
  return (
    <div className="main-container" style={{ overflow: "auto" }}>
      <Menu /> {/* Menu.jsx를 왼쪽에 배치 */}
      {/* 상단 바 */}
      <div className="top-bar" ref={searchRef}>
        {/* 돋보기 버튼 및 검색하기 텍스트 */}
        {!isSearchVisible && (
          <button className="search-toggle-button" onClick={toggleSearchBar}>
            <img src={magnifyingGlassIcon} alt="검색" className="search-icon" />
            <span className="search-text">환자 검색</span>
          </button>
        )}
        {/* 검색 바 (isSearchVisible이 true일 때만 표시) */}
        {isSearchVisible && (
          <form className={`search-form ${hideSearchBar ? "hide" : ""}`} onSubmit={handleSearchSubmit}>
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
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* 버튼 영역 */}
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px" }}>
            {/* 과거 결과 보기 버튼 */}
            <button className="exdiagnose-btn" onClick={handleViewOldResult}>
              <img src={documentIcon} alt="과거 진단 아이콘" className="document-icon" />
              과거 진단 보기
            </button>
            {showWarningModal && (
              <div className="patient-warning-modal-overlay" onClick={closeWarningModal}>
                <div className={`past-diagnosis-modal ${hideWarningModal ? "hide" : ""}`}>
                  <img src={yellowwarningIcon} alt="경고" className="patient-warning-icon" /> {/* ✅ 경고 아이콘 추가 */}
                  <p>환자를 선택해주세요.</p>
                </div>
              </div>
            )}

            {/* 진단하기 버튼 */}
            <button className="diagnose-top-btn" onClick={handleDiagnose} disabled={newImages.length > 0 && !selectedNewImage}>
              <img src={stethoscopeIcon} alt="진단 아이콘" className="stethoscope-icon" />
              진단하기
            </button>
          </div>

          {showDiagnosisWarningModal && (
            <div className="diagnosis-warning-modal-overlay" onClick={closeDiagnosisWarningModal}>
              <div className={`diagnosis-warning-modal ${hideDiagnosisWarningModal ? "hide" : ""}`}>
                <img src={yellowwarningIcon} alt="경고" className="diagnosis-warning-icon" /> {/* ✅ 경고 아이콘 추가 */}
                <p>X-ray 사진을 등록해주세요.</p> {/* ✅ 텍스트 변경 */}
              </div>
            </div>
          )}

          {showNoHistoryModal && (
            <div className="no-history-modal-overlay" onClick={closeNoHistoryModal}>
              <div className={`no-history-modal ${hideNoHistoryModal ? "hide" : ""}`}>
                <img src={yellowwarningIcon} alt="경고" className="no-history-icon" /> {/* ✅ 경고 아이콘 추가 */}
                <p>과거 진단 기록이 없습니다.</p>
              </div>
            </div>
          )}
          {showImageWarningModal && (
            <div className="image-warning-modal-overlay" onClick={closeImageWarningModal}>
              <div className={`image-warning-modal ${hideImageWarningModal ? "hide" : ""}`}>
                <img src={warningIcon} alt="경고" className="image-warning-icon" /> {/* ✅ 경고 아이콘 추가 */}
                <p>사진이 업로드 되어있지 않습니다.</p>
                <button onClick={closeImageWarningModal}>확인</button>
              </div>
            </div>
          )}

          {/* 🟡 메시지: 버튼 아래 배치 */}
          {newImages.length > 0 && !selectedNewImage && (
            <p style={{ color: "yellow", fontSize: "14px" }}>
              등록한 X-ray 중 한 장을 클릭(확대)해야 진단 가능합니다
            </p>
          )}
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="main-content">
        {/* 왼쪽 패널: 환자 목록, 검색결과 */}
        <div className="left-panel">

          <div className="patient-list-container">
            <h2 style={{ marginTop: 5, marginLeft: 10, marginBottom: 5 }}>환자 리스트</h2>
            {currentPatients.length > 0 ? (
              <>
                <table className="patient-table">
                  <thead>
                    <tr><th>이름</th><th>생년월일</th><th>전화번호</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPatients.map((pt, idx) => (
                      <React.Fragment key={pt.pIdx || idx}>
                        <tr onClick={() => handlePatientClick(pt)}>
                          <td>{pt.pName.length > 4 ? pt.pName.slice(0, 4) + "..." : pt.pName}</td>
                          <td>{pt.birth.slice(0, 6)}</td>
                          <td>{pt.tel}</td>
                        </tr>
                      </React.Fragment>
                    ))}

                    {/* ✅ 빈 행 추가 (최대 5줄 유지) */}
                    {Array.from({ length: Math.max(0, 5 - currentPatients.length) }).map((_, i) => (
                      <tr key={`empty-${i}`} className="empty-row">
                        <td colSpan="3"></td>
                      </tr>
                    ))}

                  </tbody>
                </table>

                {/* 페이지네이션 */}
                <div className="pagination-container">
                  {/* 환자 정보 페이지네이션 */}
                  <div className="patient-pagination">
                    <button onClick={goFirst} disabled={pageGroup === 1}>{"<<"}</button>
                    <button onClick={goPrev} disabled={currentPage === 1}>{"<"}</button>

                    {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(num => (
                      <button
                        key={num}
                        onClick={() => handlePageChange(num)}
                        className={currentPage === num ? "active" : ""}
                      >
                        {num}
                      </button>
                    ))}

                    <button onClick={goNext} disabled={currentPage === totalPages}>{">"}</button>
                    <button onClick={goLast} disabled={pageGroup === totalGroups}>{">>"}</button>
                  </div>

                </div>
              </>
            ) : (
              <p>등록된 환자 정보가 없습니다.</p>
            )}
          </div>

          {selectedPatient && (
            <div className="patient-detail">
              <h2 style={{ marginLeft: 10 }}>환자 정보</h2>
              <table className="patient-detail-table">
                <tbody>
                  <tr>
                    <th>환자 번호</th>
                    <td>{selectedPatient.pIdx}</td>
                  </tr>
                  <tr>
                    <th>환자 이름</th>
                    <td>{selectedPatient.pName}</td>
                  </tr>
                  <tr>
                    <th>생년월일</th>
                    <td>{selectedPatient.birth}</td>
                  </tr>
                  <tr>
                    <th>연락처</th>
                    <td>{selectedPatient.tel}</td>
                  </tr>
                  <tr>
                    <th>주소</th>
                    <td>
                      <div className="patient-address">{selectedPatient.pAdd}</div>
                    </td>
                  </tr>

                </tbody>
              </table>

              <div className="patient-detail-actions">
                <button className="btn" onClick={() => handleEditPatient(selectedPatient)}>
                  <img src={patientIcon} alt="수정" className="edit-icon" />
                </button>
                <button className="delete-button" onClick={openDeleteModal}>
                  <img src={trashIcon} alt="삭제" className="trash-icon" />
                </button>
              </div>
            </div>
          )}
          {showDeleteModal && (
            <div className={`modal-overlay ${modalVisible ? "visible" : ""}`}>
              <div className="modal-content">
                <img src={warningIcon} alt="경고" className="warning-icon" /> {/* 경고 아이콘 추가 */}
                <p>정말 [{selectedPatient?.pName}] 환자를 삭제하시겠습니까?</p>
                <div className="modal-buttons">
                  <button className="modal-button confirm" onClick={handleDeleteConfirm}>삭제</button>
                  <button className="modal-button cancel" onClick={closeDeleteModal}>취소</button>
                </div>
              </div>
            </div>
          )}

          {/* 진단 날짜 텍스트를 panel-block 밖으로 이동 */}
          {selectedPatient && (
            <div className="diagnosis-date-title">진단 날짜</div>
          )}

          {/* 날짜 리스트 */}
          <div
            className={`date-list-container panel-block
              ${!selectedPatient ? "expanded-panel" : ""}`}
            style={{ marginTop: "10px" }}
          >
            {/* ✅ selectedPatient가 없을 때만 비디오 표시 */}
            {!selectedPatient && (
              <video autoPlay loop muted playsInline className="date-list-video">
                <source src="/video2.mp4" type="video/mp4" />
              </video>
            )}

            <DateList
              diagDates={diagDates}
              currentPage={datePage}
              setCurrentPage={setDatePage}
              datesPerPage={datesPerPage}
              onDateClick={(dateStr) => handleDateClick(dateStr, selectedPatient)}
              selectedPatient={selectedPatient} // ✅ 추가
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
            {showImageDeleteModal && (
              <div className="image-delete-modal-overlay" onClick={closeImageDeleteModal}>
                <div className="image-delete-modal">
                  <img src={warningIcon} alt="경고" className="image-delete-icon" /> {/* ✅ 경고 아이콘 추가 */}
                  <p>이 이미지를 삭제하시겠습니까?</p>
                  <div className="image-delete-modal-buttons">
                    <button className="confirm" onClick={confirmImageDelete}>삭제</button>
                    <button className="cancel" onClick={closeImageDeleteModal}>취소</button>
                  </div>
                </div>
              </div>
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
    </div >
  );
}

export default Main;
