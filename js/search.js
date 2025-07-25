/**
 * 搜索功能模块
 * 为中老年人设计的简单易用搜索
 */

class SearchEngine {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.clearButton = document.getElementById('clearSearch');
        this.searchResults = document.getElementById('searchResults');
        this.resultsList = document.getElementById('resultsList');
        
        this.allWebsites = [];
        this.searchTimeout = null;
        
        this.init();
    }
    
    init() {
        // 绑定事件
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e));
        this.searchInput.addEventListener('keydown', (e) => this.handleKeydown(e));
        this.clearButton.addEventListener('click', () => this.clearSearch());
        
        // 防止表单提交
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
            }
        });
    }
    
    /**
     * 设置搜索数据
     */
    setData(categories) {
        this.allWebsites = [];
        
        categories.forEach(category => {
            category.links.forEach(link => {
                this.allWebsites.push({
                    ...link,
                    category: category.name
                });
            });
        });
    }
    
    /**
     * 处理搜索输入
     */
    handleSearch(event) {
        const query = event.target.value.trim();
        
        // 清除之前的定时器
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        // 延迟搜索，提高性能
        this.searchTimeout = setTimeout(() => {
            this.performSearch(query);
        }, 300);
    }
    
    /**
     * 执行搜索
     */
    performSearch(query) {
        if (!query) {
            this.clearSearch();
            return;
        }
        
        const results = this.searchWebsites(query);
        this.displayResults(results, query);
    }
    
    /**
     * 搜索算法
     */
    searchWebsites(query) {
        const searchTerm = query.toLowerCase();
        
        return this.allWebsites.filter(website => {
            // 搜索标题
            const titleMatch = website.title.toLowerCase().includes(searchTerm);
            
            // 搜索URL域名
            const domainMatch = this.extractDomain(website.url).toLowerCase().includes(searchTerm);
            
            // 搜索分类
            const categoryMatch = website.category.toLowerCase().includes(searchTerm);
            
            return titleMatch || domainMatch || categoryMatch;
        });
    }
    
    /**
     * 提取域名用于搜索
     */
    extractDomain(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace('www.', '');
        } catch {
            return '';
        }
    }
    
    /**
     * 显示搜索结果
     */
    displayResults(results, query) {
        if (results.length === 0) {
            this.showNoResults(query);
            return;
        }
        
        this.resultsList.innerHTML = '';
        
        results.forEach(website => {
            const card = this.createWebsiteCard(website);
            this.resultsList.appendChild(card);
        });
        
        this.searchResults.style.display = 'block';
        this.updateSearchCount(results.length);
    }
    
    /**
     * 创建网站卡片
     */
    createWebsiteCard(website) {
        const card = document.createElement('a');
        card.className = 'website-card';
        card.href = website.url;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        
        const iconContainer = document.createElement('div');
        iconContainer.className = 'website-icon';
        
        const icon = document.createElement('img');
        icon.alt = website.title;
        icon.loading = 'lazy';
        
        // 异步加载图标
        window.iconService.getIcon(website.url, website.title).then(iconData => {
            icon.src = iconData.src;
            icon.onerror = () => {
                // 图标加载失败时使用首字母
                icon.style.display = 'none';
                iconContainer.textContent = website.title.charAt(0).toUpperCase();
                iconContainer.style.backgroundColor = this.getColorFromString(website.title);
                iconContainer.style.color = '#fff';
            };
        });
        
        iconContainer.appendChild(icon);
        
        const info = document.createElement('div');
        info.className = 'website-info';
        
        const title = document.createElement('div');
        title.className = 'website-title';
        title.textContent = website.title;
        
        const url = document.createElement('div');
        url.className = 'website-url';
        url.textContent = this.extractDomain(website.url);
        
        info.appendChild(title);
        info.appendChild(url);
        
        card.appendChild(iconContainer);
        card.appendChild(info);
        
        return card;
    }
    
    /**
     * 根据字符串生成颜色
     */
    getColorFromString(str) {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
            '#FECA57', '#FF9FF3', '#54A0FF', '#48DBFB'
        ];
        
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        return colors[Math.abs(hash) % colors.length];
    }
    
    /**
     * 显示无结果提示
     */
    showNoResults(query) {
        this.resultsList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                <p style="font-size: 18px; margin-bottom: 8px;">未找到相关网站</p>
                <p style="font-size: 16px;">请尝试其他关键词，如"百度"、"视频"等</p>
            </div>
        `;
        this.searchResults.style.display = 'block';
    }
    
    /**
     * 更新搜索结果数量
     */
    updateSearchCount(count) {
        const title = this.searchResults.querySelector('h2');
        if (title) {
            title.textContent = `搜索结果 (${count}个)`;
        }
    }
    
    /**
     * 清除搜索
     */
    clearSearch() {
        this.searchInput.value = '';
        this.searchResults.style.display = 'none';
        this.resultsList.innerHTML = '';
        
        // 触发输入事件，让其他模块知道搜索已清除
        this.searchInput.dispatchEvent(new Event('searchCleared'));
    }
    
    /**
     * 处理键盘事件
     */
    handleKeydown(event) {
        if (event.key === 'Escape') {
            this.clearSearch();
            this.searchInput.blur();
        }
    }
    
    /**
     * 获取热门搜索建议
     */
    getSuggestions() {
        const suggestions = [
            '百度', '视频', '音乐', '地图', '快递',
            '新闻', '电视', '购物', '搜索', 'AI'
        ];
        
        return suggestions;
    }
    
    /**
     * 显示搜索建议
     */
    showSuggestions() {
        const suggestions = this.getSuggestions();
        // 这里可以扩展为搜索建议下拉框
        console.log('搜索建议:', suggestions);
    }
}

// 创建全局搜索实例
window.searchEngine = null;

// 初始化搜索功能
document.addEventListener('DOMContentLoaded', () => {
    window.searchEngine = new SearchEngine();
});