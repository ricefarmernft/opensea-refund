import "./App.css";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import ReactGA from "react-ga4";
ReactGA.initialize("G-M7LYR3G3FT");

function App() {
  useEffect(() => {
    ReactGA.send("pageview");
  }, []);

  return (
    <>
      <Navbar />
      <Home />
    </>
  );
}

export default App;
