/**
 * 图标获取服务
 * 使用国内可访问的图标服务，避免Google Favicon
 */

class IconService {
    constructor() {
        // 图标服务配置
        this.services = [
            {
                name: 'favicon.im',
                url: 'https://favicon.im/',
                format: (domain) => `https://favicon.im/${domain}`
            },
            {
                name: 'faviconkit',
                url: 'https://faviconkit.com/',
                format: (domain) => `https://faviconkit.com/${domain}/64`
            }
        ];
        
        // 本地图标映射（常用网站的备用图标）
        this.localIcons = {
            'baidu.com': 'assets/icons/baidu.png',
            'bing.com': 'assets/icons/bing.png',
            'qq.com': 'assets/icons/qq.png',
            'bilibili.com': 'assets/icons/bilibili.png',
            'iqiyi.com': 'assets/icons/iqiyi.png',
            'youku.com': 'assets/icons/youku.png',
            '163.com': 'assets/icons/netease.png',
            'kuaishou.com': 'assets/icons/kuaishou.png',
            'douyin.com': 'assets/icons/douyin.png'
        };
        
        // 默认图标
        this.defaultIcon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iI2YwZjBmMCIvPgo8cGF0aCBkPSJNMTIgMTZIMzZWMzJIMTJWMTZaIiBzdHJva2U9IiM2NjY2NjYiIHN0cm9rZS13aWR0aD0iMiIvPgo8cGF0aCBkPSJNMTYgMTJWMjAiIHN0cm9rZT0iIzY2NjY2NiIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxwYXRoIGQ9Ik0yMCAxMlYyMCIgc3Ryb2tlPSIjNjY2NjY2IiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+';
        
        // 缓存已获取的图标
        this.iconCache = new Map();
    }
    
    /**
     * 从URL中提取域名
     */
    extractDomain(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace('www.', '');
        } catch (error) {
            console.warn('无效的URL:', url);
            return null;
        }
    }
    
    /**
     * 获取网站图标
     */
    async getIcon(url, title = '') {
        const domain = this.extractDomain(url);
        if (!domain) {
            return this.defaultIcon;
        }
        
        // 检查缓存
        if (this.iconCache.has(domain)) {
            return this.iconCache.get(domain);
        }
        
        // 检查本地图标
        if (this.localIcons[domain]) {
            const icon = this.localIcons[domain];
            this.iconCache.set(domain, icon);
            return icon;
        }
        
        // 尝试从图标服务获取
        const icon = await this.fetchIconFromService(domain, url);
        this.iconCache.set(domain, icon);
        return icon;
    }
    
    /**
     * 从图标服务获取图标
     */
    async fetchIconFromService(domain, originalUrl) {
        // 按优先级尝试不同的图标服务
        for (const service of this.services) {
            try {
                const iconUrl = service.format(domain);
                const response = await fetch(iconUrl, { 
                    method: 'HEAD',
                    mode: 'no-cors'
                });
                
                // 由于CORS限制，我们无法检查响应状态
                // 直接返回图标URL，让浏览器处理加载
                return iconUrl;
            } catch (error) {
                console.warn(`从 ${service.name} 获取图标失败:`, error);
                continue;
            }
        }
        
        // 如果所有服务都失败，尝试一些备用方案
        return this.getFallbackIcon(originalUrl);
    }
    
    /**
     * 备用图标获取方案
     */
    getFallbackIcon(url) {
        const domain = this.extractDomain(url);
        if (!domain) return this.defaultIcon;
        
        // 尝试 /favicon.ico
        try {
            const urlObj = new URL(url);
            const faviconUrl = `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;
            return faviconUrl;
        } catch (error) {
            return this.defaultIcon;
        }
    }
    
    /**
     * 预加载常用网站的图标
     */
    async preloadIcons(websites) {
        const promises = websites.map(async (site) => {
            try {
                await this.getIcon(site.url, site.title);
            } catch (error) {
                console.warn(`预加载图标失败: ${site.title}`, error);
            }
        });
        
        // 不等待所有图标加载完成，避免阻塞页面
        Promise.allSettled(promises);
    }
    
    /**
     * 获取图标并处理加载失败
     */
    async getIconWithFallback(url, title = '') {
        const icon = await this.getIcon(url, title);
        
        // 返回一个对象，包含图标URL和备用处理
        return {
            src: icon,
            onerror: `this.src='${this.defaultIcon}'; this.onerror=null;`
        };
    }
    
    /**
     * 清除图标缓存
     */
    clearCache() {
        this.iconCache.clear();
    }
    
    /**
     * 获取缓存统计
     */
    getCacheStats() {
        return {
            cached: this.iconCache.size,
            localIcons: Object.keys(this.localIcons).length
        };
    }
}

// 创建全局图标服务实例
window.iconService = new IconService();