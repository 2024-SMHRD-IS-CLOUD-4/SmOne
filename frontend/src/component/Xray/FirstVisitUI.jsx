import React, { useState, useRef } from "react";
import plusIcon from "./plus-image.png";

function FirstVisitUI({
  newImages, setNewImages,
  newBigPreview, setNewBigPreview,
  selectedNewImage, setSelectedNewImage,
  handleNewPhotoRegister,
  handleRemoveNewImage
}) {
  const previewBoxWidth = 570;
  const previewBoxHeight = 530;

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
            border: "1px solid #999",
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
            <div style={{ marginTop: "250px", color: "#999", textAlign: "center" }}>
              밑의 아이콘을 클릭하여 사진을 등록해주세요
            </div>
          )}
        </div>

        <div style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          maxWidth: "500px"
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
                      cursor: "pointer",
                      marginTop: "10px",
                      marginBottom: "-15px"
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
                    cursor: "pointer",
                    marginTop:"10px"
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
                      right: 0,
                      width: "14px",
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

export default FirstVisitUI;
