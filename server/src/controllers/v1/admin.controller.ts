import { Request, Response, NextFunction } from "express";
// Importing Locals
import userService from "@/services/v1/user.services.js";
import { ApiResponse, ApiError } from "@/utils/response-handler.js";

const AdminController = {
  /**
   * Retrieves a list of all users.
   *
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @param {NextFunction} next - The next function in the middleware chain.
   */
  getAllUsers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await userService.getUsers();
      if (!users) {
        throw new ApiError(404, "Users not found!");
      }
      return res.status(200).json(new ApiResponse(200, "Users fetched successfully!", users));
    } catch (error) {
      next(error);
    }
  },

  /**
   * Updates the role of a user.
   *
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @param {NextFunction} next - The next function.
   */
  changeUserRole: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, role }: { userId: string; role: "basic" | "admin" } = req.body;

      const user = await userService.getUserByProperty("id", userId);
      if (!user) {
        throw new ApiError(404, "User not found!");
      }
      await userService.updateUser(userId, { role });

      return res.status(200).json(new ApiResponse(200, "User role updated successfully!"));
    } catch (error) {
      next(error);
    }
  },
};

export default AdminController;
