const request = require('supertest');
const { app, server } = require('../../../../app');
const { User } = require('../../../../api/models/user');
const { UserTestFunctions } = require('../../../functions/userTestFunctions');
const { AuthTestFunctions } = require('../../../functions/authTestFunctions');
const { AdminTestFunctions } = require('../../../functions/adminTestFunctions')

let accessToken = "";
let refreshToken = "";

afterAll(async () => {
    await server.close();
});

jest.setTimeout(30000);

describe("Admin Operations", () => {
    beforeAll(async () => {
        const response = await AuthTestFunctions.loginUser(
            "osaigbovojoshua@yahoo.com",
            "11720$GbesE"
        );

        accessToken = response.body.data.tokens.access.token;
        refreshToken = response.body.data.tokens.refresh.token;
    });

    describe("View Hosts", () => {
        const hostObject = UserTestFunctions.getHostObject();

        beforeAll(async () => {
            await AuthTestFunctions.registerUser(hostObject, accessToken, refreshToken);
        });

        afterAll(async () => {
            await UserTestFunctions.deleteUser("kutupa123@protonmail.com");
        });
        
        test("response status code is 200 if admins are returned successfully", async () => {
            const response = await UserTestFunctions.getHosts(accessToken, refreshToken);

            expect(response.statusCode).toBe(200);
        });

        test("response body object has the correct fields", async () => {
            const response = await UserTestFunctions.getHosts(accessToken, refreshToken);

            expect(response.body.data.hosts[0]).toHaveProperty('businessDetails');
            expect(response.body.data.hosts[0].businessDetails).toHaveProperty('name');
            expect(response.body.data.hosts[0].businessDetails).toHaveProperty('email');
            expect(response.body.data.hosts[0].businessDetails).toHaveProperty('type');
            expect(response.body.data.hosts[0]).toHaveProperty('createdAt');
            expect(response.body.data.hosts[0]).toHaveProperty('updatedAt');
        });
    });

    describe("View Host", () => {
        afterEach(async () => {
            await UserTestFunctions.deleteUser("kutupa123@protonmail.com");
        });

        const hostObject = UserTestFunctions.getHostObject();

        test("response status code is 200 if user is returned successfully", async () => {
            const response = await AuthTestFunctions.registerUser(hostObject);

            const user = await UserTestFunctions.getHost(response.body.data.user._id, accessToken, refreshToken);

            expect(user.statusCode).toBe(200);
        });

        test("response body object has the correct values", async () => {
            const response = await AuthTestFunctions.registerUser(hostObject);

            const user = await UserTestFunctions.getHost(response.body.data.user._id, accessToken, refreshToken);

            expect(user.body.data.host.username).toBe('BashDot');
            expect(user.body.data.host.firstname).toBe('Oladotun');
            expect(user.body.data.host.lastname).toBe('Bashorun');
            expect(user.body.data.host.email).toBe('kutupa123@protonmail.com');
            expect(user.body.data.host.businessDetails.name).toBe('Taiosquare Financials');
            expect(user.body.data.host.businessDetails.email).toBe('contact@taiosquare.com');
            expect(user.body.data.host.businessDetails.type).toBe('Education');
            expect(user.body.data.host.businessDetails.description).toBe('We are committed to helping you learn how to make money online');
            expect(user.body.data.host.businessDetails.landline).toBe('+2347049008888');
            expect(user.body.data.host.role).toBe('host');
        });

        const hostId_mongoId = "Invalid hostId Type";

        it.each`
            value                   | expectedMessage
            ${'test'}               | ${hostId_mongoId}
            ${12}                   | ${hostId_mongoId}
            ${true}                 | ${hostId_mongoId}
        `('returns $expectedMessage when $value is sent as userId', async ({ value, expectedMessage }) => {
            const user = await UserTestFunctions.getHost(value, accessToken, refreshToken);

            const body = user.body;
            expect(body.errors).toContain(expectedMessage);
        });
    });

    describe("View Admins", () => {
        const adminObject = UserTestFunctions.getAdminObject();

        beforeAll(async () => {
            await AuthTestFunctions.createAdmin(adminObject, accessToken, refreshToken);
        });

        afterAll(async () => {
            await UserTestFunctions.deleteUser("eronoiak@gmail.com");
        });
        
        test("response status code is 200 if admins are returned successfully", async () => {
            const response = await UserTestFunctions.getAdmins(accessToken, refreshToken);

            expect(response.statusCode).toBe(200);
        });

        test("response body object has the correct fields", async () => {
            const response = await UserTestFunctions.getAdmins(accessToken, refreshToken);

            expect(response.body.data.admins[0]).toHaveProperty('username');
            expect(response.body.data.admins[0]).toHaveProperty('firstname');
            expect(response.body.data.admins[0]).toHaveProperty('lastname');
            expect(response.body.data.admins[0]).toHaveProperty('email');
            expect(response.body.data.admins[0]).toHaveProperty('createdAt');
            expect(response.body.data.admins[0]).toHaveProperty('updatedAt');
        });
    });

    describe("View Admin", () => {
        afterEach(async () => {
            await UserTestFunctions.deleteUser("eronoiak@gmail.com");
        });

        const adminObject = UserTestFunctions.getAdminObject();

        test("response status code is 200 if user is returned successfully", async () => {
            const response = await AuthTestFunctions.createAdmin(adminObject, accessToken, refreshToken);

            const user = await UserTestFunctions.getAdmin(response.body.data.user._id, accessToken, refreshToken);

            expect(user.statusCode).toBe(200);
        });

        test("response body object has the correct values", async () => {
            const response = await AuthTestFunctions.createAdmin(adminObject, accessToken, refreshToken);

            const user = await UserTestFunctions.getAdmin(response.body.data.user._id, accessToken, refreshToken);

            expect(user.body.data.admin.username).toBe('Mole123');
            expect(user.body.data.admin.firstname).toBe('Oaikhina');
            expect(user.body.data.admin.lastname).toBe('Eromonsele');
            expect(user.body.data.admin.email).toBe('eronoiak@gmail.com');
            expect(user.body.data.admin.role).toBe('admin');
        });

        const adminId_mongoId = "Invalid adminId Type";

        it.each`
            value                   | expectedMessage
            ${'test'}               | ${adminId_mongoId}
            ${12}                   | ${adminId_mongoId}
            ${true}                 | ${adminId_mongoId}
        `('returns $expectedMessage when $value is sent as userId', async ({ value, expectedMessage }) => {
            const user = await UserTestFunctions.getAdmin(value, accessToken, refreshToken);

            const body = user.body;
            expect(body.errors).toContain(expectedMessage);
        });
    });
        
    describe("View Regular Users", () => {
        const regularUserObject = UserTestFunctions.getRegularUserObject();

        beforeAll(async () => {
            await AuthTestFunctions.registerUser(regularUserObject);
        });

        afterAll(async () => {
            await UserTestFunctions.deleteUser("vikkyjoe5@gmail.com");
        });
        
        test("response status code is 200 if users are returned successfully", async () => {
            const response = await UserTestFunctions.getRegularUsers(accessToken, refreshToken);

            expect(response.statusCode).toBe(200);
        });

        test("response body object has the correct fields", async () => {
            const response = await UserTestFunctions.getRegularUsers(accessToken, refreshToken);

            expect(response.body.data.users[0]).toHaveProperty('username');
            expect(response.body.data.users[0]).toHaveProperty('firstname');
            expect(response.body.data.users[0]).toHaveProperty('lastname');
            expect(response.body.data.users[0]).toHaveProperty('email');
            expect(response.body.data.users[0]).toHaveProperty('createdAt');
            expect(response.body.data.users[0]).toHaveProperty('updatedAt');
        });
    });

    describe("View Regular User", () => {
        afterEach(async () => {
            await UserTestFunctions.deleteUser("vikkyjoe5@gmail.com");
        });

        const regularUserObject = UserTestFunctions.getRegularUserObject();

        test("response status code is 200 if user is returned successfully", async () => {
            const response = await AuthTestFunctions.registerUser(regularUserObject);

            const user = await UserTestFunctions.getRegularUser(response.body.data.user._id, accessToken, refreshToken);

            expect(user.statusCode).toBe(200);
        });

        test("response body object has the correct values", async () => {
            const response = await AuthTestFunctions.registerUser(regularUserObject);

            const user = await UserTestFunctions.getRegularUser(response.body.data.user._id, accessToken, refreshToken);

            expect(user.body.data.user.username).toBe('Taiosquare');
            expect(user.body.data.user.firstname).toBe('Joshua');
            expect(user.body.data.user.lastname).toBe('Osaigbovo');
            expect(user.body.data.user.email).toBe('vikkyjoe5@gmail.com');
            expect(user.body.data.user.role).toBe('regularUser');
        });

        const userId_mongoId = "Invalid userId Type";

        it.each`
            value                   | expectedMessage
            ${'test'}               | ${userId_mongoId}
            ${12}                   | ${userId_mongoId}
            ${true}                 | ${userId_mongoId}
        `('returns $expectedMessage when $value is sent as userId', async ({ value, expectedMessage }) => {
            const user = await UserTestFunctions.getRegularUser(value, accessToken, refreshToken);

            const body = user.body;
            expect(body.errors).toContain(expectedMessage);
        });
    });

    describe("Approve Host", () => {
        const hostObject = UserTestFunctions.getHostObject();

        afterEach(async () => {
            await UserTestFunctions.deleteUser("kutupa123@protonmail.com");
        });

        test("response status code is 200 if host is approved successfully", async () => {
            const user = await AuthTestFunctions.registerUser(hostObject);

            const response = await AdminTestFunctions.approveUser(user.body.data.user._id, accessToken, refreshToken);

            expect(response.statusCode).toBe(200);
        });

        test("response body has a success message if host is approved successfully", async () => {
            const user = await AuthTestFunctions.registerUser(hostObject);

            const response = await AdminTestFunctions.approveUser(user.body.data.user._id, accessToken, refreshToken);

            expect(response.body.message).toEqual("Host Approved Successfully.");
        });

        test("response body has a user object if host is approved successfully", async () => {
            const user = await AuthTestFunctions.registerUser(hostObject);

            const response = await AdminTestFunctions.approveUser(user.body.data.user._id, accessToken, refreshToken);

            expect(response.body.data.host).toHaveProperty("name");
            expect(response.body.data.host).toHaveProperty("email");
        });

        test("Account approval status was set to true in the database", async () => {
            const response = await AuthTestFunctions.registerUser(hostObject);

            await AdminTestFunctions.approveUser(response.body.data.user._id, accessToken, refreshToken);

            const user = await User.findById(response.body.data.user._id);

            expect(user.accountApproved).toBe(true);
        });

        const hostId_mongoId = "Invalid hostId Type";

        it.each`
            value                   | expectedMessage
            ${'test'}               | ${hostId_mongoId}
            ${12}                   | ${hostId_mongoId}
            ${true}                 | ${hostId_mongoId}
        `('returns $expectedMessage when $value is sent as userId', async ({ value, expectedMessage }) => {
            const response = await AdminTestFunctions.approveUser(value, accessToken, refreshToken);

            const body = response.body;

            expect(body.errors).toContain(expectedMessage);
        });
    });

    describe("Set Host Suspension Status", () => {
        afterEach(async () => {
            await UserTestFunctions.deleteUser("kutupa123@protonmail.com");
        });

        const hostObject = UserTestFunctions.getHostObject();

        let requestBody = {
            status: true
        }

        test("response status code is 200 if host suspension status is successfully set", async () => {
            const user = await AuthTestFunctions.registerUser(hostObject);

            const response = await AdminTestFunctions.setHostSuspensionStatus(
                user.body.data.user._id,
                requestBody,
                accessToken,
                refreshToken
            );

            expect(response.statusCode).toBe(200);
        });

        test("response body has a success message if host suspension status is successfully set", async () => {
            const user = await AuthTestFunctions.registerUser(hostObject);

            const response = await AdminTestFunctions.setHostSuspensionStatus(
                user.body.data.user._id,
                requestBody,
                accessToken,
                refreshToken
            );

            expect(response.body.message).toEqual("Host Suspension Status Successfully set.");
        });

        test("Host suspension status was set to true in the database", async () => {
            const user = await AuthTestFunctions.registerUser(hostObject);

            await AdminTestFunctions.setHostSuspensionStatus(
                user.body.data.user._id,
                requestBody,
                accessToken,
                refreshToken
            );

            const response = await UserTestFunctions.getHost(user.body.data.user._id, accessToken, refreshToken);

            expect(response.body.data.host.accountSuspended).toBe(true);
        });

        const status_empty = "Host Suspension Status cannot be empty";
        const status_boolean = "Host Suspension Status should be a Boolean";
        const hostId_mongoId = "Invalid hostId Type";

        it.each`
            status       | userId                         | expectedMessage
            ${null}      | ${""}                          | ${status_empty}
            ${12}        | ${""}                          | ${status_boolean}
            ${"String"}  | ${""}                          | ${status_boolean}
            ${true}      | ${"String"}                    | ${hostId_mongoId}
            ${true}      | ${12}                          | ${hostId_mongoId}
        `('returns $expectedMessage when $status is sent as status, and $userId is sent as userId', async ({ status, userId, expectedMessage }) => {
            const user = await AuthTestFunctions.registerUser(hostObject);
            
            requestBody.status = status;
            
            userId = (userId == "") ? user.body.data.user._id : userId;

            const response = await AdminTestFunctions.setHostSuspensionStatus(userId, requestBody, accessToken, refreshToken);

            expect(response.body.errors).toContain(expectedMessage);
        });
    });
});