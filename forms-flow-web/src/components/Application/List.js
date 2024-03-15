import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import BootstrapTable from "react-bootstrap-table-next";
import filterFactory from "react-bootstrap-table2-filter";
import paginationFactory from "react-bootstrap-table2-paginator";
import ToolkitProvider from "react-bootstrap-table2-toolkit";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import {
  setApplicationListActivePage,
  setCountPerpage,
  setApplicationListLoader,
  setSelectedApplicationForDelete,
} from "../../actions/applicationActions";
import {
  getAllApplications,
  FilterApplications,
  getAllApplicationStatus,
  deleteApplicationById,
} from "../../apiManager/services/applicationServices";
import Loading from "../../containers/Loading";
import Nodata from "./nodata";
import { useTranslation } from "react-i18next";
import { columns, getoptions, defaultSortedBy } from "./table";
import { getUserRolePermission } from "../../helper/user";
import {
  CLIENT,
  // DRAFT_ENABLED,
  MULTITENANCY_ENABLED,
  STAFF_REVIEWER,
} from "../../constants/constants";
// import { CLIENT_EDIT_STATUS } from "../../constants/applicationConstants";
import Alert from "react-bootstrap/Alert";
import { Translation } from "react-i18next";

import overlayFactory from "react-bootstrap-table2-overlay";
import { SpinnerSVG } from "../../containers/SpinnerSVG";
import Head from "../../containers/Head";
import { push } from "connected-react-router";
import isValiResourceId from "../../helper/regExp/validResourceId";

import Confirm from "../../containers/Confirm";
import { toast } from "react-toastify";
import LoadingOverlay from "react-loading-overlay";
import { hasFormEditAccessByStatus } from "../../helper/access";

export const ApplicationList = React.memo(() => {
  const { t } = useTranslation();
  const applications = useSelector(
    (state) => state.applications.applicationsList
  );
  const countPerPage = useSelector((state) => state.applications.countPerPage);
  const applicationStatus = useSelector(
    (state) => state.applications.applicationStatus
  );
  const isApplicationListLoading = useSelector(
    (state) => state.applications.isApplicationListLoading
  );
  const applicationCount = useSelector(
    (state) => state.applications.applicationCount
  );
  // const draftCount = useSelector((state) => state.draft.draftCount);
  const dispatch = useDispatch();
  const userRoles = useSelector((state) => state.user.roles);
  const userObj = useSelector((state) => state.user.userDetail);
  const page = useSelector((state) => state.applications.activePage);
  const iserror = useSelector((state) => state.applications.iserror);
  const error = useSelector((state) => state.applications.error);
  const [filtermode, setfiltermode] = React.useState(false);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const [lastModified, setLastModified] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [invalidFilters, setInvalidFilters] = React.useState({});

  const selectedApplicationForDelete = useSelector(
    (state) => state.applications.selectedApplicationForDelete
  );

  const [isDeletingApplication, setIsDeletingApplication] = React.useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, [applications]);
  useEffect(() => {
    dispatch(getAllApplicationStatus());
  }, [dispatch]);

  const useNoRenderRef = (currentValue) => {
    const ref = useRef(currentValue);
    ref.current = currentValue;
    return ref;
  };

  const countPerPageRef = useNoRenderRef(countPerPage);

  const currentPage = useNoRenderRef(page);

  useEffect(() => {
    dispatch(getAllApplications(currentPage.current, countPerPageRef.current));
  }, [dispatch, currentPage, countPerPageRef, isDeletingApplication]);

  const isClientEdit = (applicationStatus, formName) => {
    if (
      getUserRolePermission(userRoles, CLIENT) ||
      getUserRolePermission(userRoles, STAFF_REVIEWER)
    ) {
      return hasFormEditAccessByStatus(formName, applicationStatus);
      // return CLIENT_EDIT_STATUS.includes(applicationStatus);
    } else {
      return false;
    }
  };

  if (isApplicationListLoading) {
    return <Loading />;
  }
  const getNoDataIndicationContent = () => {
    return (
      <div className="div-no-application">
        <label className="lbl-no-application">
          {" "}
          <Translation>{(t) => t("No applications found")}</Translation>{" "}
        </label>
        <br />
        <label className="lbl-no-application-desc">
          {" "}
          <Translation>
            {(t) =>
              t("Please change the selected filters to view applications")
            }
          </Translation>
        </label>
        <br />
      </div>
    );
  };
  const validateFilters = (newState) => {
    if (
      newState.filters?.id?.filterVal &&
      !isValiResourceId(newState.filters?.id?.filterVal)
    ) {
      return setInvalidFilters({ ...invalidFilters, APPLICATION_ID: true });
    } else {
      return setInvalidFilters({ ...invalidFilters, APPLICATION_ID: false });
    }
  };

  const handlePageChange = (type, newState) => {
    validateFilters(newState);
    if (type === "filter") {
      setfiltermode(true);
    } else if (type === "pagination") {
      if (countPerPage > 5) {
        dispatch(setApplicationListLoader(true));
      } else {
        setIsLoading(true);
      }
    }
    dispatch(setCountPerpage(newState.sizePerPage));
    dispatch(FilterApplications(newState));
    dispatch(setApplicationListActivePage(newState.page));
  };

  const listApplications = (applications) => {
    let totalApplications = applications.map((application) => {
      application.isClientEdit = isClientEdit(application.applicationStatus, 
        application.applicationName);
      application.loggedInUserObj = userObj;
      application.userRoles = userRoles;
      return application;
    });
    return totalApplications;
  };

  const headerList = () => {
    return [
      {
        name: "Applications",
        count: applicationCount,
        onClick: () => dispatch(push(`${redirectUrl}application`)),
        icon: "list",
        title: "Submitted Forms",
        description: "All forms that have been submitted",
      },
      // {
      //   name: "Drafts",
      //   count: draftCount,
      //   onClick: () => dispatch(push(`${redirectUrl}draft`)),
      //   icon: "edit",
      // },
    ];
  };

  let headOptions = headerList();

  // if (!DRAFT_ENABLED) {
  //   headOptions.pop();
  // }

  return (
    <ToolkitProvider
      bootstrap4
      keyField="id"
      data={listApplications(applications)}
      columns={columns(
        applicationStatus,
        lastModified,
        setLastModified,
        t,
        redirectUrl,
        invalidFilters
      )}
      search
    >
      {(props) => (
        <div className="container" role="definition">
        <LoadingOverlay
            active={isDeletingApplication}
            spinner
            text="Deleting..."
            className="col-12"
          >
            <Confirm
              modalOpen={selectedApplicationForDelete.modalOpen}
              message={
                "Are you sure you want to delete this application? Deleting this application will eliminate the submitted form and all existing information on it from the database."
              }
              onNo={() => {
                dispatch(
                  setSelectedApplicationForDelete({
                    modalOpen: false,
                    applicationId: "",
                    applicationName: "",
                  })
                );
              }}
              onYes={() => {
                setIsDeletingApplication(true);
                dispatch(
                  setSelectedApplicationForDelete({
                    modalOpen: false,
                    applicationId: "",
                    applicationName: "",
                  })
                );
                dispatch(
                  deleteApplicationById(
                    selectedApplicationForDelete.applicationId,
                    (error) => {
                      if (error) {
                        toast.error(
                          "There was an error deleting the application!"
                        );
                      } else {
                        toast.success("Application deleted successfully");
                      }
                      setIsDeletingApplication(false);
                    }
                  )
                );
              }}
            />
            <Head items={headOptions} page="Applications" />
            <br />
            <div>
              {applicationCount > 0 || filtermode ? (
                <BootstrapTable
                  remote={{ pagination: true, filter: true, sort: true }}
                  loading={isLoading}
                  filter={filterFactory()}
                  pagination={paginationFactory(
                    getoptions(applicationCount, page, countPerPage)
                  )}
                  onTableChange={handlePageChange}
                  filterPosition={"top"}
                  {...props.baseProps}
                  noDataIndication={() =>
                    !isLoading && getNoDataIndicationContent()
                  }
                  defaultSorted={defaultSortedBy}
                  overlay={overlayFactory({
                    spinner: <SpinnerSVG />,
                    styles: {
                      overlay: (base) => ({
                        ...base,
                        background: "rgba(255, 255, 255)",
                        height: `${
                          countPerPage > 5
                            ? "100% !important"
                            : "350px !important"
                        }`,
                        top: "65px",
                      }),
                    },
                  })}
                />
              ) : iserror ? (
                <Alert variant={"danger"}>{error}</Alert>
              ) : (
                <Nodata text={t("No Applications Found")} />
              )}
            </div>
          </LoadingOverlay>
        </div>
      )}
    </ToolkitProvider>
  );
});

export default ApplicationList;
