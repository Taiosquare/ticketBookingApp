const { User } = require("../../../models/user");

const approveHost = async (session, opts, hostId, userId) => {
    try {
        await User.updateOne([
            {
                _id: hostId
            },
            {
                $set: {
                    isApproved: true
                }
            }
        ], opts);

        const host = await User.findById(hostId); // check if the id can be gotten from the update operation

        const from = `TBA tba@outlook.com`,
            to = host.email,
            subject = "Account Approval Notice",
            html = `<p>Good Day ${host.businessDetails.name}</p> 
                <p>We wish to announce to you that your account has been approved
                after the review of your credentials from our end, thank you.</p>`;

        const data = {
            from: from,
            to: to,
            subject: subject,
            html: html,
        };

        await mailer.sendEmail(data);

        await session.commitTransaction();
        session.endSession();

        return StandardResponse.successMessage(
            "Host Approved Successfully.",
            {
                host: {
                    _id: host._id,
                    name: host.businessDetails.name,
                    email: host.email,
                },
            }
        );
    } catch (error) {
        return StandardResponse.serverError(error);
    }
}

const getEvents = (queryPage) => {
    try {
        const ITEMS_PER_PAGE = 20;
        const page = +queryPage || 1;
    
        const totalEvents = await Event.find().countDocuments();

        const events = await Event.find()
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);
    
        return StandardResponse.successMessage(
            null,
            {
                events: events,
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalEvents,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalEvents / ITEMS_PER_PAGE),
            }
        );
    } catch (error) {
        return StandardResponse.serverError(error);
    }
}

module.exports.AdminManager = {
    approveHost,
    getEvents
};