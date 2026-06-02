"use client";

import { useEffect, useMemo, useState } from "react";

import {
  defaultInputs,
  MacroContext,
  ScenarioResponse,
  SimulatorInputs,
  toRequestBody,
} from "@/lib/simulator";

const API_ROOT = "http://127.0.0.1:8000";

export function useRbfSimulator() {
  const [inputs, setInputs] = useState<SimulatorInputs>(defaultInputs);
  const [scenario, setScenario] = useState<ScenarioResponse | null>(null);
  const [macroContext, setMacroContext] = useState<MacroContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestBody = useMemo(() => toRequestBody(inputs), [inputs]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const loadMacroContext = async () => {
      try {
        const response = await fetch(`${API_ROOT}/api/macro-context`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Macro context request failed with ${response.status}`);
        }

        const data = (await response.json()) as MacroContext;
        if (active) {
          setMacroContext(data);
        }
      } catch (loadError) {
        if ((loadError as Error).name !== "AbortError" && active) {
          setError("Unable to load macro context.");
        }
      }
    };

    void loadMacroContext();

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_ROOT}/api/rbf-scenario`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Scenario request failed with ${response.status}`);
        }

        const data = (await response.json()) as ScenarioResponse;
        setScenario(data);
      } catch (loadError) {
        if ((loadError as Error).name !== "AbortError") {
          setError("Unable to load simulator scenario.");
        }
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [requestBody]);

  return {
    inputs,
    setInputs,
    scenario,
    macroContext,
    isLoading,
    error,
  };
}
