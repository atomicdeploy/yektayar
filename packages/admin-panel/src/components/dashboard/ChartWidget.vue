<template>
  <div class="relative">
    <canvas ref="chartCanvas"></canvas>
    <div
      v-if="loading"
      class="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-50 flex items-center justify-center rounded-lg"
    >
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useDark } from '@vueuse/core'
import {
  Chart,
  LineController,
  LineElement,
  BarController,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartConfiguration,
} from 'chart.js'

// Register Chart.js components
Chart.register(
  LineController,
  LineElement,
  BarController,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface Props {
  type: 'line' | 'bar'
  data: {
    labels: string[]
    datasets: any[]
  }
  options?: any
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const chartCanvas = ref<HTMLCanvasElement | null>(null)
const chartInstance = ref<Chart | null>(null)
const isDark = useDark()

const chartOptions = computed(() => {
  const textColor = isDark.value ? '#e5e7eb' : '#374151'
  const gridColor = isDark.value ? '#374151' : '#e5e7eb'

  return {
    responsive: true,
    maintainAspectRatio: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: textColor,
          font: {
            family: 'Vazirmatn',
          },
        },
      },
      tooltip: {
        backgroundColor: isDark.value ? '#1f2937' : '#ffffff',
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: gridColor,
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: gridColor,
          display: false,
        },
        ticks: {
          color: textColor,
          font: {
            family: 'Vazirmatn',
          },
        },
      },
      y: {
        grid: {
          color: gridColor,
        },
        ticks: {
          color: textColor,
          font: {
            family: 'Vazirmatn',
          },
        },
      },
    },
    ...props.options,
  }
})

function createChart() {
  if (!chartCanvas.value) return

  const config: ChartConfiguration = {
    type: props.type,
    data: props.data,
    options: chartOptions.value,
  }

  chartInstance.value = new Chart(chartCanvas.value, config)
}

function updateChart() {
  if (!chartInstance.value) return

  chartInstance.value.data = props.data
  chartInstance.value.options = chartOptions.value
  chartInstance.value.update()
}

function destroyChart() {
  if (chartInstance.value) {
    chartInstance.value.destroy()
    chartInstance.value = null
  }
}

onMounted(() => {
  createChart()
})

onUnmounted(() => {
  destroyChart()
})

watch(() => props.data, updateChart, { deep: true })
watch(isDark, updateChart)
</script>
