import type { ReactNode } from "react";
import DropdownNav from "../components/DropdownNav";

function RectMenu() {
  return (
    <div className="flex h-full gap-3">
      {[0, 1, 2].map((offset) => (
        <div key={offset} className="h-full flex-1 rounded-lg bg-[var(--ngen-grayscale-100)]" />
      ))}
    </div>
  );
}

function DropdownLink({ children }: { children: ReactNode }) {
  return (
    <a
      href="#"
      onClick={(event) => event.preventDefault()}
      className="w-fit text-2xl leading-[1.2] tracking-[-0.48px] font-medium text-[var(--ngen-grayscale-900)] outline-none focus-visible:underline"
    >
      {children}
    </a>
  );
}

function SmallLink({ children }: { children: ReactNode }) {
  return (
    <a
      href="#"
      onClick={(event) => event.preventDefault()}
      className="w-fit text-sm leading-[1.5] font-medium text-[var(--ngen-grayscale-500)] outline-none focus-visible:underline"
    >
      {children}
    </a>
  );
}

function ExploreDropdown() {
  return (
    <div className="flex h-full w-full items-start gap-[10px]">
      <div className="flex flex-1 gap-[22px] p-9">
        <div className="flex flex-1 flex-col gap-12">
          <p className="eyebrow text-[12px] leading-none text-[var(--ngen-grayscale-500)]">
            Explore
          </p>
          <div className="flex flex-col gap-3">
            <DropdownLink>About us</DropdownLink>
            <DropdownLink>Projects</DropdownLink>
            <DropdownLink>Careers</DropdownLink>
            <DropdownLink>News</DropdownLink>
          </div>
          <div className="flex w-[204px] flex-col gap-2.5">
            <p className="text-sm font-medium leading-[1.5] text-[var(--ngen-grayscale-500)]">
              Can&rsquo;t find what
              <br />
              you are looking for?
            </p>
            <button
              type="button"
              className="w-fit rounded-full border border-[var(--ngen-grayscale-50)] bg-white px-[14px] py-[10px] text-xs text-[var(--ngen-grayscale-900)]"
            >
              Contact us
            </button>
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-between self-stretch">
          <div className="flex flex-col gap-12">
            <p className="eyebrow text-[12px] leading-none text-[var(--ngen-grayscale-500)]">
              Resources
            </p>
            <div className="flex flex-col gap-3">
              <DropdownLink>Glossary</DropdownLink>
              <DropdownLink>Blog</DropdownLink>
              <DropdownLink>Help Center</DropdownLink>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <SmallLink>Terms &amp; Conditions</SmallLink>
            <SmallLink>Privacy Policy</SmallLink>
            <SmallLink>Cookie Policy</SmallLink>
          </div>
        </div>
      </div>
      <div className="w-[483px] shrink-0 self-stretch rounded-xl bg-[var(--ngen-grayscale-900)]" />
    </div>
  );
}

export default function ChevronNavDemo() {
  return (
    <div className="flex min-h-screen w-full items-start justify-center bg-white pt-[10px]">
      <DropdownNav
        items={[
          { text: "Button", href: "#", content: <RectMenu /> },
          { text: "Button", href: "#", content: <ExploreDropdown /> },
        ]}
      />
    </div>
  );
}
