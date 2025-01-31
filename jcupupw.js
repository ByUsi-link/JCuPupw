class JCuPupw {
    constructor() {
        this.modal = document.getElementById('jcModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalContent = document.getElementById('modalContent');
        this.modalButtons = document.getElementById('modalButtons');
        this.modalLoading = this.modal.querySelector('.jc-modal__loading');
        this.events = {};
        this.init();
    }

    init() {
        // 事件委托
        this.modal.addEventListener('click', (e) => {
            if (e.target.closest('.jc-modal__close') || e.target.classList.contains('jc-modal__overlay')) {
                this.close();
            }
        });

        // ESC 键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) this.close();
        });

        // 绑定触发按钮
        document.querySelectorAll('.jc-modal-trigger').forEach(trigger => {
            trigger.addEventListener('click', () => this.openFromTrigger(trigger));
        });
    }

    // 从触发按钮获取配置
    openFromTrigger(trigger) {
        const title = trigger.getAttribute('data-modal-title');
        const content = trigger.getAttribute('data-modal-content');
        const buttons = JSON.parse(trigger.getAttribute('data-modal-buttons') || '[]');

        this.open({
            title,
            content,
            buttons: buttons.map(btn => ({
                text: btn.text,
                action: () => {
                    const action = btn.action;
                    if (action && typeof window[action] === 'function') {
                        window[action]();
                    }
                }
            }))
        });
    }

    // 打开弹窗
    open(config = {}) {
        return new Promise((resolve) => {
            const {
                title = '提示',
                content = '默认内容',
                buttons = [{ text: '确定', action: () => this.close() }],
                onOpen,
                onClose
            } = config;

            // 更新内容
            this.setTitle(title);
            this.setContent(content);

            // 生成按钮
            this.modalButtons.innerHTML = buttons.map(btn => `
                <button class="jc-modal__button ${btn.type ? `jc-modal__button--${btn.type}` : ''}">
                    ${btn.text}
                </button>
            `).join('');

            // 绑定按钮事件
            this.modalButtons.querySelectorAll('.jc-modal__button').forEach((btn, index) => {
                btn.addEventListener('click', () => {
                    buttons[index].action?.();
                    if (buttons[index].close !== false) this.close();
                });
            });

            // 显示弹窗
            this.modal.classList.add('jc-modal--active');
            document.body.style.overflow = 'hidden';

            // 触发打开回调
            this.triggerEvent('open');
            onOpen?.();
            resolve();
        });
    }

    // 关闭弹窗
    close() {
        this.modal.classList.remove('jc-modal--active');
        document.body.style.overflow = '';
        this.triggerEvent('close');
        return this;
    }

    // 设置标题
    setTitle(title) {
        this.modalTitle.textContent = title;
        return this;
    }

    // 设置内容
    setContent(content) {
        this.modalContent.innerHTML = content;
        return this;
    }

    // 添加按钮
    addButton(text, action, type = 'default') {
        const button = document.createElement('button');
        button.className = `jc-modal__button ${type ? `jc-modal__button--${type}` : ''}`;
        button.textContent = text;
        button.addEventListener('click', () => {
            action?.();
            this.close();
        });
        this.modalButtons.appendChild(button);
        return this;
    }

    // 显示加载状态
    showLoading() {
        this.modalLoading.classList.add('jc-modal__loading--active');
        return this;
    }

    // 隐藏加载状态
    hideLoading() {
        this.modalLoading.classList.remove('jc-modal__loading--active');
        return this;
    }

    // 注册自定义方法
    registerMethod(name, fn) {
        this[name] = fn.bind(this);
    }

    // 事件绑定
    on(event, callback) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(callback);
    }

    // 触发事件
    triggerEvent(event) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback());
        }
    }

    // 检查弹窗是否打开
    isOpen() {
        return this.modal.classList.contains('jc-modal--active');
    }
}

// 初始化
const jcModal = new JCuPupw();