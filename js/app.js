/**
 * 主应用逻辑 - 智能布局（生活助手单独一行）
 * 网址导航页面的核心功能
 */

class NavigationApp {
    constructor() {
        this.data = null;
        this.categoriesContainer = document.getElementById('categories');
        this.loadingElement = document.getElementById('loading');
        this.themeToggle = document.getElementById('themeToggle');
        
        this.init();
    }
    
    async init() {
        try {
            // 加载数据
            await this.loadData();
            
            // 初始化主题
            this.initTheme();
            
            // 渲染组导航
            this.renderGroupNavigation();
            
            // 渲染智能布局（生活助手单独一行）
            this.renderSmartLayout();
            
            // 预加载图标
            this.preloadIcons();
            
            // 隐藏加载状态
            this.hideLoading();
            
        } catch (error) {
            console.error('应用初始化失败:', error);
            this.showError('加载失败，请刷新页面重试');
        }
    }
    
    /**
     * 加载网站数据
     */
    async loadData() {
        try {
            const response = await fetch('site.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.data = await response.json();
        } catch (error) {
            console.error('加载数据失败:', error);
            // 使用备份数据
            this.data = this.getBackupData();
        }
    }
    
    /**
     * 备份数据（防止site.json加载失败）
     */
    getBackupData() {
        return {
            categories: [
                {
                    name: "常用网站",
                    links: [
                        { title: "百度", url: "https://www.baidu.com" },
                        { title: "腾讯视频", url: "https://v.qq.com" }
                    ]
                },
                {
                    name: "工具网站",
                    links: [
                        { title: "GitHub", url: "https://github.com" }
                    ]
                }
            ]
        };
    }
    
    /**
     * 初始化主题切换
     */
    initTheme() {
        // 检查保存的主题偏好
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
        
        // 绑定主题切换事件
        this.themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            this.setTheme(newTheme);
        });
    }
    
    /**
     * 设置主题
     */
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // 更新主题图标
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }
    
    /**
     * 渲染组导航
     */
    renderGroupNavigation() {
        const groupNav = document.getElementById('groupNavigation');
        if (!groupNav || !this.data || !this.data.categories) return;
        
        const container = groupNav.querySelector('.sidebar-nav-container');
        container.innerHTML = '';
        
        // 为每个分类创建导航项
        this.data.categories.forEach((category, index) => {
            const navItem = document.createElement('button');
            navItem.className = 'sidebar-nav-item';
            navItem.textContent = category.name;
            navItem.addEventListener('click', () => this.scrollToCategory(index));
            container.appendChild(navItem);
        });
        
        groupNav.style.display = 'block';
    }
    
    /**
     * 滚动到指定分类
     */
    scrollToCategory(index) {
        const categories = document.querySelectorAll('.category');
        if (categories[index]) {
            categories[index].scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // 优雅的高亮效果
            categories[index].style.transition = 'all 0.3s ease-in-out';
            categories[index].style.transform = 'scale(1.01)';
            categories[index].style.boxShadow = '0 0 20px rgba(56, 189, 248, 0.5)';
            
            setTimeout(() => {
                categories[index].style.transform = 'scale(1)';
                categories[index].style.boxShadow = '';
            }, 400);
        }
    }
    
    /**
     * 渲染智能布局（生活助手单独占一行）
     */
    renderSmartLayout() {
        if (!this.data || !this.data.categories) {
            this.showError('暂无数据');
            return;
        }
        
        this.categoriesContainer.innerHTML = '';
        
        // 创建智能布局容器
        const wrapper = document.createElement('div');
        wrapper.className = 'categories-wrapper';
        
        // 分离生活助手和其他分类
        const lifeHelper = this.data.categories.find(cat => cat.name === "生活助手");
        const otherCategories = this.data.categories.filter(cat => cat.name !== "生活助手");
        
        // 先渲染生活助手（占满一行）
        if (lifeHelper) {
            const lifeHelperElement = this.createCategoryElement(lifeHelper);
            lifeHelperElement.id = 'category-0';
            lifeHelperElement.classList.add('special-category');
            wrapper.appendChild(lifeHelperElement);
        }
        
        // 渲染其他分类（2列布局）
        otherCategories.forEach((category, index) => {
            const categoryElement = this.createCategoryElement(category);
            const actualIndex = lifeHelper ? index + 1 : index;
            categoryElement.id = `category-${actualIndex}`;
            wrapper.appendChild(categoryElement);
        });
        
        this.categoriesContainer.appendChild(wrapper);
    }
    
    /**
     * 创建分类元素（横向排列）
     */
    createCategoryElement(category) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category';
        
        const title = document.createElement('h2');
        title.className = 'category-title';
        title.textContent = category.name;
        
        const linksRow = document.createElement('div');
        linksRow.className = 'links-row';
        
        category.links.forEach(link => {
            const card = this.createWebsiteCard(link);
            linksRow.appendChild(card);
        });
        
        categoryDiv.appendChild(title);
        categoryDiv.appendChild(linksRow);
        
        return categoryDiv;
    }
    
    /**
     * 创建横向网站卡片
     */
    createWebsiteCard(website) {
        const card = document.createElement('a');
        card.className = 'website-card';
        card.href = website.url;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.title = `${website.title} - ${website.url}`;
        
        // 添加点击统计
        card.addEventListener('click', (e) => {
            this.trackClick(website);
        });
        
        const iconContainer = document.createElement('div');
        iconContainer.className = 'website-icon';
        
        const icon = document.createElement('img');
        icon.alt = website.title;
        icon.loading = 'lazy';
        
        // 异步加载图标
        this.loadIcon(website, icon, iconContainer);
        
        iconContainer.appendChild(icon);
        
        const title = document.createElement('span');
        title.className = 'website-title';
        title.textContent = website.title;
        
        card.appendChild(iconContainer);
        card.appendChild(title);
        
        return card;
    }
    
    /**
     * 加载图标
     */
    async loadIcon(website, imgElement, container) {
        try {
            const iconData = await window.iconService.getIcon(website.url, website.title);
            imgElement.src = iconData;
            
            // 处理图标加载失败
            imgElement.onerror = () => {
                imgElement.style.display = 'none';
                container.textContent = website.title.charAt(0).toUpperCase();
                container.style.backgroundColor = this.getColorFromString(website.title);
                container.style.color = '#fff';
                container.style.fontWeight = 'bold';
            };
        } catch (error) {
            console.warn('图标加载失败:', error);
            // 使用首字母作为备用
            imgElement.style.display = 'none';
            container.textContent = website.title.charAt(0).toUpperCase();
            container.style.backgroundColor = this.getColorFromString(website.title);
            container.style.color = '#fff';
            container.style.fontWeight = 'bold';
        }
    }
    
    /**
     * 根据字符串生成颜色
     */
    getColorFromString(str) {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
            '#FECA57', '#FF9FF3', '#54A0FF', '#48DBFB',
            '#A29BFE', '#FD79A8', '#FDCB6E', '#6C5CE7'
        ];
        
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        return colors[Math.abs(hash) % colors.length];
    }
    
    /**
     * 预加载图标
     */
    preloadIcons() {
        if (!this.data || !this.data.categories) return;
        
        const allWebsites = [];
        this.data.categories.forEach(category => {
            category.links.forEach(link => {
                allWebsites.push(link);
            });
        });
        
        window.iconService.preloadIcons(allWebsites);
    }
    
    /**
     * 跟踪点击（本地存储）
     */
    trackClick(website) {
        try {
            let clicks = JSON.parse(localStorage.getItem('clicks') || '[]');
            clicks.unshift({
                title: website.title,
                url: website.url,
                timestamp: Date.now()
            });
            
            // 只保留最近50次点击
            clicks = clicks.slice(0, 50);
            localStorage.setItem('clicks', JSON.stringify(clicks));
        } catch (error) {
            console.warn('点击跟踪失败:', error);
        }
    }
    
    /**
     * 隐藏加载状态
     */
    hideLoading() {
        if (this.loadingElement) {
            this.loadingElement.style.display = 'none';
        }
    }
    
    /**
     * 显示错误信息
     */
    showError(message) {
        if (this.categoriesContainer) {
            this.categoriesContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    <p style="font-size: 16px; margin-bottom: 16px;">${message}</p>
                    <button onclick="location.reload()" style="
                        padding: 8px 16px;
                        font-size: 14px;
                        background-color: var(--accent-color);
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                    ">刷新页面</button>
                </div>
            `;
        }
        this.hideLoading();
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.navigationApp = new NavigationApp();
});

// 处理搜索清除事件
document.addEventListener('searchCleared', () => {
    const searchResults = document.getElementById('searchResults');
    if (searchResults) {
        searchResults.style.display = 'none';
    }
});