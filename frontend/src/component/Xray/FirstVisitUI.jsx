import React, { useState, useRef } from "react";

function FirstVisitUI({
  newImages, setNewImages,
  newBigPreview, setNewBigPreview,
  selectedNewImage, setSelectedNewImage,
  handleNewPhotoRegister,
  handleRemoveNewImage
}) {
  const previewBoxWidth = 550;
  const previewBoxHeight = 480;

  const [baseScale, setBaseScale] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);

  const imgRef = useRef(null);

  const handleThumbClick = (item) => {
    setSelectedNewImage(item);
    setNewBigPreview(item.previewUrl);
    setBaseScale(1);
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
  };

  const handleImageLoad = (e) => {
    const img = e.currentTarget;
    const natW = img.naturalWidth;
    const natH = img.naturalHeight;
    const scaleW = previewBoxWidth / natW;
    const scaleH = previewBoxHeight / natH;
    setBaseScale(Math.min(scaleW, scaleH));
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    let newZ = zoom + delta;
    if (newZ < 0.5) newZ = 0.5;
    if (newZ > 4.0) newZ = 4.0;
    setZoom(newZ);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setDragging(true);
    setStartX(e.clientX - offsetX);
    setStartY(e.clientY - offsetY);
  };
  const handleMouseMove = (e) => {
    if (!dragging) return;
    e.preventDefault();
    setOffsetX(e.clientX - startX);
    setOffsetY(e.clientY - startY);
  };
  const handleMouseUp = (e) => {
    e.preventDefault();
    setDragging(false);
  };
  const handleMouseLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };
  const handleDragStart = (e) => e.preventDefault();

  const totalScale = baseScale * zoom;
  const previewStyle = {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: `
      translate(-50%, -50%)
      translate(${offsetX}px, ${offsetY}px)
      scale(${totalScale})
    `,
    transformOrigin: "center center",
    cursor: dragging ? "grabbing" : "grab",
    maxWidth: "none",
    userSelect: "none"
  };

  return (
    <div style={{ position: "relative" }}>
      <div className="xray-subpanel">
        <div
          style={{
            width: `${previewBoxWidth}px`,
            height: `${previewBoxHeight}px`,
            border: "2px dashed #999",
            marginBottom: "10px",
            overflow: "hidden",
            position: "relative"
          }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {newBigPreview ? (
            <img
              ref={imgRef}
              src={newBigPreview}
              alt="big-preview"
              draggable={false}
              onDragStart={handleDragStart}
              onLoad={handleImageLoad}
              style={previewStyle}
            />
          ) : (
            <div style={{ color: "#999", textAlign: "center" }}>
              이미지를 클릭하면 확대
            </div>
          )}
        </div>

        <div style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          maxWidth: "500px",
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
                  onClick={() => handleThumbClick(item)}
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

        <button onClick={handleNewPhotoRegister}>사진 등록</button>
      </div>
    </div>
  );
}

export default FirstVisitUI;
