const request = require('supertest');
const { app, server } = require('../../../../app');
const { User } = require('../../../../api/models/user');
const { UserTestFunctions } = require('../../../functions/userTestFunctions');
const { AuthTestFunctions } = require('../../../functions/authTestFunctions');
const { AdminTestFunctions } = require('../../../functions/adminTestFunctions')

let accessToken = "";
let refreshToken = "";
let userId = "";

afterAll(async () => {
    await server.close();
});

jest.setTimeout(30000);

describe("Admin Operations", () => {
    beforeAll(async () => {
        const response = await TestFunctions.loginUser(
            "jackson.ogunmasa@gmail.com",
            "1570&JugaR"
        );

        accessToken = response.body.tokens.access.token;
        refreshToken = response.body.tokens.refresh.token;
    });

    afterAll(async () => {
        await server.close();
    });

    describe("View Hosts", () => {

    });

    describe("View Host", () => {

    });

    describe("View Admins", () => {

    });

    describe("View Admin", () => {

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
            const response = await UserTestFunctions.getUsers(accessToken, refreshToken);

            expect(response.statusCode).toBe(200);
        });

        test("response body object has the correct fields", async () => {
            const response = await UserTestFunctions.getUsers(accessToken, refreshToken);

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

            const user = await UserTestFunctions.getUser(response.body.user._id, accessToken, refreshToken);

            expect(user.statusCode).toBe(200);
        });

        test("response body object has the correct values", async () => {
            const response = await AuthTestFunctions.registerUser(regularUserObject);

            const user = await UserTestFunctions.getUser(response.body.user._id, accessToken, refreshToken);

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
            const user = await UserTestFunctions.getUser(value, accessToken, refreshToken);

            const body = user.body;
            expect(body.errors).toContain(expectedMessage);
        });
    });

    describe("Approve Host", () => {
        const hostObject = UserTestFunctions.getHostObject();

        afterEach(async () => {
            await UserTestFunctions.deleteUser("kutupa123@protonmail.com");
        });

        test("response status code is 200 if user is approved successfully", async () => {
            const user = await AuthTestFunctions.registerUser(hostObject);

            const response = await AdminTestFunctions.approveUser(user.body.user._id, accessToken, refreshToken);

            expect(response.statusCode).toBe(200);
        });

        test("response body has a success message if user is approved successfully", async () => {
            const user = await AuthTestFunctions.registerUser(hostObject);

            const response = await AdminTestFunctions.approveUser(user.body.user._id, accessToken, refreshToken);

            expect(response.body.message).toEqual("Host Approved Successfully.");
        });

        test("response body has a user object if user is approved successfully", async () => {
            const user = await AuthTestFunctions.registerUser(hostObject);

            const response = await AdminTestFunctions.approveUser(user.body.user._id, accessToken, refreshToken);

            expect(response.body.user).toHaveProperty("name");
            expect(response.body.user).toHaveProperty("email");
        });

        test("Account approval status was set to true in the database", async () => {
            const response = await AuthTestFunctions.registerUser(hostObject);

            await AdminTestFunctions.approveUser(response.body.user._id, accessToken, refreshToken);

            const user = await User.findById(response.body.user._id);

            expect(user.accountApproved).toBe(true);
        });

        const hostId_mongoId = "Invalid hostId Type";

        it.each`
            value                   | expectedMessage
            ${'test'}               | ${hostId_mongoId}
            ${12}                   | ${hostId_mongoId}
            ${true}                 | ${hostId_mongoId}
        `('returns $expectedMessage when $value is sent as userId', async ({ value, expectedMessage }) => {
            const response = await AdminTestFunctions.approveUser(value);

            const body = response.body;

            expect(body.errors).toContain(expectedMessage);
        });
    });

    describe("Set Host Suspension Status", () => {
        afterEach(async () => {
            await TestFunctions.deleteUser("jiggybaby@gmail.com");
        });

        const hostObject = UserTestFunctions.getHostObject();

        let requestBody = {
            status: true
        }

        test("response status code is 200 if host suspension status is successfully set", async () => {
            const user = await AuthTestFunctions.registerUser(hostObject);

            const response = await AdminTestFunctions.setUserSuspensionStatus(
                user.body.user._id,
                requestBody,
                accessToken,
                refreshToken
            );

            expect(response.statusCode).toBe(200);
        });

        test("response body has a success message if host suspension status is successfully set", async () => {
            const user = await AuthTestFunctions.registerUser(hostObject);

            const response = await AdminTestFunctions.setUserSuspensionStatus(
                user.body.user._id,
                requestBody,
                accessToken,
                refreshToken
            );

            expect(response.body.message).toEqual("Host Suspension Status Successfully set.");
        });

        test("Host suspension status was set to true in the database", async () => {
            const user = await AuthTestFunctions.registerUser(hostObject);

            await AdminTestFunctions.setUserSuspensionStatus(
                user.body.user._id,
                requestBody,
                accessToken,
                refreshToken
            );

            expect(user.accountSuspended).toBe(true);
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
            
            userId = (userId == "") ? user.body.user._id : userId;

            const response = await AdminTestFunctions.setHostSuspensionStatus(userId, requestBody);

            expect(response.body.errors).toContain(expectedMessage);
        });
    });
});