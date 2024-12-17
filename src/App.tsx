import React, { useEffect, useState } from "react";
import "./App.css";
import { getTweet } from "./utils/apiUtils";

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

const App = () => {
  const [idValue, setIdValue] = useState("");
  const debouncedIdValue = useDebounce(idValue, 500);

  useEffect(() => {
    console.log("test", debouncedIdValue);
  }, [debouncedIdValue]);

  const click = async (id: string) => {
    const tweet = await getTweet(id);
    console.log(tweet);
  }

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIdValue(e.target.value);
  }

  return (
    <>
      <div>
        <input type="text" value={idValue} onChange={handleIdChange} />
        <button
          onClick={() => click(debouncedIdValue)}
        >
          test
        </button>
      </div>
    </>
  )
}

export default App;
