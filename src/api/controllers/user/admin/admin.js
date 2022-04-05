// const { Admin } = require("../../../models/user"),
//   { Host } = require("../models/host"),
//   { User } = require("../models/user"),
//   mailer = require("../../services/mailer"),
//   GeneralFunctions = require("../functions/generalFunctions"),
//   { validationResult } = require("express-validator");

// exports.approveHost = async (req, res) => {
//   try {
//     res.setHeader('access-token', req.token);
//     const errors = validationResult(req);

//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         errors: await GeneralFunctions.validationErrorCheck(errors)
//       });
//     }

//     const id = req.params.hostId,
//       host = await Host.findById(id),
//       admin = await Admin.findById(req.user._id);

//     let address = "";

//     host.isApproved = true;
//     admin.approvedHosts.push(host._id);

//     await user.save();
//     await admin.save();

//     address = GeneralFunctions.environmentCheck(process.env.NODE_ENV);

//     let from = `TBA tba@outlook.com`,
//       to = host.email,
//       subject = "Account Approval Notice",
//       html = `<p>Good Day ${user.companyName}</p> 
//               <p>We wish to announce to you that your account has been approved
//               after the review of your credentials from our end, thank you.</p>`;

//     const data = {
//       from: from,
//       to: to,
//       subject: subject,
//       html: html,
//     };

//     await mailer.sendEmail(data);

//     res.status(200).json({
//       message: "Host Approved Successfully.",
//       host: {
//         _id: host._id,
//         name: host.brandName,
//         email: host.brandEmail,
//       },
//     });
//   } catch (error) {
//     res.status(400)
//       .json({ error: "Error: Host Approval Failed, please try again." });
//   }
// }

// exports.suspendHost = async (req, res) => {
//   try {
//     res.setHeader('access-token', req.token);
//     const errors = validationResult(req);

//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         errors: await GeneralFunctions.validationErrorCheck(errors)
//       });
//     }

//     if (req.user.superAdmin == false) {
//       return res.status(400).json({
//         error: "Only Super Admins can Suspend Administrators",
//       });
//     }

//     const id = req.params.hostId,
//       host = await Host.findById(id);

//     host.accountSuspended = true;

//     await host.save();

//     res.status(200).json({
//       message: "Host Suspended Successfully."
//     });
//   } catch (error) {
//     res.status(400).json({
//       error: "Error: Host Suspension Failed, please try again."
//     });
//   }
// }

// exports.getUser = async (req, res) => {
//   try {
//     res.setHeader('access-token', req.token);
//     const errors = validationResult(req);

//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         errors: await GeneralFunctions.validationErrorCheck(errors)
//       });
//     }

//     const id = req.params.userId;
//     let user = {};

//     user = await User.findById(id).select('-password -token -__v')
//       .populate("bookedEvents.id", "title category location.address dates")
//       .populate("ratedEvents.id", "title category location.address  rating.averageScore");

//     res.status(200).json({ user: user });
//   } catch (error) {
//     res.status(404).json({ error: "User not Found." });
//   }
// }

// exports.getUsers = async (req, res) => {
//   try {
//     res.setHeader('access-token', req.token);

//     let users = await User.find().select(
//       "username firstname lastname email createdAt updatedAt"
//     );

//     res.status(200).json({ users: users });
//   } catch (error) {
//     res.status(404).json({ error: "Users not Found." });
//   }
// }

// // exports.getTickets = async (req, res) => {
// // }

// exports.getHost = async (req, res) => {
//   try {
//     res.setHeader('access-token', req.token);
//     const errors = validationResult(req);

//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         errors: await GeneralFunctions.validationErrorCheck(errors)
//       });
//     }

//     const id = req.params.hostId;
//     let user = {};

//     host = await Host.findById(id).select('-password -token -__v')
//       .populate("events", "title category location.address dates");

//     res.status(200).json({ host: host });
//   } catch (error) {
//     res.status(404).json({ error: "Host not Found." });
//   }
// }

// exports.getHosts = async (req, res) => {
//   try {
//     res.setHeader('access-token', req.token);

//     let hosts = await Host.find().select(
//       "brandName brandType brandEmail createdAt updatedAt"
//     );

//     res.status(200).json({ hostss: hosts });
//   } catch (error) {
//     res.status(404).json({ error: "Hosts not Found." });
//   }
// }

// exports.getEvents = async (req, res) => {
//   try {
//     res.setHeader('access-token', req.token);

//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         errors: await GeneralFunctions.validationErrorCheck(errors)
//       });
//     }

//     const ITEMS_PER_PAGE = 20,
//       page = +req.query.page || 1,
//       totalEvents = await Event.find().countDocuments();

//     let events = await Event.find()
//       .skip((page - 1) * ITEMS_PER_PAGE)
//       .limit(ITEMS_PER_PAGE);

//     res.status(200).json({
//       events: events,
//       currentPage: page,
//       hasNextPage: ITEMS_PER_PAGE * page < totalEvents,
//       hasPreviousPage: page > 1,
//       nextPage: page + 1,
//       previousPage: page - 1,
//       lastPage: Math.ceil(totalEvents / ITEMS_PER_PAGE),
//     });
//   } catch (error) {
//     res.status(404).json({ error: "Events not found." });
//   }
// }

// exports.getAdministrator = async (req, res) => {
//   try {
//     res.setHeader('access-token', req.token);
//     const errors = validationResult(req);

//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         errors: await GeneralFunctions.validationErrorCheck(errors)
//       });
//     }

//     const id = req.params.adminId;

//     const admin = await Admin.findById(id)
//       .select('-password -__v -token')
//       .populate("approvedHosts", "brandName brandType brandEmail");

//     res.status(200).json({ admin: admin });
//   } catch (error) {
//     res.status(404).json({ error: "Error: Admin Details could not be retrieved." });
//   }
// }

// exports.getAdministrators = async (req, res) => {
//   try {
//     res.setHeader('access-token', req.token);

//     const admins = await Admin.find().select(
//       "username firstname lastname email createdAt updatedAt"
//     );

//     res.status(200).json({ admins: admins });
//   } catch (error) {
//     res.status(404).json({ error: "Error: Admins not Found." });
//   }
// }

// exports.suspendAdministrator = async (req, res) => {
//   try {
//     res.setHeader('access-token', req.token);
//     const errors = validationResult(req);

//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         errors: await GeneralFunctions.validationErrorCheck(errors)
//       });
//     }

//     if (req.admin.superAdmin == false) {
//       return res.status(400).json({
//         error: "Only Super Admins can Suspend Administrators",
//       });
//     }

//     const id = req.params.adminId,
//       admin = await Admin.findById(id);

//     admin.accountSuspended = true;

//     await admin.save();

//     // This might be a mail instead

//     res.status(200).json({
//       message: "Admin Suspended Successfully.",
//       //admin: admin
//     });
//   } catch (error) {
//     res
//       .status(400)
//       .json({ error: "Error: Admin Suspension Failed, please try again." });
//   }
// }
