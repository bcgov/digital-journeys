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

const useSnowPlow = () => {
  const location = useLocation();

  React.useEffect(() => {
    // plugins
    const isInit = isTrackerInitialized();
    if (!isInit) {
      initializeTracker(COLLECTOR);
    }
    enableLinkClickTracking({ pseudoClicks: true });
    refreshLinkClickTracking();
    trackPageView();
  }, [location]);
};

export default useSnowPlow;
