import React, { useState } from "react";
import "./App.css";
import { getTweet } from "./utils/apiUtils";

function App() {
  const [idValue, setIdValue] = useState("");

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIdValue(e.target.value);
  }

  const click = async (id: string) => {
    const tweet = await getTweet(id);
    console.log(tweet);
  }

  return (
    <>
      <div>
        <input type="text" value={idValue} onChange={handleIdChange} />
        <button
          onClick={() => click(idValue)}
        >
          test
        </button>
      </div>
    </>
  )
}

export default App;
