import { Role } from "../types";
import { useFlightContext } from "../context/FlightContext";

const RoleSelector = () => {
  const { role, setRole, selectedFlight } = useFlightContext();
  const disabled = !selectedFlight;

  const handleSelect = (nextRole: Role) => {
    if (disabled) {
      return;
    }
    setRole(nextRole);
  };

  const buttonClass = (target: Role) =>
    [
      "role-button",
      role === target ? "role-button--active" : "",
      disabled ? "role-button--disabled" : ""
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <div className="role-selector">
      <button
        type="button"
        className={buttonClass("PICK")}
        onClick={() => handleSelect("PICK")}
        disabled={disabled}
      >
        PICK
      </button>
      <button
        type="button"
        className={buttonClass("PACK")}
        onClick={() => handleSelect("PACK")}
        disabled={disabled}
      >
        PACK
      </button>
    </div>
  );
};

export default RoleSelector;
