import React, { useState } from "react";
import "./Menu.css";
import { IonIcon } from "@ionic/react";
import {
  homeOutline,
  personOutline,
  settingsOutline,
  logOutOutline,
} from "ionicons/icons";

const Menu = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false); // 메뉴 확장 상태 추가

  const menuItems = [
    { title: "Home", icon: homeOutline },
    { title: "Profile", icon: personOutline },
    { title: "Setting", icon: settingsOutline },
    { title: "Sign Out", icon: logOutOutline },
  ];

  const handleClick = (index) => {
    setActiveIndex(index);
  };

  const toggleMenu = () => {
    setIsExpanded(!isExpanded); // 메뉴 확장/축소 상태 토글
  };

  return (
    <>
      {/* 오버레이 추가 */}
      {isExpanded && <div className="menu-overlay" onClick={toggleMenu}></div>}
      <div
        className={`navigation ${isExpanded ? "expanded" : ""}`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <ul>
          {menuItems.map((item, index) => (
            <li
              key={index}
              className={`list ${activeIndex === index ? "active" : ""}`}
              onClick={() => handleClick(index)}
            >
              <a href="#">
                <span className="icon">
                  <IonIcon icon={item.icon} />
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
