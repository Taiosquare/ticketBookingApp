const { ApiCall } = require("../../helpers/apiCall");
const config = require("../../../../config");

const getAllBanks = async () => {
    try {
        await ApiCall.getFetchApi(
            'https://api.paystack.co/bank',
            'GET',
            config.PAYSTACK_TEST_SECRET,
        );

        const response = await ApiCall.getFetchApi(
            'https://api.paystack.co/bank',
            'GET',
            config.PAYSTACK_TEST_SECRET,
        );

        if (response.status) {
            const banks = response.data.map(bank => {
                return {
                    name: bank.name,
                    code: bank.code
                }
            });

            return StandardResponse.successMessage(
                "success",
                { banks: banks }
            );
        } else {
            return StandardResponse.errorMessage(
                "The Banks could not be retrieved"
            );
        }
    } catch (error) {
        return StandardResponse.serverError(error);
    }
}



// const getSellerCount = async (userId) => {
//     try {
//         const totalProducts = await Product.find({
//             soldBy: userId
//         }).countDocuments();

//         const suspendedProducts = await Product.find({
//             soldBy: userId, suspended: true
//         }).countDocuments();

//         const publishedProducts = await Product.find({
//             soldBy: userId, published: true
//         }).countDocuments();

//         const totalDepots = await Depo.find({
//             user: userId
//         }).countDocuments();

//         const suspendedDepots = await Depo.find({
//             user: userId, suspended: true
//         }).countDocuments();

//         return StandardResponse.successMessage(
//             null,
//             {
//                 products: {
//                     total: totalProducts,
//                     suspended: suspendedProducts,
//                     active: (totalProducts - suspendedProducts),
//                     published: publishedProducts,
//                     drafts: (totalProducts - publishedProducts)
//                 },
//                 depots: {
//                     total: totalDepots,
//                     suspended: suspendedDepots,
//                     active: (totalDepots - suspendedDepots),
//                 }
//             }
//         );
//     } catch (error) {
//         return StandardResponse.serverError(error);
//     }
// }

// const getAdminCount = async () => {
//     try {
//         const totalProducts = await Product.find().countDocuments();

//         const suspendedProducts = await Product.find({
//             suspended: true
//         }).countDocuments();

//         const publishedProducts = await Product.find({
//             published: true
//         }).countDocuments();

//         const totalUsers = await User.find({
//             $or: [
//                 { role: "businessBuyer" },
//                 { role: "businessSeller" }
//             ]
//         }).countDocuments();

//         const suspendedUsers = await User.find({
//             $or: [
//                 { role: "businessBuyer" },
//                 { role: "businessSeller" }
//             ],
//             accountSuspended: true
//         }).countDocuments();

//         const verifiedUsers = await User.find({
//             $or: [
//                 { role: "businessBuyer" },
//                 { role: "businessSeller" }
//             ],
//             confirmedMail: true
//         }).countDocuments();

//         const approvedUsers = await User.find({
//             $or: [
//                 { role: "businessBuyer" },
//                 { role: "businessSeller" }
//             ],
//             accountApproved: true
//         }).countDocuments();

//         return StandardResponse.successMessage(
//             null,
//             {
//                 products: {
//                     total: totalProducts,
//                     suspended: suspendedProducts,
//                     active: (totalProducts - suspendedProducts),
//                     published: publishedProducts,
//                     drafts: (totalProducts - publishedProducts)
//                 },
//                 users: {
//                     total: totalUsers,
//                     suspended: suspendedUsers,
//                     active: (totalUsers - suspendedUsers),
//                     verifiedMail: verifiedUsers,
//                     pendingVerification: (totalUsers - verifiedUsers),
//                     approved: approvedUsers,
//                     pendingApproval: (totalUsers - approvedUsers),
//                 }
//             }
//         );
//     } catch (error) {
//         return StandardResponse.serverError(error);
//     }
// }

module.exports.SystemManager = {
    getAllBanks
};