/**
 * Initial steps involves running this script:
 * 1. Connect to your openshift environment (e.g., dev, test) using Openshift CLI
 * 2. forward patroni-0 pod's db port to your local. Use the following command to forward your 5432 port: $oc port-forward 5432
 */


const { Client } = require("pg");

// Please change this to connect to webApi and Camunda databases (database name is different for webApi and Camunda).
const dbConfig = {
  host: "db-host-here",
  port: 5432,
  user: "db-user-here",
  password: "password-here",
  database: "db-name-here",
};

const dbClient = new Client(dbConfig);

const migrateApplications = async (data) => {
  const newIdirUsername = data.created_by + "_idir";
  try {
    await dbClient.query(
      `
    UPDATE application
    SET
      created_by = $1
    WHERE id = $2
    `,
      [newIdirUsername, data.id]
    );
    console.log("successfully updated: " + JSON.stringify(data));
  } catch (error) {
    console.error(error, data);
  }
};

const migrateApplicationAudits = async (data) => {
  const newIdirUsername = data.submitted_by + "_idir";
  try {
    await dbClient.query(
      `
    UPDATE application_audit
    SET 
      submitted_by = $1
    WHERE id = $2
    `,
      [newIdirUsername, data.id]
    );
    console.log("successfully updated: " + JSON.stringify(data));
  } catch (error) {
    console.error(error, data);
  }
};

const migrateTaskAssignees = async (data) => {
  const newIdirUsername = data.assignee_ + "_idir";
  try {
    await dbClient.query(
      `
    UPDATE act_ru_task
    SET 
      assignee_ = $1
    WHERE id_ = $2
    `,
      [newIdirUsername, data.id_]
    );
    console.log("successfully updated: " + JSON.stringify(data));
  } catch (error) {
    console.error(error, data);
  }
};

const migrateAuthorizationForUsers = async (data) => {
  const newIdirUsername = data.user_id_ + "_idir";
  try {
    await dbClient.query(
      `
    UPDATE act_ru_authorization
    SET 
      user_id_ = $1
    WHERE id_ = $2
    `,
      [newIdirUsername, data.id_]
    );
    console.log("successfully updated: " + JSON.stringify(data));
  } catch (error) {
    console.error(error, data);
  }
};

const main = async () => {
  // Connect to DB
  await dbClient.connect();

  /** Step 1 - webApi db >> application table **/

  // Get all the applications without "_idir" postfix
  const { rows: applicationsResults } = await dbClient.query(
    "SELECT id, created_by from application Where created_by <> '' AND created_by IS NOT NULL"
  );
  const applicationsWithoutIdirPostfix = applicationsResults.filter(
    (el) =>
      !(
        el.created_by.includes("_idir") ||
        el.created_by.includes("_bcsc") ||
        el.created_by.includes("_bceid") ||
        el.created_by.includes("Anonymous-user")
      )
  );
  console.log(
    `******************** There are ${applicationsWithoutIdirPostfix.length} applicationsWithoutIdirPostfix to be updated ********************`
  );
  applicationsWithoutIdirPostfix.forEach(async (el, index) => {
    console.log(
      `Updating ${index + 1}/${applicationsWithoutIdirPostfix.length}: id: ${
        el.id
      }, created_by: ${el.created_by}`
    );
    await migrateApplications(el);
  });

  /** Step 2 - webApi db >> application_audit table **/

  // Get all the applicationAudits without "_idir" postfix
  const { rows: applicationAuditResults } = await dbClient.query(
    "SELECT id, submitted_by from application_audit Where submitted_by <> '' AND submitted_by IS NOT NULL"
  );
  const applicationAuditsWithoutIdirPostfix = applicationAuditResults.filter(
    (el) =>
      !(
        el.submitted_by.includes("_idir") ||
        el.submitted_by.includes("_bcsc") ||
        el.submitted_by.includes("_bceid") ||
        el.submitted_by.includes("service-account-forms-flow-bpm")
      )
  );
  console.log(
    `******************** There are ${applicationAuditsWithoutIdirPostfix.length} applicationAuditsWithoutIdirPostfix to be updated ********************`
  );
  applicationAuditsWithoutIdirPostfix.forEach(async (el, index) => {
    console.log(
      `Updating ${index + 1}/${
        applicationAuditsWithoutIdirPostfix.length
      }: id: ${el.id}, submitted_by: ${el.submitted_by}`
    );
    await migrateApplicationAudits(el);
  });

  /** Step 3 - bpm (Camunda) db >> act_ru_task table **/

  // Get all the Camunda task assignees without "_idir" postfix
  const { rows: taskAssigneeResults } = await dbClient.query(
    "SELECT id_, assignee_ from act_ru_task Where assignee_ <> '' AND assignee_ IS NOT NULL"
  );
  const taskAssigneesWithoutIdirPostfix = taskAssigneeResults.filter(
    (el) =>
      !(
        el.assignee_.includes("_idir") ||
        el.assignee_.includes("_bcsc") ||
        el.assignee_.includes("_bceid")
      )
  );
  console.log(
    `******************** There are ${taskAssigneesWithoutIdirPostfix.length} taskAssigneesWithoutIdirPostfix to be updated ********************`
  );
  taskAssigneesWithoutIdirPostfix.forEach(async (el, index) => {
    console.log(
      `Updating ${index + 1}/${taskAssigneesWithoutIdirPostfix.length}: id: ${
        el.id_
      }, assignee_: ${el.assignee_}`
    );
    await migrateTaskAssignees(el);
  });

  /** Step 4 - bpm (Camunda) db >> act_ru_authorization table **/

  // Get all the Camunda authorization for users without "_idir" postfix
  const { rows: authorizationForUsersResults } = await dbClient.query(
    "SELECT id_, user_id_ from act_ru_authorization Where user_id_ <> '' AND user_id_ IS NOT NULL"
  );
  const authorizationForUsersWithoutIdirPostfix =
    authorizationForUsersResults.filter(
      (el) =>
        !(
          el.user_id_.includes("_idir") ||
          el.user_id_.includes("_bcsc") ||
          el.user_id_.includes("_bceid") ||
          el.user_id_.includes("service-account-forms-flow-bpm") ||
          el.user_id_.includes("formsflow/formsflow-client") ||
          el.user_id_ === "*"
        )
    );
  console.log(
    `******************** There are ${authorizationForUsersWithoutIdirPostfix.length} authorizationForUsersWithoutIdirPostfix to be updated ********************`
  );
  authorizationForUsersWithoutIdirPostfix.forEach(async (el, index) => {
    console.log(
      `Updating ${index + 1}/${
        authorizationForUsersWithoutIdirPostfix.length
      }: id: ${el.id_}, user_id_: ${el.user_id_}`
    );
    await migrateAuthorizationForUsers(el);
  });
};

main();
