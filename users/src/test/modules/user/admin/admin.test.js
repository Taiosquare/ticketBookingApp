const request = require('supertest');
const { app, server } = require('../../../../app');
const { User } = require('../../../../api/models/user');
const { UserTestFunctions } = require('../../functions/userTestFunctions');

let accessToken = "", refreshToken = "", userId = "";

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

    describe("Get User Vehicles", () => {
        test("response status code is 200 if vehicles are returned successfully", async () => {
            const response = await TestFunctions.getVehicles("6122ad2e1758bc1b788ffe60");

            expect(response.statusCode).toBe(200);
        });

        test("response body object has the correct fields", async () => {
            const response = await TestFunctions.getVehicles("6122ad2e1758bc1b788ffe60");

            expect(response.body.vehicles[0]).toHaveProperty('vehicleName');
            expect(response.body.vehicles[0]).toHaveProperty('vehicleNumber');
            expect(response.body.vehicles[0]).toHaveProperty('driverName');
            expect(response.body.vehicles[0]).toHaveProperty('driverContact');
        });

        const userId_mongoId = "Invalid userId Type";

        it.each`
            value                   | expectedMessage
            ${'test'}               | ${userId_mongoId}
            ${12}                   | ${userId_mongoId}
            ${true}                 | ${userId_mongoId}
        `('returns $expectedMessage when $value is sent as userId', async ({ value, expectedMessage }) => {
            const response = await TestFunctions.getVehicles(value);

            const body = response.body;
            expect(body.errors).toContain(expectedMessage);
        });
    });

    describe("Get Users", () => {
        const userObject = TestFunctions.getUserObject();

        beforeAll(async () => {
            await TestFunctions.postUser(userObject);
        });

        afterAll(async () => {
            await TestFunctions.deleteUser("jiggybaby@gmail.com");
        });
        
        test("response status code is 200 if users are returned successfully", async () => {
            const response = await TestFunctions.getUsers();

            expect(response.statusCode).toBe(200);
        });

        test("response body object has the correct fields", async () => {
            const response = await TestFunctions.getUsers();

            expect(response.body.users[0]).toHaveProperty('username');
            expect(response.body.users[0]).toHaveProperty('firstname');
            expect(response.body.users[0]).toHaveProperty('lastname');
            expect(response.body.users[0]).toHaveProperty('email');
            expect(response.body.users[0]).toHaveProperty('phoneNumber');
            expect(response.body.users[0]).toHaveProperty('businessDetails');
        });
    });

    describe("Get User", () => {
        afterEach(async () => {
            await TestFunctions.deleteUser("jiggybaby@gmail.com");
        });

        const userObject = TestFunctions.getUserObject();

        test("response status code is 200 if user is returned successfully", async () => {
            const response = await TestFunctions.postUser(userObject);

            const userResponse = await TestFunctions.getUser(response.body.user._id);

            expect(userResponse.statusCode).toBe(200);
        });

        test("response body object has the correct values", async () => {
            const response = await TestFunctions.postUser(userObject);

            const userResponse = await TestFunctions.getUser(response.body.user._id);

            expect(userResponse.body.user.username).toBe('JiggyBaby');
            expect(userResponse.body.user.firstname).toBe('Joshua');
            expect(userResponse.body.user.lastname).toBe('Osaigbovo');
            expect(userResponse.body.user.email).toBe('jiggybaby@gmail.com');
            expect(userResponse.body.user.phoneNumber).toBe('09089089078');
            expect(userResponse.body.user.businessDetails.companyName).toBe('Divine Oil Transporters');
        });

        const userId_mongoId = "Invalid userId Type";

        it.each`
            value                   | expectedMessage
            ${'test'}               | ${userId_mongoId}
            ${12}                   | ${userId_mongoId}
            ${true}                 | ${userId_mongoId}
        `('returns $expectedMessage when $value is sent as userId', async ({ value, expectedMessage }) => {
            const response = await TestFunctions.getUser(value);

            const body = response.body;
            expect(body.errors).toContain(expectedMessage);
        });
    });

    describe("Approve Host", () => {
        const hostObject = TestFunctions.getUserObject();

        beforeEach(async () => {
            const response = await postUser(hostObject);
 
            userId = response.body.user._id;
        });

        afterEach(async () => {
            await TestFunctions.deleteUser("jiggybaby@gmail.com");
        });

        test("response status code is 200 if user is approved successfully", async () => {
            const response2 = await TestFunctions.approveUser(user);

            expect(response2.statusCode).toBe(200);
        });

        test("response body has a success message if user is approved successfully", async () => {
            const response = await TestFunctions.postUser(userObject);

            const response2 = await TestFunctions.approveUser(response.body.user._id);

            expect(response2.body.message).toEqual("User Approved Successfully.");
        });

        test("response body has a user object if user is approved successfully", async () => {
            const response = await TestFunctions.postUser(userObject);

            const response2 = await TestFunctions.approveUser(response.body.user._id);

            expect(response2.body.user).toHaveProperty("name");
            expect(response2.body.user).toHaveProperty("email");
        });

        test("Account approval status was set to true in the database", async () => {
            const response = await TestFunctions.postUser(userObject);

            await TestFunctions.approveUser(response.body.user._id);

            const user = await User.findById(response.body.user._id);

            expect(user.accountApproved).toBe(true);
        });

        const userId_mongoId = "Invalid userId Type";

        it.each`
            value                   | expectedMessage
            ${'test'}               | ${userId_mongoId}
            ${12}                   | ${userId_mongoId}
            ${true}                 | ${userId_mongoId}
        `('returns $expectedMessage when $value is sent as userId', async ({ value, expectedMessage }) => {
            const response = await TestFunctions.approveUser(value);

            const body = response.body;

            expect(body.errors).toContain(expectedMessage);
        });
    });

    describe("Suspend User", () => {
        afterEach(async () => {
            await TestFunctions.deleteUser("jiggybaby@gmail.com");
        });

        const userObject = TestFunctions.getUserObject();

        let reqBody = {
            status: true
        }

        test("response status code is 200 if user is suspended successfully", async () => {
            const response = await TestFunctions.postUser(userObject);

            const response2 = await TestFunctions.suspendUser(response.body.user._id, reqBody);

            expect(response2.statusCode).toBe(200);
        });

        test("response body has a success message if user is suspended successfully", async () => {
            const response = await TestFunctions.postUser(userObject);

            const response2 = await TestFunctions.suspendUser(response.body.user._id, reqBody);

            expect(response2.body.message).toEqual("User Suspension Status Successfully set.");
        });

        test("User suspension status was set to true in the database", async () => {
            const response = await TestFunctions.postUser(userObject);

            await TestFunctions.suspendUser(response.body.user._id, reqBody);

            const user = await User.findById(response.body.user._id);

            expect(user.accountSuspended).toBe(true);
        });

        const status_empty = "User Suspension Status cannot be empty";
        const status_boolean = "User Suspension Status should be a Boolean";
        const userId_mongoId = "Invalid userId Type";

        it.each`
            status       | userId                         | expectedMessage
            ${null}      | ${""}                          | ${status_empty}
            ${12}        | ${""}                          | ${status_boolean}
            ${"String"}  | ${""}                          | ${status_boolean}
            ${true}      | ${"String"}                    | ${userId_mongoId}
            ${true}      | ${12}                          | ${userId_mongoId}
        `('returns $expectedMessage when $status is sent as status, and $userId is sent as userId', async ({ status, userId, expectedMessage }) => {
            const response = await TestFunctions.postUser(userObject);
            
            reqBody.status = status;
            
            userId = (userId == "") ? response.body.user._id : userId;

            const response2 = await TestFunctions.suspendUser(userId, reqBody);

            expect(response2.body.errors).toContain(expectedMessage);
        });
    });
});