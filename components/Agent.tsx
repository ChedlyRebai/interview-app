import Image from "next/image";
import React from "react";

const Agent = () => {
    const isSpeaker = true; // This should be determined by your application logic
  return (
    <div className="call-view">
        <div className="card-interview">
            <div className="avatar">
                <Image src="/ai-avatar.png" className="object-cover" alt ="vapi" width={50} height={50} />
                {isSpeaker && <span className="animate-speak">Speaker</span>}
            </div>
        </div>
    </div>
  );
};

export default Agent;
