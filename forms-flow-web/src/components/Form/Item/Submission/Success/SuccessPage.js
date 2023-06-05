import React from "react";
import { useSelector } from "react-redux";

import "./Success.scss";
import Logo from "../../../../../assets/DJLogo.png";
import Loading from "../../../../../containers/Loading";
import { useLocation } from "react-router-dom";

import * as successTypes from "../../../../../constants/successTypes";

export default React.memo(() => {
  const { search } = useLocation();
  const origin = window.location.origin.toString();
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  if (!isAuthenticated) {
    return <Loading />;
  }

  const getBody = () => {
    if (search.includes(successTypes.TELEWORK_SUBMISSION)) {
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
                Your request expires in 60 calendar days. If your request has
                not been processed within 60 calendar days you will need to
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
    } else if (search.includes(successTypes.TELEWORK_FINAL_SUBMISSION)) {
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
    } else if (search.includes(successTypes.SL_REVIEW_SUBMISSION)) {
      return (
        <>
          <span className="success-content-intro">
            Almost done! Your nomination has been submitted for your ministry to
            validate. Please make sure to come back and complete the final
            sign-off after discussions with your Deputy Minister (DM). Next
            steps:
          </span>
          <div className="success-content-body">
            <ol>
              <li>
                The ministry will communicate the approach you will be using to
                validate senior leader readiness.{" "}
                <a
                  href="https://bcgov.sharepoint.com/teams/06164/SitePages/Ministry-Validation.aspx"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Reach out to the ministry key contact
                </a>{" "}
                for further instruction.
              </li>

              <li>
                Once the DM/executive team has validated the senior leaders’
                readiness, please remember to go back into the system and
                re-open the form in the &quot;Submitted Forms&quot; tab to
                document any additional feedback and adjust the readiness rating
                as needed.
              </li>

              <li>
                When validated and finalized, all forms must be signed and
                submitted by you using the ‘Final Submission’ button by 11:59 PM
                on September 29, 2023.
              </li>

              <li>
                After September 29, 2023, unsigned forms that have not been
                submitted as final will be considered incomplete and will not be
                included in the data captured for corporate reporting. These
                files will be deleted from the system.
              </li>

              <li>
                If you have any questions,{" "}
                <a href="mailto:PSA.SeniorLeadershipReview@gov.bc.ca">
                  please contact the SLR team
                </a>
              </li>
            </ol>
          </div>
        </>
      );
    } else if (search.includes(successTypes.SL_REVIEW_RESUBMISSION)) {
      return (
        <>
          <span className="success-content-intro">
            Almost done! Your nomination has been submitted for your ministry to
            validate. Please make sure to come back and complete the final
            sign-off after discussions with your Deputy Minister (DM). Next
            steps:
          </span>
          <div className="success-content-body">
            <ol>
              <li>
                The ministry will communicate the approach you will be using to
                validate senior leader readiness.{" "}
                <a
                  href="https://bcgov.sharepoint.com/teams/06164/SitePages/Ministry-Validation.aspx"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Reach out to the ministry key contact
                </a>{" "}
                for further instruction.
              </li>

              <li>
                Once the DM/executive team has validated the senior leaders’
                readiness, please remember to go back into the system and
                re-open the form in the &quot;Submitted Forms&quot; tab to
                document any additional feedback and adjust the readiness rating
                as needed.
              </li>

              <li>
                When validated and finalized, all forms must be signed and
                submitted by you using the ‘Final Submission’ button by 11:59 PM
                on September 29, 2023.
              </li>

              <li>
                After September 29, 2023, unsigned forms that have not been
                submitted as final will be considered incomplete and will not be
                included in the data captured for corporate reporting. These
                files will be deleted from the system.
              </li>

              <li>
                If you have any questions,{" "}
                <a href="mailto:PSA.SeniorLeadershipReview@gov.bc.ca">
                  please contact the SLR team
                </a>
              </li>
            </ol>
          </div>
        </>
      );
    } else if (search.includes(successTypes.SL_REVIEW_FINAL_SUBMISSION)) {
      return (
        <>
          <span className="success-content-intro">
            Thank you for your commitment to supporting senior leadership and
            executive succession.
          </span>
          <div className="success-content-body">
            <ul>
              <li>
                The information you’ve provided will be shared with Executive
                Talent Management and Corporate Workforce Strategies in the
                Public Service Agency, ministry SLR key contact
                (ministry-specific data), and DMC/DMCPSR to inform executive
                succession and senior leadership development strategies,
                programs and activities at both the ministry and corporate
                levels.
              </li>

              <li>
                Shortly, you will receive an email with a PDF copy of the form
                for your records.
              </li>

              <li>
                If you have any questions, please contact{" "}
                <a href="mailto:PSA.SeniorLeadershipReview@gov.bc.ca">
                  the SLR Team
                </a>
                .
              </li>
            </ul>
          </div>
        </>
      );
    } else if (
      search.includes(successTypes.COMPLAINT_INTAKE_FORM_1_10_NOEMAIL)
    ) {
      return (
        <>
          <span className="success-content-intro">
            Thank you for submitting your Bullying / Misuse of Authority
            Complaint Form (Article 1.10)
          </span>
          <div className="success-content-body">
            <ul>
              <li>
                The Liquor Distribution Branch (LDB) will notify your union
                within 10 days of your complaint.
              </li>
              <li>
                LDB will assess your complaint and contact you regarding the
                process and timeline for next steps.
              </li>
              <li>
                You may ask for assistance from your union representative either
                before or after submitting your complaint.
              </li>
              <li>
                Starting 10 days after your submission, you may ask your union
                representative for an update on the status of a review or
                investigation arising from your complaint.
              </li>
              <li>
                You may access or download a copy of your complaint by visiting
                the
                <a href={origin}> Digital Journey portal</a>.
              </li>
            </ul>
          </div>
        </>
      );
    } else if (search.includes(successTypes.COMPLAINT_INTAKE_FORM_1_10_LDB)) {
      return (
        <>
          <span className="success-content-intro">
            Thank you for submitting your Bullying / Misuse of Authority
            Complaint Form (Article 1.10)
          </span>
          <div className="success-content-body">
            <ul>
              <li>
                The Liquor Distribution Branch (LDB) will notify your union
                within 10 days of your complaint.
              </li>
              <li>
                LDB will assess your complaint and contact you regarding the
                process and timeline for next steps.
              </li>
              <li>
                You may ask for assistance from your union representative either
                before or after submitting your complaint.
              </li>
              <li>
                Starting 10 days after your submission, you may ask your union
                representative for an update on the status of a review or
                investigation arising from your complaint.
              </li>
            </ul>
          </div>
        </>
      );
    } else if (search.includes(successTypes.COMPLAINT_INTAKE_FORM_1_10)) {
      return (
        <>
          <span className="success-content-intro">
            Thank you for submitting your Bullying / Misuse of Authority
            Complaint Form (Article 1.10)
          </span>
          <div className="success-content-body">
            <ul>
              <li>
                The Public Service Agency (PSA) will notify your union within 10
                days of your complaint.
              </li>
              <li>
                PSA will assess your complaint and contact you regarding the
                process and timeline for next steps.
              </li>
              <li>
                You may ask for assistance from your union representative either
                before or after submitting your complaint.
              </li>
              <li>
                Starting 10 days after your submission, you may ask your union
                representative for an update on the status of a review or
                investigation arising from your complaint.
              </li>
            </ul>
          </div>
        </>
      );
    } else if (search.includes(successTypes.INFLUENZA_WORKSITE_REGISTRATION_EDIT)) {
      return (
        <>
          <span className="success-content-intro">
            Thank you. Your form has been resubmitted.
          </span>
          <div className="success-content-body">
            <ul>
              <li>
                Our nurse teams will reach out to you July-August to begin
                organizing your clinic.
              </li>
              <li>
                You may check the&nbsp;
                <a href="https://www2.gov.bc.ca/gov/content/careers-myhr/all-employees/safety-health-well-being/health/cold-flu">
                  Cold & Flu page on the Careers & MyHR website
                </a>
                &nbsp; regularly for the most current information on the
                program.
              </li>

              <li>
                If you have any questions, please email the&nbsp;
                <a href="mailto:Cold.Flu@gov.bc.ca">Cold and Flu team</a>.
              </li>
            </ul>
          </div>
        </>
      );
    } else if (search.includes(successTypes.INFLUENZA_WORKSITE_REGISTRATION)) {
      return (
        <>
          <span className="success-content-intro">
            Thank you for registering your worksite for the 2023 Cold and Flu
            Program
          </span>
          <div className="success-content-body">
            <ul>
              <li>
                Our nurse teams will reach out to you July-August to begin
                organizing your clinic.
              </li>
              <li>
                You may check the&nbsp;
                <a href="https://www2.gov.bc.ca/gov/content/careers-myhr/all-employees/safety-health-well-being/health/cold-flu">
                  Cold & Flu page on the Careers & MyHR website
                </a>
                &nbsp; regularly for the most current information on the
                program.
              </li>

              <li>
                If you have any questions, please email the&nbsp;
                <a href="mailto:Cold.Flu@gov.bc.ca">Cold and Flu team</a>.
              </li>
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
