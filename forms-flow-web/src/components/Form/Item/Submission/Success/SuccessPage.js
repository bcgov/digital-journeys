import React from "react";
import { useSelector } from "react-redux";

import "./Success.scss";
import Logo from "../../../../../assets/DJLogo.png";
import Loading from "../../../../../containers/Loading";
import { useLocation } from "react-router-dom";

import * as successTypes from "../../../../../constants/successTypes";

export default React.memo(() => {
  const { search } = useLocation();
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  if (!isAuthenticated) {
    return <Loading />;
  }

  const getBody = () => {
    if (search.includes("submission")) {
      return (
        <>
          <span className="success-content-intro">
            Thank you for submitting a telework agreement request. Your
            supervisor/delegate has been notified by email of your request.
          </span>
          <div className="success-content-body">
            <ul>
              <li>
                This message does not confirm approval of your telework request.
              </li>

              <li>
                You will receive another email after your supervisor/delegate
                submits their decision with a pdf attachment of the completed
                submission.
              </li>

              <li>
                The pdf can be stored on your personnel files or according to
                your ministry&apos;s record-keeping policy.
              </li>

              <li>
                If you have not received an email confirming their decision
                within 15 days, please discuss the status of your telework
                agreement with them.
              </li>

              <li>
                Your request expires in 30 calendar days. If your request has
                not been processed within 30 calendar days you will need to
                submit a new request.
              </li>

              <li>
                If you have any questions about the status of your telework
                agreement request, please check with your supervisor or
                delegate.
              </li>

              <li>
                For questions or feedback about the Telework form or other PSA
                forms, please{" "}
                <a href="mailto:DigitalJourneys@gov.bc.ca">
                  contact the Digital Journeys team
                </a>
                .
              </li>

              <li>You may now close this window.</li>
            </ul>
          </div>
        </>
      );
    } else if (search.includes("approval")) {
      return (
        <>
          <span className="success-content-intro">
            Thank you for reviewing and completing this telework agreement
            request.
          </span>
          <div className="success-content-body">
            <ul>
              <li>
                The employee has been notified by email of your decision and has
                received a pdf copy of the completed telework agreement.
              </li>

              <li>
                You will receive by email a pdf copy of the Telework Agreement,
                as well as an attachment with ADM (or delegate) approval if the
                request was for three or more Telework days.
              </li>

              <li>
                The attachments can be stored in your personnel files or
                according to your ministry&apos;s record-keeping policy.
              </li>

              <li>
                For questions or feedback about the Telework agreement or other
                PSA forms, please{" "}
                <a href="mailto:DigitalJourneys@gov.bc.ca">
                  contact the Digital Journeys team
                </a>
                .
              </li>

              <li>You may now close this window.</li>
            </ul>
          </div>
        </>
      );
    } else if (
      search.includes(successTypes.SL_REVIEW_SUBMISSION) ||
      search.includes(successTypes.SL_REVIEW_RESUBMISSION)
    ) {
      return (
        <>
          <span className="success-content-intro">
            Thank you for your commitment to supporting career development of
            your Senior Leadership team and for your contribution to executive
            succession.
          </span>
          <div className="success-content-body">
            <ul>
              <li>
                The information you’ve provided will be shared with Executive
                Talent Management, Corporate Workforce Strategies in the Public
                Service Agency, as well as ministry Strategic Human Resources
                (ministry-specific data). Broad themes will be presented to
                DMCPSR to further the conversation on executive talent and
                utilized for executive succession and development strategies,
                programs and activities.
              </li>

              <li>
                Please download a PDF copy for your files and share with the
                senior leader. Continue conversations with the identified senior
                leader to refine their learning and development plan, goals, and
                actions in support of their aspirations. Your Ministry Human
                Resources representative can connect the senior leader with
                targeted ministry and corporate learning opportunities to ensure
                they have access to the essential learning and experiences that
                will set them up for success. Coaching services are also
                available to senior leaders.
              </li>

              <li>
                If you have any questions, please&nbsp;
                <a href="mailto:jodi.little@gov.bc.ca">contact Jodi Little</a>
                &nbsp;Leadership Development and Succession Lead.
              </li>

              <li>You may now close this window.</li>
            </ul>
          </div>
        </>
      );
    }
  };

  return (
    <div className="container" id="main">
      <div className="success-body">
        <div className="title-row">
          <img src={Logo} alt="Logo" width="260" />
        </div>
        <div className="success-content">{getBody()}</div>
      </div>
    </div>
  );
});
