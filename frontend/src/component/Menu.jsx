import React, { useState } from "react";
import "./Menu.css";
import axios from "axios";
import { IonIcon } from "@ionic/react";
import { useNavigate } from "react-router-dom";
import {
  homeOutline,
  personOutline,
  logOutOutline,
} from "ionicons/icons";
import patientIcon from "./png/patient.png";
import teamLogo from "./png/teamlogo.png";

const Menu = ({ onMypageClick, onPatientClick, onHomeClick }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const userId = sessionStorage.getItem("userId");


  const menuItems = [
    { title: "메인화면", icon: homeOutline },
    { title: "마이페이지", icon: personOutline },
    { title: "환자등록", icon: null, image: patientIcon },
    { title: "로그아웃", icon: logOutOutline },
  ];

  const handleClick = (event, index) => {
    event.preventDefault();
    setActiveIndex(index);
    if (menuItems[index].title === "메인화면") {
      if (onHomeClick) onHomeClick();
      navigate("/main");
    }
    if (menuItems[index].title === "마이페이지") {
      navigate("/mypage");
    }
    if (menuItems[index].title === "환자등록") {
      navigate("/patients");
    }
    if (menuItems[index].title === "로그아웃") {
      handleLogout();
    }
  };

  const toggleMenu = () => {
    setIsExpanded(!isExpanded);
  };
  const handleLogout = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_DB_URL}/users/logout`, {}, { withCredentials: true });
      navigate("/");
    } catch (e) {
      console.error(e);
      alert("로그아웃 실패");
    }
  };

  return (
    <>
      {isExpanded && <div className="menu-overlay" onClick={toggleMenu}></div>}
      <div
        className={`navigation ${isExpanded ? "expanded" : ""}`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div className={`team-logo-container ${isExpanded ? "expanded" : ""}`}>
          <img src={teamLogo} alt="Team Logo" className="team-logo" />
        </div>
        {isExpanded && (
          <div className="welcome-message">
            {userId}님 환영합니다.
          </div>
        )}

        <ul>
          {menuItems.map((item, index) => (
            <li
              key={index}
              className={`list ${activeIndex === index ? "active" : ""}`}
              onClick={(e) => handleClick(e, index)}
            >
              <a href="/">
                <span className="icon">
                  {item.image ? (
                    <img src={item.image} alt={`${item.title} icon`} className="menu-image" />
                  ) : (
                    <IonIcon icon={item.icon} />
                  )}
                </span>
                <span className="title">{item.title}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Menu;
