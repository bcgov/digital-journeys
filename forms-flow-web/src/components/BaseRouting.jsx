import React from "react";
import { Route, Switch } from "react-router-dom";
import {useSelector} from "react-redux";

import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";

/*import SideBar from "../containers/SideBar";*/
import NavBar from "../containers/NavBar";
import Footer from "../components/Footer";
import { ToastContainer } from 'react-toastify';
import { Container } from "react-bootstrap";
import 'react-toastify/dist/ReactToastify.css'

const BaseRouting = React.memo(({store}) => {
  const isAuth = useSelector((state) => state.user.isAuthenticated);

  return (
    <>
      {isAuth?<NavBar/>:null}
      <div className="wrapper">
          <div className="content">
            <Container className="app-container">
                <ToastContainer />
                <Switch>
                  <Route path="/public"><PublicRoute store={store}/></Route>
                  <Route path="/">
                      <PrivateRoute store={store} />
                  </Route>
                </Switch>
            </Container>
          </div>
          {isAuth?<Footer />:null}
      </div>
    </>
  );
});


export default BaseRouting;
