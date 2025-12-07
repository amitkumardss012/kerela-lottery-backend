import { asyncHandler } from "../middlewares";
import { AdminService } from "../services";
import { statusCode } from "../types/types";
import { ErrorResponse, jwt, Password } from "../utils";
import { SuccessResponse } from "../utils/response.util";
import { AdminValidator } from "../validators";

export const createAdmin = asyncHandler(async (req, res, next) => {
  // Validate request body against AdminValidator schema
  const validData = AdminValidator.parse(req.body);
  // Ensure only admin roles can be created
  if (validData.role === "admin")
    return next(
      new ErrorResponse("only one admin is allowed", statusCode.Bad_Request)
    );
  
  // Check for existing sub-admin and hash password concurrently
  const [existingSubAdmin, hashedPassword] = await Promise.all([
    AdminService.findByEmail(validData.email),
    Password.hashPassword(validData.password),
  ]);

  
  // Return error if sub-admin already exists
  if (existingSubAdmin)
    return next(
      new ErrorResponse("Sub Admin already exists", statusCode.Bad_Request)
    );

  // Create new sub-admin with hashed password
  const newSubAdmin = await AdminService.createAdmin({
    ...validData,
    password: hashedPassword,
  });
  return SuccessResponse(
    res,
    "Sub Admin Created Successfully",
    newSubAdmin,
    statusCode.Created
  );
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  // Validate required fields
  if (!email || !password)
    return next(
      new ErrorResponse(
        "Email and Password are required",
        statusCode.Bad_Request
      )
    );

  // Find admin by email
  const admin = await AdminService.findByEmail(email);
  console.log(admin)

  // Verify password and admin existence
  if (!admin || !(await Password.verifyPassword(password, admin.password))) {
    return next(
      new ErrorResponse("Invalid email or Password", statusCode.Unauthorized)
    );
  }

  // Generate JWT token
  const token = jwt.generateToken({
    id: admin.id,
    email: admin.email,
    role: admin.role,
  });

  // Set cookie and send response
  return res
    .status(statusCode.OK)
    .cookie("token", token, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    })
    .header("Authorization", `Bearer ${token}`)
    .json({
      success: true,
      message: "Login successfully",
      token,
      data: admin,
    });
});

export const logout = asyncHandler(async (req, res, next) => {
  return res
    .status(statusCode.OK)
    .cookie("token", "", {
      secure: process.env.NODE_ENV === "production", //? Secure in production
      sameSite: "strict", //? Prevent CSRF attacks
      expires: new Date(0),
    })
    .json({
      success: true,
      message: "Logout successfully",
    });
});

export const AllAdmins = asyncHandler(async (req, res, next) => {
  const admins = await AdminService.getAllAdmin();
  return SuccessResponse(
    res,
    "Admins fetched successfully",
    admins,
    statusCode.OK
  );
});

export const getAdminById = asyncHandler(async (req, res, next) => {
  // Validate and parse ID parameter
  const id = Number(req.params.id);
  if (isNaN(id) || !id)
    return next(new ErrorResponse("Invalid ID", statusCode.Bad_Request));
  
  // Find admin by ID
  const admin = await AdminService.findById(id);
  if (!admin)
    return next(
      new ErrorResponse("admin or sub admin not found", statusCode.Not_Found)
    );

  return SuccessResponse(res, "sub admin fetched successfully", admin);
});


export const deleteById = asyncHandler(async (req, res, next) => {
  // Validate and parse ID parameter
  const id = Number(req.params.id);
  if (isNaN(id) || !id)
    return next(new ErrorResponse("Invalid ID", statusCode.Bad_Request));
  
  // Delete admin and check if successful
  const deletedAdmin = await AdminService.deleteById(id);
  if (!deletedAdmin)
    return next(new ErrorResponse("Sub Admin not found", statusCode.Not_Found));
  return SuccessResponse(res, "Sub Admin deleted Successfully");
});
