import React, { useState } from "react";
import "./App.scss";

function App() {
  const [isShown, setIsShown] = useState(false);

  const toggleMessage = () => {
    setIsShown((prev) => !prev);
  };

  return (
    <div className="container">
      <button onClick={toggleMessage}>
        {isShown ? "HIDE" : "SHOW"}
      </button>
      {isShown && <p>Welcome to React!</p>}
    </div>
  );
}

export default App;




