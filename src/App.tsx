import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import { getTweet } from "./utils/apiUtils";
import { Md } from "./Md";

const App = () => {
  const [inputValue, setInputValue] = useState("");
  const [idValue, setIdValue] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [tweet, setTweet] = useState(null);

  useEffect(() => {
    console.log("idValue: ", inputValue);
  }, [inputValue]);

  const click = async (id: string) => {
    const t = await getTweet(id);
    if (t) setTweet(t);
  }

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    validateInput(e.target.value);
  }

  const validateInput = useRef(
    (input: string) => {
      const id = idFromUrl(input);
      setIsValid(!!id);
      setIdValue(id ?? "");
    }
  ).current;

  const idFromUrl = (input: string) => {
    const match = input.match(/\b\d{17,20}\b/);
    if (!!match) return match[0];
  }

  return (
    <>
      <div className="main">
        {
          !tweet &&
          <div className="input-container">
            <input
              className="id-input"
              type="text"
              value={inputValue}
              placeholder="Enter ID or URL"
              onChange={handleIdChange} />
            <button
              className="submit-button"
              disabled={!isValid}
              onClick={() => click(idValue)}
            >
              {isValid ? "valid" : "invalid"}
            </button>
          </div>
        }
        {
          tweet &&
          <Md tweet={tweet} />
        }
      </div>
    </>
  )
}

export default App;
