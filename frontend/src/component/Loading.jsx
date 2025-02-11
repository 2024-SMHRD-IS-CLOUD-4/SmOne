import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Loading.css";

const Loading = () => {
  const navigate = useNavigate();
  const location = useLocation();

    return (
      <div className="loadingRing">
        Diagnosing
        <span className="loadingSpan"></span>
      </div>
    );
  };
export default Loading;
