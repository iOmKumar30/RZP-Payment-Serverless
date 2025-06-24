import { useEffect, useContext } from "react";
import { UNSAFE_NavigationContext } from "react-router-dom";

function clearAllBrowserData() {
  localStorage.clear();
  sessionStorage.clear();
}

function useBackButtonWarning(
  when = true,
  message = "Are you sure you want to leave this page? All data will be cleared."
) {
  const navigator = useContext(UNSAFE_NavigationContext).navigator;

  useEffect(() => {
    if (!when) return;

    const unblock = navigator.block((tx) => {
      if (tx.location.pathname !== window.location.pathname) {
        const confirmed = window.confirm(message);
        if (confirmed) {
          clearAllBrowserData();
          window.location.replace("/"); 
        }
      }
    });

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = ""; // browsers require this to show a confirmation dialog
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      unblock();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [when, message, navigator]);
}

export default useBackButtonWarning;
