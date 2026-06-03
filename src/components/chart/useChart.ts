import { useTheme } from '@mui/material/styles';

export default function useChart(options?: any) {
  const theme = useTheme();

  const baseOptions = {
    // Colors
    colors: [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.info?.main || '#00B8D9',
      theme.palette.warning?.main || '#FFAB00',
      theme.palette.error?.main || '#FF5630',
      theme.palette.success?.main || '#36B37E',
    ],

    // Chart
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
      foreColor: theme.palette.text.secondary,
      fontFamily: theme.typography.fontFamily,
    },

    // States
    states: {
      hover: {
        filter: {
          type: 'lighten',
          value: 0.04,
        },
      },
      active: {
        filter: {
          type: 'none',
        },
      },
    },

    // Grid
    grid: {
      strokeDashArray: 3,
      borderColor: theme.palette.divider || '#F1F5F9',
      xaxis: {
        lines: {
          show: false,
        },
      },
    },

    // Stroke
    stroke: {
      width: 3,
      curve: 'smooth',
      lineCap: 'round',
    },

    // Tooltip
    tooltip: {
      theme: theme.palette.mode,
      shared: true,
      intersect: false,
      x: {
        show: false,
      },
    },

    // Marker
    markers: {
      size: 0,
      strokeColors: theme.palette.background.paper,
    },

    // Data Labels
    dataLabels: {
      enabled: false,
    },

    // Legend
    legend: {
      show: true,
      fontSize: '13px',
      position: 'top',
      horizontalAlign: 'right',
      markers: {
        radius: 12,
      },
      fontWeight: 500,
      itemMargin: {
        horizontal: 8,
      },
      labels: {
        colors: theme.palette.text.primary,
      },
    },

    // Xaxis
    xaxis: {
      axisBorder: { show: false },
      axisTicks: { show: false },
    },

    // Plot Options
    plotOptions: {
      // Bar
      bar: {
        borderRadius: 4,
        columnWidth: '28%',
      },
    },
  };

  return {
    ...baseOptions,
    ...options,
    chart: {
      ...baseOptions.chart,
      ...(options?.chart || {}),
    },
    stroke: {
      ...baseOptions.stroke,
      ...(options?.stroke || {}),
    },
    tooltip: {
      ...baseOptions.tooltip,
      ...(options?.tooltip || {}),
    },
    legend: {
      ...baseOptions.legend,
      ...(options?.legend || {}),
    },
    xaxis: {
      ...baseOptions.xaxis,
      ...(options?.xaxis || {}),
    },
    yaxis: options?.yaxis || {},
    grid: {
      ...baseOptions.grid,
      ...(options?.grid || {}),
    },
    plotOptions: {
      ...baseOptions.plotOptions,
      bar: {
        ...baseOptions.plotOptions.bar,
        ...(options?.plotOptions?.bar || {}),
      },
    },
  };
}
