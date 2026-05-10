type CreditsProps = {
  className?: string;
};

export default function Credits({ className = "" }: CreditsProps) {
  return (
      <footer
          className={`p-[1rem] text-left text-[15px] ${className}`} //TODO: Why p-8 doesn't work?
          style={{ backgroundColor: "#040303", color: "#EEEEEE" }}
      >
        <p>Made with ❤️ by Thomas Conchon</p>
        <p>Thanks to the Comité de promo 2026</p>
        <p>Code Source: BUTTON</p>
      </footer>
  );
}