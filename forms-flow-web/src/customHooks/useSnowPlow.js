import {
  newTracker,
  trackPageView,
  enableActivityTracking,
} from "@snowplow/browser-tracker";
import {
  refreshLinkClickTracking,
  enableLinkClickTracking,
  LinkClickTrackingPlugin,
} from "@snowplow/browser-plugin-link-click-tracking";
import React from "react";
import { useLocation } from "react-router-dom";

let tracker;
const COLLECTOR =
  (window._env_ && window._env_.REACT_APP_SNOWPLOW_COLLECTOR) ||
  process.env.REACT_APP_SNOWPLOW_COLLECTOR;

const initializeTracker = (endpoint) => {
  tracker = newTracker("Snowplow_standalone_PSA", endpoint, {
    cookieLifetime: 86400 * 548,
    platform: "web",
    post: true,
    forceSecureTracker: true,
    contexts: { webPage: true, performanceTiming: true },
    plugins: [LinkClickTrackingPlugin()],
  });

  enableActivityTracking({
    minimumVisitLength: 30,
    heartbeatDelay: 30,
  });
};

const isTrackerInitialized = () => tracker !== undefined;

const startTracking = () => {
  setTimeout(() => {
    enableLinkClickTracking({ pseudoClicks: true });
    refreshLinkClickTracking();
    trackPageView();
  }, 500);
};

const useSnowPlow = () => {
  const location = useLocation();
  const [isInit, setIsInit] = React.useState(isTrackerInitialized());
  if (!isInit) {
    initializeTracker(COLLECTOR);
    setIsInit(true);
  }
  // this is for internal link click
  React.useEffect(() => {
    if (isInit) {
      startTracking();
    }
  }, [location, isInit]);

  // this is for external link click
  React.useEffect(() => {
    const handleClick = (event) => {
      // Get the element that was clicked
      const target = event.target;

      // Check if the clicked element is a link
      if (target.tagName === "A" && target.href) {
        // Create a URL object from the href property
        const href = new URL(target.href);
        const location = window.location;

        // Check if the hostname of the URL is different from the current location's hostname
        if (href.hostname !== location.hostname) {
          if (isInit) {
            startTracking();
          }
        }
      }
    };

    // Attach the event listener to document
    document.addEventListener("click", handleClick);

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [isInit]);
};

export default useSnowPlow;
