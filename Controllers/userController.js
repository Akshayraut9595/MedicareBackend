import Booking from "../models/BookingSchema.js";
import Doctor from "../models/DoctorSchema.js";
import User from "../models/UserSchema.js";

export const updateUser = async (req, res) => {
  const id = req.params.id;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Successfully updated",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update" });
  }
};
export const deleteUser = async (req, res) => {
  const id = req.params.id;

  try {
    const deleteuser = await User.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Successfully deleted",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete" });
  }
};

export const getSingleUser = async (req, res) => {
  const id = req.params.id;

  try {
    const user = await User.findById(id).select("-password");
    res.status(200).json({
      success: true,
      message: "User found",
      data: user,
    });
  } catch (error) {
    res.status(404).json({ success: false, message: "User not found" });
  }
};

export const getAllUser = async (req, res) => {
  const id = req.params.id;

  try {
    const user = await User.find({}).select("-password");
    res.status(200).json({
      success: true,
      message: "Users found",
      data: user,
    });
  } catch (error) {
    res.status(404).json({ success: false, message: "Users not found" });
  }
};

export const getUserProfile = async (req, res) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const { password, ...rest } = user._doc;
    res.status(200).json({
      success: true,
      message: "Profile info is getting",
      data: { ...rest },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong, can not find profile",
    });
  }
};

export const getMyAppointments = async (req, res) => {
  try {
    // step 1: retrive appointements from booking for specific user
    const bookings = await Booking.find({ user: req.userId });

    // step 2: extract doctor idx from appointment bookings
    const doctorIds = bookings.map((el) => el.doctor.id);

    // step 3: retrive doctors using doctor ids
    const doctors = await Doctor.find({ _id: { $in: doctorIds } }).select(
      "-password"
    );

    res
      .status(200)
      .json({
        success: true,
        message: "Appointments are getting",
        data: doctors,
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong, can not find appointments",
    });
  }
};
