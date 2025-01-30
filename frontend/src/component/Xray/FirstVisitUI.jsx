// src/component/Xray/FirstVisitUI.jsx
import React from "react";

function FirstVisitUI({
  newImages,
  setNewImages,
  newBigPreview,
  setNewBigPreview,
  handleNewPhotoRegister,
  handleNewFileChange,
  handleRemoveNewImage,
  diagnosisMessage,
  newFileInputRef
}) {
  const handleThumbClick = (item) => {
    setNewBigPreview(item.previewUrl);
  };

  return (
    <div className="xray-subpanel">
      <h4 style={{ marginTop: 0 }}>신규 X-ray 등록</h4>
      {/* 큰 미리보기 */}
      <div style={{
        width: "550px",
        height: "500px",
        border: "2px dashed #999",
        marginBottom: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        {newBigPreview ? (
          <img
            src={newBigPreview}
            alt="big-preview"
            style={{ width: "500px", height: "450px", objectFit: "contain" }}
          />
        ) : (
          <div style={{ color: "#999" }}>이미지를 클릭하면 확대</div>
        )}
      </div>

      {/* 썸네일 목록 */}
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
                    width: "80px",
                    height: "80px",
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
                    width: "80px",
                    height: "80px",
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
                  width: "80px",
                  height: "80px",
                  border: "2px dashed red",
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
                    width: "10px",
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
      <input
        ref={newFileInputRef}
        type="file"
        multiple
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleNewFileChange}
      />

      {diagnosisMessage && (
        <div style={{
          marginTop: "20px",
          padding: "10px",
          border: "1px solid #444",
          background: "#222",
          color: "#fff"
        }}>
          {diagnosisMessage}
        </div>
      )}
    </div>
  );
}

export default FirstVisitUI;
