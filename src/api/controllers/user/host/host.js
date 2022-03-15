require("dotenv").config();

const { Event } = require("../models/event"),
  { Host } = require("../models/host"),
  { Account } = require("../models/account"),
  mongoose = require("mongoose"),
  GeneralFunctions = require("../functions/generalFunctions"),
  { validationResult } = require("express-validator"),
  fetch = require("node-fetch");

exports.addEvent = async (req, res) => {
  try {
    res.setHeader('access-token', req.token);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: await GeneralFunctions.validationErrorCheck(errors)
      });
    }

    const {
      title, poster, type, category,
      keywords, description, location,
      tickets, minAge, dates, availableSpace
    } = req.body;

    let event = await Event.findOne({ title: title, host: req.user._id });

    if (event) {
      return res.status(400).json({
        error: "Event already added",
      });
    }

    let newEvent = new Event({
      _id: mongoose.Types.ObjectId(),
      title: title,
      poster: poster,
      type: type,
      category: category,
      keywords: keywords,
      description: description,
      location: location,
      tickets: tickets,
      minimumAge: minAge,
      dates: dates,
      availableSpace: availableSpace,
      rating: {
        averageScore: 0,
        numOfRatings: 0
      },
      users: [],
      host: req.user._id
    });

    let host = await Host.findById(req.user._id);

    host.events.push(newEvent._id);

    [newEvent, host] = await Promise.all([newEvent.save(), host.save()]);

    res.status(201).json({
      message: "Event successfully added",
      event: {
        _id: newEvent._id,
        title: newEvent.title,
        category: newEvent.category,
        location: newEvent.location,
        dates: newEvent.dates
      },
    });
  } catch (error) {
    res.status(400).json({
      error: "Event could not be registered, please try again.",
    });
  }
}

exports.editEvent = async (req, res) => {
  try {
    res.setHeader('access-token', req.token);
    const errors = validationResult(req),
      id = req.params.eventId;

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: await GeneralFunctions.validationErrorCheck(errors)
      });
    }

    let event = await Event.findById(id);

    req.body.title && (event.title = req.body.title);
    req.body.poster && (event.poster = req.body.poster);
    req.body.type && (event.type = req.body.type);
    req.body.category && (event.category = req.body.category);
    (req.body.keywords || (req.body.keywords == null)) && (event.keywords = req.body.keywords);
    req.body.description && (event.description = req.body.description);
    req.body.location && (event.location = req.body.location);
    req.body.tickets && (event.tickets = req.body.tickets);
    (req.body.minimumAge || (req.body.minimumAge == null)) && (event.minimumAge = req.body.minimumAge);
    req.body.dates && (event.dates = req.body.dates);
    req.body.availableSpace && (event.availableSpace = req.body.availableSpace);

    const result = await event.save();

    res.status(200).json({
      message: "Event Details Updated Successfully",
      event: {
        _id: result._id,
        title: result.title,
        category: result.category,
        location: result.location,
        dates: result.dates
      },
    });
  } catch (error) {
    res.status(400).json({
      error: "Event Details Failed to Update, please try again.",
    });
  }
}

exports.deleteEvent = async (req, res) => {
  try {
    res.setHeader('access-token', req.token);
    const errors = validationResult(req),
      id = req.params.eventId;

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: await GeneralFunctions.validationErrorCheck(errors)
      });
    }

    let event = await Event.findById(id);

    if (event.host.toString() != req.user._id.toString()) {
      return res.status(400).json({
        error: "This User cannot delete this event",
      });
    }

    let host = await Host.findById(req.user._id);

    host.events.pull(id);

    await host.save();

    await Event.findByIdAndDelete(id);

    res.status(200).json({
      message: "Event Deleted Successfully",
    });
  } catch (error) {
    res.status(400).json({ error: "Event Failed to Delete" });
  }
}

// Retry Transfer in case the OTP expires

exports.verifyTicketPayment = async (req, res) => {
  try {
    res.setHeader('access-token', req.token);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({
        errors: await GeneralFunctions.validationErrorCheck(errors)
      });
    } else {
      const { otp } = req.body;

      const event = await Event.findById(req.params.eventId);

      const params = {
        "transfer_code": event.transferCode,
        "otp": otp,
      }

      const response = await fetch(`https://api.paystack.co/transfer/finalize_transfer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_TEST_SECRET}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params),
      });

      const response2 = await response.json();

      if (response2.status == true) {
        event.transferCode = undefined;

        await event.save();

        res.status(200).json({
          message: 'Payment has successfully been verified.',
        });
      } else {
        res.status(400).json({
          error: 'Error: The Payment could not be verified, please try again.',
        });
      }
    }
  } catch (error) {
    res.status(400).json({
      error: 'Error: The Payment could not be verified, please try again.',
    });
  }
}

exports.viewBookedUsers = async (req, res) => {
  try {
    res.setHeader('access-token', req.token);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: await GeneralFunctions.validationErrorCheck(errors)
      });
    }

    const event = await Event.findById(req.params.eventId)
      .populate({
        path: 'users',
        populate: {
          path: 'user',
          select: 'username firstname lastname email'
        },
      });

    res.status(200).json({ bookedUsers: event.users });
  } catch (error) {
    res.status(400).json({
      error: "Error Fetching User's Events, please try again.",
    });
  }
}

exports.viewEvent = async (req, res) => {
  try {
    res.setHeader('access-token', req.token);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: await GeneralFunctions.validationErrorCheck(errors)
      });
    }

    const eventId = mongoose.Types.ObjectId(req.params.id);

    const event = await Event.aggregate([
      { $match: { "_id": eventId } },
      {
        $project: {
          title: 1,
          poster: 1,
          location: {
            address: 1,
          },
          rating: {
            averageScore: 1,
            numOfRatings: 1
          },
          keywords: 1,
          category: 1,
          type: 1,
          description: 1,
          tickets: 1,
          minimumAge: 1,
          dates: 1,
          availableSpace: 1,
          users: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    ]);

    res.status(200).json({ event: event[0] });
  } catch (error) {
    res.status(400).json({
      error: "Error Fetching Event Details, please try again.",
    });
  }
}

exports.viewEvents = async (req, res) => {
  try {
    res.setHeader('access-token', req.token);

    const hostId = mongoose.Types.ObjectId(req.user._id);

    const events = await Event.aggregate([
      { $match: { "host": hostId } },
      {
        $project: {
          title: 1,
          category: 1,
          type: 1,
          image: "$poster.small",
          rating: "$rating.averageScore",
          state: "$location.state",
          from: "$dates.begin",
          to: "$dates.end"
        }
      }
    ]);

    res.status(200).json({ events: events });
  } catch (error) {
    res.status(400).json({
      error: "Error Fetching User's Events, please try again.",
    });
  }
}

exports.updateAccountDetails = async (req, res) => {
  try {
    res.setHeader('access-token', req.token);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: await GeneralFunctions.validationErrorCheck(errors)
      });
    }

    let account = await Account.findOne({ host: req.user._id });

    req.body.accountName && (account.accountName = req.body.accountName);
    req.body.accountNumber && (account.accountNumber = req.body.accountNumber);
    req.body.bank && (account.bank = req.body.bank);

    const result = await account.save();

    res.status(200).json({
      message: "Account Details Updated Successfully",
      account: {
        _id: result._id,
        accountName: result.accountName,
        accountNumber: result.accountNumber,
        bank: result.bank,
      },
    });
  } catch (error) {
    res.status(400).json({
      error: "Event Details Failed to Update, please try again.",
    });
  }
}