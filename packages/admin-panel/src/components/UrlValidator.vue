<script setup lang="ts">
import { onMounted, ref } from 'vue';

const showError = ref(false);
const expectedUrl = ref('');
const actualUrl = ref('');

onMounted(() => {
  const expected = import.meta.env.EXPECTED_BASE_URL as string;
  
  // Only validate if base URL is configured (for reverse proxy deployments)
  if (expected) {
    try {
      const expectedURL = new URL(expected);
      const actualURL = new URL(window.location.href);
      
      // Compare protocol, hostname, and port (ignoring path)
      const protocolMatch = expectedURL.protocol === actualURL.protocol;
      const hostMatch = expectedURL.hostname === actualURL.hostname;
      
      // Port comparison: handle default ports (80 for HTTP, 443 for HTTPS)
      const expectedPort = expectedURL.port || (expectedURL.protocol === 'https:' ? '443' : '80');
      const actualPort = actualURL.port || (actualURL.protocol === 'https:' ? '443' : '80');
      const portMatch = expectedPort === actualPort;
      
      if (!protocolMatch || !hostMatch || !portMatch) {
        showError.value = true;
        expectedUrl.value = expectedURL.origin;
        actualUrl.value = actualURL.origin;
        
        // Log to console for debugging
        console.error('URL Configuration Mismatch:', {
          expected: expectedURL.origin,
          actual: actualURL.origin,
          protocolMatch,
          hostMatch,
          portMatch
        });
      }
    } catch (error) {
      console.error('URL validation error:', error);
    }
  }
});
</script>

<template>
  <!-- Error Screen -->
  <div v-if="showError" class="url-mismatch-error">
    <div class="error-content">
      <div class="error-icon">⚠️</div>
      <h1>پیکربندی نادرست</h1>
      <h2>Configuration Mismatch</h2>
      
      <div class="error-details">
        <p>این پنل برای اجرا در این آدرس پیکربندی شده است:</p>
        <p>This admin panel is configured to run at:</p>
        <code class="expected">{{ expectedUrl }}</code>
        
        <p>اما شما از این آدرس به آن دسترسی دارید:</p>
        <p>But you're accessing it from:</p>
        <code class="actual">{{ actualUrl }}</code>
      </div>
      
      <div class="error-solution">
        <p><strong>راه حل / Solution:</strong></p>
        <ul>
          <li>فایل <code>.env</code> را در سرور بروزرسانی کنید</li>
          <li>Update the <code>.env</code> file on the server</li>
          <li>یا از آدرس صحیح به پنل دسترسی داشته باشید</li>
          <li>Or access the panel from the correct URL</li>
        </ul>
      </div>
    </div>
  </div>
  
  <!-- Normal App Content -->
  <slot v-else />
</template>

<style scoped>
.url-mismatch-error {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: 10000;
  overflow: auto;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  color: white;
  text-align: center;
}

.error-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

h1 {
  font-size: 1.8rem;
  margin: 0.5rem 0;
  font-weight: bold;
}

h2 {
  font-size: 1.4rem;
  margin: 0.5rem 0 2rem 0;
  opacity: 0.9;
  font-weight: normal;
}

.error-details {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1rem 0;
  max-width: 600px;
  width: 100%;
}

.error-details p {
  margin: 0.5rem 0;
  font-size: 0.95rem;
}

code {
  display: block;
  background: rgba(0, 0, 0, 0.3);
  padding: 0.75rem 1rem;
  margin: 0.75rem 0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'Courier New', monospace;
  word-break: break-all;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

code.expected {
  border-color: rgba(76, 175, 80, 0.5);
}

code.actual {
  border-color: rgba(244, 67, 54, 0.5);
}

.error-solution {
  margin-top: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 600px;
  width: 100%;
}

.error-solution p {
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.error-solution ul {
  text-align: right;
  list-style: none;
  padding: 0;
  margin: 0;
}

.error-solution li {
  margin: 0.5rem 0;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  font-size: 0.9rem;
}

.error-solution code {
  display: inline;
  padding: 0.2rem 0.5rem;
  margin: 0;
  font-size: 0.85rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
</style>
