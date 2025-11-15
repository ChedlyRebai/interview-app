import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/action/auth.action";
import React from "react";

const page = async () => {

  const user=await getCurrentUser();
  return (
    <>
        <h3>Interview generation</h3>
        <Agent userName={user?.displayName ||''} userId={user?.uid || ''}  type="generate"/>
    </>
  );
};

export default page;
