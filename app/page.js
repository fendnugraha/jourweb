import Image from "next/image";
import LoginLinks from "./LoginLinks";

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col justify-between bg-white text-gray-800"
      style={{
        backgroundImage: "url('/bg-new-t.png')",
        backgroundColor: "rgba(222 ,222 ,222 ,.5)",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      {/* Header */}
      <header className="flex justify-start items-center px-6 py-4">
        <div className="flex items-center gap-3">
          <Image
            src="/jour-logo.svg"
            alt="Jour Logo"
            width={30}
            height={14}
            priority
          />{" "}
          {" | "}
          <h1 className="text-blue-800 text-2xl font-bold">
            <span className="text-xs text-slate-500 block">
              Journal Apps for
            </span>
            AgenBRI
            <span className="text-orange-500">Link</span>
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="grow flex flex-col items-center justify-center gap-6 px-4">
        <h1 className="text-slate-600/50 text-shadow-sm text-4xl sm:text-8xl font-bold">
          THREE<span className="font-light">KOMUNIKA</span>
        </h1>
        <div className="">
          <LoginLinks />
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-xs sm:text-sm text-center sm:text-start text-gray-500">
        Created by{" "}
        <Image
          src="/eightnite.png"
          alt="Eightnite Logo"
          className="inline"
          width={75}
          height={14}
          priority
        />
        . Copyright © 2023 All Rights Reserved
      </footer>
    </div>
  );
}
