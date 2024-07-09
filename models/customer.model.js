import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  // cnic: {
  //   type: String,
  //   unique: true,
  //   sparse: true, // Allows unique field to be null or empty
  // },
  balance: {
    type: Number,
    default: 0,
  },
  points: {
    type: Number,
    default: 0,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
  },
  otpExpiry: {
    type: Date,
  },
});

// Modify toJSON method to exclude password and OTP fields
customerSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpiry;
  return obj;
};

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
