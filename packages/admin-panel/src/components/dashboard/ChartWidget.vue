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
import { ref, onMounted, onUnmounted, watch, computed, toRaw } from 'vue'
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
import { logger } from '@yektayar/shared'

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
const isInitializing = ref(false)

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
  if (!chartCanvas.value || isInitializing.value) return
  
  isInitializing.value = true

  try {
    // Deep clone and convert to plain object to avoid Vue reactivity issues
    const plainData = JSON.parse(JSON.stringify(toRaw(props.data)))
    const plainOptions = JSON.parse(JSON.stringify(toRaw(chartOptions.value)))

    const config: ChartConfiguration = {
      type: props.type,
      data: plainData,
      options: plainOptions,
    }

    chartInstance.value = new Chart(chartCanvas.value, config)
  } catch (error) {
    logger.error('Error creating chart:', error)
  } finally {
    isInitializing.value = false
  }
}

function updateChart() {
  if (!chartInstance.value || isInitializing.value) return

  try {
    // Destroy and recreate chart instead of updating to avoid reactivity issues
    destroyChart()
    createChart()
  } catch (error) {
    logger.error('Error updating chart:', error)
  }
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

// Watch for data changes - use immediate: false to prevent initial double-render
watch(() => JSON.stringify(props.data), () => {
  if (chartInstance.value) {
    updateChart()
  }
})

// Watch for dark mode changes
watch(isDark, () => {
  if (chartInstance.value) {
    updateChart()
  }
})
</script>
