import {
  newTracker,
  trackPageView,
  enableActivityTracking,
} from "@snowplow/browser-tracker";
import {
  refreshLinkClickTracking,
  enableLinkClickTracking,
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
  });

  // plugins
  enableActivityTracking({
    minimumVisitLength: 30,
    heartbeatDelay: 30,
  });
  enableLinkClickTracking({ pseudoClicks: true });
  refreshLinkClickTracking();
};

const isTrackerInitialized = () => tracker !== undefined;

const useLocationChange = () => {
  const location = useLocation();
  React.useEffect(() => {
    trackPageView();
  }, [location]);
};

const useSnowPlow = () => {
  React.useEffect(() => {
    const isInit = isTrackerInitialized();
    if (!isInit) {
      initializeTracker(COLLECTOR);
    }
  }, []);

  useLocationChange();
};

export default useSnowPlow;
