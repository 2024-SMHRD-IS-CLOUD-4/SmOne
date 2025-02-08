import React, { useState, useRef, useEffect } from "react";
import plusIcon from "./plus-image.png";
import axios from "axios";

function SecondVisitUI({
  oldImages, setOldImages,
  oldBigPreview, setOldBigPreview,
  selectedOldImage, setSelectedOldImage,
  selectedPatient, setselectedPatient,

  newImages, setNewImages,
  newBigPreview, setNewBigPreview,
  selectedNewImage, setSelectedNewImage,

  handleNewPhotoRegister,
  handleRemoveNewImage,

  selectedDate,
  patientName,
  earliestDate,
  latestDate,

  diagnosisResult,
  setDiagnosisResult
}) {
  const previewBoxWidth = 570;
  const previewBoxHeight = 570;
  
 /** ✅ useEffect 내부에서 X-ray 이미지 목록을 불러오기 */
 useEffect(() => {
  if (selectedPatient) {
    axios
      .get(`${process.env.REACT_APP_DB_URL2}/list?pIdx=${selectedPatient}`)
      .then(response => {
        setOldImages(response.data); // ✅ API 응답 데이터를 상태에 저장
      })
      .catch(error => console.error("❌ X-RAY 이미지 로드 실패:", error));
  }
}, [selectedPatient, setOldImages]);  // ✅ 의존성 배열 수정


  // 과거 X-ray
  const [oldBaseScale, setOldBaseScale] = useState(1);
  const [oldZoom, setOldZoom] = useState(1);
  const [oldOffsetX, setOldOffsetX] = useState(0);
  const [oldOffsetY, setOldOffsetY] = useState(0);
  const [oldDragging, setOldDragging] = useState(false);
  const [oldStartX, setOldStartX] = useState(0);
  const [oldStartY, setOldStartY] = useState(0);
  const oldImgRef = useRef(null);

  const handleOldThumbClick = (item) => {
    setSelectedOldImage(item);
    setOldBigPreview(item.bigXray);
    setOldBaseScale(1);
    setOldZoom(1);
    setOldOffsetX(0);
    setOldOffsetY(0);
  };

  const handleOldImageLoad = (e) => {
    const img = e.currentTarget;
    const natW = img.naturalWidth;
    const natH = img.naturalHeight;
    const scaleW = previewBoxWidth / natW;
    const scaleH = previewBoxHeight / natH;
    setOldBaseScale(Math.min(scaleW, scaleH));
  };
  
  const handleWheelOld = (e) => {
    let delta = e.deltaY < 0 ? 0.1 : -0.1;
    let newZ = oldZoom + delta;
    if (newZ < 0.5) newZ = 0.5;
    if (newZ > 4.0) newZ = 4.0;
    setOldZoom(newZ);
  };
  const handleOldMouseDown = (e) => {
    e.preventDefault();
    setOldDragging(true);
    setOldStartX(e.clientX - oldOffsetX);
    setOldStartY(e.clientY - oldOffsetY);
  };
  const handleOldMouseMove = (e) => {
    if (!oldDragging) return;
    e.preventDefault();
    setOldOffsetX(e.clientX - oldStartX);
    setOldOffsetY(e.clientY - oldStartY);
  };
  const handleOldMouseUp = (e) => {
    e.preventDefault();
    setOldDragging(false);
  };
  const handleOldMouseLeave = (e) => {
    e.preventDefault();
    setOldDragging(false);
  };
  const handleOldDragStart = (e) => e.preventDefault();

  const oldTotalScale = oldBaseScale * oldZoom;
  const oldTransform = {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: `
      translate(-50%, -50%)
      translate(${oldOffsetX}px, ${oldOffsetY}px)
      scale(${oldTotalScale})
    `,
    transformOrigin: "center center",
    cursor: oldDragging ? "grabbing" : "grab",
    maxWidth: "none",
    userSelect: "none"
  };

  const oldXrayTitle = selectedDate ? `${selectedDate} X-ray` : "과거 X-ray";

  // 신규 X-ray
  const [newBaseScale, setNewBaseScale] = useState(1);
  const [newZoom, setNewZoom] = useState(1);
  const [newOffsetX, setNewOffsetX] = useState(0);
  const [newOffsetY, setNewOffsetY] = useState(0);
  const [newDragging, setNewDragging] = useState(false);
  const [newStartX, setNewStartX] = useState(0);
  const [newStartY, setNewStartY] = useState(0);
  const newImgRef = useRef(null);

  const handleNewThumbClick = (item) => {
    setSelectedNewImage(item);
    setNewBigPreview(item.previewUrl);
    setNewBaseScale(1);
    setNewZoom(1);
    setNewOffsetX(0);
    setNewOffsetY(0);
  };
  const handleNewImageLoad = (e) => {
    const img = e.currentTarget;
    const natW = img.naturalWidth;
    const natH = img.naturalHeight;
    const scaleW = previewBoxWidth / natW;
    const scaleH = previewBoxHeight / natH;
    setNewBaseScale(Math.min(scaleW, scaleH));
  };
  const handleWheelNew = (e) => {
    let delta = e.deltaY < 0 ? 0.1 : -0.1;
    let newZ = newZoom + delta;
    if (newZ < 0.5) newZ = 0.5;
    if (newZ > 4.0) newZ = 4.0;
    setNewZoom(newZ);
  };
  const handleNewMouseDown = (e) => {
    e.preventDefault();
    setNewDragging(true);
    setNewStartX(e.clientX - newOffsetX);
    setNewStartY(e.clientY - newOffsetY);
  };
  const handleNewMouseMove = (e) => {
    if (!newDragging) return;
    e.preventDefault();
    setNewOffsetX(e.clientX - newStartX);
    setNewOffsetY(e.clientY - newStartY);
  };
  const handleNewMouseUp = (e) => {
    e.preventDefault();
    setNewDragging(false);
  };
  const handleNewMouseLeave = (e) => {
    e.preventDefault();
    setNewDragging(false);
  };
  const handleNewDragStart = (e) => e.preventDefault();

  const newTotalScale = newBaseScale * newZoom;
  const newTransform = {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: `
      translate(-50%, -50%)
      translate(${newOffsetX}px, ${newOffsetY}px)
      scale(${newTotalScale})
    `,
    transformOrigin: "center center",
    cursor: newDragging ? "grabbing" : "grab",
    maxWidth: "none",
    userSelect: "none"
  };

  return (
    <div className="xray-flex" style={{ position: "relative" }}>
      {/* 과거 X-ray */}
      <div className="xray-subpanel2">
        <h4 style={{ marginTop: 0 }}>{oldXrayTitle}</h4>
        <div
          style={{
            width: `${previewBoxWidth}px`,
            height: `${previewBoxHeight}px`,
            border: "1px solid #999",
            marginBottom: "15px",
            overflow: "hidden",
            position: "relative"
          }}
          onWheel={handleWheelOld}
          onMouseDown={handleOldMouseDown}
          onMouseMove={handleOldMouseMove}
          onMouseUp={handleOldMouseUp}
          onMouseLeave={handleOldMouseLeave}
        >
          {oldBigPreview ? (
            <img
              ref={oldImgRef}
              src={oldBigPreview}
              alt="old-big"
              draggable={false}
              onDragStart={handleOldDragStart}
              onLoad={handleOldImageLoad}
              style={oldTransform}
            />
          ) : (
            <div style={{
              color: "#999",
              marginTop: "250px"
            }}>
              기존 이미지를 클릭하면 확대
            </div>

          )}
        </div>

        <div style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          maxWidth: "550px",
          marginTop: "5px",
          marginBottom: "10px"
        }}>
          {oldImages.length === 0 && <p>(none)</p>}
          {oldImages.map((item, i) => (
            <div
              key={i}
              style={{
                position: "relative",
                width: "80px", height: "80px",
                border: "1px solid #999",
                cursor: "pointer"
              }}
              onClick={() => handleOldThumbClick(item)}
            >
              <img
                src={item.imgPath}
                alt={`item ${i + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 신규 X-ray */}
      <div className="xray-subpanel2">
        <h4 style={{ marginTop: 0 }}>신규 X-ray 등록</h4>
        <div
          style={{
            width: `${previewBoxWidth}px`,
            height: `${previewBoxHeight}px`,
            border: "1px solid #999",
            marginBottom: "10px",
            overflow: "hidden",
            position: "relative"
          }}
          onWheel={handleWheelNew}
          onMouseDown={handleNewMouseDown}
          onMouseMove={handleNewMouseMove}
          onMouseUp={handleNewMouseUp}
          onMouseLeave={handleNewMouseLeave}
        >
          {newBigPreview ? (
            <img
              ref={newImgRef}
              src={newBigPreview}
              alt="new-big"
              draggable={false}
              onDragStart={handleNewDragStart}
              onLoad={handleNewImageLoad}
              style={newTransform}
            />
          ) : (
            <div style={{ color: "#999", marginTop: "250px" }}>
              밑의 아이콘을 클릭하여 사진을 등록해주세요
            </div>
          )}
        </div>

        <div style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          maxWidth: "550px",
          marginTop: "10px",
          marginBottom: "10px"
        }}>
          {Array.from({ length: 5 }).map((_, i) => {
            const item = newImages[i];
            if (!item) {
              if (newImages.length < 5) {
                return (
                  <div
                    key={`plus-${i}`}
                    style={{
                      width: "80px", height: "80px",
                      border: "2px dashed #999",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer"
                    }}
                    onClick={handleNewPhotoRegister}
                  >
                    <span style={{ fontSize: "24px" }}>
                      <img
                        src={plusIcon}
                        alt="plus-icon"
                        className="plus-icon"
                      />
                    </span>
                  </div>
                );
              } else {
                return (
                  <div
                    key={`full-${i}`}
                    style={{
                      width: "80px", height: "80px",
                      border: "1px solid #999",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    (full)
                  </div>
                );
              }
            } else {
              return (
                <div
                  key={item.id}
                  style={{
                    position: "relative",
                    width: "80px", height: "80px",
                    border: "1px solid #999",
                    cursor: "pointer"
                  }}
                  onClick={() => handleNewThumbClick(item)}
                >
                  <img
                    src={item.previewUrl}
                    alt="new-thumb"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveNewImage(item.id);
                    }}
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 2,
                      width: "10px", /* 기존보다 5px 넓게 설정 */
                      background: "rgba(255,0,0,0.7)",
                      border: "none",
                      color: "#fff",
                      fontSize: "12px",
                      cursor: "pointer"
                    }}
                  >
                    X
                  </button>
                </div>
              );
            }
          })}
        </div>


      </div>
    </div>
  );
}

export default SecondVisitUI; 