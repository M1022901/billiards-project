import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { countries, hexToRgba, MAP_NAME } from "../lib/worldGeo.js";

export default function WorldMapChart({ cumulativeCountryMap, selectedCountry, onSelectCountry }) {
  const chartElementRef = useRef(null);
  const chartRef = useRef(null);
  const onSelectRef = useRef(onSelectCountry);
  const [error, setError] = useState("");

  useEffect(() => {
    onSelectRef.current = onSelectCountry;
  }, [onSelectCountry]);

  useEffect(() => {
    if (!chartElementRef.current) return undefined;

    try {
      const chart = echarts.init(chartElementRef.current, null, { renderer: "canvas" });
      chartRef.current = chart;

      const resize = () => chart.resize();
      window.addEventListener("resize", resize);

      chart.on("click", (params) => {
        if (params.name) onSelectRef.current(params.name);
      });

      chart.on("mouseover", (params) => {
        if (params.name) onSelectRef.current(params.name);
      });

      return () => {
        window.removeEventListener("resize", resize);
        chart.dispose();
        chartRef.current = null;
      };
    } catch (initError) {
      setError(initError instanceof Error ? initError.message : String(initError));
      return undefined;
    }
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const data = countries.map((country) => {
      const research = cumulativeCountryMap[country];
      const isSelected = country === selectedCountry;
      const alpha = research?.isCurrent ? 0.9 : 0.28;
      const borderAlpha = research?.isCurrent ? 0.72 : 0.34;

      return {
        name: country,
        value: research ? 1 : 0,
        research,
        tooltip: {
          show: Boolean(research),
        },
        label: {
          show: Boolean(research?.isCurrent || isSelected),
          color: "#111827",
          fontSize: 11,
          fontWeight: 700,
        },
        itemStyle: {
          areaColor: research ? hexToRgba(research.stage.color, alpha) : "#edf3f0",
          borderColor: research ? `rgba(15, 23, 42, ${borderAlpha})` : "transparent",
          borderWidth: research ? (isSelected ? 1.8 : 0.7) : 0,
          shadowBlur: isSelected && research ? 12 : 0,
          shadowColor: isSelected && research ? "rgba(17, 24, 39, 0.35)" : "transparent",
        },
        emphasis: {
          disabled: !research,
          label: {
            show: Boolean(research),
            color: "#111827",
            fontSize: 12,
            fontWeight: 800,
          },
          itemStyle: {
            areaColor: research ? hexToRgba(research.stage.color, 0.86) : "#edf3f0",
            borderColor: research ? "#111827" : "transparent",
            borderWidth: research ? 1 : 0,
          },
        },
      };
    });

    chart.setOption(
      {
        backgroundColor: "#dce8e3",
        tooltip: {
          trigger: "item",
          borderWidth: 0,
          confine: true,
          extraCssText: "max-width: 260px; white-space: normal; line-height: 1.45; padding: 12px 14px;",
          backgroundColor: "rgba(17, 24, 39, 0.92)",
          textStyle: {
            color: "#ffffff",
            fontSize: 14,
          },
          formatter: (params) => {
            const research = params.data?.research;
            if (!research) return "";
            return `<strong>${params.name}</strong><br/>${research.stage.period}: ${research.heat}<br/>${research.note}`;
          },
        },
        series: [
          {
            type: "map",
            map: MAP_NAME,
            nameProperty: "name",
            roam: true,
            zoom: 1.2,
            layoutCenter: ["50%", "52%"],
            layoutSize: "96%",
            data,
            itemStyle: {
              areaColor: "#edf3f0",
              borderColor: "transparent",
              borderWidth: 0,
            },
            emphasis: {
              disabled: true,
            },
          },
        ],
      },
      true
    );
  }, [cumulativeCountryMap, selectedCountry]);

  return (
    <>
      {error ? <div className="error-box">Map failed to load: {error}</div> : null}
      <div ref={chartElementRef} className="map-chart" aria-label="World map" />
    </>
  );
}
