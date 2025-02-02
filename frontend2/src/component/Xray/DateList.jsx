import "./DateList.css"
// src/component/Xray/DateList.jsx

function DateList({
  diagDates,
  currentPage, setCurrentPage,
  datesPerPage,
  onDateClick
}) {
  const totalPages = Math.ceil(diagDates.length / datesPerPage);
  const indexOfLast = currentPage * datesPerPage;
  const indexOfFirst = indexOfLast - datesPerPage;
  const currentDates = diagDates.slice(indexOfFirst, indexOfLast);

  const goFirst = () => setCurrentPage(1);
  const goLast = () => setCurrentPage(totalPages);
  const goPrev = () => setCurrentPage(prev => Math.max(1, prev - 1));
  const goNext = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goPage = (p) => setCurrentPage(p);

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>진단 날짜</h2>
      {diagDates.length === 0 ? (
        <p>등록된 진단 날짜가 없습니다.</p>
      ) : (
        <>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {currentDates.map((d, i) => (
              <li
                key={i}
                style={{
                  marginBottom: "5px",
                  padding: "5px",
                  cursor: "pointer"
                }}
                onClick={() => onDateClick(d)}
              >
                {d}
              </li>
            ))}
          </ul>

          {/* 페이지네이션 */}
          <div className="date-pagination">
            <button onClick={goFirst} disabled={currentPage === 1}>{"<<"}</button>
            <button onClick={goPrev} disabled={currentPage === 1}>{"<"}</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
              <button
                key={num}
                onClick={() => goPage(num)}
                className={currentPage === num ? "active" : ""}
              >
                {num}
              </button>
            ))}
            <button onClick={goNext} disabled={currentPage === totalPages}>{">"}</button>
            <button onClick={goLast} disabled={currentPage === totalPages}>{">>"}</button>
          </div>

        </>
      )}
    </div>
  );
}

export default DateList;