import React, { useState, useRef } from "react";

function SecondVisitUI({
  oldImages, setOldImages,
  oldBigPreview, setOldBigPreview,
  selectedOldImage, setSelectedOldImage,

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
  const previewBoxWidth = 550;
  const previewBoxHeight = 468;

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
    setOldBigPreview(`http://localhost:8090/SmOne/images/${item.imgPath}`);
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
    e.preventDefault();
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
    e.preventDefault();
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
      <div className="xray-subpanel">
        <h4 style={{ marginTop: 0 }}>{oldXrayTitle}</h4>
        <div
          style={{
            width: `${previewBoxWidth}px`,
            height: `${previewBoxHeight}px`,
            border: "2px dashed #999",
            marginBottom: "10px",
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
            <div style={{ color: "#999" }}>
              과거 이미지를 클릭하면 확대
            </div>
          )}
        </div>

        <div style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          maxWidth: "550px",
          marginBottom: "20px"
        }}>
          {oldImages.length === 0 && <p>(none)</p>}
          {oldImages.map((item, i) => (
            <div
              key={item.imgIdx || i}
              style={{
                position: "relative",
                width: "80px", height: "80px",
                border: "2px dashed #999",
                cursor: "pointer"
              }}
              onClick={() => handleOldThumbClick(item)}
            >
              <img
                src={`http://localhost:8090/SmOne/images/${item.imgPath}`}
                alt="old-thumb"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 신규 X-ray */}
      <div className="xray-subpanel">
        <h4 style={{ marginTop: 0 }}>신규 X-ray 등록</h4>
        <div
          style={{
            width: `${previewBoxWidth}px`,
            height: `${previewBoxHeight}px`,
            border: "2px dashed #999",
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
            <div style={{ color: "#999" }}>
              신규 이미지를 클릭하면 확대
            </div>
          )}
        </div>

        <div style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          maxWidth: "550px",
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
                    <span style={{ fontSize: "24px" }}>+</span>
                  </div>
                );
              } else {
                return (
                  <div
                    key={`full-${i}`}
                    style={{
                      width: "80px", height: "80px",
                      border: "2px dashed #999",
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
                    border: "2px dashed #999",
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

        <button
          onClick={handleNewPhotoRegister}
          style={{
            width: "120px",  // 버튼 너비
            height: "30px", // 버튼 높이
            padding: "4px", // 내부 패딩 조정
            border: "none",
            borderRadius: "6px",
            background: "#333", // 버튼 색상 변경
            color: "white",
            fontSize: "12px", // 크기에 맞게 글자 크기 조정
            fontWeight: "bold",
            cursor: "pointer",
            transition: "background 0.3s ease-in-out, transform 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={(e) => (e.target.style.background = "#555")}
          onMouseLeave={(e) => (e.target.style.background = "#333")}
          onMouseDown={(e) => (e.target.style.transform = "scale(0.95)")}
          onMouseUp={(e) => (e.target.style.transform = "scale(1)")}
        >
          사진 등록
        </button>

      </div>
    </div>
  );
}

export default SecondVisitUI;
