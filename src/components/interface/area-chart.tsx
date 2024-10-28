"use client";

import React, { useMemo, useRef, useEffect } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import {
    TooltipComponent,
    DataZoomComponent,
    DataZoomInsideComponent,
    DataZoomSliderComponent,
    TitleComponent,
    GridComponent
} from "echarts/components";
import { SVGRenderer } from "echarts/renderers";

interface AreaChartProps {
    data: [Date, number][];
    seriesName: string;
}

export default function AreaChart({ data, seriesName }: AreaChartProps) {
    const chartRef = useRef<ReactEChartsCore>(null);

    useEffect(() => {
        const handleMouseLeave = () => {
            const canvas = chartRef.current?.ele?.querySelector("canvas");
            if (canvas) {
                canvas.dispatchEvent(
                    new MouseEvent("mouseup", {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    })
                );
            }
        };

        const chartContainer = chartRef.current?.ele;
        chartContainer?.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            chartContainer?.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, []);

    useMemo(() => {
        echarts.use([
            TitleComponent,
            TooltipComponent,
            GridComponent,
            LineChart,
            SVGRenderer,
            DataZoomComponent,
            DataZoomInsideComponent,
            DataZoomSliderComponent
        ]);
    }, []);

    const option = useMemo(
        () => ({
            darkMode: true,
            color: [
                "#FFFFFF",
                "#91cc75",
                "#fac858",
                "#ee6666",
                "#73c0de",
                "#3ba272",
                "#fc8452",
                "#9a60b4",
                "#ea7ccc"
            ],
            grid: {
                top: 10,
                left: 50,
                right: 10
            },
            backgroundColor: "#000000",
            tooltip: {
                trigger: "axis",
                position: function (
                    [x, y]: [number, number],
                    _params: any,
                    dom: HTMLElement,
                    _rect: DOMRect,
                    size: { viewSize: [number, number]; contentSize: [number, number] }
                ) {
                    const { viewSize } = size;
                    const tooltipWidth = dom.offsetWidth;
                    const tooltipHeight = dom.offsetHeight;

                    let posX = x + 20;
                    let posY = y + 10;

                    if (x + tooltipWidth + 20 > viewSize[0]) {
                        posX = x - tooltipWidth - 20;
                    }

                    if (y + tooltipHeight + 10 > viewSize[1]) {
                        posY = y - tooltipHeight - 10;
                    }

                    return [posX, posY];
                },
                axisPointer: {
                    lineStyle: {
                        color: "#817f91"
                    },
                    crossStyle: {
                        color: "#817f91"
                    },
                    label: {
                        color: "#fff",
                        formatter: function ({ value }: { value: number }) {
                            const date = new Date(value);
                            return date.toLocaleString("en-US", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                            });
                        }
                    }
                }
            },
            xAxis: {
                type: "time",
                boundaryGap: false,
                axisLine: {
                    lineStyle: {
                        color: "#000000"
                    }
                },
                axisTick: {
                    lineStyle: {
                        color: "#000000"
                    }
                },
                axisLabel: {
                    color: "#fff"
                }
            },
            yAxis: {
                type: "value",
                axisLine: {
                    lineStyle: {
                        color: "#141414"
                    }
                },
                axisTick: {
                    lineStyle: {
                        color: "#141414"
                    }
                },
                axisLabel: {
                    color: "#fff",
                    formatter: (value: number) => {
                        if (value >= 1e9) return (value / 1e9).toFixed(1) + "b";
                        if (value >= 1e6) return (value / 1e6).toFixed(1) + "m";
                        if (value >= 1e3) return (value / 1e3).toFixed(1) + "k";
                        return value.toString();
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: "#141414"
                    }
                }
            },
            dataZoom: [
                {
                    type: "inside",
                    start: 0,
                    end: 100,
                    borderColor: "#71708A",
                    textStyle: {
                        color: "#fff"
                    },
                    brushStyle: {
                        color: "rgba(135,163,206,0.3)"
                    },
                    handleStyle: {
                        color: "#353450",
                        borderColor: "#C5CBE3"
                    },
                    moveHandleStyle: {
                        color: "#B0B6C3",
                        opacity: 0.3
                    },
                    fillerColor: "rgba(135,163,206,0.2)",
                    emphasis: {
                        handleStyle: {
                            borderColor: "#91B7F2",
                            color: "#4D587D"
                        },
                        moveHandleStyle: {
                            color: "#636D9A",
                            opacity: 0.7
                        }
                    },
                    dataBackground: {
                        lineStyle: {
                            color: "#71708A",
                            width: 1
                        },
                        areaStyle: {
                            color: "#71708A"
                        }
                    },
                    selectedDataBackground: {
                        lineStyle: {
                            color: "#87A3CE"
                        },
                        areaStyle: {
                            color: "#87A3CE"
                        }
                    }
                },
                {
                    start: 0,
                    end: 10,
                    borderColor: "#71708A",
                    textStyle: {
                        color: "#fff"
                    },
                    brushStyle: {
                        color: "rgba(135,163,206,0.3)"
                    },
                    handleStyle: {
                        color: "#353450",
                        borderColor: "#C5CBE3"
                    },
                    moveHandleStyle: {
                        color: "#B0B6C3",
                        opacity: 0.3
                    },
                    fillerColor: "rgba(135,163,206,0.2)",
                    emphasis: {
                        handleStyle: {
                            borderColor: "#91B7F2",
                            color: "#4D587D"
                        },
                        moveHandleStyle: {
                            color: "#636D9A",
                            opacity: 0.7
                        }
                    },
                    dataBackground: {
                        lineStyle: {
                            color: "#71708A",
                            width: 1
                        },
                        areaStyle: {
                            color: "#71708A"
                        }
                    },
                    selectedDataBackground: {
                        lineStyle: {
                            color: "#87A3CE"
                        },
                        areaStyle: {
                            color: "#87A3CE"
                        }
                    }
                }
            ],
            series: [
                {
                    name: seriesName,
                    type: "line",
                    symbol: "circle",
                    symbolSize: 8,
                    sampling: "lttb",
                    itemStyle: {
                        color: "#FFFFFF"
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            {
                                offset: 0,
                                color: "rgba(255, 255, 255, 0.8)"
                            },
                            {
                                offset: 1,
                                color: "rgba(255, 255, 255, 0)"
                            }
                        ])
                    },
                    data: data,
                    showSymbol: false,
                    emphasis: {
                        itemStyle: {
                            color: "#000000",
                            borderColor: "#FFFFFF",
                            borderWidth: 2,
                            zIndex: 3
                        }
                    }
                }
            ]
        }),
        [data, seriesName]
    );

    return (
        <ReactEChartsCore
            ref={chartRef}
            echarts={echarts}
            option={option}
            notMerge={true}
            lazyUpdate={true}
            theme={"dark"}
            style={{
                height: "450px",
                width: "100%"
            }}
        />
    );
}
