import React from "react";
import {Navbar, Dropdown, Container, Nav, NavDropdown, Button} from "react-bootstrap";
import {Link, useLocation} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import UserService from "../services/UserService";
import {getUserRoleName, getUserRolePermission, getUserInsightsPermission} from "../helper/user";
import { useHistory } from "react-router-dom";
import Navigation from "@button-inc/bcgov-theme/Navigation";

import "./styles.scss";
import {CLIENT, STAFF_REVIEWER, APPLICATION_NAME, STAFF_DESIGNER} from "../constants/constants";
import ServiceFlowFilterListDropDown from "../components/ServiceFlow/filter/ServiceTaskFilterListDropDown";
import {push} from "connected-react-router";

const NavBar = React.memo(() => {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const location = useLocation();
  const { pathname } = location;
  const user = useSelector((state) => state.user.userDetail);
  const userRoles = useSelector((state) => state.user.roles);
  const showApplications= useSelector((state) => state.user.showApplications);

  
  const dispatch = useDispatch();

  const logout = () => {
      dispatch(push(`/`));
      UserService.userLogout();
  }

  const handleOnBannerClick = () => {
    dispatch(push(`/`))
  }
  
  const analyticsDropdown = () => (
    <NavDropdown
        className={pathname.match(/^\/metrics/)? 'active': null}
        title="Dashboards"
        id="dashboard-dropdown">
      <NavDropdown.Item
          as={Link}
          to='/metrics'
          className={`main-nav nav-item ${pathname?.match(/^\/metrics/) ? "active-tab" : ""}`}>
        Metrics
      </NavDropdown.Item>
      {isAuthenticated && getUserInsightsPermission() &&
        <NavDropdown.Item
            as={Link}
            to='/insights'
            className={`main-nav nav-item ${pathname?.match(/^\/insights/) ? "active-tab" : ""}`}>
          Insights
        </NavDropdown.Item>}
    </NavDropdown>
  );

  const navItems = () => [
    (!getUserRolePermission(userRoles, STAFF_REVIEWER) && !getUserRolePermission(userRoles, CLIENT)) ? (
      <Link
          className={pathname.match(/^\/form/)? 'active': null}
          to='/form'>
        Forms
      </Link>
    ) : null,
    getUserRolePermission(userRoles, STAFF_DESIGNER)? (
      <Link
          className={pathname.match(/^\/admin/)? 'active': null}
          to='/admin'>
        Admin
      </Link>
    ): null,
    showApplications &&  (( !getUserRolePermission(userRoles, CLIENT) && !getUserRolePermission(userRoles, STAFF_REVIEWER))) ?
      <Link 
          className={pathname.match(/^\/application/)? 'active': null}
          to='/application'>
        Applications
      </Link>: null,
    (!getUserRolePermission(userRoles, STAFF_REVIEWER) && !getUserRolePermission(userRoles, CLIENT)) ? analyticsDropdown(): null,
      <Link
          className={pathname.match(/^\/task/)? 'active': null}
          to='/task'>
        Review and Process Applications
      </Link>,
    getUserRolePermission(userRoles, STAFF_REVIEWER) ? analyticsDropdown(): null,
  ];

  return (
    <Navigation
      className="page-navigation"
      header="main"
      mobileBreakPoint={800}
      onBannerClick={handleOnBannerClick}
      title={
        <>
          {"Digital Journeys"}
          {user? (
            <Button onClick={logout} variant="outline-light">Sign Out</Button>
          ): null}
        </>
      }>
        {isAuthenticated && <div>
          <ul>
            <div className="sign-out-button">
              <Button onClick={logout} variant="outline-light">Sign Out</Button>
            </div>
            {navItems()
              .filter(item => item)
              .map(item => <li>{item}</li>)}
          </ul>
          </div>}
    </Navigation>
  );
});

export default NavBar;
