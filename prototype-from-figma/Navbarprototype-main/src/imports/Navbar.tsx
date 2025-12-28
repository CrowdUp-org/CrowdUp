import svgPaths from "./svg-82teplvwvz";

function Svg() {
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
            stroke="var(--stroke-0, #737383)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.00893"
          />
          <path
            d={svgPaths.pd775100}
            id="Vector_2"
            stroke="var(--stroke-0, #737383)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.00893"
          />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div
      className="content-stretch flex flex-col h-[49px] items-center justify-center relative rounded-[20px] shrink-0 w-[96px]"
      data-name="Button"
    >
      <Svg />
    </div>
  );
}

function Svg1() {
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
            stroke="var(--stroke-0, white)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.00893"
          />
          <path
            d={svgPaths.pf3de100}
            id="Vector_2"
            stroke="var(--stroke-0, white)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.00893"
          />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div
      className="content-stretch flex flex-col h-[57.857px] items-center justify-center relative rounded-[17.564px] shrink-0 w-[96.429px]"
      data-name="Button"
    >
      <Svg1 />
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
            stroke="var(--stroke-0, white)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.00893"
          />
          <path
            d="M12.0535 5.0224V19.0849"
            id="Vector_2"
            stroke="var(--stroke-0, white)"
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

function Container() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0"
      data-name="Container"
    >
      <OverlayShadow />
    </div>
  );
}

function Button2() {
  return (
    <div
      className="content-stretch flex flex-col h-[57.857px] items-center justify-center relative rounded-[17.564px] shrink-0 w-[96.429px]"
      data-name="Button"
    >
      <Container />
    </div>
  );
}

function Svg3() {
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
            stroke="var(--stroke-0, #717182)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.00893"
          />
        </g>
      </svg>
    </div>
  );
}

function Button3() {
  return (
    <div
      className="content-stretch flex flex-col h-[57.857px] items-center justify-center relative rounded-[17.564px] shrink-0 w-[96.429px]"
      data-name="Button"
    >
      <Svg3 />
    </div>
  );
}

function Svg4() {
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
            stroke="var(--stroke-0, #717182)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.00893"
          />
          <path
            d={svgPaths.p1d3f6a00}
            id="Vector_2"
            stroke="var(--stroke-0, #717182)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.00893"
          />
        </g>
      </svg>
    </div>
  );
}

function Button4() {
  return (
    <div
      className="content-stretch flex flex-col h-[57.857px] items-center justify-center relative rounded-[17.564px] shrink-0 w-[96.429px]"
      data-name="Button"
    >
      <Svg4 />
    </div>
  );
}

function Container1() {
  return (
    <div
      className="content-stretch flex gap-[9.643px] items-center relative shrink-0"
      data-name="Container"
    >
      <Button />
      <Button1 />
      <Button2 />
      <Button3 />
      <Button4 />
    </div>
  );
}

function OverlayOverlayBlur() {
  return (
    <div
      className="absolute backdrop-blur-[5.51px] backdrop-filter bg-[rgba(225,225,225,0.3)] box-border content-stretch flex flex-col items-center justify-center left-0 p-[9.643px] rounded-[20px] top-0"
      data-name="Overlay+OverlayBlur"
    >
      <div
        className="absolute bg-[#909090] h-[57.857px] left-[114px] rounded-[17.564px] shadow-[0px_0px_28px_-3px_#909090] top-[10px] w-[96.429px]"
        data-name="Overlay+Shadow"
      />
      <Container1 />
    </div>
  );
}

export default function Navbar() {
  return (
    <div className="relative size-full" data-name="Navbar">
      <OverlayOverlayBlur />
    </div>
  );
}
