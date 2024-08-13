import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../context/AuthContext";

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const { register: registerUser } = useAuth();

  const onSubmit = async (data: RegisterFormData) => {
    await registerUser(data);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-base-200">
      <div className="w-full max-w-md p-8 space-y-3 rounded-xl bg-base-100 shadow-lg">
        <h1 className="text-2xl font-bold text-center">Register</h1>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="form-control">
            <label
              htmlFor="firstName"
              className="label"
            >
              <span className="label-text">First Name</span>
            </label>
            <input
              id="firstName"
              type="text"
              className={`input input-bordered ${errors.firstName ? "input-error" : ""}`}
              {...register("firstName")}
            />
            {errors.firstName && <span className="text-error">{errors.firstName.message}</span>}
          </div>

          <div className="form-control">
            <label
              htmlFor="lastName"
              className="label"
            >
              <span className="label-text">Last Name</span>
            </label>
            <input
              id="lastName"
              type="text"
              className={`input input-bordered ${errors.lastName ? "input-error" : ""}`}
              {...register("lastName")}
            />
            {errors.lastName && <span className="text-error">{errors.lastName.message}</span>}
          </div>

          <div className="form-control">
            <label
              htmlFor="email"
              className="label"
            >
              <span className="label-text">Email</span>
            </label>
            <input
              id="email"
              type="email"
              className={`input input-bordered ${errors.email ? "input-error" : ""}`}
              {...register("email")}
            />
            {errors.email && <span className="text-error">{errors.email.message}</span>}
          </div>

          <div className="form-control">
            <label
              htmlFor="username"
              className="label"
            >
              <span className="label-text">Username</span>
            </label>
            <input
              id="username"
              type="text"
              className={`input input-bordered ${errors.username ? "input-error" : ""}`}
              {...register("username")}
            />
            {errors.username && <span className="text-error">{errors.username.message}</span>}
          </div>

          <div className="form-control">
            <label
              htmlFor="password"
              className="label"
            >
              <span className="label-text">Password</span>
            </label>
            <input
              id="password"
              type="password"
              className={`input input-bordered ${errors.password ? "input-error" : ""}`}
              {...register("password")}
            />
            {errors.password && <span className="text-error">{errors.password.message}</span>}
          </div>

          <div className="form-control mt-6">
            <button
              type="submit"
              className="btn btn-primary"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
