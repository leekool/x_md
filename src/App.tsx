import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import { getTweet } from "./utils/apiUtils";
import { Md } from "./md";

// const useDebounce = <T,>(value: T, delay: number): T => {
//   const [debouncedValue, setDebouncedValue] = useState(value);
//
//   useEffect(() => {
//     const handler = setTimeout(() => setDebouncedValue(value), delay);
//     return () => clearTimeout(handler);
//   }, [value, delay]);
//
//   return debouncedValue;
// }

const debounce = (fn: Function, delay: number) => {
  let timer: number;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

const App = () => {
  const [idValue, setIdValue] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [tweet, setTweet] = useState(null);

  useEffect(() => {
    console.log("idValue: ", idValue);
  }, [idValue]);

  const click = async (id: string) => {
    const t = await getTweet(id);
    if (t) setTweet(t);
  }

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIdValue(e.target.value);
    validateInput(e.target.value);
  }

  const validateInput = useRef(
    debounce((input: string) => {
      const match = input.match(/\b\d{17,20}\b/);
      setIsValid(!!match);
    }, 500)
  ).current;

  return (
    <>
      <div>
        <input
          type="text"
          value={idValue}
          placeholder="Enter ID or URL"
          onChange={handleIdChange} />
        <button
          disabled={!isValid}
          onClick={() => click(idValue)}
        >
          {isValid ? "valid" : "invalid"}
        </button>
        { tweet && <Md tweet={tweet} /> }
      </div>
    </>
  )
}

export default App;
