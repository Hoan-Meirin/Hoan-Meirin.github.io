/**
 * 综合控制面板
 * 集成Live2D模型切换、主题切换、透明度调整等功能
 */

class ControlPanel {
  constructor() {
    this.currentModel = this.getInitialModel();
    this.isVisible = true;
    this.isSwitching = false;
    this.currentTheme = this.getInitialTheme();
    
    this.availableModels = [
      { name: 'anon_2151', displayName: 'Anon (2151)' },
      { name: 'hina_1387', displayName: 'Hina (1387)' },
      { name: 'kkr_265', displayName: 'Kokoro (265)' },
      { name: 'ksm_270', displayName: 'Kasumi (270)' },
      { name: 'ksm_271', displayName: 'Kasumi (271)' },
      { name: 'mzm', displayName: 'Mutsumi' },
      { name: 'nidie', displayName: 'Nidie' },
      { name: 'tomorin', displayName: 'Tomori' }
    ];
    
    this.init();
  }

  getInitialModel() {
    const saved = localStorage.getItem('live2d-current-model');
    return saved || 'anon_2151';
  }

  getInitialTheme() {
    return localStorage.getItem('theme') || 'light-theme';
  }

  init() {
    this.createControlPanel();
    this.bindEvents();
    this.enableDragging();
    this.loadSettings();
    this.updateModelSelector();
    this.hideControlPanel();
  }

  hideControlPanel() {
    const content = document.getElementById('control-content');
    if (content) {
      content.classList.add('collapsed');
    }
  }

  createControlPanel() {
    const controlPanel = document.createElement('div');
    controlPanel.id = 'control-panel';
    controlPanel.innerHTML = `
      <div class="panel-header">
        <span class="panel-title">🎮 控制面板</span>
        <button class="panel-toggle" id="panel-toggle">⚙️</button>
      </div>
      <div class="panel-content" id="control-content">
        
        <!-- Live2D 模型选择 -->
        <div class="panel-section">
          <h3 class="section-title">🎭 Live2D 模型</h3>
          <select id="model-selector" class="panel-select">
            ${this.availableModels.map(model => 
              `<option value="${model.name}" ${model.name === this.currentModel ? 'selected' : ''}>
                ${model.displayName}
              </option>`
            ).join('')}
          </select>
        </div>

        <!-- 主题切换 -->
        <div class="panel-section">
          <h3 class="section-title">🌓 主题设置</h3>
          <div class="theme-buttons">
            <button class="theme-btn light-btn" data-theme="light-theme">☀️ 亮色</button>
            <button class="theme-btn dark-btn" data-theme="dark-theme">🌙 暗色</button>
          </div>
        </div>

        <!-- 透明度调整 -->
        <div class="panel-section">
          <h3 class="section-title">👁️ 透明度</h3>
          <div class="opacity-control">
            <input type="range" id="opacity-slider" class="slider" min="0.1" max="1" step="0.1" value="1.0">
            <span id="opacity-value" class="opacity-display">100%</span>
          </div>
        </div>

        <!-- 功能按钮 -->
        <div class="panel-section">
          <h3 class="section-title">⚡ 功能</h3>
          <div class="button-group">
            <button id="toggle-visibility" class="panel-btn">👁️ 隐藏看板娘</button>
            <button id="clear-cache" class="panel-btn danger">🗑️ 清理缓存</button>
          </div>
        </div>

        <!-- 快捷键提示 -->
        <div class="panel-section shortcuts">
          <h3 class="section-title">⌨️ 快捷键</h3>
          <div class="shortcut-list">
            <div class="shortcut-item">
              <kbd>L</kbd> <span>打开/关闭面板</span>
            </div>
            <div class="shortcut-item">
              <kbd>T</kbd> <span>切换主题</span>
            </div>
            <div class="shortcut-item">
              <kbd>H</kbd> <span>隐藏/显示看板娘</span>
            </div>
          </div>
        </div>

      </div>
    `;

    this.addStyles();
    document.body.appendChild(controlPanel);
    
    setTimeout(() => {
      this.updateModelSelector();
    }, 0);
  }

  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #control-panel {
        position: fixed;
        top: 20px;
        left: 20px;
        background: rgba(255, 255, 255, 0.98);
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        min-width: 280px;
        max-width: 320px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        transition: all 0.3s ease;
      }

      .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 16px;
        border-bottom: 2px solid #f0f0f0;
        cursor: move;
        user-select: none;
      }

      .panel-title {
        font-weight: 700;
        color: #333;
        font-size: 15px;
      }

      .panel-toggle {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 6px;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .panel-toggle:hover {
        background: rgba(0, 0, 0, 0.08);
        transform: rotate(90deg);
      }

      .panel-content {
        padding: 16px;
        max-height: 600px;
        overflow-y: auto;
        animation: slideDown 0.3s ease;
      }

      .panel-content.collapsed {
        display: none;
      }

      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .panel-section {
        margin-bottom: 18px;
        padding-bottom: 16px;
        border-bottom: 1px solid #f0f0f0;
      }

      .panel-section:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
      }

      .section-title {
        margin: 0 0 10px 0;
        font-size: 13px;
        font-weight: 600;
        color: #555;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .panel-select {
        width: 100%;
        padding: 8px 12px;
        border: 2px solid #e0e0e0;
        border-radius: 6px;
        font-size: 13px;
        background: white;
        color: #333;
        cursor: pointer;
        transition: all 0.2s;
        font-weight: 500;
      }

      .panel-select:hover {
        border-color: #2563eb;
        box-shadow: 0 2px 8px rgba(37, 99, 235, 0.1);
      }

      .panel-select:focus {
        outline: none;
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
      }

      .theme-buttons {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      .theme-btn {
        padding: 8px 12px;
        border: 2px solid #e0e0e0;
        background: white;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 600;
        transition: all 0.2s;
        color: #555;
      }

      .theme-btn:hover {
        border-color: #2563eb;
        background: #f0f7ff;
      }

      .theme-btn.active {
        background: #2563eb;
        color: white;
        border-color: #2563eb;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      }

      .opacity-control {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .slider {
        flex: 1;
        height: 6px;
        border-radius: 3px;
        background: #e0e0e0;
        outline: none;
        -webkit-appearance: none;
        appearance: none;
      }

      .slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #2563eb;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(37, 99, 235, 0.4);
        transition: all 0.2s;
      }

      .slider::-webkit-slider-thumb:hover {
        transform: scale(1.2);
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.6);
      }

      .slider::-moz-range-thumb {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #2563eb;
        cursor: pointer;
        border: none;
        box-shadow: 0 2px 6px rgba(37, 99, 235, 0.4);
        transition: all 0.2s;
      }

      .slider::-moz-range-thumb:hover {
        transform: scale(1.2);
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.6);
      }

      .opacity-display {
        min-width: 45px;
        text-align: right;
        font-weight: 600;
        color: #2563eb;
        font-size: 13px;
      }

      .button-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .panel-btn {
        padding: 10px 12px;
        border: 2px solid #e0e0e0;
        background: white;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 600;
        color: #333;
        transition: all 0.2s;
      }

      .panel-btn:hover {
        border-color: #2563eb;
        background: #f0f7ff;
        color: #2563eb;
      }

      .panel-btn.danger {
        color: #dc2626;
        border-color: #fecaca;
      }

      .panel-btn.danger:hover {
        background: #fef2f2;
        border-color: #dc2626;
      }

      .shortcuts {
        background: #f9fafb;
        padding: 12px;
        border-radius: 6px;
        margin: -16px -16px 0 -16px;
        padding: 12px 16px;
      }

      .shortcut-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .shortcut-item {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 12px;
        color: #666;
      }

      .shortcut-item kbd {
        background: white;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        padding: 3px 8px;
        font-family: 'Monaco', 'Courier New', monospace;
        font-size: 11px;
        font-weight: 600;
        color: #333;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        min-width: 30px;
        text-align: center;
      }

      /* 暗色主题适配 */
      body.dark-theme #control-panel {
        background: rgba(30, 41, 59, 0.98);
        border-color: rgba(255, 255, 255, 0.1);
      }

      body.dark-theme .panel-header {
        border-bottom-color: #334155;
      }

      body.dark-theme .panel-title {
        color: #e2e8f0;
      }

      body.dark-theme .panel-section {
        border-bottom-color: #334155;
      }

      body.dark-theme .section-title {
        color: #cbd5e1;
      }

      body.dark-theme .panel-select,
      body.dark-theme .panel-btn {
        background: #1e293b;
        color: #e2e8f0;
        border-color: #475569;
      }

      body.dark-theme .panel-select:hover,
      body.dark-theme .panel-btn:hover {
        background: #334155;
        border-color: #60a5fa;
      }

      body.dark-theme .theme-btn {
        background: #1e293b;
        color: #cbd5e1;
        border-color: #475569;
      }

      body.dark-theme .theme-btn:hover {
        background: #334155;
      }

      body.dark-theme .theme-btn.active {
        background: #3b82f6;
        border-color: #3b82f6;
      }

      body.dark-theme .shortcuts {
        background: #1e293b;
      }

      body.dark-theme .shortcut-item {
        color: #94a3b8;
      }

      body.dark-theme .shortcut-item kbd {
        background: #0f172a;
        border-color: #475569;
        color: #cbd5e1;
      }

      /* 滚动条美化 */
      .panel-content::-webkit-scrollbar {
        width: 6px;
      }

      .panel-content::-webkit-scrollbar-track {
        background: transparent;
      }

      .panel-content::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 3px;
      }

      .panel-content::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }

      body.dark-theme .panel-content::-webkit-scrollbar-thumb {
        background: #475569;
      }

      body.dark-theme .panel-content::-webkit-scrollbar-thumb:hover {
        background: #64748b;
      }

      /* 响应式设计 */
      @media (max-width: 768px) {
        #control-panel {
          top: 10px;
          left: 10px;
          right: 10px;
          max-width: none;
          min-width: auto;
        }
      }
    `;

    document.head.appendChild(style);
  }

  bindEvents() {
    // 面板折叠/展开
    document.getElementById('panel-toggle').addEventListener('click', () => {
      const content = document.getElementById('control-content');
      content.classList.toggle('collapsed');
    });

    // 模型切换
    document.getElementById('model-selector').addEventListener('change', (e) => {
      this.switchModel(e.target.value);
    });

    // 主题切换
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const theme = e.target.dataset.theme;
        this.switchTheme(theme);
      });
    });

    // 透明度调整
    document.getElementById('opacity-slider').addEventListener('input', (e) => {
      const opacity = parseFloat(e.target.value);
      document.getElementById('opacity-value').textContent = Math.round(opacity * 100) + '%';
      this.updateModelOpacity(opacity);
    });

    // 功能按钮
    document.getElementById('toggle-visibility').addEventListener('click', () => {
      this.toggleVisibility();
    });

    document.getElementById('clear-cache').addEventListener('click', () => {
      this.clearCache();
    });

    // 快捷键
    document.addEventListener('keydown', (e) => {
      if (this.isInputFocused()) return;

      switch(e.key.toLowerCase()) {
        case 'l':
          const content = document.getElementById('control-content');
          content.classList.toggle('collapsed');
          break;
        case 't':
          const newTheme = this.currentTheme === 'light-theme' ? 'dark-theme' : 'light-theme';
          this.switchTheme(newTheme);
          break;
        case 'h':
          this.toggleVisibility();
          break;
      }
    });
  }

  enableDragging() {
    const panel = document.getElementById('control-panel');
    const header = document.querySelector('.panel-header');
    
    if (!panel || !header) return;
    
    let isDragging = false;
    let currentX, currentY, initialX, initialY;
    
    const savePanelPosition = () => {
      localStorage.setItem('control-panel-position', JSON.stringify({
        x: panel.offsetLeft,
        y: panel.offsetTop
      }));
    };
    
    const restorePanelPosition = () => {
      const saved = localStorage.getItem('control-panel-position');
      if (saved) {
        try {
          const pos = JSON.parse(saved);
          panel.style.left = pos.x + 'px';
          panel.style.top = pos.y + 'px';
          panel.style.right = 'auto';
        } catch (e) {
          console.warn('恢复面板位置失败:', e);
        }
      }
    };
    
    header.addEventListener('mousedown', (e) => {
      isDragging = true;
      initialX = e.clientX - panel.offsetLeft;
      initialY = e.clientY - panel.offsetTop;
      header.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
      
      const maxX = window.innerWidth - panel.offsetWidth;
      const maxY = window.innerHeight - panel.offsetHeight;
      
      currentX = Math.max(0, Math.min(currentX, maxX));
      currentY = Math.max(0, Math.min(currentY, maxY));
      
      panel.style.left = currentX + 'px';
      panel.style.top = currentY + 'px';
      panel.style.right = 'auto';
    });
    
    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        header.style.cursor = 'move';
        savePanelPosition();
      }
    });
    
    restorePanelPosition();
  }

  isInputFocused() {
    const activeElement = document.activeElement;
    return activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'SELECT');
  }

  switchModel(modelName) {
    if (this.isSwitching) {
      console.log('⚠️ 正在切换中，请稍候...');
      return;
    }

    const model = this.availableModels.find(m => m.name === modelName);
    if (!model) {
      console.error('❌ 模型不存在:', modelName);
      this.showNotification(`模型 ${modelName} 不存在`);
      return;
    }

    if (modelName === this.currentModel) {
      console.log('ℹ️ 已经是当前模型');
      return;
    }

    console.log(`🔄 切换到模型: ${model.displayName}`);
    this.isSwitching = true;
    
    // 保存新模型选择到localStorage
    console.log('💾 保存模型选择到localStorage:', modelName);
    localStorage.setItem('live2d-current-model', modelName);
    
    this.currentModel = modelName;
    this.saveSettings();
    
    this.showNotification(`正在切换到 ${model.displayName}...`);
    
    // 刷新页面，让hexo-helper-live2d在Live2D初始化时从localStorage读取新模型
    console.log('🔄 300ms后刷新页面以应用新模型...');
    setTimeout(() => {
      console.log('🔄 执行页面刷新');
      window.location.reload();
    }, 300);
  }

  switchTheme(theme) {
    const body = document.body;
    
    if (theme === 'dark-theme') {
      body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark-theme');
      this.currentTheme = 'dark-theme';
    } else {
      body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light-theme');
      this.currentTheme = 'light-theme';
    }
    
    this.updateThemeButtons();
    this.showNotification(`✅ 已切换到${theme === 'dark-theme' ? '暗色' : '亮色'}主题`);
  }

  updateThemeButtons() {
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.theme === this.currentTheme) {
        btn.classList.add('active');
      }
    });
  }

  updateModelOpacity(opacity) {
    const widget = document.getElementById('live2d-widget');
    if (widget) {
      widget.style.opacity = opacity;
    }
  }

  toggleVisibility() {
    const widget = document.getElementById('live2d-widget');
    const button = document.getElementById('toggle-visibility');
    
    if (widget) {
      this.isVisible = !this.isVisible;
      widget.style.display = this.isVisible ? 'block' : 'none';
      if (button) {
        button.textContent = this.isVisible ? '👁️ 隐藏看板娘' : '👁️ 显示看板娘';
      }
    }
    this.saveSettings();
  }

  clearCache() {
    console.log('🧹 清理缓存...');
    
    localStorage.removeItem('live2d-current-model');
    localStorage.removeItem('live2d-settings');
    localStorage.removeItem('control-panel-position');
    
    this.showNotification('✅ 缓存已清理，即将重载页面...');
    
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.85);
      color: white;
      padding: 14px 28px;
      border-radius: 8px;
      z-index: 10001;
      font-size: 14px;
      font-weight: 500;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      animation: fadeInOut 2s ease-in-out;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
        10% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        90% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
      }
    `;
    
    document.head.appendChild(style);
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 2000);
  }

  saveSettings() {
    const settings = {
      model: this.currentModel,
      visible: this.isVisible,
      theme: this.currentTheme
    };
    localStorage.setItem('live2d-settings', JSON.stringify(settings));
  }

  loadSettings() {
    const saved = localStorage.getItem('live2d-settings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        this.currentModel = settings.model || this.currentModel;
        this.isVisible = settings.visible !== false;
        this.currentTheme = settings.theme || 'light-theme';

        // 应用主题
        if (this.currentTheme === 'dark-theme') {
          document.body.classList.add('dark-theme');
        }
        
        this.updateThemeButtons();
      } catch (e) {
        console.warn('加载设置失败:', e);
      }
    }
  }

  updateModelSelector() {
    const selector = document.getElementById('model-selector');
    if (selector) {
      selector.value = this.currentModel;
    }
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  // 等待Live2D加载，最多等待5秒
  let waitCount = 0;
  const waitForLive2D = setInterval(() => {
    if (window.L2Dwidget || waitCount > 10) {
      clearInterval(waitForLive2D);
      window.controlPanel = new ControlPanel();
      console.log('✅ 综合控制面板已初始化');
      if (!window.L2Dwidget) {
        console.warn('⚠️ Live2D 未检测到，某些功能可能不可用');
      }
    }
    waitCount++;
  }, 500);
});
