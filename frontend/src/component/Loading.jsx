import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Loading.css";

const Loading = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/result", { state: location.state });
    }, 3000); // 3초 후 이동

    return () => clearTimeout(timer); // 클린업 함수
  }, [navigate, location.state]);

  return (
    <div className="loading-container">
      <div className="circle-container">
        <div className="circle"></div>
      </div>
      <div className="circle-container">
        <div className="circle"></div>
      </div>
      <div className="circle-container">
        <div className="circle"></div>
      </div>
      <p>Diagnosing...</p>
    </div>
  );
};

export default Loading;
