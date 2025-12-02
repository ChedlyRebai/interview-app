
import { isAuthenticated } from "@/lib/action/auth.action";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import React, { ReactNode } from "react";

const Rootlayout = async ({children}:{children:ReactNode}) => {
  const isauthenticated = await isAuthenticated();
  
  // if(!isauthenticated){
  //   redirect('/sign-in');
  // }
  return (
    <div className="root-layout">
      <nav>
        <Link  href="/" className="flex items-center">
          <Image src="/logo.svg" alt="logo" height={32} width={32} />
          <h2 className="text-primary-100">
            Interview
          </h2>
        </Link>
      </nav>
      {children}
    </div>
  );
};

export default Rootlayout;
