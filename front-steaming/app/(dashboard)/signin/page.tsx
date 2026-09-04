import React, { Suspense } from "react";
import SigninPage from "./_components/signin-page";

const page = () => {
  return (
    <Suspense fallback={<div>กำลังโหลด...</div>}>
      <SigninPage />
    </Suspense>
  );
};

export default page;
