import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { useSelector } from "react-redux";

import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";
import { BASE_ROUTE } from "../constants/constants";

/*import SideBar from "../containers/SideBar";*/
import NavBar from "../containers/NavBar";
import Footer from "../components/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NotFound from "./NotFound";

import { Container } from "react-bootstrap";
import ReleaseNoteModal from "./ReleaseNote/ReleaseNoteModal";

const BaseRouting = React.memo(({ store }) => {
  const isAuth = useSelector((state) => state.user.isAuthenticated);

  return (
    <>
      {isAuth ? <NavBar /> : null}
      {isAuth ? <ReleaseNoteModal /> : null}
      <div className="wrapper">
        {/*{isAuth?<SideBar store={store} />:null}*/}
        <div className="content">
          <Container className="app-container">
            <ToastContainer />
            <Switch>
              <Route path="/public">
                <PublicRoute store={store} />
              </Route>
              <Route path={BASE_ROUTE}>
                <PrivateRoute store={store} />
              </Route>
              <Route path="/404" exact={true} component={NotFound} />
              <Redirect from="*" to="/404" />
            </Switch>
          </Container>
        </div>
        {isAuth ? <Footer /> : null}
      </div>
    </>
  );
});

export default BaseRouting;
