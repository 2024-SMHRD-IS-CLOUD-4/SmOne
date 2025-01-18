import React, { useState } from 'react';
import './Menu.css'; // Add your CSS file for styling
import { IonIcon } from '@ionic/react'; // Assuming you're using Ionic React components
import {
  homeOutline,
  personOutline,
  chatbubblesOutline,
  settingsOutline,
  helpOutline,
  lockClosedOutline,
  logOutOutline
} from 'ionicons/icons';

const App = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const menuItems = [
    { title: 'Home', icon: homeOutline },
    { title: 'Profile', icon: personOutline },
    { title: 'Setting', icon: settingsOutline },
    { title: 'Sign Out', icon: logOutOutline },
  ];

  const handleClick = (index) => {
    setActiveIndex(index);
  };

  return (
    <div className="navigation">
      <ul>
        {menuItems.map((item, index) => (
          <li
            key={index}
            className={`list ${activeIndex === index ? 'active' : ''}`}
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
  );
};

export default App;