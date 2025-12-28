import { useState } from "react";
import svgPaths from "./imports/svg-ukqjubhuum";

type NavItem = "home" | "search" | "add" | "messages" | "profile";

function Svg({ isActive }: { isActive: boolean }) {
  return (
    <div className="relative shrink-0 size-[24.107px]" data-name="SVG">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 25 25"
      >
        <g id="SVG">
          <path
            d={svgPaths.p2d6a7600}
            id="Vector"
            stroke={isActive ? "white" : "#717182"}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.00893"
          />
          <path
            d={svgPaths.pd775100}
            id="Vector_2"
            stroke={isActive ? "white" : "#717182"}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.00893"
          />
        </g>
      </svg>
    </div>
  );
}

function Svg1({ isActive }: { isActive: boolean }) {
  return (
    <div className="relative shrink-0 size-[24.107px]" data-name="SVG">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 25 25"
      >
        <g id="SVG">
          <path
            d={svgPaths.p393528b4}
            id="Vector"
            stroke={isActive ? "white" : "#717182"}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.00893"
          />
          <path
            d={svgPaths.pf3de100}
            id="Vector_2"
            stroke={isActive ? "white" : "#717182"}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.00893"
          />
        </g>
      </svg>
    </div>
  );
}

function Svg2() {
  return (
    <div className="relative shrink-0 size-[24.107px]" data-name="SVG">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 25 25"
      >
        <g id="SVG">
          <path
            d="M5.0221 12.0536H19.0846"
            id="Vector"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.00893"
          />
          <path
            d="M12.0535 5.0224V19.0849"
            id="Vector_2"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.00893"
          />
        </g>
      </svg>
    </div>
  );
}

function Svg3({ isActive }: { isActive: boolean }) {
  return (
    <div className="relative shrink-0 size-[24.107px]" data-name="SVG">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 25 25"
      >
        <g id="SVG">
          <path
            d={svgPaths.p3f8a600}
            id="Vector"
            stroke={isActive ? "white" : "#717182"}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.00893"
          />
        </g>
      </svg>
    </div>
  );
}

function Svg4({ isActive }: { isActive: boolean }) {
  return (
    <div className="relative shrink-0 size-[24.107px]" data-name="SVG">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 25 25"
      >
        <g id="SVG">
          <path
            d={svgPaths.p1036f160}
            id="Vector"
            stroke={isActive ? "white" : "#717182"}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.00893"
          />
          <path
            d={svgPaths.p1d3f6a00}
            id="Vector_2"
            stroke={isActive ? "white" : "#717182"}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.00893"
          />
        </g>
      </svg>
    </div>
  );
}

function OverlayShadow() {
  return (
    <div
      className="bg-[#ff992b] box-border content-stretch flex items-center justify-center overflow-clip relative rounded-[16px] shadow-[0px_13.776px_20.663px_-4.133px_rgba(0,0,0,0.1),0px_5.51px_8.265px_-5.51px_rgba(0,0,0,0.1)] shrink-0 size-[48.214px]"
      data-name="Overlay+Shadow"
    >
      <Svg2 />
    </div>
  );
}

export default function App() {
  const [activeItem, setActiveItem] = useState<NavItem>("home");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="relative">
        <div
          className="backdrop-blur-[5.51px] backdrop-filter bg-[rgba(225,225,225,0.3)] box-border content-stretch flex flex-col items-center justify-center p-[9.643px] rounded-[20px]"
          data-name="Overlay+OverlayBlur"
        >
          <div
            className="absolute bg-[#909090] h-[57.857px] rounded-[17.564px] shadow-[0px_0px_28px_-3px_#909090] top-[9.64px] w-[96.429px] transition-all duration-300 ease-out"
            data-name="Overlay+Shadow"
            style={{
              left:
                activeItem === "home"
                  ? "9.64px"
                  : activeItem === "search"
                    ? "115.672px"
                    : activeItem === "add"
                      ? "221.704px"
                      : activeItem === "messages"
                        ? "327.736px"
                        : "433.768px",
            }}
          />
          <div
            className="content-stretch flex gap-[9.643px] items-center relative shrink-0 z-10"
            data-name="Container"
          >
            <button
              onClick={() => setActiveItem("home")}
              className="content-stretch flex flex-col h-[57.857px] items-center justify-center relative rounded-[20px] shrink-0 w-[96.429px] cursor-pointer transition-all hover:scale-105"
              data-name="Button"
            >
              <Svg isActive={activeItem === "home"} />
            </button>
            <button
              onClick={() => setActiveItem("search")}
              className="content-stretch flex flex-col h-[57.857px] items-center justify-center relative rounded-[17.564px] shrink-0 w-[96.429px] cursor-pointer transition-all hover:scale-105"
              data-name="Button"
            >
              <Svg1 isActive={activeItem === "search"} />
            </button>
            <div
              className="content-stretch flex flex-col h-[57.857px] items-center justify-center relative rounded-[17.564px] shrink-0 w-[96.429px]"
              data-name="Button"
            >
              <div
                className="content-stretch flex flex-col items-start relative shrink-0"
                data-name="Container"
              >
                <OverlayShadow />
              </div>
            </div>
            <button
              onClick={() => setActiveItem("messages")}
              className="content-stretch flex flex-col h-[57.857px] items-center justify-center relative rounded-[17.564px] shrink-0 w-[96.429px] cursor-pointer transition-all hover:scale-105"
              data-name="Button"
            >
              <Svg3 isActive={activeItem === "messages"} />
            </button>
            <button
              onClick={() => setActiveItem("profile")}
              className="content-stretch flex flex-col h-[57.857px] items-center justify-center relative rounded-[17.564px] shrink-0 w-[96.429px] cursor-pointer transition-all hover:scale-105"
              data-name="Button"
            >
              <Svg4 isActive={activeItem === "profile"} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
