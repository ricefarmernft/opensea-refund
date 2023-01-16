import "./App.css";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import ReactGA from "react-ga4";

const googleApi = `${process.env.REACT_APP_GOOGLE_API_KEY}`;
ReactGA.initialize(googleApi);

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
