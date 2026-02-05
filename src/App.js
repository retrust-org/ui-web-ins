// src/App.js
import React from "react";
import "./App.css";
import { BrowserRouter } from "react-router-dom";
import TagManager from "react-gtm-module";
import BrowserSelector from './components/common/BrowserSelector';

const tagManagerArgs = {
  gtmId: process.env.REACT_APP_GTM_ID,
};
TagManager.initialize(tagManagerArgs);

function App({ Router }) {
  const basename = process.env.PUBLIC_URL || "";
  
  return (
    <div className="layoutWrapper">
      <BrowserSelector />
      <BrowserRouter basename={basename}>
        <Router />
      </BrowserRouter>
    </div>
  );
}

export default App;