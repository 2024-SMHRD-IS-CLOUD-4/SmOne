import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Loading.css";

const Loading = () => {
  const navigate = useNavigate();

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
