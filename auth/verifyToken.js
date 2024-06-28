import jwt, { decode } from "jsonwebtoken";
import Doctor from "../models/DoctorSchema.js";
import User from "../models/UserSchema.js";

export const authenticate = async (req, res, next) => {
  // get token from headers
  const authToken = req.headers.authorization;
  // check token is exists
  if (!authToken || !authToken.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "No token, authorization denied" });
  }

  try {
    const token = authToken.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.userId = decoded.id;
    req.role = decoded.role;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token is expired" });
    }

    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// export const restrict = roles => async(req,res,next)=>{
//     const userId = req.userId;
//     let user;
//     const patient = await User.findById(userId);
//     const doctor = await Doctor.findById(userId);

//     if(patient){
//         user = patient;
//     }
//     else if(doctor){
//         user = doctor;
//     }

//     if(!roles.includes(user.role)){
//         return res.status(401).json({success:false, message:"You are not authorized"})
//     }

//     next();
// }

export const restrict = (roles) => async (req, res, next) => {
  const userId = req.userId;
  let user;

  try {
    // Find user by ID in both collections
    const patient = await User.findById(userId);
    const doctor = await Doctor.findById(userId);

    // Determine if user is a patient or a doctor
    if (patient) {
      user = patient;
    } else if (doctor) {
      user = doctor;
    } else {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    console.log("User role:", user.role); // Logging user role
    console.log("Allowed roles:", roles);

    // Check if user role is authorized
    if (!roles.includes(user.role)) {
      return res.status(401).json({ success: false, message: "You are not authorized" });
    }

    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};