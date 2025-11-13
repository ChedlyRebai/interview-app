import Image from "next/image";
import React from "react";

const Agent = ({ userName }: AgentProps) => {
  const isSpeaker = true; // This should be determined by your application logic
  return (
    <>
      <div className="call-view">
        <div className="card-interview">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              className="object-cover"
              alt="vapi"
              width={65}
              height={54}
            />
            {isSpeaker && <span className="animate-speak">Speaker</span>}
          </div>

          <h3>AI interviewer</h3>
        </div>

        <div className="card-border">
          <div className="card-content">
            <Image
              src={"/user-avatar.png"}
              alt="user avatar"
              width={540}
              height={540}
              className="rounded-full object-cover size-[120px]"
            />

            <h3>{userName}</h3>
          </div>
        </div>
      </div>
    </>
  );
};

export default Agent;
