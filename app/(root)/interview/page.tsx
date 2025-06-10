import Agent from "@/components/Agent";
import React from "react";

const page = () => {
  return (
    <>
        <h3>Interview generation</h3>
        <Agent userName="chedly" userId="12345"  type="generate"/>
    </>
  );
};

export default page;
