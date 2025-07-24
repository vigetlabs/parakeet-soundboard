import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";

function AuthSuccess() {
  useEffect(() => {
    const hash = window.location.hash;
    const tokenMatch = hash.match(/token=([^&]+)/);
    if (tokenMatch) {
      const token = tokenMatch[1];
      // Save JWT token to storage
      browser.storage.local.set({ jwt: token }, () => {
        console.log("Token saved!");
        console.log(token);
        // Optionally redirect or show success message
      });
    }
  }, []);

  return <h1>Authentication Successful! You may close this tab.</h1>;
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<AuthSuccess />);
