import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../context/AuthContext";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const { login } = useAuth();

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-base-200">
      <div className="w-full max-w-sm p-8 space-y-3 rounded-xl bg-base-100 shadow-lg">
        <h1 className="text-2xl font-bold text-center">Login</h1>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
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
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
