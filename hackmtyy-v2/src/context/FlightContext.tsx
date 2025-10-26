import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState
} from "react";
import { flightsDB } from "../data/flights";
import {
  AlcoholDecisionOption,
  Flight,
  Item,
  Role,
  Trolley
} from "../types";

type ItemProgress = Record<string, number>;
type ProgressState = Record<string, ItemProgress>;
type AlcoholDecisionState = Record<string, Record<string, AlcoholDecisionOption>>;

interface FlightContextValue {
  selectedFlightId: string | null;
  selectedFlight: Flight | null;
  flightError: string | null;
  role: Role | null;
  pickProgress: ProgressState;
  packProgress: ProgressState;
  selectedPackTrolleyId: string | null;
  activePickTrolleyId: string | null;
  alcoholDecisions: AlcoholDecisionState;
  alcoholConfirmed: Record<string, boolean>;
  selectFlight: (flightNumber: string) => boolean;
  setRole: (role: Role | null) => void;
  setSelectedPackTrolleyId: (trolleyId: string | null) => void;
  setActivePickTrolleyId: (trolleyId: string | null) => void;
  scanItem: (trolleyId: string, sku: string) => boolean;
  adjustPackItem: (trolleyId: string, sku: string, delta: number) => void;
  setAlcoholDecision: (
    trolleyId: string,
    sku: string,
    decision: AlcoholDecisionOption
  ) => void;
  confirmAlcoholDecisions: (trolleyId: string) => boolean;
}

const FlightContext = createContext<FlightContextValue | undefined>(undefined);

const buildPickProgress = (flight: Flight): ProgressState =>
  flight.trolleys.reduce<ProgressState>((acc, trolley) => {
    acc[trolley.id] = trolley.items.reduce<ItemProgress>((itemAcc, item) => {
      itemAcc[item.sku] = item.qty;
      return itemAcc;
    }, {});
    return acc;
  }, {});

const buildPackProgress = (flight: Flight): ProgressState =>
  flight.trolleys.reduce<ProgressState>((acc, trolley) => {
    acc[trolley.id] = trolley.items.reduce<ItemProgress>((itemAcc, item) => {
      itemAcc[item.sku] = 0;
      return itemAcc;
    }, {});
    return acc;
  }, {});

const buildAlcoholDecisionInit = (flight: Flight): {
  decisions: AlcoholDecisionState;
  confirmed: Record<string, boolean>;
} => {
  const decisions: AlcoholDecisionState = {};
  const confirmed: Record<string, boolean> = {};

  flight.trolleys.forEach((trolley) => {
    const alcoholItems = trolley.items.filter((item) => item.alcohol);
    if (alcoholItems.length > 0) {
      decisions[trolley.id] = {};
      confirmed[trolley.id] = false;
    }
  });

  return { decisions, confirmed };
};

const getItemFromFlight = (
  flight: Flight | null,
  trolleyId: string,
  sku: string
): Item | undefined => {
  if (!flight) {
    return undefined;
  }
  const trolley = flight.trolleys.find((t) => t.id === trolleyId);
  return trolley?.items.find((item) => item.sku === sku);
};

export const FlightProvider = ({ children }: PropsWithChildren) => {
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [flightError, setFlightError] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [pickProgress, setPickProgress] = useState<ProgressState>({});
  const [packProgress, setPackProgress] = useState<ProgressState>({});
  const [selectedPackTrolleyId, setSelectedPackTrolleyId] = useState<
    string | null
  >(null);
  const [activePickTrolleyId, setActivePickTrolleyId] = useState<string | null>(
    null
  );
  const [alcoholDecisions, setAlcoholDecisions] =
    useState<AlcoholDecisionState>({});
  const [alcoholConfirmed, setAlcoholConfirmed] = useState<Record<
    string,
    boolean
  >>({});

  const resetState = useCallback(() => {
    setSelectedFlightId(null);
    setSelectedFlight(null);
    setRole(null);
    setPickProgress({});
    setPackProgress({});
    setSelectedPackTrolleyId(null);
    setActivePickTrolleyId(null);
    setAlcoholDecisions({});
    setAlcoholConfirmed({});
  }, []);

  const selectFlight = useCallback(
    (flightNumber: string) => {
      const normalized = flightNumber.trim().toUpperCase();
      if (!normalized) {
        resetState();
        setFlightError("Ingresa un número de vuelo");
        return false;
      }

      const found = flightsDB[normalized];
      if (!found) {
        resetState();
        setFlightError("Vuelo no encontrado");
        return false;
      }

      setFlightError(null);
      setSelectedFlightId(normalized);
      setSelectedFlight(found);
      setRole(null);
      setPickProgress(buildPickProgress(found));
      setPackProgress(buildPackProgress(found));
      setSelectedPackTrolleyId(null);
      setActivePickTrolleyId(found.trolleys[0]?.id ?? null);

      const { decisions, confirmed } = buildAlcoholDecisionInit(found);
      setAlcoholDecisions(decisions);
      setAlcoholConfirmed(confirmed);

      return true;
    },
    [resetState]
  );

  const scanItem = useCallback(
    (trolleyId: string, sku: string) => {
      let success = false;
      setPickProgress((prev) => {
        const trolleyProgress = prev[trolleyId];
        if (!trolleyProgress || trolleyProgress[sku] === undefined) {
          return prev;
        }
        if (trolleyProgress[sku] <= 0) {
          return prev;
        }
        success = true;
        return {
          ...prev,
          [trolleyId]: {
            ...trolleyProgress,
            [sku]: Math.max(0, trolleyProgress[sku] - 1)
          }
        };
      });
      return success;
    },
    []
  );

  const adjustPackItem = useCallback(
    (trolleyId: string, sku: string, delta: number) => {
      const item = getItemFromFlight(selectedFlight, trolleyId, sku);
      if (!item) {
        return;
      }
      setPackProgress((prev) => {
        const trolleyProgress = prev[trolleyId] ?? {};
        const current = trolleyProgress[sku] ?? 0;
        const next = Math.min(Math.max(current + delta, 0), item.qty);
        if (next === current) {
          return prev;
        }
        return {
          ...prev,
          [trolleyId]: {
            ...trolleyProgress,
            [sku]: next
          }
        };
      });
    },
    [selectedFlight]
  );

  const setAlcoholDecisionHandler = useCallback(
    (trolleyId: string, sku: string, decision: AlcoholDecisionOption) => {
      setAlcoholDecisions((prev) => ({
        ...prev,
        [trolleyId]: {
          ...(prev[trolleyId] ?? {}),
          [sku]: decision
        }
      }));
      setAlcoholConfirmed((prev) => ({
        ...prev,
        [trolleyId]: false
      }));
    },
    []
  );

  const confirmAlcoholDecisions = useCallback(
    (trolleyId: string) => {
      const trolley = selectedFlight?.trolleys.find(
        (candidate) => candidate.id === trolleyId
      );
      if (!trolley) {
        return false;
      }
      const alcoholItems = trolley.items.filter((item) => item.alcohol);
      if (alcoholItems.length === 0) {
        setAlcoholConfirmed((prev) => ({ ...prev, [trolleyId]: true }));
        return true;
      }

      const decisions = alcoholDecisions[trolleyId] ?? {};
      const allSelected = alcoholItems.every((item) => decisions[item.sku]);
      if (!allSelected) {
        return false;
      }

      setAlcoholConfirmed((prev) => ({ ...prev, [trolleyId]: true }));
      return true;
    },
    [alcoholDecisions, selectedFlight]
  );

  const value = useMemo(
    () => ({
      selectedFlightId,
      selectedFlight,
      flightError,
      role,
      pickProgress,
      packProgress,
      selectedPackTrolleyId,
      activePickTrolleyId,
      alcoholDecisions,
      alcoholConfirmed,
      selectFlight,
      setRole,
      setSelectedPackTrolleyId,
      setActivePickTrolleyId,
      scanItem,
      adjustPackItem,
      setAlcoholDecision: setAlcoholDecisionHandler,
      confirmAlcoholDecisions
    }),
    [
      selectedFlightId,
      selectedFlight,
      flightError,
      role,
      pickProgress,
      packProgress,
      selectedPackTrolleyId,
      activePickTrolleyId,
      alcoholDecisions,
      alcoholConfirmed,
      selectFlight,
      scanItem,
      adjustPackItem,
      setAlcoholDecisionHandler,
      confirmAlcoholDecisions
    ]
  );

  return <FlightContext.Provider value={value}>{children}</FlightContext.Provider>;
};

export const useFlightContext = (): FlightContextValue => {
  const ctx = useContext(FlightContext);
  if (!ctx) {
    throw new Error("useFlightContext debe usarse dentro de FlightProvider");
  }
  return ctx;
};
