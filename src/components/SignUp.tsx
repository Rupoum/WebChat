"use client";
import { BackgroundLines } from "../components/ui/background-lines";
import SignupFormDemo from "./example/signup-form-demo";
const SignUp = () => {
  return (
    <div className="">
      <BackgroundLines className="h-screen w-screen flex justify-center items-center">
        <SignupFormDemo />
      </BackgroundLines>
    </div>
  );
};

export default SignUp;
