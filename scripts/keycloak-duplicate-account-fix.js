const AdminClient = require("keycloak-admin").default;
const { Issuer } = require("openid-client");

const keycloakConfig = {
  baseUrl: "",
  realmName: "",
  adminClientId: "",
  adminSecret: "",
};

const adminClient = new AdminClient({
  baseUrl: keycloakConfig.baseUrl,
  realmName: keycloakConfig.realmName,
});

// A function to authenticate with the Keycloak provider. Run it only once.
const authenticateWithProvider = async () => {
  try {
    const accessToken = await adminClient.getAccessToken();
    if (accessToken) {
      return;
    }
    const issuer = await Issuer.discover(
      `${keycloakConfig.baseUrl}/realms/${keycloakConfig.realmName}`
    );
    const client = new issuer.Client({
      client_id: keycloakConfig.adminClientId,
      client_secret: keycloakConfig.adminSecret,
    });
    const token = await client.grant({
      grant_type: "client_credentials",
    });
    await adminClient.setAccessToken(token.access_token);
  } catch (error) {
    console.log(error);
  }
};

const main = async () => {
  await authenticateWithProvider();
  /***************** STEP 1 remove duplicate account *****************/

  /* Find the list of emails associated with more than one accounts from Keycloak's database:
    SELECT email
    FROM user_entity
    GROUP BY email
    HAVING COUNT(*) > 1; 
  */
  const duplicateAccountsEmails = ["email1", "email2"];

  for (let i = 0; i < duplicateAccountsEmails.length; i++) {
    const email = duplicateAccountsEmails[i];

    const usersAssociatedWithEmail = await adminClient.users.findOne({ email });
    for (let j = 0; j < usersAssociatedWithEmail.length; j++) {
      const user = usersAssociatedWithEmail[j];
      await adminClient.users.del({ id: user.id });
    }

    // Create a new user based on that email for IDIR users
    const newUser = await adminClient.users.create({
      username: email + "_idir",
      email,
      enabled: true,
    });

    // Find the manager group
    const groups = await adminClient.groups.find();
    const managerGroup = groups
      .map((el) => el.subGroups)
      .flat()
      .filter((el) => el.name === "manager")[0];

    // Add the manager group to the newly created user
    try {
      await adminClient.users.addToGroup({
        groupId: managerGroup.id,
        id: newUser.id,
      });
    } catch (error) {
      console.log(error);
    }
  }
  /***************** END of STEP 1 *****************/

  /***************** STEP 2 Update all the IDIR account with the new username *****************/
  /* Find the list of users with legacy username from Keycloak's database:
    SELECT username, id, email
    from user_entity
    WHERE username LIKE '%@idir';
  */
  const usersWithLegacyUsername = [{ id: "", username: "", email: "" }];
  for (let i = 0; i < usersWithLegacyUsername.length; i++) {
    console.log(i + " / " + usersWithLegacyUsername.length);
    let legacyUser = usersWithLegacyUsername[i];
    await adminClient.users.update(
      { id: legacyUser.id },
      { username: `${legacyUser.email}_idir` }
    );
    console.log(i + " success");
  }
  /***************** END of STEP 2 *****************/
};

main();
