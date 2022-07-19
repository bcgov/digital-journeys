import React from "react";
import {useSelector} from "react-redux";

import "./Success.scss";
import Logo from "../../../../../assets/DJLogo.png" 
import Loading from "../../../../../containers/Loading";
import { useLocation } from "react-router-dom";

let user = "";

export default React.memo(() => {
  user = useSelector(state=>state.user.roles || []);
  const { search } = useLocation();
  const isAuthenticated = useSelector(state=>state.user.isAuthenticated);
  if (!isAuthenticated) {
    return <Loading />;
  }


  const getBody = () => {
    if (search.includes('submission')) {
      return (
        <>
          <span className="success-content-intro">Thank you for submitting a telework agreement request. Your supervisor/delegate has been notified by email of your request.</span>
          <div className="success-content-body">
            <ul>
              <li>This message does not confirm approval of your telework request.</li>

              <li>You will receive another email after your supervisor/delegate submits their decision. with a pdf attachment of the completed submission. The pdf can be stored on your personal file or according to your ministry's record-keeping policy.</li>

              <li>If you have not received an email confirming their decision within 15 days, please discuss the status of your telework agreement with them.</li>

              <li>Your request expires in 30 calendar days. If your request has not been processed within 30 calendar days you will need to submit a new request.</li>

              <li>If you have any questions about the status of your telework agreement request, please check with your supervisor or delegate.</li>

              <li>For questions or feedback about the Telework form or other PSA forms, please contact the <a href="mailto:DigitalJourneys@gov.bc.ca">Digital Journeys team</a>.</li>
            </ul>
          </div>
        </>
      )
    } else if (search.includes('approval')) {
      return (
        <>
          <span className="success-content-intro">Thank you for submitting reviewing and completing this telework agreement request.</span>
          <div className="success-content-body">
            <ul>
              <li>The employee has been notified by email of your decision and has received a pdf copy of the completed telework agreement.</li>

              <li>You will receive by email a pdf copy of the Telework Agreement, as well as an attachment with ADM approval if the request was for three or more Telework days.</li>

              <li>The attachments can be stored in your personal files or according to your ministry's record-keeping policy.</li>

              <li>For questions or feedback about the Telework form or other PSA forms, please contact the <a href="mailto:DigitalJourneys@gov.bc.ca">Digital Journeys team</a>.</li>
            </ul>
          </div>
        </>
      )
    }
  }


  return (
    <div className="container" id="main">
      <div className="success-body">
        <div className="title-row">
          <img src={Logo} alt="Logo" width="260"/>
          <div>APPLICATION</div>
        </div>
        <div className="success-content">
          {
            getBody()
          }
        </div>
      </div>
    </div>
  );
});