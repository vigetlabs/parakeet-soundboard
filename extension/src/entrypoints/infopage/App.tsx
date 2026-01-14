import { DotsVerticalIcon } from "@radix-ui/react-icons";
import "./App.css";

function App() {
  return (
    <div className="infoPage">
      <header className="header">
        <a href={import.meta.env.VITE_WEBSITE_URL} target="_blank">
          <img
            src={browser.runtime.getURL("/images/parakeetLogo.png")}
            alt="Parakeet Logo"
            className="logo"
          />
        </a>
        <h1>Thanks for downloading Parakeet!</h1>
        <p className="subtitle">
          Play sound effects in Google Meet!
        </p>
      </header>

      <section className="warning-section">
        <h2>Important: Studio Sound</h2>
        <p>
          Make sure <strong>"Studio Sound"</strong> is turned <strong>OFF</strong> in
          Google Meet so sound effect audio isn't filtered out.
        </p>
        <div className="instruction-box">
          <p>
            During a meeting, click <DotsVerticalIcon className="inlineIcon" /> (next
            to "Leave call") → Settings → Audio → Studio Sound
          </p>
        </div>
        <p className="footnote">
          Note: Most accounts don't have Studio Sound. If you don't see it, you're
          good to go!
        </p>
      </section>

      <section className="section">
        <h2>How Muting Works</h2>
        <p>
          Parakeet can <strong>only play sound effects when your Google Meet
          microphone is unmuted</strong>. To mute your voice while keeping sound
          effects working, use the Parakeet mute buttons:
        </p>

        <div className="mute-buttons-grid">
          <div className="mute-option">
            <img
              src={browser.runtime.getURL("/images/info-mute-button-popup.png")}
              alt="Mute button in extension popup"
              className="screenshot screenshot-small"
            />
            <p className="caption">In the extension popup</p>
          </div>

          <div className="mute-option">
            <img
              src={browser.runtime.getURL("/images/info-mute-button-googlemeet.png")}
              alt="Parakeet mute button in Google Meet"
              className="screenshot screenshot-small"
            />
            <p className="caption">Next to Meet's control bar</p>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Meeting Usage Tips</h2>
        <ul className="tips-list">
          <li>
            <strong>Keep Google Meet mic unmuted</strong> - Control your voice with
            Parakeet's mute button instead
          </li>
          <li>
            <strong>Keep extension popup open</strong> - The popup must be open on
            the Meet tab to play sounds
          </li>
          <li>
            <strong>Pro tip for presenting</strong> - Open Meet in a separate
            window/screen so you can access the extension while presenting
          </li>
          <li>
            <strong>Use the Parakeet logo button</strong> in the bottom right corner to open the extension.
          </li>
          <li>
            <strong>Don't want the Parakeet buttons to show in Meet?</strong> You can hide them in settings on the extension pop-up.
          </li>
        </ul>
      </section>

      <section className="section">
        <h2>Sound Management</h2>
        <p>
          Create custom sound effects and organize them into folders at{" "}
          <a href="https://parakeet.vigetx.com" target="_blank">
            parakeet.vigetx.com
          </a>
          . Your account automatically syncs with the extension.
        </p>
        <img
          src={browser.runtime.getURL("/images/website-create-sound.png")}
          alt="Sound management on Parakeet website"
          className="screenshot screenshot-large"
        />
      </section>

      <section className="section troubleshooting">
        <h2>Troubleshooting</h2>
        <div className="troubleshooting-item">
          <img
            src={browser.runtime.getURL("/images/quality-of-your-call-alert.png")}
            alt="Quality of your call alert"
            className="screenshot screenshot-large"
          />
          <p>
            If you see this "extension affecting call quality" message, you can
            safely dismiss it. Parakeet will not impact your call quality.
          </p>
        </div>
      </section>

      <footer className="footer">
        <p className="credits">
          Parakeet is always improving! Report issues or share feedback at{" "}
          <a href="mailto:apps@viget.com">apps@viget.com</a>
        </p>
        <p className="credits">
          Created by <a href="https://viget.com" target="_blank">Viget</a> - 2025 Internship Cohort
        </p>
      </footer>
    </div>
  );
}

export default App;
