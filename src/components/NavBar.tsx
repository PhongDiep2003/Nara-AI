import React from "react";
import Image from "next/image";
const NavBar = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image
              src={"/naraAI.png"}
              alt="Nara AI app logo"
              width={48}
              height={48}
              className="rounded-full shadow-sm"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Nara AI</h1>
              <p className="text-sm text-gray-500">
                Automated presentation scripting
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
