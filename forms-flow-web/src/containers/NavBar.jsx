import React, { useEffect /* useMemo */ } from "react";
import {
  /* Navbar, Container, Nav, */ NavDropdown,
  Button,
} from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import UserService from "../services/UserService";
import {
  /* getUserRoleName, */
  getUserRolePermission,
  // TODO : modify insigth permission conditions
  getUserInsightsPermission,
} from "../helper/user";

import "./styles.scss";
import {
  CLIENT,
  STAFF_REVIEWER,
  /* APPLICATION_NAME, */
  STAFF_DESIGNER,
  MULTITENANCY_ENABLED,
  MANAGER_GROUP,
} from "../constants/constants";
// import ServiceFlowFilterListDropDown from "../components/ServiceFlow/filter/ServiceTaskFilterListDropDown";
import { push } from "connected-react-router";
import i18n from "../resourceBundles/i18n";
// import { setLanguage } from "../actions/languageSetAction";
// import { updateUserlang } from "../apiManager/services/userservices";

import { fetchSelectLanguages } from "../apiManager/services/languageServices";

import Navigation from "./Override/Navigation";

const NavBar = React.memo(() => {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const location = useLocation();
  const { pathname } = location;
  const user = useSelector((state) => state.user.userDetail);
  const lang = useSelector((state) => state.user.lang);
  const userRoles = useSelector((state) => state.user.roles);
  const showApplications = useSelector((state) => state.user.showApplications);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  // const applicationTitle = useSelector(
  //   (state) => state.tenants?.tenantData?.details?.applicationTitle
  // );
  const baseUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  // const selectLanguages = useSelector((state) => state.user.selectLanguages);
  const dispatch = useDispatch();
  // const logoPath = "/logo.svg";
  // const getAppName = useMemo(
  //   () => () => {
  //     if (!MULTITENANCY_ENABLED) {
  //       return APPLICATION_NAME;
  //     }
  //     // TODO: Need a propper fallback component prefered a skeleton.
  //     return applicationTitle || "";
  //   },
  //   [MULTITENANCY_ENABLED, applicationTitle]
  // );
  // const appName = getAppName();
  // const { t } = useTranslation();

  useEffect(() => {
    dispatch(fetchSelectLanguages());
  }, [dispatch]);

  useEffect(() => {
    i18n.changeLanguage(lang);
  }, [lang]);

  // const handleOnclick = (selectedLang) => {
  //   dispatch(setLanguage(selectedLang));
  //   dispatch(updateUserlang(selectedLang));
  // };
  const logout = () => {
    dispatch(push(baseUrl));
    UserService.userLogout();
  };

  const handleOnBannerClick = () => {
    dispatch(push(`/`));
  };

  const analyticsDropdown = () => (
    <NavDropdown
      className={pathname.match(/^\/metrics/) ? "active" : null}
      title="Dashboards"
      id="dashboard-dropdown"
    >
      <NavDropdown.Item
        as={Link}
        to="/metrics"
        className={`main-nav nav-item ${
          pathname?.match(/^\/metrics/) ? "active-tab" : ""
        }`}
      >
        Metrics
      </NavDropdown.Item>
      {isAuthenticated && getUserInsightsPermission() && (
        <NavDropdown.Item
          as={Link}
          to="/insights"
          className={`main-nav nav-item ${
            pathname?.match(/^\/insights/) ? "active-tab" : ""
          }`}
        >
          Insights
        </NavDropdown.Item>
      )}
    </NavDropdown>
  );

  const navItems = () => [
    !getUserRolePermission(userRoles, STAFF_REVIEWER) &&
    !getUserRolePermission(userRoles, CLIENT) ? (
      <Link className={pathname.match(/^\/form/) ? "active" : null} to="/form">
        Forms
      </Link>
    ) : null,
    getUserRolePermission(userRoles, STAFF_DESIGNER) ? (
      <Link
        className={pathname.match(/^\/admin/) ? "active" : null}
        to="/admin"
      >
        Admin
      </Link>
    ) : null,
    showApplications &&
    !getUserRolePermission(userRoles, CLIENT) &&
    !getUserRolePermission(userRoles, STAFF_REVIEWER) ? (
      <Link
        className={pathname.match(/^\/application/) ? "active" : null}
        to="/application"
      >
        Applications
      </Link>
    ) : null,
    (getUserRolePermission(userRoles, MANAGER_GROUP) ||
      getUserRolePermission(userRoles, STAFF_REVIEWER)) && (
      <Link className={pathname.match(/^\/task/) ? "active" : null} to="/task">
        Review and Process Applications
      </Link>
    ),
    !getUserRolePermission(userRoles, STAFF_REVIEWER) &&
    !getUserRolePermission(userRoles, CLIENT)
      ? analyticsDropdown()
      : null,
  ];

  const items = navItems()
    .filter((item) => item)
    .map((item) => <li key={Math.random().toString()}>{item}</li>);

  return (
    <Navigation
      className="page-navigation"
      header="main"
      mobileBreakPoint={800}
      onBannerClick={handleOnBannerClick}
      title={
        <>
          {"Digital Journeys"}
          {user ? (
            <Button onClick={logout} variant="outline-light">
              Sign Out
            </Button>
          ) : null}
        </>
      }
    >
      {isAuthenticated && (
        <div className={items?.length ? "menu-padded" : ""}>
          <ul>
            <div className="sign-out-button">
              <Button onClick={logout} variant="outline-light">
                Sign Out
              </Button>
            </div>
            {items}
          </ul>
        </div>
      )}
    </Navigation>
  );
});

export default NavBar;
