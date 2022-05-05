const { app, server } = require('../../../app');
const { User } = require('../../../api/models/user');
const { AuthTestFunctions } = require('../../functions/authTestFunctions');
const { UserTestFunctions } = require('../../functions/userTestFunctions');

let accessToken = "", refreshToken = "";

afterAll(async () => {
    await server.close();
});

jest.setTimeout(90000);

describe("User Creation/Registration", () => {
    afterAll(async () => {
        await server.close();
    });

    describe("Admin Creation", () => {
        let adminObject = UserTestFunctions.getAdminObject();

        beforeAll(async () => {       
            const response = await AuthTestFunctions.loginUser(
                "osaigbovojoshua@yahoo.com",
                "11720$GbesE"
            );

            accessToken = response.body.data.tokens.access.token;
            refreshToken = response.body.data.tokens.refresh.token;
        });

        beforeEach(async () => {
            await UserTestFunctions.deleteUser("eronoiak@gmail.com");
        });
        
        test("response status code is 201 if user is added successfully", async () => {
            const response = await AuthTestFunctions.createAdmin(adminObject, accessToken, refreshToken);

            expect(response.statusCode).toBe(201);
        });

        test("response body has a success message", async () => {
            const response = await AuthTestFunctions.createAdmin(adminObject, accessToken, refreshToken);

            expect(response.body.message).toEqual("Admin successfully added.");
        });

        test("user was saved to database", async () => {
            await AuthTestFunctions.createAdmin(adminObject, accessToken, refreshToken);

            const user = await User.findOne({ username: "Mole123" });

            expect(user).toHaveProperty('_id');
        });

        test("all the fields were correctly saved", async () => {
            const response = await AuthTestFunctions.createAdmin(adminObject, accessToken, refreshToken);

            expect(response.body.data.user.username).toEqual("Mole123");
            expect(response.body.data.user.firstname).toEqual("Oaikhina");
            expect(response.body.data.user.lastname).toEqual("Eromonsele");
            expect(response.body.data.user.email).toEqual("eronoiak@gmail.com");
            expect(response.body.data.user.role).toEqual("admin");
        });

        test("user password was hashed", async () => {
            await AuthTestFunctions.createAdmin(adminObject, accessToken, refreshToken);

            const user = await User.findOne({ username: "Mole123" });

            expect(user.password).not.toBe("11720$GbesE");
        });

        test("response status code is 400 if firstname, lastname and email are null", async () => {
            adminObject.firstname = null;
            adminObject.lastname = null;
            adminObject.email = null;
            
            const response = await AuthTestFunctions.createAdmin(adminObject, accessToken, refreshToken);

            expect(response.statusCode).toBe(400);
        });

        it.each`
            field            | value                   
            ${'firstname'}   | ${null}                 
            ${'lastname'}    | ${null}                   
            ${'email'}       | ${null}                 
        `('response status code is 400 when $field is $value', async ({ field, value }) => {
            adminObject[field] = value;

            const response = await AuthTestFunctions.createAdmin(adminObject, accessToken, refreshToken);

            expect(response.statusCode).toBe(400)
        });
        
        const username_empty = "Username cannot be empty";
        const username_string = "Username should be a String";
        const username_size = "Username must be between 6 and 24 characters in length";
        const firstname_empty = "Firstname cannot be empty";
        const firstname_string = "Firstname should be a String";
        const lastname_empty = "Lastname cannot be empty";
        const lastname_string = "Lastname should be a String";
        const email_empty = "Email cannot be empty";
        const email_invalid = "Email is invalid";
        const role_empty = "Role cannot be empty";
        const role_string = "Role should be a String";
        const password_empty = "Password cannot be empty";
        const password_size = "Password must have at least 8 characters";
        const password_pattern = "Password must have at least 1 uppercase, 1 lowercase letter and 1 number";

        it.each`
            field            | value                   | expectedMessage
            ${'username'}    | ${null}                 | ${username_empty}
            ${'username'}    | ${12}                   | ${username_string}
            ${'username'}    | ${12.5}                 | ${username_string}
            ${'username'}    | ${'usr'}                | ${username_size}
            ${'username'}    | ${'a'.repeat(33)}       | ${username_size}
            ${'firstname'}   | ${null}                 | ${firstname_empty}
            ${'firstname'}   | ${12}                   | ${firstname_string}
            ${'firstname'}   | ${12.5}                 | ${firstname_string}
            ${'lastname'}    | ${null}                 | ${lastname_empty}
            ${'lastname'}    | ${12}                   | ${lastname_string}
            ${'lastname'}    | ${12.5}                 | ${lastname_string}
            ${'email'}       | ${null}                 | ${email_empty}
            ${'email'}       | ${'yahoo.com'}          | ${email_invalid}
            ${'email'}       | ${'jesttest.yahoo.com'} | ${email_invalid}
            ${'email'}       | ${'jesttest@yahoo'}     | ${email_invalid}
            ${'role'}        | ${null}                 | ${role_empty}
            ${'role'}        | ${12}                   | ${role_string}
            ${'role'}        | ${12.5}                 | ${role_string}
            ${'password'}    | ${null}                 | ${password_empty}
            ${'password'}    | ${'P4ssw'}              | ${password_size}
            ${'password'}    | ${'alllowercase'}       | ${password_pattern}
            ${'password'}    | ${'ALLUPPERCASE'}       | ${password_pattern}
            ${'password'}    | ${'1234567890'}         | ${password_pattern}
            ${'password'}    | ${'lowerandUPPER'}      | ${password_pattern}
            ${'password'}    | ${'lower4nd5667'}       | ${password_pattern}
            ${'password'}    | ${'UPPER44444'}         | ${password_pattern}
        `('returns $expectedMessage when $field is $value', async ({ field, value, expectedMessage }) => {
            adminObject[field] = value;

            const response = await AuthTestFunctions.createAdmin(adminObject, accessToken, refreshToken);
            const body = response.body;
            
            expect(body.errors).toContain(expectedMessage);
        });    
    });

    describe("Host Registration", () => {
        let hostObject = UserTestFunctions.getHostObject();

        beforeEach(async () => {
            await UserTestFunctions.deleteUser("kutupa123@protonmail.com");
        });

        test("response status code is 201 if host is registered successfully", async () => {
            const response = await AuthTestFunctions.registerUser(hostObject);

            expect(response.statusCode).toBe(201);
        });

        test("response body has a success message", async () => {
            const response = await AuthTestFunctions.registerUser(hostObject);

            expect(response.body.message).toEqual("User successfully added.");
        });

        test("host was saved to database", async () => {
            await AuthTestFunctions.registerUser(hostObject);

            const user = await User.findOne({ username: "BashDot" });

            expect(user).toHaveProperty('_id');
        });

        test("all the fields were correctly saved", async () => {
            const response = await AuthTestFunctions.registerUser(hostObject);

            expect(response.body.data.user.username).toEqual("BashDot");
            expect(response.body.data.user.email).toEqual("kutupa123@protonmail.com");
            expect(response.body.data.user.role).toEqual("host");
        });

        test("host password was hashed", async () => {
            await AuthTestFunctions.registerUser(hostObject);

            const user = await User.findOne({ username: "BashDot" });

            expect(user.password).not.toBe("11720$GbesE");
        });

        test("emailConfirmationToken was created for host", async () => {
            await AuthTestFunctions.registerUser(hostObject);

            const user = await User.findOne({ username: "BashDot" });

            expect(user).toHaveProperty('confirmationToken');
        });

        test("response status code is 400 if firstname, lastname and email are null", async () => {
            hostObject.firstname = null;
            hostObject.lastname = null;
            hostObject.email = null;
            
            const response = await AuthTestFunctions.registerUser(hostObject);

            expect(response.statusCode).toBe(400);
        });

        it.each`
            field            | value                   
            ${'firstname'}   | ${null}                 
            ${'lastname'}    | ${null}                   
            ${'email'}       | ${null}                 
        `('response status code is 400 when $field is $value', async ({ field, value }) => {
            hostObject[field] = value;

            const response = await AuthTestFunctions.registerUser(hostObject);

            expect(response.statusCode).toBe(400)
        });

        const username_empty = "Username cannot be empty";
        const username_string = "Username should be a String";
        const username_size = "Username must be between 6 and 24 characters in length";
        const firstname_empty = "Firstname cannot be empty";
        const firstname_string = "Firstname should be a String";
        const lastname_empty = "Lastname cannot be empty";
        const lastname_string = "Lastname should be a String";
        const email_empty = "Email cannot be empty";
        const email_invalid = "Email is invalid";
        const role_empty = "Role cannot be empty";
        const role_string = "Role should be a String";
        const password_empty = "Password cannot be empty";
        const password_size = "Password must have at least 8 characters";
        const password_pattern = "Password must have at least 1 uppercase, 1 lowercase letter and 1 number";
        const position_empty = "Position cannot be empty";
        const position_string = "Position should be a String";
        const companyName_empty = "Company Name cannot be empty";
        const companyName_string = "Company Name should be a String";
        const companyAddress_empty = "Company Address cannot be empty";
        const companyAddress_string = "Company Address should be a String";
        const businessLandline_empty = "Business Landline cannot be empty";
        const businessLandline_string = "Business Landline should be a String";
        const companyEmail_empty = "Company Email cannot be empty";
        const companyEmail_string = "Company Email is invalid";


        it.each`
            field            | value                   | expectedMessage
            ${'username'}    | ${null}                 | ${username_empty}
            ${'username'}    | ${12}                   | ${username_string}
            ${'username'}    | ${true}                 | ${username_string}
            ${'username'}    | ${'usr'}                | ${username_size}
            ${'username'}    | ${'a'.repeat(33)}       | ${username_size}
            ${'firstname'}   | ${null}                 | ${firstname_empty}
            ${'firstname'}   | ${12}                   | ${firstname_string}
            ${'firstname'}   | ${true}                 | ${firstname_string}
            ${'lastname'}    | ${null}                 | ${lastname_empty}
            ${'lastname'}    | ${12}                   | ${lastname_string}
            ${'lastname'}    | ${true}                 | ${lastname_string}
            ${'email'}       | ${null}                 | ${email_empty}
            ${'email'}       | ${'yahoo.com'}          | ${email_invalid}
            ${'email'}       | ${'jesttest.yahoo.com'} | ${email_invalid}
            ${'email'}       | ${'jesttest@yahoo'}     | ${email_invalid}
            ${'role'}        | ${null}                 | ${role_empty}
            ${'role'}        | ${12}                   | ${role_string}
            ${'role'}        | ${true}                 | ${role_string}
            ${'password'}    | ${null}                 | ${password_empty}
            ${'password'}    | ${'P4ssw'}              | ${password_size}
            ${'password'}    | ${'alllowercase'}       | ${password_pattern}
            ${'password'}    | ${'ALLUPPERCASE'}       | ${password_pattern}
            ${'password'}    | ${'1234567890'}         | ${password_pattern}
            ${'password'}    | ${'lowerandUPPER'}      | ${password_pattern}
            ${'password'}    | ${'lower4nd5667'}       | ${password_pattern}
            ${'password'}    | ${'UPPER44444'}         | ${password_pattern}
        `('returns $expectedMessage when $field is $value', async ({ field, value, expectedMessage }) => {
            hostObject[field] = value;

            const response = await AuthTestFunctions.registerUser(hostObject);
            const body = response.body;
            
            expect(body.errors).toContain(expectedMessage);
        });

        it.each`
            field                                                 | value                   | expectedMessage
            ${'businessDetails.name'}                             | ${null}                 | ${companyName_empty}
            ${'businessDetails.name'}                             | ${12}                   | ${companyName_string}
            ${'businessDetails.name'}                             | ${true}                 | ${companyName_string}
            ${'businessDetails.address'}                          | ${null}                 | ${companyAddress_empty}
            ${'businessDetails.address'}                          | ${12}                   | ${companyAddress_string}
            ${'businessDetails.address'}                          | ${true}                 | ${companyAddress_string}
            ${'businessDetails.businessLandline'}                 | ${null}                 | ${businessLandline_empty}
            ${'businessDetails.businessLandline'}                 | ${12}                   | ${businessLandline_string}
            ${'businessDetails.businessLandline'}                 | ${true}                 | ${businessLandline_string}
            ${'businessDetails.companyEmail'}                     | ${null}                 | ${companyEmail_empty}
            ${'businessDetails.companyEmail'}                     | ${12}                   | ${companyEmail_string}
            ${'businessDetails.companyEmail'}                     | ${true}                 | ${companyEmail_string}
            ${'position'}                                         | ${null}                 | ${position_empty}
            ${'position'}                                         | ${12}                   | ${position_string}
            ${'position'}                                         | ${true}                 | ${position_string}
        `('returns $expectedMessage when $field is $value', async ({ field, value, expectedMessage }) => {
            hostObject[field] = value;

            const response = await AuthTestFunctions.registerUser(hostObject);
            const body = response.body;

            expect(body.errors).toContain(expectedMessage)
        });
    });

    describe("Regular User Registration", () => {
        let regularUserObject = UserTestFunctions.getRegularUserObject();

        beforeEach(async () => {
            await UserTestFunctions.deleteUser("vikkyjoe5@gmail.com");
        });

        test("response status code is 201 if user is added successfully", async () => {
            const response = await AuthTestFunctions.registerUser(regularUserObject);

            expect(response.statusCode).toBe(201);
        });

        test("response body has a success message", async () => {
            const response = await AuthTestFunctions.registerUser(regularUserObject);

            expect(response.body.message).toEqual("User successfully added.");
        });

        test("regular user was saved to database", async () => {
            await AuthTestFunctions.registerUser(regularUserObject);

            const user = await User.findOne({ username: "Taiosquare" });

            expect(user).toHaveProperty('_id');
        });

        test("all the fields were correctly saved", async () => {
            const response = await AuthTestFunctions.registerUser(regularUserObject);

            expect(response.body.data.user.username).toEqual("Taiosquare");
            expect(response.body.data.user.email).toEqual("vikkyjoe5@gmail.com");
            expect(response.body.data.user.role).toEqual("regularUser");
        });

        test("regular user password was hashed", async () => {
            await AuthTestFunctions.registerUser(regularUserObject);

            const user = await User.findOne({ username: "Taiosquare" });

            expect(user.password).not.toBe("11720$GbesE");
        });

        test("emailConfirmationToken was created for user", async () => {
            await AuthTestFunctions.registerUser(regularUserObject);

            const user = await User.findOne({ username: "Taiosquare" });

            expect(user).toHaveProperty('confirmationToken');
        });

        test("response status code is 400 if firstname, lastname and email are null", async () => {
            regularUserObject.firstname = null;
            regularUserObject.lastname = null;
            regularUserObject.email = null;
            
            const response = await AuthTestFunctions.registerUser(regularUserObject);

            expect(response.statusCode).toBe(400);
        });

        it.each`
            field            | value                   
            ${'firstname'}   | ${null}                 
            ${'lastname'}    | ${null}                   
            ${'email'}       | ${null}                 
        `('response status code is 400 when $field is $value', async ({ field, value, expectedMessage }) => {
            regularUserObject[field] = value;

            const response = await AuthTestFunctions.registerUser(regularUserObject);

            expect(response.statusCode).toBe(400)
        });

        const username_empty = "Username cannot be empty";
        const username_string = "Username should be a String";
        const username_size = "Username must be between 6 and 24 characters in length";
        const firstname_empty = "Firstname cannot be empty";
        const firstname_string = "Firstname should be a String";
        const lastname_empty = "Lastname cannot be empty";
        const lastname_string = "Lastname should be a String";
        const email_empty = "Email cannot be empty";
        const email_invalid = "Email is invalid";
        const role_empty = "Role cannot be empty";
        const role_string = "Role should be a String";
        const password_empty = "Password cannot be empty";
        const password_size = "Password must have at least 8 characters";
        const password_pattern = "Password must have at least 1 uppercase, 1 lowercase letter and 1 number";
        it.each`
            field            | value                   | expectedMessage
            ${'username'}    | ${null}                 | ${username_empty}
            ${'username'}    | ${12}                   | ${username_string}
            ${'username'}    | ${true}                 | ${username_string}
            ${'username'}    | ${'usr'}                | ${username_size}
            ${'username'}    | ${'a'.repeat(33)}       | ${username_size}
            ${'firstname'}   | ${null}                 | ${firstname_empty}
            ${'firstname'}   | ${12}                   | ${firstname_string}
            ${'firstname'}   | ${true}                 | ${firstname_string}
            ${'lastname'}    | ${null}                 | ${lastname_empty}
            ${'lastname'}    | ${12}                   | ${lastname_string}
            ${'lastname'}    | ${true}                 | ${lastname_string}
            ${'email'}       | ${null}                 | ${email_empty}
            ${'email'}       | ${'yahoo.com'}          | ${email_invalid}
            ${'email'}       | ${'jesttest.yahoo.com'} | ${email_invalid}
            ${'email'}       | ${'jesttest@yahoo'}     | ${email_invalid}
            ${'role'}        | ${null}                 | ${role_empty}
            ${'role'}        | ${12}                   | ${role_string}
            ${'role'}        | ${true}                 | ${role_string}
            ${'password'}    | ${null}                 | ${password_empty}
            ${'password'}    | ${'P4ssw'}              | ${password_size}
            ${'password'}    | ${'alllowercase'}       | ${password_pattern}
            ${'password'}    | ${'ALLUPPERCASE'}       | ${password_pattern}
            ${'password'}    | ${'1234567890'}         | ${password_pattern}
            ${'password'}    | ${'lowerandUPPER'}      | ${password_pattern}
            ${'password'}    | ${'lower4nd5667'}       | ${password_pattern}
            ${'password'}    | ${'UPPER44444'}         | ${password_pattern}
        `('returns $expectedMessage when $field is $value', async ({ field, value, expectedMessage }) => {
            regularUserObject[field] = value;

            const response = await AuthTestFunctions.registerUser(regularUserObject);
            const body = response.body;
            
            expect(body.errors).toContain(expectedMessage);
        });
    });
});