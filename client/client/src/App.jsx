import { useEffect, useState } from "react";
import "./App.css";
import API from "./services/api";

function App() {
  const [message, setMessage] = useState("connecting.....");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await API.get("/");
        setMessage(response.data.message);
      } catch (error) {
        setMessage("Backend connection failed!");
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
  }, []);

  return <></>;
}

export default App;
