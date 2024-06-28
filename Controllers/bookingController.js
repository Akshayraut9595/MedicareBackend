// import User from "../models/UserSchema.js";
// import Doctor from "../models/DoctorSchema.js";
// import Booking from "../models/BookingSchema.js";
// import Stripe from "stripe";

// export const getCheckoutSession = async (req, res) => {
//   try {
//     // get currently booked doctor
//     const doctor = await Doctor.findById(req.params.doctorId);
//     const user = await User.findById(req.userId);

//     const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

//     // create stripe checkout session
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       mode: "payment",
//       success_url: `${process.env.CLIENT_SITE_URL}/checkout-success`,
//       cancel_url: `${req.protocol}://${req.get("host")}/doctors/${doctor.id}`,
//       customer_email: user.email,
//       client_reference_id: req.params.doctorId,
//       line_items: [
//         {
//           price_data: {
//             currency: "usd",
//             unit_amount: doctor.ticketPrice * 100,
//             product_data: {
//               name: doctor.name,
//               description: doctor.bio,
//               images: [doctor.photo],
//             },
//           },
//           quantity: 1,
//         },
//       ],
//     });

//     // create new booking
//     const booking = new Booking({
//       doctor: doctor._id,
//       user: user._id,
//       ticketPrice: doctor.ticketPrice,
//       session: session.id,
//     });

//     await booking.save();

//     res
//       .status(200)
//       .json({ success: true, message: "Successfully paid", session });
//   } catch (error) {

//     console.log(error.message);
//     res
//       .status(500)
//       .json({ success: false, message: "Error creating checkout session" });
//   }
// };

import User from "../models/UserSchema.js";
import Doctor from "../models/DoctorSchema.js";
import Booking from "../models/BookingSchema.js";
import Stripe from "stripe";

export const getCheckoutSession = async (req, res) => {
  try {
    // Get currently booked doctor
    const doctor = await Doctor.findById(req.params.doctorId);
    const user = await User.findById(req.userId);

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Ensure ticketPrice is a valid number
    if (isNaN(doctor.ticketPrice)) {
      throw new Error("Invalid ticket price for doctor");
    }

    // Create line items for Stripe session
    const lineItems = [
      {
        price_data: {
          currency: "usd",
          unit_amount: doctor.ticketPrice * 100,
          product_data: {
            name: doctor.name,
            images: [doctor.photo],
          },
        },
        quantity: 1,
      },
    ];

    // Add description only if it's a non-empty string
    if (doctor.bio) {
      lineItems[0].price_data.product_data.description = doctor.bio;
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.CLIENT_SITE_URL}/checkout-success`,
      cancel_url: `${req.protocol}://${req.get("host")}/doctors/${doctor.id}`,
      customer_email: user.email,
      client_reference_id: req.params.doctorId,
      line_items: lineItems,
    });

    // Create new booking
    const booking = new Booking({
      doctor: doctor._id,
      user: user._id,
      ticketPrice: doctor.ticketPrice,
      session: session.id,
    });

    await booking.save();

    res.status(200).json({ success: true, message: "Successfully paid", session });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Error creating checkout session" });
  }
};