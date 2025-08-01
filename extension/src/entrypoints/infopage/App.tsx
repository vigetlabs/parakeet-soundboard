import { useState } from "react";
import "./App.css";
import { DotsVerticalIcon } from "@radix-ui/react-icons";

function App() {
  const [count, setCount] = useState(0);
  return (
    <>
      <body>
        <a href={import.meta.env.VITE_WEBSITE_HOST} target="_blank">
          <img
            src={browser.runtime.getURL("/images/parakeetLogo.png")}
            alt="Parakeet Logo"
            className="logo"
          />
        </a>
        <h1>Thanks for downloading Parakeet!</h1>
        <h2>IMPORTANT</h2>

        <p>
          Make sure <b>“Studio Sound”</b> noise cancellation is turned{" "}
          <b>off</b> in Google Meet so that non-voice audio isn't removed.
        </p>
        <p>
          During a meeting, click
          <DotsVerticalIcon className="inlineIcon" />
          (next to "Leave call") → Settings → Audio → Studio Sound (right below
          your microphone choice)
        </p>
        <p className="footnote">
          Note: Most Google accounts don't have access to Studio Sound. If you
          don't see it in settings, don't worry about any of this!
        </p>
        <p className="credits">
          Created by{" "}
          <a href="https://viget.com" target="_blank">
            Viget
          </a>
        </p>
      </body>
    </>
  );
}

export default App;
